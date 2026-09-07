import React, { Suspense } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import QuotePageContent from '@/components/QuotePageContent';

export default async function RootQuotePage() {
  setRequestLocale('en');
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center text-xs text-[#737373]">
            Loading Studio Questionnaire...
          </div>
        }
      >
        <QuotePageContent />
      </Suspense>
    </NextIntlClientProvider>
  );
}
