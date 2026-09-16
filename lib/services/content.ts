import { BeforeAfterShowcase } from '../types';
import { BEFORE_AFTER_SHOWCASES } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';
import {
  INPUT_LIMITS,
  normalizeFilename,
  normalizeMediaUrl,
  normalizeOptionalText,
  normalizePrice,
  normalizeRequiredText,
} from '../security';
import { hasAllowedFileSignature } from './storage';
import { BACKEND_NOT_CONFIGURED_ERROR, isDemoModeEnabled } from '../runtime-mode';

export interface SiteSettings {
  hero_title: string;
  hero_subtitle: string;
  simple_tier_price: number;
  standard_tier_price: number;
  complex_tier_price: number;
  updated_at?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_title: 'Turn AI concepts & blurry artwork into production-ready vectors.',
  hero_subtitle:
    'Generative AI creates the concept; our master studio redraws every path by hand. We deliver mathematically clean, closed bezier curves engineered for physical presses, embroidery, CNC cutters, and infinite scale.',
  simple_tier_price: 25,
  standard_tier_price: 45,
  complex_tier_price: 75,
};

const STORAGE_KEY_SETTINGS = 'artlantix_site_settings';
const STORAGE_KEY_SHOWCASES = 'artlantix_portfolio_showcases';

function sanitizeSettings(settings: SiteSettings): SiteSettings {
  return {
    hero_title: normalizeRequiredText(settings.hero_title, 'Hero title', INPUT_LIMITS.heroTitle),
    hero_subtitle: normalizeRequiredText(settings.hero_subtitle, 'Hero subtitle', INPUT_LIMITS.heroSubtitle),
    simple_tier_price: normalizePrice(settings.simple_tier_price, 'Simple tier price'),
    standard_tier_price: normalizePrice(settings.standard_tier_price, 'Standard tier price'),
    complex_tier_price: normalizePrice(settings.complex_tier_price, 'Complex tier price'),
    updated_at: settings.updated_at,
  };
}

function validateStats(stats: BeforeAfterShowcase['stats']): BeforeAfterShowcase['stats'] {
  if (!stats) return undefined;
  const clean = {
    pointsReduced: normalizeRequiredText(stats.pointsReduced, 'Points reduced', 500),
    formatDelivered: normalizeRequiredText(stats.formatDelivered, 'Format delivered', 500),
    turnaround: normalizeRequiredText(stats.turnaround, 'Turnaround', 500),
    tolerance: normalizeRequiredText(stats.tolerance, 'Tolerance', 500),
  };
  if (JSON.stringify(clean).length > INPUT_LIMITS.portfolioStats) throw new Error('Portfolio statistics are too long.');
  return clean;
}

function sanitizePortfolioItem(item: BeforeAfterShowcase, allowDataImage: boolean): BeforeAfterShowcase {
  const vectorUrl = item.vectorUrl ? normalizeMediaUrl(item.vectorUrl, allowDataImage) : undefined;
  return {
    id: normalizeRequiredText(item.id, 'Portfolio item ID', 200),
    title: normalizeRequiredText(item.title, 'Portfolio title', INPUT_LIMITS.portfolioTitle),
    category: normalizeRequiredText(item.category, 'Portfolio category', INPUT_LIMITS.portfolioCategory),
    clientType: normalizeOptionalText(item.clientType, 'Client type', INPUT_LIMITS.portfolioClientType),
    badge: normalizeOptionalText(item.badge, 'Badge', INPUT_LIMITS.portfolioBadge),
    rasterUrl: normalizeMediaUrl(item.rasterUrl, allowDataImage),
    vectorUrl,
    description: normalizeRequiredText(item.description, 'Portfolio description', INPUT_LIMITS.portfolioDescription),
    active: item.active !== false,
    created_at: item.created_at,
    stats: validateStats(item.stats),
  };
}

// ---------------------------------------------------------------------------
// 1. SITE SETTINGS CMS
// ---------------------------------------------------------------------------

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        if (!error && data) {
          return {
            hero_title: data.hero_title || DEFAULT_SITE_SETTINGS.hero_title,
            hero_subtitle: data.hero_subtitle || DEFAULT_SITE_SETTINGS.hero_subtitle,
            simple_tier_price: data.simple_tier_price ?? DEFAULT_SITE_SETTINGS.simple_tier_price,
            standard_tier_price: data.standard_tier_price ?? DEFAULT_SITE_SETTINGS.standard_tier_price,
            complex_tier_price: data.complex_tier_price ?? DEFAULT_SITE_SETTINGS.complex_tier_price,
            updated_at: data.updated_at,
          };
        }
      }
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
    return DEFAULT_SITE_SETTINGS;
  }

  if (!isDemoModeEnabled() || typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SITE_SETTINGS));
    return DEFAULT_SITE_SETTINGS;
  }
  try {
    return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const updated = sanitizeSettings({
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  });

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Content service is unavailable.');
    const { error } = await supabase.from('site_settings').upsert({
      id: 'current',
      hero_title: updated.hero_title,
      hero_subtitle: updated.hero_subtitle,
      simple_tier_price: updated.simple_tier_price,
      standard_tier_price: updated.standard_tier_price,
      complex_tier_price: updated.complex_tier_price,
      updated_at: updated.updated_at,
    });
    if (error) throw new Error('Site settings could not be saved. Please try again.');
    return updated;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return updated;
}

