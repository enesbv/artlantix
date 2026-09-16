import { OrderFile, Order, FileCategory } from '../types';
import { isSupabaseConfigured, createClient } from '../supabase/client';
import { BACKEND_NOT_CONFIGURED_ERROR, isDemoModeEnabled } from '../runtime-mode';
import { normalizeFilename } from '../security';

export const STORAGE_BUCKETS = {
  CUSTOMER_ASSETS: 'customer-assets',
  PREVIEWS: 'previews',
  MASTER_DELIVERIES: 'master-deliveries',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

export function getBucketForCategory(category: FileCategory): StorageBucket {
  switch (category) {
    case 'customer_upload':
    case 'revision_ref':
      return STORAGE_BUCKETS.CUSTOMER_ASSETS;
    case 'preview_watermarked':
      return STORAGE_BUCKETS.PREVIEWS;
    case 'final_master':
      return STORAGE_BUCKETS.MASTER_DELIVERIES;
    default:
      return STORAGE_BUCKETS.CUSTOMER_ASSETS;
  }
}

export interface UploadedFileData {
  name: string;
  size: number;
  format: string;
  url: string;
  dimensions?: { width: number; height: number };
  file?: File;
}

const CLIENT_UPLOAD_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

const STORAGE_UPLOAD_RULES: Record<StorageBucket, { maxBytes: number; types: Record<string, string[]> }> = {
  [STORAGE_BUCKETS.CUSTOMER_ASSETS]: {
    maxBytes: 2 * 1024 * 1024,
    types: {
      jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'],
      webp: ['image/webp'], pdf: ['application/pdf'],
    },
  },
  [STORAGE_BUCKETS.PREVIEWS]: {
    maxBytes: 10 * 1024 * 1024,
    types: {
      jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'],
      svg: ['image/svg+xml'], pdf: ['application/pdf'],
    },
  },
  [STORAGE_BUCKETS.MASTER_DELIVERIES]: {
    maxBytes: 50 * 1024 * 1024,
    types: {
      png: ['image/png'], svg: ['image/svg+xml'], pdf: ['application/pdf'],
      ai: ['application/postscript', 'application/pdf', 'application/octet-stream'],
      eps: ['application/postscript', 'application/octet-stream'],
    },
  },
};

function startsWithBytes(bytes: Uint8Array, expected: number[], offset = 0): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

export function hasAllowedFileSignature(extension: string, bytes: Uint8Array): boolean {
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return startsWithBytes(bytes, [0xff, 0xd8, 0xff]);
    case 'png':
      return startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'webp':
      return startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWithBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8);
    case 'pdf':
      return startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
    case 'ai':
      return startsWithBytes(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]) || startsWithBytes(bytes, [0x25, 0x21, 0x50, 0x53]);
    case 'eps':
      return startsWithBytes(bytes, [0x25, 0x21, 0x50, 0x53]);
    case 'svg': {
      const prefix = new TextDecoder().decode(bytes).replace(/^\uFEFF/, '').trimStart().toLowerCase();
      return prefix.startsWith('<svg') || prefix.startsWith('<?xml');
    }
    default:
      return false;
  }
}

export async function validateStorageUpload(file: File, bucket: StorageBucket, expectedExtension?: string): Promise<string> {
  const filename = normalizeFilename(file.name);
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const rule = STORAGE_UPLOAD_RULES[bucket];
  const acceptedTypes = rule.types[extension];
  if (!acceptedTypes) throw new Error('This file format is not allowed for the selected delivery type.');
  if (expectedExtension && extension !== expectedExtension.toLowerCase()) throw new Error('The selected format does not match the file extension.');
  if (!acceptedTypes.includes(file.type)) throw new Error('The file type does not match its extension.');
  if (file.size === 0 || file.size > rule.maxBytes) throw new Error(`Choose a non-empty file up to ${rule.maxBytes / 1024 / 1024} MB.`);
  const signature = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (!hasAllowedFileSignature(extension, signature)) throw new Error('The file contents do not match the selected file type.');
  return extension;
}

export function validateClientUploadMetadata(file: Pick<File, 'name' | 'size' | 'type'>): string {
  const filename = normalizeFilename(file.name);
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const expectedType = CLIENT_UPLOAD_TYPES[extension];
  if (!expectedType) throw new Error('Please upload a JPG, PNG, WebP or PDF file.');
  if (file.type !== expectedType) throw new Error('The file type does not match its extension.');
  if (file.size === 0 || file.size > 2 * 1024 * 1024) throw new Error('Please select a non-empty file up to 2 MB.');
  return extension;
}

