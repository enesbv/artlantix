import Link from 'next/link';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import { localizedPath, normalizeMarketingLocale } from '@/lib/marketing';
import { customQuoteCopy } from '@/lib/custom-quote-copy';

export default function ContactPricingCard({ locale, showIcon = true }: { locale: string; showIcon?: boolean }) {
  const lang = normalizeMarketingLocale(locale);
  const copy = customQuoteCopy[lang];
  return <Link href={`${localizedPath(lang, '/quote')}?review=1`} className="group flex h-full flex-col rounded-2xl border border-[#B4DFC4] bg-white p-6 transition-colors hover:border-[#18794E] hover:bg-[#F3FBF6]">
    {showIcon && <MessagesSquare className="h-6 w-6 text-[#18794E]" />}
    <h3 className={`${showIcon ? 'mt-6' : ''} text-xl font-bold text-[#102A20]`}>{copy.title}</h3>
    <p className="mb-6 mt-4 text-sm leading-6 text-[#5E625F]">{copy.description}</p>
    <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-[#18794E]">{copy.action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
  </Link>;
}
