import React, { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import QuotePageContent from '@/components/QuotePageContent';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocalizedQuotePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center text-xs text-[#737373]">
          Loading Studio Questionnaire...
        </div>
      }
    >
      <QuotePageContent />
    </Suspense>
  );
}
