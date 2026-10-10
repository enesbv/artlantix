import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import Sheet from '@/components/ui/Sheet';
import RuledColumns from '@/components/ui/RuledColumns';
import ServiceVisual from '@/components/ServiceVisual';
import DropCta from '@/components/home/DropCta';
import { btnChip, btnPrimary, container, textLink } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { getService, localizedPath, marketingCopy, normalizeMarketingLocale, services } from '@/lib/marketing';
import { routing } from '@/i18n/routing';

const pad = (n: number) => String(n).padStart(2, '0');

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => services.map((service) => ({ locale, slug: service.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = getService(slug);
  if (!item) return {};
  const lang = normalizeMarketingLocale(locale);
  return { title: `${item.title[lang]} · Artlantix`, description: item.short[lang] };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const item = getService(slug);
  if (!item) notFound();
  const index = services.findIndex((service) => service.slug === item.slug);
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const quoteHref = `${localizedPath(lang, '/quote')}?service=${item.slug}`;
  const others = services.filter((service) => service.slug !== item.slug);

  return (
    <PublicPageShell>
      <main>
        <PageHero
          back={{ href: localizedPath(lang, '/services'), label: copy.common.back }}
          meta={copy.home.servicesEyebrow}
          title={item.title[lang]}
          body={item.description[lang]}
          actions={
            <Link href={quoteHref} className={btnPrimary}>
              {copy.common.startService}
              <span className={btnChip}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
          }
          aside={
            <Sheet
              caption={`${pad(index + 1)} / ${pad(services.length)}`}
              cells={[[copy.common.from, `$${item.startingPrice}`], [h.services.typical, item.turnaround[lang]]]}
            >
              <ServiceVisual slug={item.slug} />
            </Sheet>
          }
        />

        <section className={`${container} py-16 lg:py-24`}>
          <RuledColumns
            columns={[
              { title: copy.common.included, items: item.includes[lang] },
              { title: copy.common.idealFor, items: item.idealFor[lang] },
              { title: copy.common.useCases, items: item.useCases[lang] },
            ]}
          />
        </section>

        <section className="border-t border-rule">
          <div className={`${container} py-14 lg:py-20`}>
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em]">{copy.home.servicesEyebrow}</h2>
              <Link href={localizedPath(lang, '/services')} className={`${textLink} hidden shrink-0 sm:inline-flex`}>
                {copy.home.allServices}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-8 border-t border-ink">
              {others.map((service) => (
                <li key={service.slug} className="border-b border-ink">
                  <Link
                    href={localizedPath(lang, `/services/${service.slug}`)}
                    className="group grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-6 py-4 sm:grid-cols-[3rem_minmax(0,1fr)_auto_auto]"
                  >
                    <span className="hidden font-display text-sm font-semibold tabular-nums text-ink-3 transition-colors group-hover:text-signal-ink sm:block">{pad(services.findIndex((s) => s.slug === service.slug) + 1)}</span>
                    <span className="font-display text-lg font-bold leading-snug tracking-[-0.015em] transition-transform duration-300 group-hover:translate-x-1.5 sm:text-xl">{service.title[lang]}</span>
                    <span className="text-[13px] font-semibold text-ink-2">{copy.common.from} ${service.startingPrice}</span>
                    <ArrowUpRight className="h-5 w-5 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-ink" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <DropCta title={copy.home.finalTitle} body={copy.home.finalBody} action={copy.common.startService} href={quoteHref} formats={h.cta.formats} />
      </main>
    </PublicPageShell>
  );
}
