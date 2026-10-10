import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import Sheet from '@/components/ui/Sheet';
import MarketingVisual from '@/components/MarketingVisual';
import ServiceVisual from '@/components/ServiceVisual';
import { btnChip, btnPrimary, container } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { caseStudies, getCaseStudy, getService, localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';
import { routing } from '@/i18n/routing';

const stageLabels = {
  tr: ['Problem', 'Yaklaşım', 'Üretim sonucu'],
  en: ['Challenge', 'Approach', 'Production outcome'],
  de: ['Problem', 'Vorgehen', 'Produktionsergebnis'],
} as const;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => caseStudies.map((study) => ({ locale, slug: study.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getCaseStudy(slug);
  if (!item) return {};
  const lang = normalizeMarketingLocale(locale);
  return { title: `${item.title[lang]} · Artlantix`, description: item.summary[lang] };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const item = getCaseStudy(slug);
  if (!item) notFound();
  const index = caseStudies.findIndex((study) => study.slug === item.slug);
  const service = getService(item.serviceSlug);
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const labels = stageLabels[lang];
  // The category starts with "Studio demonstration ·"; the page keeps only the topic after it.
  const topic = item.category[lang].split('·').slice(1).join('·').trim() || item.category[lang];

  return (
    <PublicPageShell>
      <main>
        <PageHero
          back={{ href: localizedPath(lang, '/work'), label: copy.common.back }}
          meta={`${copy.common.demo} · ${topic}`}
          title={item.title[lang]}
          body={item.summary[lang]}
          aside={
            <Sheet caption={copy.common.demo} number={`No. 00${index + 1}`}>
              <MarketingVisual kind={item.visual} />
            </Sheet>
          }
        />

        <section className={`${container} py-16 lg:py-24`}>
          <ol className="grid border-y border-ink md:grid-cols-3">
            {[item.challenge[lang], item.approach[lang], item.outcome[lang]].map((value, i) => (
              <li key={labels[i]} className={`py-8 md:px-8 md:py-10 ${i === 0 ? 'md:pl-0' : 'border-t border-ink md:border-l md:border-t-0'} ${i === 2 ? 'md:pr-0' : ''}`}>
                <span aria-hidden="true" className="block font-display text-[3.75rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]">0{i + 1}</span>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-[-0.02em]">{labels[i]}</h2>
                <p className="mt-3 text-[15px] leading-7 text-ink-2">{value}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${container} pb-20 lg:pb-28`}>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-20">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{copy.common.included}</h2>
              <ul className="mt-6 border-b border-rule">
                {item.deliverables[lang].map((value) => (
                  <li key={value} className="flex gap-3 border-t border-rule py-3 text-[15px] leading-6 text-ink-2">
                    <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-signal" />
                    {value}
                  </li>
                ))}
              </ul>
            </div>

            {service && (
              <div>
                <Sheet caption={service.title[lang]} cells={[[copy.common.from, `$${service.startingPrice}`], [h.services.typical, service.turnaround[lang]]]}>
                  <ServiceVisual slug={service.slug} />
                </Sheet>
                <p className="mt-6 text-[15px] leading-6 text-ink-2">{service.short[lang]}</p>
                <Link href={`${localizedPath(lang, '/quote')}?service=${service.slug}`} className={`${btnPrimary} mt-6`}>
                  {copy.common.startService}
                  <span className={btnChip}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
