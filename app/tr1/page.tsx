import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import PreviousHomePageContent from '@/components/PreviousHomePageContent';

export const metadata: Metadata = {
  title: 'Önceki ana sayfa · Artlantix',
  robots: { index: false, follow: false },
};

export default async function PreviousHomePage() {
  setRequestLocale('tr');
  const messages = await getMessages({ locale: 'tr' });
  return <NextIntlClientProvider locale="tr" messages={messages}>
    <PreviousHomePageContent locale="tr" />
  </NextIntlClientProvider>;
}
