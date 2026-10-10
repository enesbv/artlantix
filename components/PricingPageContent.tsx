'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import PageHero from '@/components/ui/PageHero';
import DropCta from '@/components/home/DropCta';
import { OpenSpecimen, Specimen } from '@/components/home/RateCard';
import { container, textLink } from '@/components/ui/styles';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import { homeCopy } from '@/lib/home-copy';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from '@/lib/services/content';
import { localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';

const TIERS = ['simple', 'standard', 'complex'] as const;

const labels = {
  tr: {
    tiers: ['Basit', 'Standart', 'Karmaşık'],
    features: [['Temiz temel geometriler', '1–2 renk dahil', 'Üretim masterları'], ['Çok renkli logo ve rozetler', 'Dengeli eğri rekonstrüksiyonu', 'Üretim masterları'], ['Maskot ve ayrıntılı çizimler', 'Derin manuel rekonstrüksiyon', 'Uzman dosya incelemesi']],
    cta: 'Dosyanızla teklif oluşturun',
    note: 'Öncelikli ekspres teslim ve isteğe bağlı ek hizmetler (marka kimliği, alternatif logo tasarımı, sosyal medya tasarım seti) tahmini değiştirir. Nihai fiyatı, çalışma başlamadan önce stüdyo onaylar.',
  },
  en: {
    tiers: ['Simple', 'Standard', 'Complex'],
    features: [['Clean basic geometry', '1–2 colors included', 'Production masters'], ['Multi-color logos and badges', 'Balanced path reconstruction', 'Production masters'], ['Mascots and detailed artwork', 'Deep manual reconstruction', 'Expert file review']],
    cta: 'Build a quote with your file',
    note: 'Priority express delivery and the optional extras (brand identity, alternative logo design, social media design kit) change the estimate. The studio confirms the final price before any work starts.',
  },
  de: {
    tiers: ['Einfach', 'Standard', 'Komplex'],
    features: [['Saubere Grundgeometrie', '1–2 Farben enthalten', 'Produktions-Master'], ['Mehrfarbige Logos und Abzeichen', 'Ausgewogene Pfadrekonstruktion', 'Produktions-Master'], ['Maskottchen und Detailgrafiken', 'Tiefe manuelle Rekonstruktion', 'Expertenprüfung']],
    cta: 'Angebot mit Datei erstellen',
    note: 'Prioritäts-Express und die optionalen Zusatzleistungen (Markenidentität, alternativer Logoentwurf, Social-Media-Designset) verändern die Schätzung. Das Studio bestätigt den Endpreis, bevor die Arbeit beginnt.',
  },
} as const;

const rowGrid = 'grid gap-6 p-6 sm:p-8 lg:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)_14rem] lg:items-center lg:gap-10';

export default function PricingPageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const h = homeCopy[lang];
  const text = labels[lang];
  const custom = customQuoteCopy[lang];
  const tierCopy = useTranslations('quote.complexityGuide');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const quotePath = localizedPath(lang, '/quote');

  return (
    <PublicPageShell>
      <main>
        <PageHero title={copy.pages.pricingTitle} body={copy.pages.pricingBody} meta={copy.home.pricingEyebrow} />

        <section className={`${container} pb-16 pt-10 lg:pb-24 lg:pt-14`}>
          <div className="border border-ink bg-paper-2 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)]">
            <div className="flex items-center justify-between border-b border-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]">
              <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{h.pricing.rateCard}</span>
              <span className="text-ink-3">{h.pricing.hint}</span>
            </div>

            <ul>
              {TIERS.map((tier, index) => (
                <li key={tier} className={`${rowGrid} ${index > 0 ? 'border-t border-ink' : ''}`}>
                  <Specimen tier={tier} />
                  <div>
                    <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.025em]">{text.tiers[index]}</h2>
                    <p className="mt-3 max-w-[42ch] text-[15px] leading-6 text-ink-2">{tierCopy(`${tier}Description`)}</p>
                  </div>
                  <ul>
                    {text.features[index].map((feature) => (
                      <li key={feature} className="flex gap-3 border-t border-rule py-2.5 text-[15px] leading-6 text-ink-2 first:border-t-0 lg:first:border-t">
                        <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-signal" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="lg:text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{copy.common.from}</p>
                    <p className="mt-1 font-display text-[clamp(3.4rem,5vw,4.5rem)] font-extrabold leading-none tracking-[-0.045em]">
                      <span className="mr-1 align-top text-[0.42em] font-bold text-ink-3">$</span>{settings[`${tier}_tier_price`]}
                    </p>
                    <p className="mt-5">
                      <Link href={`${quotePath}?tier=${tier}`} className={textLink}>
                        {text.cta}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </p>
                  </div>
                </li>
              ))}

              <li className={`${rowGrid} border-t border-ink bg-signal-tint/70`}>
                <OpenSpecimen />
                <div>
                  <h2 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.025em]">{custom.title}</h2>
                  <p className="mt-3 max-w-[42ch] text-[15px] leading-6 text-ink-2">{custom.description}</p>
                </div>
                <p className="max-w-[44ch] text-[15px] leading-6 text-ink-2">{custom.note}</p>
                <div className="lg:text-right">
                  <p className="font-hand text-[2.5rem] font-semibold leading-[0.95] text-signal-ink">{custom.pending}</p>
                  <p className="mt-5">
                    <Link href={`${quotePath}?review=1`} className={textLink}>
                      {custom.action}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <p className="mt-8 max-w-3xl text-[15px] leading-7 text-ink-2">{text.note}</p>
        </section>

        <DropCta title={copy.home.finalTitle} body={copy.home.finalBody} action={copy.home.primary} href={`${quotePath}?review=1`} formats={h.cta.formats} />
      </main>
    </PublicPageShell>
  );
}
