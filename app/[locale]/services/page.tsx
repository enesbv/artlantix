import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import ServiceVisual from '@/components/ServiceVisual';
import { btnChip, container } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { localizedPath, marketingCopy, normalizeMarketingLocale, services } from '@/lib/marketing';

export const metadata: Metadata = { title: 'Vectorization Services · Artlantix', description: 'Manual vector reconstruction services for print, embroidery, signage and CNC.' };

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const typical = homeCopy[lang].services.typical;

  return (
    <PublicPageShell>
      <main>
        <PageHero title={copy.pages.servicesTitle} body={copy.pages.servicesBody} meta={copy.home.servicesEyebrow} />

        <section className={`${container} pb-24 pt-2 lg:pb-32`}>
          <ol>
            {services.map((service, index) => (
              <li key={service.slug} className="border-b border-ink">
                <Link
                  href={localizedPath(lang, `/services/${service.slug}`)}
                  className="group grid gap-6 py-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[3rem_minmax(0,19rem)_minmax(0,1fr)_11rem] lg:items-center lg:gap-10 lg:py-10"
                >
                  <span className="hidden font-display text-sm font-semibold tabular-nums text-ink-3 transition-colors group-hover:text-signal-ink lg:block">0{index + 1}</span>
                  <div className="border border-ink transition-shadow duration-300 group-hover:shadow-[6px_6px_0_0_var(--color-ink)]">
                    <ServiceVisual slug={service.slug} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-[clamp(1.6rem,2.7vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.025em]">{service.title[lang]}</h2>
                    <p className="mt-3 max-w-[54ch] text-[15px] leading-6 text-ink-2">{service.short[lang]}</p>
                    <p className="mt-4 max-w-[60ch] text-[13px] leading-5 text-ink-3">
                      <span className="font-semibold text-ink-2">{copy.common.idealFor}</span> {service.idealFor[lang].join(' · ')}
                    </p>
                    <div className="mt-5 flex items-end justify-between gap-6 border-t border-rule pt-4 md:hidden">
                      <p>
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{copy.common.from}</span>
                        <span className="font-display text-3xl font-extrabold leading-none tracking-[-0.03em]">${service.startingPrice}</span>
                      </p>
                      <p className="text-right text-[13px] text-ink-3">{typical} {service.turnaround[lang]}</p>
                    </div>
                  </div>
                  <div className="hidden flex-col items-end gap-2 text-right md:flex md:col-span-2 md:flex-row md:items-center md:justify-between lg:col-span-1 lg:flex-col lg:items-end lg:justify-center">
                    <p>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{copy.common.from}</span>
                      <span className="font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.035em]">${service.startingPrice}</span>
                    </p>
                    <p className="text-[13px] text-ink-3">{typical} {service.turnaround[lang]}</p>
                    <span className={`${btnChip} mt-2 border border-ink`}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </PublicPageShell>
  );
}
