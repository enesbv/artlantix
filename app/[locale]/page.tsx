import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import HomePageContent from '@/components/HomePageContent';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocalizedHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePageContent locale={locale} />;
}
