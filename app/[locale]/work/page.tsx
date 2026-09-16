import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import MarketingVisual from '@/components/MarketingVisual';
import { caseStudies, localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';

export const metadata: Metadata = { title: 'Studio Demonstrations · Artlantix', description: 'See how Artlantix approaches common vector reconstruction problems.' };
export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; setRequestLocale(locale); const lang = normalizeMarketingLocale(locale); const copy = marketingCopy[lang]; return <PublicPageShell><main><section className="border-b border-[#DAD8D2] bg-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#18794E]">{copy.pages.workEyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.04em] text-[#102A20] sm:text-6xl">{copy.pages.workTitle}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#5E625F]">{copy.pages.workBody}</p></div></section><section className="mx-auto grid max-w-7xl gap-7 px-4 py-20 sm:px-6 lg:grid-cols-3 lg:px-8">{caseStudies.map(study => <Link key={study.slug} href={localizedPath(lang, `/work/${study.slug}`)} className="group overflow-hidden rounded-3xl border border-[#DAD8D2] bg-white"><MarketingVisual kind={study.visual} compact /><div className="p-7"><span className="rounded-full bg-[#E9F9EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#115C3B]">{copy.common.demo}</span><h2 className="mt-5 text-2xl font-black text-[#102A20]">{study.title[lang]}</h2><p className="mt-3 leading-7 text-[#5E625F]">{study.summary[lang]}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.common.viewCase}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link>)}</section></main></PublicPageShell>; }
