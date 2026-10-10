import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import WorkPlates from '@/components/home/WorkPlates';
import DropCta from '@/components/home/DropCta';
import { container, sectionTitleSm } from '@/components/ui/styles';
import { homeCopy } from '@/lib/home-copy';
import { caseStudies, localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';

export const metadata: Metadata = {
  title: 'Studio Demonstrations · Artlantix',
  description: 'See how Artlantix approaches common vector reconstruction problems with interactive split-slider inspection.',
};

const inspect = {
  en: {
    label: 'Inspection desk',
    title: 'Slide to compare the pixels with the paths.',
    body: 'Drag the handle, or use the arrow keys, to compare degraded pixel artifacts with the clean Bézier paths of the redrawn version. This is a studio demonstration, not a customer file.',
  },
  de: {
    label: 'Prüftisch',
    title: 'Schieben Sie, um Pixel und Pfade zu vergleichen.',
    body: 'Ziehen Sie den Regler oder nutzen Sie die Pfeiltasten, um Pixelartefakte mit den sauberen Bézier-Pfaden der neu gezeichneten Fassung zu vergleichen. Das ist eine Studio-Demonstration, keine Kundendatei.',
  },
  tr: {
    label: 'İnceleme masası',
    title: 'Kaydırarak pikselleri yollarla karşılaştırın.',
    body: 'Tutamacı sürükleyin ya da ok tuşlarını kullanın; bozuk piksel kalıntılarını yeniden çizilmiş sürümün temiz Bézier yollarıyla karşılaştırın. Bu, bir stüdyo demonstrasyonudur; müşteri dosyası değildir.',
  },
} as const;

export default async function WorkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const text = inspect[lang];

  return (
    <PublicPageShell>
      <main>
        <PageHero title={copy.pages.workTitle} body={copy.pages.workBody} meta={copy.common.demo} />

        <section className={`${container} py-16 lg:py-24`}>
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-16">
            <div>
              <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-2">
                <span aria-hidden="true" className="h-2 w-2 bg-signal" />
                {text.label}
              </p>
              <h2 className={`${sectionTitleSm} mt-5 max-w-2xl`}>{text.title}</h2>
            </div>
            <p className="text-[15px] leading-7 text-ink-2">{text.body}</p>
          </div>
          <BeforeAfterSlider />
        </section>

        <WorkPlates lang={lang} demo={copy.common.demo} viewCase={copy.common.viewCase} studies={caseStudies} plain />

        <DropCta title={copy.home.finalTitle} body={copy.home.finalBody} action={copy.home.primary} href={`${localizedPath(lang, '/quote')}?review=1`} formats={h.cta.formats} />
      </main>
    </PublicPageShell>
  );
}
