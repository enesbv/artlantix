'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ContactPricingCard from '@/components/ContactPricingCard';
import { ArrowRight, Check, CircleDollarSign } from 'lucide-react';
import PublicPageShell from '@/components/PublicPageShell';
import { DEFAULT_SITE_SETTINGS, getSiteSettings, SiteSettings } from '@/lib/services/content';
import { localizedPath, marketingCopy, normalizeMarketingLocale } from '@/lib/marketing';

const labels = {
  tr: { tiers: ['Basit', 'Standart', 'Karmaşık'], features: [['Temiz temel geometriler', '1–2 renk dahil', 'Üretim master dosyaları'], ['Çok renkli logo ve rozetler', 'Dengeli eğri yeniden çizimi', 'Üretim master dosyaları'], ['Maskot ve ayrıntılı çizimler', 'Kapsamlı elle yeniden çizim', 'Uzman dosya incelemesi']], cta: 'Dosyanız için teklif alın', note: 'Yazı, kapsamlı onarım, ek renkler ve ekspres teslim tahmini fiyatı etkileyebilir.' },
  en: { tiers: ['Simple', 'Standard', 'Complex'], features: [['Clean basic geometry', '1–2 colors included', 'Production masters'], ['Multicolor logos and badges', 'Balanced path reconstruction', 'Production masters'], ['Mascots and detailed artwork', 'In-depth manual reconstruction', 'Expert file review']], cta: 'Get a quote for your file', note: 'Lettering, heavy repair, extra colors and express turnaround can affect the estimate.' },
  de: { tiers: ['Einfach', 'Standard', 'Komplex'], features: [['Saubere Grundgeometrie', '1–2 Farben enthalten', 'Produktionsmaster'], ['Mehrfarbige Logos und Embleme', 'Ausgewogene Pfadrekonstruktion', 'Produktionsmaster'], ['Maskottchen und Detailgrafiken', 'Aufwendige manuelle Rekonstruktion', 'Expertenprüfung']], cta: 'Angebot mit Datei erstellen', note: 'Schrift, aufwendige Reparaturen, Zusatzfarben und Expresslieferung können die Schätzung verändern.' },
} as const;

export default function PricingPageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = marketingCopy[lang];
  const text = labels[lang];
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const prices = [settings.simple_tier_price, settings.standard_tier_price, settings.complex_tier_price];
  return <PublicPageShell><main><section className="border-b border-[#DAD8D2] bg-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#18794E]">{copy.pages.pricingEyebrow}</p><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.04em] text-[#102A20] sm:text-6xl">{copy.pages.pricingTitle}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#5E625F]">{copy.pages.pricingBody}</p></div></section><section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{prices.map((price, index) => <div key={text.tiers[index]} className={`rounded-3xl border p-7 ${index === 1 ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#DAD8D2] bg-white'}`}><CircleDollarSign className="h-6 w-6 text-[#18794E]" /><h2 className="mt-8 text-xl font-bold">{text.tiers[index]}</h2><p className="mt-3 text-4xl font-black">${price}</p><p className="mt-1 text-xs text-[#5E625F]">{copy.common.from}</p><ul className="mt-7 space-y-3 border-t border-[#DAD8D2] pt-6">{text.features[index].map(feature => <li key={feature} className="flex gap-2 text-sm text-[#4E534F]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#18794E]" />{feature}</li>)}</ul><Link href={`${localizedPath(lang, '/quote')}?tier=${['simple','standard','complex'][index]}`} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{text.cta}<ArrowRight className="h-4 w-4" /></Link></div>)}<ContactPricingCard locale={lang} /></div><p className="mt-6 text-sm text-[#5E625F]">{text.note}</p></section></main></PublicPageShell>;
}
