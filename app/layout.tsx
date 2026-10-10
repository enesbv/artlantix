import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, Geist } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import trMessages from '@/messages/tr.json';

// latin-ext carries the Turkish and German letters (ğ ş İ ı ö ü ä ß); without it they fall back to a system font.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
});

// Only used for the two margin notes on the hero drawing sheet.
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "Artlantix · Manual Vectorization & Artwork Reconstruction Studio",
  description:
    "Turn AI concepts, low-resolution artwork, and raster sketches into pristine, production-ready vector files. 100% hand-crafted by master production artists.",
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
    <html lang={locale} className={`${geistSans.variable} ${bricolage.variable} ${caveat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <NextIntlClientProvider messages={messageSets[locale]} locale={locale}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
