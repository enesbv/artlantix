import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import DropCta from '@/components/home/DropCta';
import { container } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { getGuide, guides, localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';
import { routing } from '@/i18n/routing';

const contentsLabel = { en: 'Contents', de: 'Inhalt', tr: 'İçindekiler' } as const;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => guides.map((guide) => ({ locale, slug: guide.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const lang = normalizeMarketingLocale(locale);
  return { title: `${guide.title[lang]} · Artlantix`, description: guide.excerpt[lang] };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const guide = getGuide(slug);
  if (!guide) notFound();
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const sections = guide.sections[lang];

  return (
    <PublicPageShell>
      <main>
        <PageHero
          back={{ href: localizedPath(lang, '/guides'), label: copy.common.back }}
          meta={guide.readTime[lang]}
          title={guide.title[lang]}
          body={guide.excerpt[lang]}
        />

        <article className={`${container} py-16 lg:py-24`}>
          <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,44rem)] lg:gap-24">
            <nav aria-label={contentsLabel[lang]} className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">{contentsLabel[lang]}</p>
                <ol className="mt-4 border-t border-ink">
                  {sections.map((section, index) => (
                    <li key={section.title} className="border-b border-rule">
                      <a href={`#section-${index + 1}`} className="group flex gap-3 py-3 text-[15px] leading-snug text-ink-2 transition-colors hover:text-ink">
                        <span className="font-display text-sm font-semibold tabular-nums text-ink-3 transition-colors group-hover:text-signal-ink">0{index + 1}</span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="space-y-16">
              {sections.map((section, index) => (
                <section key={section.title} id={`section-${index + 1}`} className="scroll-mt-28">
                  <span aria-hidden="true" className="block font-display text-[3.25rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]">0{index + 1}</span>
                  <h2 className="mt-5 font-display text-[clamp(1.7rem,2.6vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.025em]">{section.title}</h2>
                  <p className="mt-5 text-lg leading-8 text-ink-2">{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </article>

        <DropCta title={copy.home.finalTitle} body={copy.home.finalBody} action={copy.home.primary} href={`${localizedPath(lang, '/quote')}?review=1`} formats={h.cta.formats} />
      </main>
    </PublicPageShell>
  );
}
