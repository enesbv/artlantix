import { BeforeAfterShowcase } from '../types';
import { BEFORE_AFTER_SHOWCASES } from '../mock-data';
import { isSupabaseConfigured, createClient } from '../supabase/client';

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
      // Fallback to local storage
    }
  }

  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
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
  const updated: SiteSettings = {
    ...current,
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase
          .from('site_settings')
          .upsert({ id: 'current', ...updated });
      }
    } catch {
      // Fallback
    }
  }

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
      // Fallback
    }
  }

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
  const newItem: BeforeAfterShowcase = Object.assign(
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
  );

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('portfolio_items')
          .insert(newItem)
          .select()
          .single();
        if (!error && data) return data as BeforeAfterShowcase;
      }
    } catch {
      // Fallback
    }
  }

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
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('portfolio_items')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as BeforeAfterShowcase;
      }
    } catch {
      // Fallback
    }
  }

  const existing = await getPortfolioItems(false);
  const idx = existing.findIndex((i) => i.id === id);
  if (idx === -1) return null;

  existing[idx] = { ...existing[idx], ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(existing));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return existing[idx];
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('portfolio_items').delete().eq('id', id);
      }
    } catch {
      // Fallback
    }
  }

  const existing = await getPortfolioItems(false);
  const filtered = existing.filter((i) => i.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SHOWCASES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('artlantix_content_updated'));
  }

  return true;
}

export async function uploadShowcaseMedia(file: File, prefix: 'raster' | 'vector'): Promise<string> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      if (supabase) {
        const ext = file.name.split('.').pop();
        const path = `showcases/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error } = await supabase.storage.from('portfolio').upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from('portfolio').getPublicUrl(path);
          if (data?.publicUrl) return data.publicUrl;
        }
      }
    } catch {
      // Fallback
    }
  }

  // Fallback: Read file as Data URL for local preview
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
