import type { MetadataRoute } from 'next';
import { caseStudies, guides, localizedPath, MarketingLocale, services } from '@/lib/marketing';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const now = new Date();
  const locales: MarketingLocale[] = ['tr', 'en', 'de'];
  const staticRoutes = ['/', '/quote', '/business', '/services', '/work', '/pricing', '/guides', '/faq'];

  return locales.flatMap((locale) => [
    ...staticRoutes.map((path) => ({
      url: `${baseUrl}${localizedPath(locale, path)}`,
      lastModified: now,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : path === '/quote' ? 0.9 : 0.8,
    })),
    ...services.map((service) => ({ url: `${baseUrl}${localizedPath(locale, `/services/${service.slug}`)}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.75 })),
    ...caseStudies.map((study) => ({ url: `${baseUrl}${localizedPath(locale, `/work/${study.slug}`)}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.65 })),
    ...guides.map((guide) => ({ url: `${baseUrl}${localizedPath(locale, `/guides/${guide.slug}`)}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]);
}
