'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight, FileLock2, FolderCheck, PenTool, ScanSearch, ShieldCheck, Upload, UserCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MarketingVisual from '@/components/MarketingVisual';
import HeroVectorArtwork from '@/components/HeroVectorArtwork';
import FaqList from '@/components/FaqList';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from '@/lib/services/content';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import { caseStudies, guides, localizedPath, marketingCopy, normalizeMarketingLocale, processSteps, publicFaqs, services, trustFacts } from '@/lib/marketing';

const processIcons = [Upload, ScanSearch, PenTool, FolderCheck];
const trustIcons = [PenTool, FileLock2, ShieldCheck, UserCheck];

const extraCopy = {
  tr: {
    uses: ['Baskı', 'Nakış', 'Tabela', 'CNC', 'Lazer kesim', 'DTF', 'Serigrafi', 'Folyo kesim', 'Web', 'Ambalaj'],
    challenge: 'Sorun', approach: 'Yaklaşım', outcome: 'Sonuç',
    heroMeta: ['Elle yeniden çizim', 'Otomatik izleme yok', 'Teklif onayından sonra ödeme'],
    formats: 'Teslim',
    finalLead: 'Dosyanı gönder,',
    finalAccent: 'gerisi bizde.',
  },
  en: {
    uses: ['Print', 'Embroidery', 'Signage', 'CNC', 'Laser cutting', 'DTF', 'Screen print', 'Vinyl cutting', 'Web', 'Packaging'],
    challenge: 'Problem', approach: 'Approach', outcome: 'Outcome',
    heroMeta: ['Redrawn by hand', 'No auto-trace', 'Pay after quote approval'],
    formats: 'Delivered as',
    finalLead: 'Send your file,',
    finalAccent: 'we handle the rest.',
  },
  de: {
    uses: ['Druck', 'Stickerei', 'Beschilderung', 'CNC', 'Laserschnitt', 'DTF', 'Siebdruck', 'Folienplot', 'Web', 'Verpackung'],
    challenge: 'Problem', approach: 'Vorgehen', outcome: 'Ergebnis',
    heroMeta: ['Von Hand neu gezeichnet', 'Kein Auto-Trace', 'Zahlung nach Freigabe'],
    formats: 'Lieferung',
    finalLead: 'Datei senden,',
    finalAccent: 'den Rest machen wir.',
  },
} as const;

function SectionHead({ index, label, dark = false, action }: { index: string; label: string; dark?: boolean; action?: React.ReactNode }) {
  return (
    <div className={`flex items-center justify-between gap-4 border-t pt-4 text-xs font-medium uppercase tracking-[0.18em] ${dark ? 'border-white/15 text-white/55' : 'border-[#0B1611]/15 text-[#6B6A63]'}`}>
      <span className="flex items-center gap-3"><span className={dark ? 'text-[#C8F169]' : 'text-[#18794E]'}>{index}</span>{label}</span>
      {action}
    </div>
  );
}

