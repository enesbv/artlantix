'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ContactPricingCard from '@/components/ContactPricingCard';
import { ArrowRight, Check, CircleDollarSign, FolderCheck, PenTool, ScanSearch, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketingVisual from '@/components/MarketingVisual';
import ServiceVisual from '@/components/ServiceVisual';
import FaqList from '@/components/FaqList';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from '@/lib/services/content';
import { caseStudies, guides, localizedPath, marketingCopy, normalizeMarketingLocale, processSteps, publicFaqs, services } from '@/lib/marketing';

const processIcons = [Upload, ScanSearch, PenTool, FolderCheck];

export default function HomePageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const quotePath = localizedPath(lang, '/quote');

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
            <MarketingVisual />
          </div>
        </section>

        <section id="work" className="scroll-mt-24 border-b border-[#DAD8D2] bg-[#FCFDFB]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-20">
              <div>
                <span className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#18794E]"><span className="h-1.5 w-1.5 rounded-full bg-[#18794E]" aria-hidden="true" />{copy.home.workEyebrow}</span>
                <h2 className="max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.04em] text-[#102A20] sm:text-4xl lg:text-[2.75rem]">{copy.home.workTitle}</h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#697467] lg:pb-1">{copy.home.workBody}</p>
            </div>

            <div className="mt-10 mb-12">
              <BeforeAfterSlider />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {caseStudies.map((study) => (
                <Link key={study.slug} href={localizedPath(lang, `/work/${study.slug}`)} className="group overflow-hidden rounded-2xl border border-[#DAD8D2] bg-[#F9F8F6]">
                  <MarketingVisual kind={study.visual} compact />
                  <div className="p-6">
                    <span className="rounded-full bg-[#E9F9EE] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#115C3B]">{copy.common.demo}</span>
                    <h3 className="mt-4 text-xl font-bold text-[#102A20]">{study.title[lang]}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#5E625F]">{study.summary[lang]}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.common.viewCase}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href={localizedPath(lang, '/work')} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.allWork}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><h2 className="max-w-2xl text-4xl font-black tracking-tight text-[#102A20]">{copy.home.servicesTitle}</h2><p className="mt-4 max-w-2xl text-[#5E625F]">{copy.home.servicesBody}</p></div>
            <Link href={localizedPath(lang, '/services')} className="inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.allServices}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <Link key={service.slug} href={localizedPath(lang, `/services/${service.slug}`)} className="group rounded-2xl border border-[#DAD8D2] bg-white p-6 transition hover:-translate-y-1 hover:border-[#8FC9A6] hover:shadow-lg">
                <ServiceVisual slug={service.slug} />
                <div className="flex items-center justify-end"><ArrowRight className="h-4 w-4 text-[#18794E] transition-transform group-hover:translate-x-1" /></div>
                <h3 className="mt-8 text-xl font-bold text-[#102A20]">{service.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-[#5E625F]">{service.short[lang]}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[#EAE8E3] pt-4 text-xs"><span>{copy.common.from} <strong>${service.startingPrice}</strong></span><span>{service.turnaround[lang]}</span></div>
              </Link>
            ))}
          </div>
        </section>

        <section id="process" aria-labelledby="process-heading" className="relative isolate scroll-mt-24 overflow-hidden bg-[#102A20] text-white">
          <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-60 -z-10 h-[580px] w-[580px] rounded-full bg-[#18794E]/25 blur-[100px]" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 id="process-heading" className="max-w-2xl text-3xl font-semibold leading-[1.15] tracking-[-0.04em] sm:text-4xl lg:text-[2.75rem]">{copy.home.processTitle}</h2>
              <Link href={quotePath} className="inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-[#B4DFC4]/30 px-5 py-3 text-sm font-semibold text-[#DFF7E7] transition-colors hover:border-[#B4DFC4]/60 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B4DFC4] md:self-auto">
                {copy.home.primary}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ol className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {processSteps[lang].map((step, index) => {
                const Icon = processIcons[index];
                return (
                  <li key={step.title} className="relative flex flex-col rounded-2xl border border-[#B4DFC4]/15 bg-gradient-to-b from-white/[0.055] to-white/[0.015] p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B4DFC4]/20 bg-[#B4DFC4]/[0.07] text-[#A6E3BD]">
                        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="text-sm font-medium tabular-nums text-[#9AB9A6]" aria-hidden="true">0{index + 1}</span>
                    </div>
                    <h3 className="mt-7 text-lg font-semibold tracking-tight text-[#F0FAF3]">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#B8CBBF]">{step.text}</p>
                    {index < processSteps[lang].length - 1 && <span aria-hidden="true" className="absolute -right-[21px] top-10 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-[#3D5C49] bg-[#163629] text-[#A6E3BD] lg:flex"><ArrowRight className="h-3 w-3" /></span>}
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section id="pricing" className="border-y border-[#DAD8D2] bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-1 lg:px-8">
            <div><h2 className="text-4xl font-black tracking-tight text-[#102A20]">{copy.home.pricingTitle}</h2><p className="mt-4 leading-7 text-[#5E625F]">{copy.home.pricingBody}</p><Link href={localizedPath(lang, '/pricing')} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.home.fullPricing}<ArrowRight className="h-4 w-4" /></Link></div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[[copy.common.simple, settings.simple_tier_price], [copy.common.standard, settings.standard_tier_price], [copy.common.complex, settings.complex_tier_price]].map(([label, price], index) => <div key={label} className={`rounded-2xl border p-6 ${index === 1 ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#DAD8D2] bg-[#F9F8F6]'}`}><CircleDollarSign className="h-5 w-5 text-[#18794E]" /><p className="mt-8 text-sm font-bold">{label}</p><p className="mt-2 text-3xl font-black">${price}</p><p className="mt-2 text-xs text-[#5E625F]">{copy.common.from}</p></div>)}<ContactPricingCard locale={lang} /></div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6"><h2 className="text-4xl font-black tracking-tight text-[#102A20]">{copy.home.guidesTitle}</h2><Link href={localizedPath(lang, '/guides')} className="hidden items-center gap-2 text-sm font-bold text-[#18794E] sm:inline-flex">{copy.home.allGuides}<ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{guides.map((guide) => <Link key={guide.slug} href={localizedPath(lang, `/guides/${guide.slug}`)} className="rounded-2xl border border-[#DAD8D2] bg-white p-6 transition hover:border-[#8FC9A6]"><h3 className="text-xl font-bold text-[#102A20]">{guide.title[lang]}</h3><p className="mt-3 text-sm leading-6 text-[#5E625F]">{guide.excerpt[lang]}</p></Link>)}</div>
        </section>

        <section id="faq" className="border-t border-[#DAD8D2] bg-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.7fr_1.3fr] lg:px-8"><h2 className="text-4xl font-black tracking-tight text-[#102A20]">{copy.home.faqTitle}</h2><FaqList items={publicFaqs[lang]} /></div>
        </section>

        <section className="bg-[#18794E] text-white"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8"><div><h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">{copy.home.finalTitle}</h2><p className="mt-3 max-w-2xl text-white/75">{copy.home.finalBody}</p></div><Link href={`${quotePath}?review=1`} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#115C3B]">{copy.home.primary}<ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <Footer />
    </div>
  );
}
