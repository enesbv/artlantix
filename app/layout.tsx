import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import trMessages from '@/messages/tr.json';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Artlantix · Manual Vectorization & Artwork Reconstruction Studio",
  description:
    "Turn AI concepts, low-resolution artwork, and raster sketches into pristine, production-ready vector files. 100% hand-crafted by master production artists.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: 'website',
    title: 'Artlantix · Production-ready vector artwork',
    description: 'Manual vectorization and artwork reconstruction for print, embroidery, signage and CNC production.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const requestedLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = requestedLocale === 'de' || requestedLocale === 'tr' ? requestedLocale : 'en';
  const messageSets = { en: enMessages, de: deMessages, tr: trMessages };
  return (
    <html lang={locale} className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F9F8F6] text-[#141414]">
        <NextIntlClientProvider messages={messageSets[locale]} locale={locale}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
