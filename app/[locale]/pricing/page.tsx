import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PricingPageContent from '@/components/PricingPageContent';

export const metadata: Metadata = { title: 'Pricing · Artlantix', description: 'Transparent starting prices for manual vector reconstruction.' };
export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); return <PricingPageContent locale={locale} />; }
