'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MessagesSquare } from 'lucide-react';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import { normalizeMarketingLocale } from '@/lib/marketing';
import { ComplexityTier } from '@/lib/types';

export default function ComplexityPicker({ value, prices, onChange }: {
  value: ComplexityTier | 'review';
  prices: Record<ComplexityTier, number>;
  onChange: (value: ComplexityTier | 'review') => void;
}) {
  const t = useTranslations('quote.complexityGuide');
  const contact = customQuoteCopy[normalizeMarketingLocale(useLocale())];
  return (
    <fieldset className="rounded-2xl border border-[#EAE8E3] bg-white p-5 sm:p-6">
      <legend className="sr-only">{t('title')}</legend>
      <h3 className="text-lg font-bold tracking-tight text-[#102A20]">{t('title')}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5E625F]">{t('intro')}</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(['simple', 'standard', 'complex'] as const).map((tier) => (
          <label key={tier} className={`relative cursor-pointer rounded-xl border-2 p-4 transition-colors has-[:focus-visible]:shadow-[inset_0_0_0_2px_#115C3B] ${value === tier ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#EAE8E3] bg-white hover:border-[#B4DFC4]'}`}>
            <input type="radio" name="complexity" value={tier} checked={value === tier} onChange={() => onChange(tier)} className="sr-only focus:outline-none" />
            <svg aria-hidden="true" viewBox="0 0 120 90" className="mb-3 h-24 w-full rounded-lg bg-[#F9F8F6]" fill="none" stroke="#141414" strokeWidth="2.5" strokeLinejoin="round">
              {tier === 'simple' ? <>
                <path d="M60 17 85 65H35Z" fill="#141414" />
                <path d="M60 31 75 60H45Z" fill="#F9F8F6" stroke="none" />
                <path d="M28 72H92" stroke="#18794E" />
              </> : tier === 'standard' ? <>
                <path d="M60 8 94 22V43Q92 66 60 82 28 66 26 43V22Z" fill="#FFF" />
                <path d="M60 16 85 27V43Q83 60 60 73 37 60 35 43V27Z" stroke="#18794E" />
                <path d="m60 25 5 11 12 2-9 9 2 12-10-6-10 6 2-12-9-9 12-2Z" fill="#18794E" stroke="none" />
              </> : <>
                <ellipse cx="60" cy="45" rx="27" ry="34" />
                <path d="M60 72V23M60 52 46 38M60 44 74 30M60 63 73 52" stroke="#18794E" />
                <path d="M60 25Q43 8 44 26Q45 36 60 38Q78 26 78 16Q63 16 60 25ZM47 40Q31 29 36 45Q40 54 60 56M72 52Q90 37 85 55Q80 65 61 67" stroke="#18794E" />
                <path d="M30 70Q12 45 30 20M90 70Q108 45 90 20M23 30 15 24M20 41 11 37M21 53 12 52M26 64 17 64M97 30 105 24M100 41 109 37M99 53 108 52M94 64 103 64" />
              </>}
            </svg>
            <span className="block text-sm font-bold text-[#102A20]">{t(`${tier}Title`)}</span>
            <span className="mt-1 block text-xs leading-5 text-[#555]">{t(`${tier}Description`)}</span>
            <span className="mt-3 block text-xs font-semibold text-[#115C3B]">{t('from', { price: prices[tier] })}</span>
          </label>
        ))}
      <label className={`relative flex cursor-pointer flex-col rounded-xl border-2 p-4 has-[:focus-visible]:shadow-[inset_0_0_0_2px_#115C3B] ${value === 'review' ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#EAE8E3] bg-white hover:border-[#B4DFC4]'}`}>
        <input type="radio" name="complexity" value="review" checked={value === 'review'} onChange={() => onChange('review')} className="sr-only focus:outline-none" />
        <span className="mb-3 flex h-24 items-center justify-center rounded-lg bg-[#F9F8F6]"><MessagesSquare className="h-10 w-10 text-[#18794E]" /></span>
        <span className="block text-sm font-bold text-[#102A20]">{contact.title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#555]">{contact.description}</span>
      </label>
      </div>
      <p className="mt-2 text-xs text-[#737373]">{t('examples')}</p>
    </fieldset>
  );
}
