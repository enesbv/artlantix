import { ArtworkType, ColorCount, ComplexityTier, TurnaroundSpeed } from '../types';
import { UploadedFileData } from './storage';

const STORAGE_KEY = 'artlantix_quote_draft_v1';

export interface QuoteDraft {
  projectName: string;
  artworkType: ArtworkType;
  complexity: ComplexityTier;
  artistReviewRequested: boolean;
  hasText: boolean;
  reconstructionOption: 'clean' | 'moderate' | 'heavy';
  colorCount: ColorCount;
  turnaround: TurnaroundSpeed;
  notes: string;
  companyName?: string;
  intendedUse?: string;
  agencyServices?: ('brand-identity' | 'alternative-logo' | 'social-media-kit')[];
  aiTool?: string;
  requestedDeadline?: string;
  serviceSlug?: string;
  customerName: string;
  customerEmail: string;
  uploadedFile: UploadedFileData | null;
  sourceOrderId?: string;
  savedAt: string;
}

export function loadQuoteDraft(): QuoteDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') as QuoteDraft | null;
    return parsed && parsed.projectName && parsed.savedAt ? parsed : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveQuoteDraft(draft: QuoteDraft): boolean {
  if (typeof window === 'undefined') return false;
  const serializableDraft = {
    ...draft,
    uploadedFile: draft.uploadedFile ? { ...draft.uploadedFile, file: undefined } : null,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializableDraft));
    return true;
  } catch {
    // Preserve the form even when a base64 upload exceeds browser storage quota.
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...serializableDraft, uploadedFile: null }));
    } catch {
      return false;
    }
    return false;
  }
}

export function clearQuoteDraft(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}
