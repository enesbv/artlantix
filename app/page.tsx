import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import HomePageContent from '@/components/HomePageContent';

export default async function RootHomePage() {
  setRequestLocale('en');
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale="en">
      <HomePageContent locale="en" />
    </NextIntlClientProvider>
  );
}
