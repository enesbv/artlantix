'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Check, FileLock2, FolderCheck, PenTool, ScanSearch, ShieldCheck, Upload, UserCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketingVisual from '@/components/MarketingVisual';
import HeroVectorArtwork from '@/components/HeroVectorArtwork';
import ServiceVisual from '@/components/ServiceVisual';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from '@/lib/services/content';
import FaqList from '@/components/FaqList';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import { caseStudies, guides, localizedPath, marketingCopy, normalizeMarketingLocale, processSteps, publicFaqs, services, trustFacts } from '@/lib/marketing';

const processIcons = [Upload, ScanSearch, PenTool, FolderCheck];
const trustIcons = [PenTool, FileLock2, ShieldCheck, UserCheck];
const caseLabels = {
  tr: { challenge: 'Sorun', approach: 'Yaklaşım', outcome: 'Sonuç' },
  en: { challenge: 'Problem', approach: 'Approach', outcome: 'Outcome' },
  de: { challenge: 'Problem', approach: 'Vorgehen', outcome: 'Ergebnis' },
} as const;

export default function HomePageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const tierCopy = useTranslations('quote.complexityGuide');
  const pricingHint = { tr: 'Başlangıç fiyatları · USD', en: 'Starting prices · USD', de: 'Startpreise · USD' }[lang];
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const quotePath = localizedPath(lang, '/quote');
  const [activeCase, setActiveCase] = useState(0);
  const study = caseStudies[activeCase];
  const custom = customQuoteCopy[lang];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-[#DAD8D2]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.055em] text-[#102A20] sm:text-7xl lg:text-[5.4rem]">
                {copy.home.titleLines.map((line, index) => <span key={line} className={`block ${index === 1 ? 'mt-[0.045em] text-[#18794E]' : ''}`}>{line}</span>)}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#5E625F]">{copy.home.description}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={quotePath} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#18794E] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#115C3B]">{copy.home.primary}<ArrowRight className="h-4 w-4" /></Link>
                <Link href="#work" className="inline-flex items-center justify-center rounded-xl border border-[#BFC5C0] bg-white px-6 py-3.5 text-sm font-bold text-[#102A20] transition hover:border-[#18794E]">{copy.home.secondary}</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-[#5E625F]">
                {['AI', 'EPS', 'SVG', 'PDF', 'PNG'].map((format) => <span key={format} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#18794E]" />{format}</span>)}
              </div>
            </div>
            <HeroVectorArtwork />
          </div>
        </section>

        <section id="work" className="scroll-mt-24 border-b border-[#DAD8D2] bg-[#FCFDFB]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <h2 className="max-w-3xl text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.04em] text-[#102A20] sm:text-4xl">{copy.home.workTitle}</h2>
              <div role="tablist" aria-label={copy.home.workEyebrow} className="flex gap-1 overflow-x-auto rounded-xl border border-[#DAD8D2] bg-white p-1">
                {caseStudies.map((item, index) => (
                  <button key={item.slug} role="tab" type="button" aria-selected={index === activeCase} onClick={() => setActiveCase(index)} className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${index === activeCase ? 'bg-[#102A20] text-white' : 'text-[#5E625F] hover:text-[#102A20]'}`}>
                    {item.category[lang].split('·').pop()?.trim()}
                  </button>
                ))}
              </div>
            </div>

            <div role="tabpanel" className="mt-8 grid overflow-hidden rounded-3xl border border-[#DAD8D2] bg-white lg:grid-cols-[1fr_1.1fr]">
              <div className="p-3 [&>div]:h-full"><MarketingVisual key={study.slug} kind={study.visual} /></div>
              <div className="flex flex-col p-6 sm:p-10">
                <span className="self-start rounded-full bg-[#E9F9EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#115C3B]">{copy.common.demo}</span>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-[#102A20] sm:text-3xl">{study.title[lang]}</h3>
                <dl className="mt-6 divide-y divide-[#EAE8E3] border-y border-[#EAE8E3]">
                  {(['challenge', 'approach', 'outcome'] as const).map((key, index) => (
                    <div key={key} className="grid gap-1 py-4 sm:grid-cols-[110px_1fr] sm:gap-6">
                      <dt className="flex items-center gap-2 text-sm font-semibold text-[#18794E]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E9F9EE] text-[10px] tabular-nums">{index + 1}</span>{caseLabels[lang][key]}</dt>
                      <dd className="text-sm leading-6 text-[#5E625F]">{study[key][lang]}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 flex flex-wrap gap-2">
                  {study.deliverables[lang].map((item) => <span key={item} className="rounded-full border border-[#DDE5DE] px-3 py-1 text-xs text-[#5E625F]">{item}</span>)}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
                  <Link href={localizedPath(lang, `/work/${study.slug}`)} className="inline-flex items-center gap-2 rounded-xl bg-[#18794E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#115C3B]">{copy.common.viewCase}<ArrowRight className="h-4 w-4" /></Link>
                  <Link href={localizedPath(lang, '/work')} className="inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.allWork}<ArrowRight className="h-4 w-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-24 mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-balance text-3xl font-semibold leading-[1.15] tracking-[-0.04em] text-[#102A20] sm:text-4xl">{copy.home.servicesTitle}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#697467]">{copy.home.servicesBody}</p>
            <Link href={localizedPath(lang, '/services')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.allServices}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <ul className="divide-y divide-[#DAD8D2] border-y border-[#DAD8D2]">
            {services.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <Link href={localizedPath(lang, `/services/${service.slug}`)} className="group grid items-center gap-4 py-5 sm:grid-cols-[150px_1fr_auto] sm:gap-6">
                  <div className="hidden sm:block [&>div]:mb-0 [&_svg]:h-[72px]"><ServiceVisual slug={service.slug} /></div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-[#102A20] transition-colors group-hover:text-[#18794E]">{service.title[lang]}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#5E625F]">{service.short[lang]}</p>
                    <p className="mt-2 text-xs text-[#697467]">{copy.common.from} <strong className="text-[#102A20]">${service.startingPrice}</strong> · {service.turnaround[lang]}</p>
                  </div>
                  <span aria-hidden="true" className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#DAD8D2] text-[#18794E] transition group-hover:border-[#18794E] group-hover:bg-[#18794E] group-hover:text-white sm:flex"><ArrowRight className="h-4 w-4" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="process" aria-labelledby="process-heading" className="relative isolate scroll-mt-24 overflow-hidden bg-[#102A20] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-60 -z-10 h-[580px] w-[580px] rounded-full bg-[#18794E]/25 blur-[100px]" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="process-heading" className="max-w-2xl text-3xl font-semibold leading-[1.15] tracking-[-0.04em] sm:text-4xl">{copy.home.processTitle}</h2>
              <Link href={quotePath} className="inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-[#B4DFC4]/30 px-5 py-3 text-sm font-semibold text-[#DFF7E7] transition-colors hover:border-[#B4DFC4]/60 hover:bg-white/5 md:self-auto">{copy.home.primary}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <span aria-hidden="true" className="absolute left-7 right-7 top-7 hidden h-px bg-gradient-to-r from-[#B4DFC4]/10 via-[#B4DFC4]/40 to-[#B4DFC4]/10 lg:block" />
              {processSteps[lang].map((step, index) => {
                const Icon = processIcons[index];
                return (
                  <li key={step.title} className="relative">
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B4DFC4]/25 bg-[#163629] text-[#A6E3BD]"><Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" /><span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#78D5A6] text-[11px] font-bold tabular-nums text-[#0B1F17]">{index + 1}</span></span>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#F0FAF3]">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-7 text-[#B8CBBF]">{step.text}</p>
                  </li>
                );
              })}
            </ol>
            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-[#B4DFC4]/15 bg-[#B4DFC4]/15 sm:grid-cols-2 lg:grid-cols-4">
              {trustFacts[lang].map((fact, index) => {
                const Icon = trustIcons[index];
                return <div key={fact.title} className="bg-[#12301F] p-6"><Icon className="h-5 w-5 text-[#78D5A6]" strokeWidth={1.75} aria-hidden="true" /><h3 className="mt-4 text-sm font-semibold text-[#F0FAF3]">{fact.title}</h3><p className="mt-2 text-sm leading-6 text-[#9AB9A6]">{fact.text}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 border-b border-[#DAD8D2] bg-[#FCFDFB]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-16">
              <div className="max-w-3xl">
                <p className="mb-4 text-xs font-semibold text-[#18794E]">{pricingHint}</p>
                <h2 className="text-3xl font-semibold leading-[1.15] tracking-[-0.04em] text-[#102A20] sm:text-4xl">{copy.home.pricingTitle}</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#697467]">{copy.home.pricingBody}</p>
              </div>
              <Link href={localizedPath(lang, '/pricing')} className="inline-flex shrink-0 items-center gap-2 self-start text-sm font-bold text-[#18794E] lg:self-auto">{copy.home.fullPricing}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <div className="mt-10 grid overflow-hidden rounded-3xl border border-[#DAD8D2] bg-white sm:grid-cols-2 lg:grid-cols-4">
              {(['simple', 'standard', 'complex'] as const).map((tier, index) => {
                const featured = index === 1;
                return (
                  <div key={tier} className={`flex flex-col border-b border-[#EAE8E3] p-7 sm:border-r lg:border-b-0 ${featured ? 'bg-[#F3FBF6]' : ''}`}>
                    <h3 className="text-sm font-semibold text-[#102A20]">{copy.common[tier]}</h3>
                    <p className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-[#102A20]"><span className="mr-1 align-top text-2xl leading-10 text-[#697467]">$</span>{settings[`${tier}_tier_price`]}</p>
                    <p className="mb-8 mt-4 text-sm leading-6 text-[#5E6C62]">{tierCopy(`${tier}Description`)}</p>
                    <Link href={quotePath} className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${featured ? 'bg-[#18794E] text-white hover:bg-[#115C3B]' : 'border border-[#D5E3D9] text-[#18794E] hover:border-[#18794E]'}`}>{copy.home.primary}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  </div>
                );
              })}
              <div className="flex flex-col bg-[#102A20] p-7 text-white">
                <h3 className="text-sm font-semibold text-[#A6E3BD]">{custom.title}</h3>
                <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight">{custom.pending}</p>
                <p className="mb-8 mt-4 text-sm leading-6 text-[#B8CBBF]">{custom.description}</p>
                <Link href={`${quotePath}?review=1`} className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/10">{custom.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold leading-[1.15] tracking-[-0.04em] text-[#102A20] sm:text-4xl">{copy.home.faqTitle}</h2>
            <div className="mt-8"><FaqList items={publicFaqs[lang]} /></div>
            <Link href={localizedPath(lang, '/faq')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.faqEyebrow}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="rounded-3xl bg-[#F1EFEA] p-6 sm:p-8 lg:self-start">
            <h2 className="text-xl font-semibold tracking-tight text-[#102A20]">{copy.home.guidesTitle}</h2>
            <ul className="mt-6 space-y-3">
              {guides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={localizedPath(lang, `/guides/${guide.slug}`)} className="group flex items-start justify-between gap-4 rounded-2xl bg-white p-5 transition hover:shadow-md">
                    <span><span className="block font-semibold text-[#102A20]">{guide.title[lang]}</span><span className="mt-1 block text-sm leading-6 text-[#5E625F]">{guide.excerpt[lang]}</span></span>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#18794E] transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={localizedPath(lang, '/guides')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.allGuides}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="bg-[#18794E] text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">{copy.home.finalTitle}</h2><p className="mt-3 max-w-2xl text-white/75">{copy.home.finalBody}</p></div><Link href={`${quotePath}?review=1`} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#115C3B]">{copy.home.primary}<ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <Footer />
    </div>
  );
}