export default function HomePageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const extra = extraCopy[lang];
  const custom = customQuoteCopy[lang];
  const tierCopy = useTranslations('quote.complexityGuide');
  const pricingHint = { tr: 'Başlangıç fiyatları · USD', en: 'Starting prices · USD', de: 'Startpreise · USD' }[lang];
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const [activeCase, setActiveCase] = useState(0);
  const study = caseStudies[activeCase];
  const quotePath = localizedPath(lang, '/quote');
  const headline = 'font-display font-normal tracking-[-0.02em]';
  const actionLink = (href: string, label: string, dark = false) => (
    <Link href={href} className={`group inline-flex items-center gap-1.5 normal-case tracking-normal ${dark ? 'text-white hover:text-[#C8F169]' : 'text-[#0B1611] hover:text-[#18794E]'}`}>{label}<ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
  );

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#0B1611]">
      <Navbar />
      <main>
        <section className="relative isolate overflow-hidden bg-[#0B1611] text-[#F4F1EA]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(#C8F169_1px,transparent_1px),linear-gradient(90deg,#C8F169_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 -z-10 h-[640px] w-[640px] rounded-full bg-[#18794E]/35 blur-[140px]" />
          <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 pb-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
              <span className="text-[#C8F169]">{copy.home.eyebrow}</span>
              {extra.heroMeta.map((item) => <span key={item} className="hidden sm:inline">{item}</span>)}
            </div>
            <div className="relative grid items-center lg:grid-cols-[1.25fr_0.75fr]">
              <h1 className={`${headline} relative z-10 pt-10 text-[4.2rem] leading-[0.86] sm:text-[7.5rem] lg:pt-0 lg:text-[10.5rem]`}>
                <span className="block">{copy.home.titleLines[0]}</span>
                <span className="block italic text-[#C8F169]">{copy.home.titleLines[1].toLocaleLowerCase(lang)}.</span>
              </h1>
              <div className="relative mx-auto -mt-4 w-full max-w-[320px] sm:max-w-[440px] lg:-ml-24 lg:mt-0 lg:max-w-none"><HeroVectorArtwork tone="ink" /></div>
            </div>
            <div className="mt-6 grid gap-8 border-t border-white/10 pt-8 lg:mt-2 lg:grid-cols-[1fr_auto] lg:items-end">
              <p className="max-w-xl text-lg leading-8 text-white/70">{copy.home.description}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={quotePath} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C8F169] px-7 text-sm font-semibold text-[#0B1611] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C8F169]">{copy.home.primary}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
                <Link href="#work" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold text-white transition hover:border-white/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{copy.home.secondary}</Link>
              </div>
            </div>
          </div>
        </section>

        <div className="overflow-hidden border-y border-[#0B1611] bg-[#C8F169] py-4 text-[#0B1611]" aria-label={extra.uses.join(', ')}>
          <div aria-hidden="true" className="animate-marquee flex w-max">
            {[0, 1].map((copyIndex) => (
              <div key={copyIndex} className="flex shrink-0 items-center">
                {extra.uses.map((use) => <span key={use} className={`${headline} flex items-center gap-8 pr-8 text-3xl italic sm:text-4xl`}>{use}<span className="h-2 w-2 rotate-45 bg-[#0B1611]" /></span>)}
              </div>
            ))}
          </div>
        </div>

        <section id="work" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionHead index="01" label={copy.home.workEyebrow} action={actionLink(localizedPath(lang, '/work'), copy.home.allWork)} />
          <div className="mt-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <h2 className={`${headline} max-w-3xl text-5xl leading-[0.95] sm:text-6xl lg:text-7xl`}>{copy.home.workTitle}</h2>
            <div role="tablist" aria-label={copy.home.workEyebrow} className="flex gap-6 overflow-x-auto border-b border-[#0B1611]/15">
              {caseStudies.map((item, index) => (
                <button key={item.slug} role="tab" type="button" aria-selected={index === activeCase} onClick={() => setActiveCase(index)} className={`-mb-px shrink-0 border-b-2 pb-3 text-sm font-semibold transition-colors ${index === activeCase ? 'border-[#0B1611] text-[#0B1611]' : 'border-transparent text-[#6B6A63] hover:text-[#0B1611]'}`}>
                  <span className="mr-2 text-[#18794E]">0{index + 1}</span>{item.category[lang].split('·').pop()?.trim()}
                </button>
              ))}
            </div>
          </div>

          <div role="tabpanel" className="mt-12 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:min-h-[380px] lg:[&>div]:min-h-[560px]"><MarketingVisual key={study.slug} kind={study.visual} /></div>
            <div className="flex flex-col">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B6A63]">{copy.common.demo}</p>
              <h3 className={`${headline} mt-4 text-4xl leading-[1.02] sm:text-5xl`}>{study.title[lang]}</h3>
              <dl className="mt-8 border-t border-[#0B1611]/15">
                {(['challenge', 'approach', 'outcome'] as const).map((key) => (
                  <div key={key} className="grid gap-2 border-b border-[#0B1611]/15 py-5 sm:grid-cols-[120px_1fr] sm:gap-6">
                    <dt className={`${headline} text-2xl italic text-[#18794E]`}>{extra[key]}</dt>
                    <dd className="text-[15px] leading-7 text-[#3F4540]">{study[key][lang]}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                {study.deliverables[lang].map((item) => <span key={item} className="border border-[#0B1611]/20 px-3 py-1.5 text-xs text-[#3F4540]">{item}</span>)}
              </div>
              <Link href={localizedPath(lang, `/work/${study.slug}`)} className="group mt-8 inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-[#0B1611] px-7 text-sm font-semibold text-[#F4F1EA] transition hover:bg-[#18794E]">{copy.common.viewCase}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-24 bg-[#EBE6DB]">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <SectionHead index="02" label={copy.home.servicesEyebrow} action={actionLink(localizedPath(lang, '/services'), copy.home.allServices)} />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end">
              <h2 className={`${headline} text-5xl leading-[0.95] sm:text-6xl lg:text-7xl`}>{copy.home.servicesTitle}</h2>
              <p className="max-w-md text-[15px] leading-7 text-[#3F4540] lg:justify-self-end">{copy.home.servicesBody}</p>
            </div>
            <ol className="mt-14 border-t border-[#0B1611]">
              {services.slice(0, 6).map((service, index) => (
                <li key={service.slug}>
                  <Link href={localizedPath(lang, `/services/${service.slug}`)} className="group relative grid grid-cols-[44px_1fr] items-center gap-x-4 border-b border-[#0B1611]/20 py-6 transition-colors hover:bg-[#0B1611] hover:text-[#F4F1EA] sm:grid-cols-[64px_1fr_48px] sm:gap-x-6 sm:px-4">
                    <span className={`${headline} self-start text-3xl leading-none text-[#18794E] group-hover:text-[#C8F169] sm:self-center`}>0{index + 1}</span>
                    <div className="grid gap-2 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-10">
                      <h3 className={`${headline} text-3xl leading-tight sm:text-4xl`}>{service.title[lang]}</h3>
                      <div>
                        <p className="text-sm leading-6 text-[#3F4540] group-hover:text-white/70">{service.short[lang]}</p>
                        <p className="mt-1 text-sm text-[#3F4540] group-hover:text-white/70"><span className="font-semibold text-[#0B1611] group-hover:text-[#C8F169]">{copy.common.from} ${service.startingPrice}</span> · {service.turnaround[lang]}</p>
                      </div>
                    </div>
                    <span aria-hidden="true" className="hidden h-11 w-11 items-center justify-center rounded-full border border-current transition group-hover:border-[#C8F169] group-hover:bg-[#C8F169] group-hover:text-[#0B1611] sm:flex"><ArrowUpRight className="h-4 w-4" /></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="process" aria-labelledby="process-heading" className="relative isolate scroll-mt-24 overflow-hidden bg-[#0B1611] text-[#F4F1EA]">
          <div aria-hidden="true" className="pointer-events-none absolute -left-40 bottom-0 -z-10 h-[520px] w-[520px] rounded-full bg-[#18794E]/30 blur-[140px]" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <SectionHead index="03" label={copy.home.processEyebrow} dark action={actionLink(quotePath, copy.home.primary, true)} />
            <h2 id="process-heading" className={`${headline} mt-10 max-w-4xl text-5xl leading-[0.95] sm:text-6xl lg:text-7xl`}>{copy.home.processTitle}</h2>
            <ol className="mt-16 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps[lang].map((step, index) => {
                const Icon = processIcons[index];
                return (
                  <li key={step.title} className="group bg-[#0B1611] p-6 transition-colors hover:bg-[#12211A] sm:p-8">
                    <div className="flex items-start justify-between">
                      <span className={`${headline} text-7xl leading-none text-[#C8F169]`}>{index + 1}</span>
                      <Icon className="h-6 w-6 text-white/40 transition-colors group-hover:text-[#C8F169]" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="mt-10 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/60">{step.text}</p>
                  </li>
                );
              })}
            </ol>
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trustFacts[lang].map((fact, index) => {
                const Icon = trustIcons[index];
                return <div key={fact.title} className="border-l border-[#C8F169]/40 pl-5"><Icon className="h-5 w-5 text-[#C8F169]" strokeWidth={1.5} aria-hidden="true" /><h3 className="mt-4 text-sm font-semibold">{fact.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{fact.text}</p></div>;
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <SectionHead index="04" label={pricingHint} action={actionLink(localizedPath(lang, '/pricing'), copy.home.fullPricing)} />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <h2 className={`${headline} text-5xl leading-[0.95] sm:text-6xl lg:text-7xl`}>{copy.home.pricingTitle}</h2>
            <p className="max-w-md text-[15px] leading-7 text-[#3F4540] lg:justify-self-end">{copy.home.pricingBody}</p>
          </div>
          <div className="mt-14 grid border-t border-[#0B1611] sm:grid-cols-2 lg:grid-cols-4">
            {(['simple', 'standard', 'complex'] as const).map((tier, index) => {
              const featured = index === 1;
              return (
                <div key={tier} className={`flex flex-col border-b border-[#0B1611]/20 px-1 py-8 sm:px-6 lg:border-b-0 lg:border-r ${featured ? 'bg-[#E4EEDC] px-6' : ''}`}>
                  <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#6B6A63]">{copy.common[tier]}</h3>
                  <p className={`${headline} mt-6 text-8xl leading-none`}><span className="mr-1 align-top text-4xl text-[#6B6A63]">$</span>{settings[`${tier}_tier_price`]}</p>
                  <p className="mb-8 mt-6 text-sm leading-6 text-[#3F4540]">{tierCopy(`${tier}Description`)}</p>
                  <Link href={quotePath} className={`group mt-auto inline-flex min-h-12 items-center justify-between gap-2 rounded-full px-6 text-sm font-semibold transition ${featured ? 'bg-[#0B1611] text-[#F4F1EA] hover:bg-[#18794E]' : 'border border-[#0B1611]/25 hover:border-[#0B1611]'}`}>{copy.home.primary}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
                </div>
              );
            })}
            <div className="flex flex-col bg-[#0B1611] p-6 text-[#F4F1EA] sm:py-8">
              <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-[#C8F169]">{custom.title}</h3>
              <p className={`${headline} mt-6 text-4xl italic leading-[1.05]`}>{custom.pending}</p>
              <p className="mb-8 mt-6 text-sm leading-6 text-white/60">{custom.description}</p>
              <Link href={`${quotePath}?review=1`} className="group mt-auto inline-flex min-h-12 items-center justify-between gap-2 rounded-full bg-[#C8F169] px-6 text-sm font-semibold text-[#0B1611] transition hover:bg-white">{custom.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[#0B1611]/15 bg-[#EBE6DB]">
          <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <SectionHead index="05" label={copy.home.faqEyebrow} action={actionLink(localizedPath(lang, '/faq'), copy.home.faqEyebrow)} />
              <h2 className={`${headline} mt-10 text-5xl leading-[0.95] sm:text-6xl`}>{copy.home.faqTitle}</h2>
              <div className="mt-10"><FaqList items={publicFaqs[lang]} /></div>
            </div>
            <div>
              <SectionHead index="06" label={copy.home.guidesEyebrow} action={actionLink(localizedPath(lang, '/guides'), copy.home.allGuides)} />
              <ul className="mt-10 space-y-4">
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={localizedPath(lang, `/guides/${guide.slug}`)} className="group block border border-[#0B1611]/15 bg-[#F4F1EA] p-6 transition hover:border-[#0B1611] hover:bg-white">
                      <span className="flex items-start justify-between gap-4"><span className={`${headline} text-2xl leading-tight`}>{guide.title[lang]}</span><ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-[#18794E] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
                      <span className="mt-3 block text-sm leading-6 text-[#3F4540]">{guide.excerpt[lang]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-[#0B1611] text-[#F4F1EA]">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(#C8F169_1px,transparent_1px),linear-gradient(90deg,#C8F169_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <h2 className={`${headline} text-6xl leading-[0.9] sm:text-8xl lg:text-[8.5rem]`}>{extra.finalLead}<br /><span className="italic text-[#C8F169]">{extra.finalAccent}</span></h2>
            <div className="mt-12 flex flex-col gap-8 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-xl text-lg leading-8 text-white/65">{copy.home.finalBody}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`${quotePath}?review=1`} className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C8F169] px-7 text-sm font-semibold text-[#0B1611] transition hover:bg-white">{copy.home.primary}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Link>
                <span className="inline-flex min-h-12 items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/45">{extra.formats} · AI · EPS · SVG · PDF · PNG</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
