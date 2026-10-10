import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mark } from '@/components/brand/Brand';
import HeroSheet from '@/components/home/HeroSheet';
import ProblemSheet from '@/components/home/ProblemSheet';
import WorkPlates from '@/components/home/WorkPlates';
import ServicesIndex from '@/components/home/ServicesIndex';
import ProcessPath from '@/components/home/ProcessPath';
import RateCard from '@/components/home/RateCard';
import GuidesStrip from '@/components/home/GuidesStrip';
import DropCta from '@/components/home/DropCta';
import { btnChip, btnPrimary, container, textLink } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { caseStudies, guides, localizedPath, marketingCopy, normalizeMarketingLocale, processSteps, services } from '@/lib/marketing';

const FORMATS = ['AI', 'EPS', 'SVG', 'PDF', 'PNG'];

export default function HomePageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const quotePath = localizedPath(lang, '/quote');

  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative overflow-hidden border-b border-rule">
          <div className={`${container} grid gap-16 pb-24 pt-14 md:gap-24 md:pt-20 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,.96fr)] lg:items-center lg:gap-12 lg:pb-32 lg:pt-24`}>
            <div>
              <p className="rise-in flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-2">
                <Mark size={22} className="text-ink" />
                {copy.home.eyebrow}
              </p>
              <h1 className="mt-7 font-display text-[clamp(3rem,15.5vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.045em] lg:text-[clamp(3.6rem,6.4vw,6rem)]">
                {h.hero.lines.map((line, index) => (
                  <span key={line} className="rise-in block" style={{ animationDelay: `${120 + index * 110}ms` }}>
                    {index === h.hero.lines.length - 1 ? <span className="swash">{line}</span> : line}
                  </span>
                ))}
              </h1>
              <p className="rise-in mt-9 max-w-xl text-lg leading-8 text-ink-2" style={{ animationDelay: '480ms' }}>{copy.home.description}</p>

              <div className="rise-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-5" style={{ animationDelay: '580ms' }}>
                <Link href={quotePath} className={btnPrimary}>
                  {copy.home.primary}
                  <span className={btnChip}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </Link>
                <Link href="#process" className={textLink}>{h.hero.howItWorks}</Link>
              </div>

              <div className="rise-in mt-12 flex flex-wrap items-center gap-x-4 gap-y-3" style={{ animationDelay: '680ms' }}>
                <span className="text-[13px] font-medium text-ink-3">{h.hero.deliveredAs}</span>
                <ul className="flex flex-wrap gap-2">
                  {FORMATS.map((format) => (
                    <li key={format} className="border border-ink px-2 py-0.5 text-[11px] font-semibold tracking-[0.06em]">{format}</li>
                  ))}
                </ul>
              </div>
              <p className="rise-in mt-5 max-w-md text-sm leading-6 text-ink-3" style={{ animationDelay: '760ms' }}>{h.hero.reassurance}</p>
            </div>

            <div className="rise-in md:pt-6" style={{ animationDelay: '300ms' }}>
              <HeroSheet demoLabel={copy.common.demo} copy={h.sheet} />
            </div>
          </div>
        </section>

        <ProblemSheet copy={h.problem} />

        <WorkPlates
          lang={lang}
          title={copy.home.workTitle}
          body={copy.home.workBody}
          demo={copy.common.demo}
          viewCase={copy.common.viewCase}
          allLabel={copy.home.allWork}
          studies={caseStudies}
        />

        <ServicesIndex
          lang={lang}
          title={copy.home.servicesTitle}
          body={copy.home.servicesBody}
          allLabel={copy.home.allServices}
          allHref={localizedPath(lang, '/services')}
          from={copy.common.from}
          typical={h.services.typical}
          idealFor={copy.common.idealFor}
          included={copy.common.included}
          services={services.slice(0, 6)}
        />

        <ProcessPath title={copy.home.processTitle} steps={processSteps[lang]} cta={copy.home.primary} href={quotePath} />

        <RateCard
          lang={lang}
          title={copy.home.pricingTitle}
          body={copy.home.pricingBody}
          fullPricing={copy.home.fullPricing}
          action={copy.home.primary}
          tierLabels={{ simple: copy.common.simple, standard: copy.common.standard, complex: copy.common.complex }}
          copy={h.pricing}
        />

        <GuidesStrip lang={lang} title={copy.home.guidesTitle} allLabel={copy.home.allGuides} guides={guides} />

        <DropCta title={copy.home.finalTitle} body={copy.home.finalBody} action={copy.home.primary} href={`${quotePath}?review=1`} formats={h.cta.formats} />
      </main>
      <Footer />
    </>
  );
}