export async function resetSiteSettings(): Promise<SiteSettings> {
  return updateSiteSettings(DEFAULT_SITE_SETTINGS);
}

// ---------------------------------------------------------------------------
// 2. PORTFOLIO / BEFORE-AFTER SHOWCASE MANAGER
// ---------------------------------------------------------------------------

function getInitialShowcases(): BeforeAfterShowcase[] {
  return BEFORE_AFTER_SHOWCASES.map((item) => ({
    ...item,
    active: item.active !== false,
  }));
}

export async function getPortfolioItems(activeOnly: boolean = false): Promise<BeforeAfterShowcase[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        let query = supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
        if (activeOnly) {
          query = query.eq('active', true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as BeforeAfterShowcase[];
        }
      }
    } catch {
      return [];
    }
    return [];
  }

  if (!isDemoModeEnabled()) return [];
  if (typeof window === 'undefined') {
    const list = getInitialShowcases();
    return activeOnly ? list.filter((i) => i.active) : list;
  }

  const raw = localStorage.getItem(STORAGE_KEY_SHOWCASES);
  let list: BeforeAfterShowcase[];
  if (!raw) {
    list = getInitialShowcases();
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(list));
  } else {
    try {
      list = JSON.parse(raw);
    } catch {
      list = getInitialShowcases();
    }
  }

  return activeOnly ? list.filter((i) => i.active !== false) : list;
}

export async function createPortfolioItem(
  payload: Omit<BeforeAfterShowcase, 'id'>
): Promise<BeforeAfterShowcase> {
  const newId = `showcase-${Date.now()}`;
  const newItem = sanitizePortfolioItem(Object.assign(
    {
      clientType: 'Commercial Client',
      badge: 'Precision Rebuild',
      stats: {
        pointsReduced: '94% Fewer Points',
        formatDelivered: 'AI, EPS, SVG, PDF, PNG',
        turnaround: '24 Hours',
        tolerance: 'Production Approved',
      },
    },
    payload,
    {
      id: newId,
      active: payload.active !== false,
    }
  ), !isSupabaseConfigured());

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Portfolio service is unavailable.');
    const { data, error } = await supabase.from('portfolio_items').insert(newItem).select().single();
    if (error) throw new Error('The portfolio item could not be created. Please try again.');
    return data as BeforeAfterShowcase;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);
  const existing = await getPortfolioItems(false);
  const updated = [newItem, ...existing];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(updated));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return newItem;
}

export async function updatePortfolioItem(
  id: string,
  updates: Partial<BeforeAfterShowcase>
): Promise<BeforeAfterShowcase | null> {
  const existingItem = (await getPortfolioItems(false)).find((item) => item.id === id);
  if (!existingItem) return null;
  const sanitized = sanitizePortfolioItem({ ...existingItem, ...updates, id }, !isSupabaseConfigured());
  const safeUpdates = {
    title: sanitized.title,
    category: sanitized.category,
    clientType: sanitized.clientType,
    badge: sanitized.badge,
    rasterUrl: sanitized.rasterUrl,
    vectorUrl: sanitized.vectorUrl,
    description: sanitized.description,
    active: sanitized.active,
    stats: sanitized.stats,
  };
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Portfolio service is unavailable.');
    const { data, error } = await supabase.from('portfolio_items').update(safeUpdates).eq('id', id).select().single();
    if (error) throw new Error('The portfolio item could not be updated. Please try again.');
    return data as BeforeAfterShowcase;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);
  const existing = await getPortfolioItems(false);
  const idx = existing.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  existing[idx] = sanitized;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(existing));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return existing[idx];
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Portfolio service is unavailable.');
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) throw new Error('The portfolio item could not be deleted. Please try again.');
    return true;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);
  const existing = await getPortfolioItems(false);
  const filtered = existing.filter((i) => i.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return true;
}

export async function uploadShowcaseMedia(file: File, prefix: 'raster' | 'vector'): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowed = prefix === 'vector' ? ['png', 'webp'] : ['jpg', 'jpeg', 'png', 'webp'];
  const expectedTypes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  };
  normalizeFilename(file.name);
  if (file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose a non-empty portfolio image up to 5 MB.');
  if (!allowed.includes(extension)) throw new Error(`Unsupported portfolio file. Allowed: ${allowed.join(', ').toUpperCase()}.`);
  if (file.type !== expectedTypes[extension]) throw new Error('The portfolio file type does not match its extension.');
  const signature = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasAllowedFileSignature(extension, signature)) throw new Error('The portfolio file contents do not match its extension.');
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (!supabase) throw new Error('Portfolio storage is unavailable.');
    const path = `showcases/${prefix}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from('portfolio').upload(path, file);
    if (error) throw new Error('Portfolio media could not be uploaded. Please try again.');
    const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
    if (!data?.publicUrl) throw new Error('Portfolio URL could not be generated.');
    return data.publicUrl;
  }

  if (!isDemoModeEnabled()) throw new Error(BACKEND_NOT_CONFIGURED_ERROR);

  // Explicit development demo: read file as a local data URL.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
