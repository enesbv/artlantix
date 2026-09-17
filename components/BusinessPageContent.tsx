'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ContactPricingCard from '@/components/ContactPricingCard';
import Image from 'next/image';
import { ArrowRight, Building2, Printer, Scissors, Shirt, Palette, UploadCloud, ListChecks, FolderArchive, PenTool, CheckCircle2, CalendarDays, Layers, FileCheck2 } from 'lucide-react';
import BusinessArtwork from '@/components/BusinessArtwork';
import PublicPageShell from '@/components/PublicPageShell';
import { businessCopy } from '@/lib/business-copy';
import { localizedPath, normalizeMarketingLocale } from '@/lib/marketing';
import { DEFAULT_SITE_SETTINGS, getSiteSettings } from '@/lib/services/content';

const industryIcons = [Scissors, Printer, Shirt, Palette];
const benefitIcons = [UploadCloud, ListChecks, FolderArchive, PenTool, CheckCircle2, CalendarDays];
const jobIcons = [Scissors, Printer, Shirt];
const primary = 'inline-flex items-center justify-center gap-2 rounded-xl bg-[#18794E] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#115C3B]';
const secondary = 'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DAD8D2] bg-white px-6 py-3.5 text-sm font-bold text-[#102A20] transition hover:border-[#18794E]';
const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function BusinessPageContent({ locale }: { locale: string }) {
  const lang = normalizeMarketingLocale(locale);
  const c = businessCopy[lang];
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  useEffect(() => { getSiteSettings().then(setSettings).catch(() => undefined); }, []);
  const signup = '/signup?type=business&next=%2Fdashboard%2Fbusiness';
  const prices = [settings.simple_tier_price, settings.standard_tier_price, settings.complex_tier_price];
  const actions = <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><Link href={signup} className={primary}>{c.apply}<ArrowRight className="h-4 w-4" /></Link><Link href="/dashboard/business" className={secondary}>{c.project}</Link></div>;
  return <PublicPageShell><main>
    <section className="relative overflow-hidden border-b border-[#DAD8D2]">
      <div className={`${container} grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-24`}>
        <div>
          <p className="flex items-center gap-2 text-xs font-bold text-[#18794E]"><span className="h-2 w-2 rounded-full bg-[#18794E]" />{c.badge}</p>
          <h1 className="mt-6 text-[2.7rem] font-extrabold leading-[1.08] tracking-[-0.045em] text-[#102A20] sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">{c.title}<span className="mt-3 block text-[#18794E]">{c.accent}</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#5E625F]">{c.intro}</p>
          <div className="mt-8">{actions}</div>
          <p className="mt-4 text-xs text-[#737373]">{c.terms}</p>
          <Link href="/login?next=%2Fdashboard%2Fbusiness" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-[#18794E]">{c.login}<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="relative min-w-0 rounded-[1.75rem] bg-[#E5EBE5] p-4 sm:p-7">
          <div className="absolute inset-0 rounded-[1.75rem] opacity-30 [background-image:radial-gradient(#8BA493_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative overflow-hidden rounded-2xl border border-white bg-[#FCFCF9] shadow-[0_20px_50px_-25px_rgba(16,42,32,0.4)]">
            <div className="flex items-center justify-between border-b border-[#EAE8E3] px-5 py-4"><span className="flex items-center gap-2 text-sm font-bold text-[#102A20]"><Layers className="h-4 w-4 text-[#18794E]" />Artlantix Studio</span><span className="rounded-full bg-[#E9F9EE] px-2.5 py-1 text-[10px] font-semibold text-[#115C3B]">{c.demo}</span></div>
            <div className="grid grid-cols-2 gap-px bg-[#DCE4DB]"><div className="h-40 bg-[#F1F3EC] sm:h-48"><BusinessArtwork kind={0} /></div><div className="h-40 bg-[#E7EDE6] sm:h-48"><BusinessArtwork kind={1} /></div></div>
            <div className="p-5"><p className="mb-4 text-xs font-bold text-[#737373]">{c.queue}</p>{c.jobs.map((job,index)=>{const Icon=jobIcons[index];return <div key={job} className="flex items-center gap-3 border-t border-[#EAE8E3] py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F3ED] text-[#18794E]"><Icon className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#102A20]">{job}</p><p className="mt-1 text-[10px] text-[#737373]">{c.statuses[index]}</p></div>{index===1?<CheckCircle2 className="h-4 w-4 shrink-0 text-[#18794E]" />:<span className="h-1.5 w-1.5 rounded-full bg-[#B4C6BB]" />}</div>;})}</div>
          </div>
          <div className="relative mx-3 -mt-1 flex items-center justify-between rounded-b-xl border border-[#DAD8D2] bg-white px-4 py-3 shadow-sm"><span className="flex items-center gap-2 text-xs font-semibold text-[#115C3B]"><FolderArchive className="h-4 w-4" />{c.benefitTitles[2]}</span><div className="flex gap-2">{['ai','eps','pdf'].map(format=><Image key={format} src={`/${format}.svg`} alt={format.toUpperCase()} width={18} height={23} />)}</div></div>
        </div>
      </div>
      <div className="border-t border-[#DAD8D2] bg-white"><div className={`${container} grid grid-cols-2 gap-x-5 gap-y-6 py-6 lg:grid-cols-4`}>{c.industryTitles.map((title,index)=>{const Icon=industryIcons[index];return <a key={title} href="#industries" className="flex items-center gap-3 text-xs font-semibold text-[#5E625F] hover:text-[#18794E]"><Icon className="h-5 w-5 shrink-0 text-[#18794E]" />{title}</a>;})}</div></div>
    </section>

    <section id="industries" className={`${container} scroll-mt-24 py-16 sm:py-24`}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"><h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-[#102A20] sm:text-4xl">{c.industries}</h2><p className="max-w-lg self-end text-base leading-7 text-[#5E625F]">{c.industriesDesc}</p></div>
      <div className="mt-10 grid overflow-hidden rounded-2xl border border-[#DAD8D2] bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="divide-y divide-[#EAE8E3]">{c.industryTitles.map((title,index)=>{const Icon=industryIcons[index];const active=activeIndustry===index;return <button key={title} type="button" aria-pressed={active} aria-controls="industry-preview" onClick={()=>setActiveIndustry(index)} className={`flex w-full items-start gap-4 p-5 text-left transition-colors sm:p-6 ${active?'bg-[#E9F9EE]':'hover:bg-[#F7F8F4]'}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active?'bg-[#18794E] text-white':'bg-[#F0F3ED] text-[#18794E]'}`}><Icon className="h-5 w-5" /></span><span className="flex-1"><span className="block text-base font-bold text-[#102A20]">{title}</span>{active&&<span className="mt-2 block text-sm leading-6 text-[#5E625F]">{c.industryBodies[index]}</span>}</span><ArrowRight className={`mt-2 h-4 w-4 shrink-0 ${active?'text-[#18794E]':'text-[#A2ADA5]'}`} /></button>;})}</div>
        <div id="industry-preview" aria-live="polite" className="flex flex-col justify-center border-t border-[#DAD8D2] bg-[#EDF1E9] p-6 sm:p-10 lg:border-l lg:border-t-0"><div className="aspect-[5/3]"><BusinessArtwork kind={activeIndustry} /></div><div className="mt-4 flex items-center gap-3 rounded-xl border border-white bg-white/80 p-4"><FileCheck2 className="h-5 w-5 shrink-0 text-[#18794E]" /><p className="text-xs font-semibold leading-5 text-[#115C3B]">{c.industryOutputs[activeIndustry]}</p></div></div>
      </div>
    </section>

    <section className="border-y border-[#DAD8D2] bg-white"><div className={`${container} grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20`}>
      <div><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9F9EE]"><Building2 className="h-6 w-6 text-[#18794E]" /></span><h2 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight text-[#102A20] sm:text-4xl">{c.benefits}</h2><p className="mt-5 text-sm leading-7 text-[#5E625F]">{c.queueDesc}</p><Link href="/dashboard/business" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{c.volumeCta}<ArrowRight className="h-4 w-4" /></Link><div className="mt-8 flex gap-3">{['ai','eps','svg','pdf','png'].map(format=><Image key={format} src={`/${format}.svg`} alt={format.toUpperCase()} width={24} height={30} />)}</div></div>
      <div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">{c.benefitTitles.map((title,index)=>{const Icon=benefitIcons[index];return <div key={title} className="border-t border-[#DAD8D2] pt-5"><Icon className="h-5 w-5 text-[#18794E]" /><h3 className="mt-4 text-base font-bold text-[#102A20]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#5E625F]">{c.benefitBodies[index]}</p></div>;})}</div>
    </div></section>

    <section id="volume" className={`${container} scroll-mt-24 py-16 sm:py-24`}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]"><h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[#102A20] sm:text-4xl">{c.pricing}</h2><p className="max-w-lg self-end text-sm leading-7 text-[#5E625F]">{c.pricingDesc}</p></div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{c.tiers.map((title,index)=><Link key={title} href={`${localizedPath(lang,'/quote')}?tier=${['simple','standard','complex'][index]}`} className={`group flex flex-col rounded-2xl border p-7 transition-colors ${index===1?'border-[#18794E] bg-[#E9F9EE]':'border-[#DAD8D2] bg-white hover:border-[#18794E]'}`}><div className="flex items-center justify-between"><span className="text-xs font-semibold text-[#18794E]">{index===1?c.popular:c.from}</span><ArrowRight className="h-4 w-4 text-[#18794E] transition-transform group-hover:translate-x-1" /></div><h3 className="mt-7 text-lg font-bold text-[#102A20]">{title}</h3><p className="mt-3 text-4xl font-extrabold tracking-tight text-[#102A20]">${prices[index]}<span className="ml-2 text-xs font-medium text-[#737373]">USD</span></p><p className="mt-5 border-t border-[#DAD8D2] pt-5 text-sm leading-6 text-[#5E625F]">{c.tierBodies[index]}</p></Link>)}<ContactPricingCard locale={lang} /></div>
      <div className="mt-7 flex flex-col gap-3 border-l-2 border-[#18794E] pl-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold text-[#102A20]">{c.volume}</h3><p className="mt-2 max-w-2xl text-xs leading-6 text-[#5E625F]">{c.volumeBody}</p></div><Link href="/dashboard/business" className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-[#18794E]">{c.volumeCta}<ArrowRight className="h-4 w-4" /></Link></div>
    </section>

    <section className={`${container} pb-16`}><div className="relative overflow-hidden rounded-3xl bg-[#102A20] p-7 sm:p-12"><div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-[50px] border-[#B4DFC4]/[0.06]" /><div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]"><div><h2 className="max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{c.cta}</h2><p className="mt-4 max-w-xl text-sm leading-7 text-white/65">{c.ctaBody}</p></div><div className="lg:justify-self-end"><Link href={signup} className="inline-flex items-center gap-3 rounded-xl bg-[#E9F9EE] px-6 py-4 text-sm font-bold text-[#115C3B] transition hover:bg-white">{c.apply}<ArrowRight className="h-4 w-4" /></Link><p className="mt-4 text-xs text-white/60">{c.terms}</p></div></div></div></section>
  </main></PublicPageShell>;
}
