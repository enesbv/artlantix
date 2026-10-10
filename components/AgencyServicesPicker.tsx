'use client';

import { useTranslations } from 'next-intl';
import { Palette, PenTool, PanelsTopLeft, Check } from 'lucide-react';

import { AGENCY_SERVICES, AgencyService } from '@/lib/agency-services';
const SERVICE_ICONS = { brand: Palette, logo: PenTool, social: PanelsTopLeft };

export default function AgencyServicesPicker({ value, onChange }: {
  value: AgencyService[];
  onChange: (value: AgencyService[]) => void;
}) {
  const t = useTranslations('quote.agency');
  return (
    <fieldset className="border border-ink bg-paper-2 p-5 sm:p-6">
      <legend className="sr-only">{t('title')}</legend>
      <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">{t('title')}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-2">{t('description')}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {AGENCY_SERVICES.map(({ id, key, price, minBusinessDays, maxBusinessDays }) => {
          const selected = value.includes(id);
          const Icon = SERVICE_ICONS[key];
          return (
            <label key={id} className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors has-[:focus-visible]:shadow-[inset_0_0_0_2px_var(--color-guide)] ${selected ? 'border-ink bg-signal-tint' : 'border-rule bg-paper-2 hover:border-signal-line'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper text-signal-ink"><Icon className="h-5 w-5" /></span>
                <input type="checkbox" checked={selected} onChange={() => onChange(selected ? value.filter((item) => item !== id) : [...value, id])} className="h-5 w-5 accent-ink focus:outline-none" />
              </div>
              <span className="mt-5 text-sm font-bold text-ink">{t(`${key}Title`)}</span>
              <span className="mt-2 text-xs leading-5 text-ink-2">{t(`${key}Description`)}</span>
              <div className="mt-auto pt-5">
                <span className="block text-xl font-bold text-ink">${price}</span>
                <span className="mt-1 block text-xs leading-5 text-ink-2">{t('delivery', { min: minBusinessDays, max: maxBusinessDays })}</span>
              </div>
              {selected && <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-signal-ink"><Check className="h-4 w-4" />{t('selected')}</span>}
            </label>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-ink-2">{t('note')}</p>
    </fieldset>
  );
}
