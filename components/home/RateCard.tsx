'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { container, sectionTitle, textLink } from '@/components/ui/styles';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, type SiteSettings } from '@/lib/services/content';
import { localizedPath, type MarketingLocale } from '@/lib/marketing';
import type { HomeCopy } from '@/lib/home-copy';

type Tier = 'simple' | 'standard' | 'complex';

interface Props {
  lang: MarketingLocale;
  title: string;
  body: string;
  fullPricing: string;
  action: string;
  tierLabels: Record<Tier, string>;
  copy: HomeCopy['pricing'];
}

const fix = (n: number) => n.toFixed(2);

/** Points of a star with `n` tips, so a cell can show how many nodes a tier typically needs. */
function starPoints(n: number, outer: number, inner: number): Array<[number, number]> {
  return Array.from({ length: n * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / n - Math.PI / 2;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  });
}

const SPECIMENS: Record<Tier, { tips: number; outer: number; inner: number; rings: number[] }> = {
  simple: { tips: 4, outer: 36, inner: 15, rings: [] },
  standard: { tips: 8, outer: 38, inner: 21, rings: [44] },
  complex: { tips: 16, outer: 39, inner: 27, rings: [46, 18] },
};

/** More tips and rings mean more nodes to place by hand, which is what the tier prices. */
function Specimen({ tier }: { tier: Tier }) {
  const { tips, outer, inner, rings } = SPECIMENS[tier];
  const points = starPoints(tips, outer, inner);
  const d = `M${points.map(([x, y]) => `${fix(x)} ${fix(y)}`).join('L')}Z`;
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--color-ink)" strokeWidth="1.2">
        {rings.map((r) => <circle key={r} cx="50" cy="50" r={r} />)}
      </g>
      <path d={d} fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="50" cy="50" r={tier === 'simple' ? 4 : 5} fill="var(--color-signal)" />
      <g fill="var(--color-paper-2)" stroke="var(--color-guide)" strokeWidth="0.9">
        {points.map(([x, y]) => <rect key={`${fix(x)}-${fix(y)}`} x={fix(x - 1.7)} y={fix(y - 1.7)} width="3.4" height="3.4" />)}
      </g>
    </svg>
  );
}

/** A loose pencil outline with a few open nodes: the scope is still to be drawn. */
function OpenSpecimen() {
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true" focusable="false" fill="none">
      <path d="M18 62C10 38 28 16 52 18c24 2 38 20 30 42-6 17-24 26-42 22-9-2-18-8-22-20Z" stroke="var(--color-ink)" strokeWidth="1.4" strokeDasharray="4 4" strokeLinecap="round" />
      <path d="M34 54c4-14 14-20 28-14 8 4 6 16-2 22s-20 4-26-8Z" stroke="var(--color-signal-ink)" strokeWidth="1.6" strokeLinecap="round" />
      <g fill="var(--color-signal)" stroke="var(--color-ink)" strokeWidth="1">
        <rect x="14.5" y="58.5" width="7" height="7" />
        <rect x="48.5" y="14.5" width="7" height="7" />
        <rect x="78.5" y="56.5" width="7" height="7" />
      </g>
    </svg>
  );
}

const cellBorders = [
  '',
  'border-t border-dashed border-ink/40 sm:border-l sm:border-t-0',
  'border-t border-dashed border-ink/40 lg:border-l lg:border-t-0',
  'border-t border-dashed border-ink/40 sm:border-l lg:border-t-0',
];

/** Starting prices as one printed rate card: three priced columns and a fourth for "talk to us". */
export default function RateCard({ lang, title, body, fullPricing, action, tierLabels, copy }: Props) {
  const tierCopy = useTranslations('quote.complexityGuide');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const quotePath = localizedPath(lang, '/quote');
  const custom = customQuoteCopy[lang];

  return (
    <section id="pricing" className="border-b border-rule">
      <div className={`${container} py-20 lg:py-28`}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <h2 className={sectionTitle}>{title}</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-2">{body}</p>
          </div>
          <Link href={localizedPath(lang, '/pricing')} className={`${textLink} self-start lg:self-auto`}>
            {fullPricing}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-14 border border-ink bg-paper-2 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)]">
          <div className="flex items-center justify-between border-b border-ink px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]">
            <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{copy.rateCard}</span>
            <span className="text-ink-3">{copy.hint}</span>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
            {(['simple', 'standard', 'complex'] as const).map((tier, index) => (
              <li key={tier} className={`flex flex-col p-6 sm:p-8 ${cellBorders[index]}`}>
                <Specimen tier={tier} />
                <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.01em]">{tierLabels[tier]}</h3>
                <p className="mt-3 font-display text-[clamp(3.4rem,5.2vw,4.75rem)] font-extrabold leading-none tracking-[-0.045em]">
                  <span className="mr-1 align-top text-[0.42em] font-bold text-ink-3">$</span>{settings[`${tier}_tier_price`]}
                </p>
                <p className="mb-8 mt-5 text-[15px] leading-6 text-ink-2">{tierCopy(`${tier}Description`)}</p>
                <Link href={quotePath} className="mt-auto inline-flex items-center justify-between gap-2 border-t border-ink pt-4 text-[15px] font-semibold transition-colors hover:text-signal-ink">
                  {action}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
            <li className={`flex flex-col bg-signal-tint/70 p-6 sm:p-8 ${cellBorders[3]}`}>
              <OpenSpecimen />
              <h3 className="mt-6 font-display text-xl font-bold tracking-[-0.01em]">{custom.title}</h3>
              <p className="mt-3 font-hand text-[2.5rem] font-semibold leading-[0.95] text-signal-ink">{custom.pending}</p>
              <p className="mb-8 mt-5 text-[15px] leading-6 text-ink-2">{custom.description}</p>
              <Link href={`${quotePath}?review=1`} className="mt-auto inline-flex items-center justify-between gap-2 border-t border-ink pt-4 text-[15px] font-semibold transition-colors hover:text-signal-ink">
                {custom.action}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
