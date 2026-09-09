import { OrderFile, Order, FileCategory } from '../types';
import { isSupabaseConfigured, createClient } from '../supabase/client';

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

export async function processClientFileUpload(file: File): Promise<UploadedFileData> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext)) {
    throw new Error('Please upload a JPG, PNG, WebP or PDF file.');
  }
  // Demo uploads are persisted as base64 in localStorage, which has a small quota.
  if (file.size === 0 || file.size > 2 * 1024 * 1024) {
    throw new Error('Please select a non-empty file up to 2 MB.');
  }

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
        img.onerror = () => {
          resolve({
            name: file.name,
            size: file.size,
            format: ext,
            url: result,
            file,
          });
        };
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

        if (!error && data?.signedUrl) {
          return data.signedUrl;
        }
      }
    } catch {
      // Fall through to mock generator
    }
  }

  // In mock/offline mode or if direct download is needed
  return file.url || file.storage_path;
}

export async function uploadToStorageBucket(
  file: File,
  bucket: StorageBucket,
  destinationPath: string
): Promise<{ path: string; url?: string; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(destinationPath, file, { upsert: true });

        if (error) return { path: destinationPath, error: error.message };
        return { path: data.path };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage upload failure';
      return { path: destinationPath, error: msg };
    }
  }

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

  // Demo mode generates representative files so the workflow can be evaluated offline.
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

export function triggerMasterBundleZip(order: Order): void {
  if (typeof window === 'undefined') return;

  const manifest = `ARTLANTIX DEMO PACKAGE MANIFEST
=============================================
Order Number: ${order.order_number}
Project: ${order.project_name}
This text file represents a future downloadable archive. It is not a ZIP file
and does not contain production artwork.

Planned format specifications:
- AI (Adobe Illustrator CC / CS6 compatible, layered)
- EPS (Illustrator 10 EPS, unflattened CMYK, bounding box strict)
- SVG (W3C standard, closed bezier paths, zero raster effects)
- PDF (PDF/X-1a:2001 high quality print press profile)
- PNG (4000x4000px 300 DPI transparent raster preview)

Demo data only. Connect private object storage and archive generation before production use.
=============================================`;

  const blob = new Blob([manifest], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${order.order_number}-demo-package-manifest.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
