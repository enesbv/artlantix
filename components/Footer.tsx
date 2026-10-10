'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Lockup } from '@/components/brand/Brand';
import { container } from '@/components/ui/styles';
import { WORDMARK } from '@/lib/brand-art';
import { homeCopy } from '@/lib/home-copy';
import { localizedPath, normalizeMarketingLocale, services } from '@/lib/marketing';

const FORMATS = ['AI', 'EPS', 'SVG', 'PDF', 'PNG'];

const headingClass = 'text-xs font-semibold uppercase tracking-[0.1em] text-paper/55';
const linkClass = 'text-[15px] text-paper/80 transition-colors hover:text-paper';

/**
 * The logotype at full width, drawn as an outline. Hovering it reveals the anchors and handles the
 * letters were built from, the same construction layer the hero drawing shows.
 */
function GiantWordmark() {
  const unit = 22;
  return (
    <div className="group relative mb-6 mt-20 lg:mt-28" aria-hidden="true">
      <svg viewBox={WORDMARK.viewBox} className="block w-full overflow-visible" focusable="false">
        <path
          d={WORDMARK.d}
          vectorEffect="non-scaling-stroke"
          strokeWidth="1.5"
          strokeLinejoin="round"
          className="fill-transparent stroke-paper/45 transition-[fill] duration-500 group-hover:fill-paper/[0.07]"
        />
        <rect x={WORDMARK.dot.x} y={WORDMARK.dot.y} width={WORDMARK.dot.size} height={WORDMARK.dot.size} className="fill-signal" />
        <g className="opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <g stroke="var(--color-guide-soft)" strokeWidth="1" vectorEffect="non-scaling-stroke">
            {WORDMARK.handles.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g fill="var(--color-ink)" stroke="var(--color-guide-soft)" strokeWidth="1">
            {WORDMARK.controls.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={unit * 0.4} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <g fill="var(--color-ink)" stroke="var(--color-guide-soft)" strokeWidth="1.2">
            {WORDMARK.anchors.map(([x, y], i) => (
              <rect key={i} x={x - unit / 2} y={y - unit / 2} width={unit} height={unit} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const lang = normalizeMarketingLocale(useLocale());
  const h = homeCopy[lang];

  return (
    <footer className="overflow-hidden bg-ink text-paper">
      <div className={`${container} pt-20 lg:pt-28`}>
        <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] lg:gap-16">
          <div className="md:col-span-2 lg:col-span-1">
            <Link href={localizedPath(lang, '/')} className="inline-block text-paper">
              <Lockup inverted />
            </Link>
            <p className="mt-8 max-w-md font-display text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em]">{h.footer.tagline}</p>
            <p className="mt-5 max-w-md text-sm leading-6 text-paper/60">{t('craftsmanship')}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {FORMATS.map((format) => (
                <li key={format} className="border border-paper/45 px-2 py-0.5 text-[11px] font-semibold tracking-[0.06em] text-paper/80">{format}</li>
              ))}
            </ul>
          </div>

          <nav aria-label={t('capabilities')}>
            <h3 className={headingClass}>{t('capabilities')}</h3>
            <ul className="mt-6 space-y-3.5">
              {services.slice(0, 5).map((service) => (
                <li key={service.slug}><Link className={linkClass} href={localizedPath(lang, `/services/${service.slug}`)}>{service.title[lang]}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('platform')}>
            <h3 className={headingClass}>{t('platform')}</h3>
            <ul className="mt-6 space-y-3.5">
              <li><Link className={linkClass} href={localizedPath(lang, '/business')}>{nav('business')}</Link></li>
              <li><Link className={linkClass} href={localizedPath(lang, '/work')}>{nav('showcase')}</Link></li>
              <li><Link className={linkClass} href={localizedPath(lang, '/pricing')}>{nav('pricing')}</Link></li>
              <li><Link className={linkClass} href={localizedPath(lang, '/guides')}>{nav('guides')}</Link></li>
              <li><Link className={linkClass} href={localizedPath(lang, '/faq')}>{nav('faq')}</Link></li>
              <li><Link className="text-[15px] font-semibold text-signal-hot underline decoration-2 underline-offset-[6px] transition-colors hover:text-paper" href={localizedPath(lang, '/quote')}>{t('quote')}</Link></li>
              <li><Link className={linkClass} href="/dashboard">{t('portal')}</Link></li>
            </ul>
          </nav>
        </div>

        <GiantWordmark />

        <div className="flex flex-col justify-between gap-3 border-t border-paper/20 py-7 text-xs text-paper/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Artlantix. {t('copyright')}</p>
          <p>{t('privacy')} · {t('curves')}</p>
        </div>
      </div>
    </footer>
  );
}
