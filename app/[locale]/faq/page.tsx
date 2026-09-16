import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import FaqList from '@/components/FaqList';
import { localizedPath, marketingCopy, normalizeMarketingLocale, publicFaqs } from '@/lib/marketing';

export const metadata: Metadata = { title: 'FAQ · Artlantix', description: 'Answers about quotes, production, private files, revisions and delivery.' };
export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); const lang = normalizeMarketingLocale(locale); const copy = marketingCopy[lang]; return <PublicPageShell><main><section className="border-b border-[#DAD8D2] bg-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#18794E]">{copy.pages.faqEyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.04em] text-[#102A20] sm:text-6xl">{copy.pages.faqTitle}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#5E625F]">{copy.pages.faqBody}</p></div></section><section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.55fr_1fr] lg:px-8"><div className="rounded-3xl bg-[#102A20] p-7 text-white lg:sticky lg:top-28 lg:self-start"><h2 className="text-2xl font-black">{copy.home.finalTitle}</h2><p className="mt-3 text-sm leading-6 text-white/65">{copy.home.finalBody}</p><Link href={localizedPath(lang, '/quote')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#78D5A6]">{copy.home.primary}<ArrowRight className="h-4 w-4" /></Link></div><FaqList items={publicFaqs[lang]} /></section></main></PublicPageShell>; }
