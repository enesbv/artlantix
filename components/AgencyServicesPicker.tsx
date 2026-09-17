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
    <fieldset className="rounded-2xl border border-[#EAE8E3] bg-white p-5 sm:p-6">
      <legend className="sr-only">{t('title')}</legend>
      <h3 className="text-lg font-bold tracking-tight text-[#102A20]">{t('title')}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5E625F]">{t('description')}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {AGENCY_SERVICES.map(({ id, key, price, minBusinessDays, maxBusinessDays }) => {
          const selected = value.includes(id);
          const Icon = SERVICE_ICONS[key];
          return (
            <label key={id} className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors has-[:focus-visible]:shadow-[inset_0_0_0_2px_#115C3B] ${selected ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#EAE8E3] bg-white hover:border-[#B4DFC4]'}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F7F4] text-[#18794E]"><Icon className="h-5 w-5" /></span>
                <input type="checkbox" checked={selected} onChange={() => onChange(selected ? value.filter((item) => item !== id) : [...value, id])} className="h-5 w-5 accent-[#18794E] focus:outline-none" />
              </div>
              <span className="mt-5 text-sm font-bold text-[#102A20]">{t(`${key}Title`)}</span>
              <span className="mt-2 text-xs leading-5 text-[#555]">{t(`${key}Description`)}</span>
              <div className="mt-auto pt-5">
                <span className="block text-xl font-bold text-[#102A20]">${price}</span>
                <span className="mt-1 block text-xs leading-5 text-[#555]">{t('delivery', { min: minBusinessDays, max: maxBusinessDays })}</span>
              </div>
              {selected && <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#18794E]"><Check className="h-4 w-4" />{t('selected')}</span>}
            </label>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-[#5E625F]">{t('note')}</p>
    </fieldset>
  );
}
