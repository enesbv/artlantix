import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import { container } from '@/components/ui/styles';
import { guides, localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';

export const metadata: Metadata = { title: 'Vector Production Guides · Artlantix', description: 'Practical guides for vector artwork, print, cutting and embroidery.' };

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];

  return (
    <PublicPageShell>
      <main>
        <PageHero title={copy.pages.guidesTitle} body={copy.pages.guidesBody} meta={copy.home.guidesEyebrow} />

        <section className={`${container} pb-24 pt-2 lg:pb-32`}>
          <ol>
            {guides.map((guide, index) => (
              <li key={guide.slug} className="border-b border-ink">
                <Link
                  href={localizedPath(lang, `/guides/${guide.slug}`)}
                  className="group grid gap-x-10 gap-y-4 py-9 md:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1fr)] lg:py-11"
                >
                  <span className="font-display text-sm font-semibold tabular-nums text-ink-3 transition-colors group-hover:text-signal-ink md:pt-2">0{index + 1}</span>
                  <h2 className="font-display text-[clamp(1.6rem,2.7vw,2.4rem)] font-bold leading-[1.08] tracking-[-0.025em] transition-transform duration-300 group-hover:translate-x-1.5">{guide.title[lang]}</h2>
                  <div className="md:col-start-3">
                    <p className="max-w-[48ch] text-[15px] leading-6 text-ink-2">{guide.excerpt[lang]}</p>
                    <p className="mt-4 flex items-center gap-2 text-[13px] font-semibold text-ink-3">
                      {guide.readTime[lang]}
                      <ArrowUpRight className="h-4 w-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-ink" aria-hidden="true" />
                    </p>
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
