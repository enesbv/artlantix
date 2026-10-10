import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import FaqList from '@/components/FaqList';
import { btnChip, btnPrimary, container } from '@/components/ui/styles';
import { localizedPath, marketingCopy, normalizeMarketingLocale, publicFaqs } from '@/lib/marketing';

export const metadata: Metadata = { title: 'FAQ · Artlantix', description: 'Answers about quotes, production, private files, revisions and delivery.' };

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];

  return (
    <PublicPageShell>
      <main>
        <PageHero title={copy.pages.faqTitle} body={copy.pages.faqBody} meta={copy.home.faqEyebrow} />

        <section className={`${container} pb-24 pt-10 lg:pb-32 lg:pt-14`}>
          <div className="grid gap-14 lg:grid-cols-[minmax(0,.62fr)_minmax(0,1.38fr)] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="border border-ink bg-paper-2 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)]">
                <p className="flex items-center gap-2 border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
                  <span aria-hidden="true" className="h-2 w-2 bg-signal" />
                  {copy.home.faqEyebrow}
                </p>
                <div className="p-6 sm:p-7">
                  <h2 className="font-display text-[1.65rem] font-bold leading-[1.12] tracking-[-0.025em]">{copy.home.finalTitle}</h2>
                  <p className="mt-4 text-[15px] leading-6 text-ink-2">{copy.home.finalBody}</p>
                  <Link href={`${localizedPath(lang, '/quote')}?review=1`} className={`${btnPrimary} mt-7`}>
                    {copy.home.primary}
                    <span className={btnChip}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                  </Link>
                </div>
              </div>
            </aside>

            <FaqList items={publicFaqs[lang]} />
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
