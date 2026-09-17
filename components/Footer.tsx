'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Layers, ShieldCheck } from 'lucide-react';
import DeliverableBadge from '@/components/DeliverableBadge';
import { localizedPath, normalizeMarketingLocale, services } from '@/lib/marketing';

export default function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const lang = normalizeMarketingLocale(useLocale());
  return (
    <footer className="border-t border-[#DAD8D2] bg-[#102A20] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href={localizedPath(lang, '/')} className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><Layers className="h-4 w-4 text-[#78D5A6]" /></span><strong className="text-xl tracking-tight">Artlantix</strong></Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">{t('description')}</p>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-[#78D5A6]" />{t('craftsmanship')}</div>
            <div className="mt-5 flex flex-wrap gap-2"><DeliverableBadge format="ai" variant="pill" /><DeliverableBadge format="eps" variant="pill" /><DeliverableBadge format="svg" variant="pill" /><DeliverableBadge format="pdf" variant="pill" /><DeliverableBadge format="png" variant="pill" /></div>
          </div>
          <div><h3 className="text-xs font-bold uppercase text-[#78D5A6]">{t('capabilities')}</h3><ul className="mt-5 space-y-3 text-sm text-white/65">{services.slice(0, 5).map(service => <li key={service.slug}><Link className="hover:text-white" href={localizedPath(lang, `/services/${service.slug}`)}>{service.title[lang]}</Link></li>)}</ul></div>
          <div><h3 className="text-xs font-bold uppercase text-[#78D5A6]">{t('platform')}</h3><ul className="mt-5 space-y-3 text-sm text-white/65"><li><Link className="hover:text-white" href={localizedPath(lang, '/business')}>{nav('business')}</Link></li><li><Link className="hover:text-white" href={localizedPath(lang, '/work')}>{nav('showcase')}</Link></li><li><Link className="hover:text-white" href={localizedPath(lang, '/pricing')}>{nav('pricing')}</Link></li><li><Link className="hover:text-white" href={localizedPath(lang, '/guides')}>{nav('guides')}</Link></li><li><Link className="hover:text-white" href={localizedPath(lang, '/faq')}>{nav('faq')}</Link></li><li><Link className="font-bold text-[#78D5A6]" href={localizedPath(lang, '/quote')}>{t('quote')}</Link></li><li><Link className="hover:text-white" href="/dashboard">{t('portal')}</Link></li></ul></div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/45 sm:flex-row"><p>© {new Date().getFullYear()} Artlantix. {t('copyright')}</p><p>{t('privacy')} · {t('curves')}</p></div>
      </div>
    </footer>
  );
}
