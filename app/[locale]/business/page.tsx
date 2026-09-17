import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import BusinessPageContent from '@/components/BusinessPageContent';
import { businessCopy } from '@/lib/business-copy';
import { normalizeMarketingLocale } from '@/lib/marketing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const copy = businessCopy[normalizeMarketingLocale(locale)];
  return { title: `Artlantix for Business · ${copy.title}`, description: copy.intro };
}
export default async function BusinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BusinessPageContent locale={locale} />;
}
