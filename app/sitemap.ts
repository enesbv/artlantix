import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const now = new Date();
  return ['tr', 'en', 'de'].flatMap((locale) => [
    { url: `${baseUrl}/${locale}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/${locale}/quote`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
  ]);
}