export async function processClientFileUpload(file: File): Promise<UploadedFileData> {
  const ext = validateClientUploadMetadata(file);
  const signature = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasAllowedFileSignature(ext, signature)) throw new Error('The file contents do not match the selected file type.');

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The file could not be read. Please try again.'));
    reader.onabort = () => reject(new Error('File reading was cancelled.'));
    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            name: file.name,
            size: file.size,
            format: ext,
            url: result,
            dimensions: { width: img.width, height: img.height },
            file,
          });
        };
        img.onerror = () => reject(new Error('The image is invalid or cannot be decoded.'));
        img.src = result;
      } else {
        resolve({
          name: file.name,
          size: file.size,
          format: ext,
          url: result || URL.createObjectURL(file),
          file,
        });
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a temporary signed download URL for secure master deliverables or customer assets.
 * Respects the 'master-deliveries' strict private bucket policy in Supabase.
 */
export async function getSignedDownloadUrl(
  file: OrderFile,
  expiresInSeconds: number = 3600
): Promise<string> {
  const bucket = getBucketForCategory(file.file_category);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(file.storage_path, expiresInSeconds);

        if (!error && data?.signedUrl) return data.signedUrl;
      }
    } catch {
      // The configured service must fail closed rather than expose a raw path.
    }
    throw new Error('The secure download link could not be created. Please try again.');
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);

  // Explicit development demo download.
  return file.url || file.storage_path;
}

export async function removeStorageObject(bucket: StorageBucket, path: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  if (!supabase) return;
  await supabase.storage.from(bucket).remove([path]);
}

export async function requestOrderUploadScan(orderId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const response = await fetch('/api/uploads/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  if (!response.ok) throw new Error('The artwork is saved but its security scan is still pending.');
}

export async function uploadToStorageBucket(
  file: File,
  bucket: StorageBucket,
  destinationPath: string
): Promise<{ path: string; url?: string; error?: string }> {
  await validateStorageUpload(file, bucket);
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(destinationPath, file, { upsert: false });

        if (error) return { path: destinationPath, error: 'The file could not be uploaded securely.' };
        return { path: data.path };
      }
    } catch {
      return { path: destinationPath, error: 'The file could not be uploaded securely.' };
    }
  }

  if (!isDemoModeEnabled()) return { path: destinationPath, error: BACKEND_NOT_CONFIGURED_ERROR };
  const processed = await processClientFileUpload(file);
  return { path: destinationPath, url: processed.url };
}

export async function triggerFileDownload(file: OrderFile): Promise<void> {
  if (typeof window === 'undefined') return;

  if (isSupabaseConfigured()) {
    const signedUrl = await getSignedDownloadUrl(file);
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = file.filename;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);

  // Explicit development demo generates representative files for evaluation.
  let content = `/* Artlantix Production Master - ${file.filename} */\n/* Generated for professional print & CNC output */\n`;

  if (file.format === 'svg') {
    content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
  <!-- Artlantix Production Vector Deliverable: ${file.filename} -->
  <!-- Clean mathematical bezier curves · Closed paths · 0.01mm tolerance -->
  <defs>
    <linearGradient id="artlantixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18794E" />
      <stop offset="100%" stop-color="#111111" />
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="#FAFAF8"/>
  <circle cx="400" cy="400" r="280" fill="none" stroke="#111111" stroke-width="8"/>
  <circle cx="400" cy="400" r="240" fill="none" stroke="#18794E" stroke-width="3" stroke-dasharray="8 6"/>
  <path d="M 400 200 L 460 360 L 630 360 L 490 460 L 540 620 L 400 520 L 260 620 L 310 460 L 170 360 L 340 360 Z" fill="#111111" stroke="#18794E" stroke-width="4"/>
  <text x="400" y="720" font-family="sans-serif" font-size="20" font-weight="700" letter-spacing="4" text-anchor="middle" fill="#111111">ARTLANTIX MASTER VECTOR</text>
</svg>`;
  }

  const mimeMap: Record<string, string> = {
    svg: 'image/svg+xml',
    ai: 'application/postscript',
    eps: 'application/postscript',
    pdf: 'application/pdf',
    png: 'image/png',
  };

  const blob = new Blob([content], { type: mimeMap[file.format] || 'application/octet-stream' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

export async function downloadAllMasterFiles(order: Order): Promise<void> {
  const masterFiles = order.files?.filter((file) => file.file_category === 'final_master') || [];
  if (masterFiles.length === 0) throw new Error('No master files are available for this order yet.');
  for (const file of masterFiles) await triggerFileDownload(file);
}
