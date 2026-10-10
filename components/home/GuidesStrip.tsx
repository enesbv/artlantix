import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { container, sectionTitleSm, textLink } from '@/components/ui/styles';
import { localizedPath, type MarketingGuide, type MarketingLocale } from '@/lib/marketing';

interface Props {
  lang: MarketingLocale;
  title: string;
  allLabel: string;
  guides: MarketingGuide[];
}

/** Guides as a contents list beside a sticky title, so the section reads like a short table of contents. */
export default function GuidesStrip({ lang, title, allLabel, guides }: Props) {
  return (
    <section className="border-b border-rule">
      <div className={`${container} py-20 lg:py-28`}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className={sectionTitleSm}>{title}</h2>
            <Link href={localizedPath(lang, '/guides')} className={`${textLink} mt-8`}>
              {allLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ol className="border-t border-ink">
            {guides.map((guide, index) => (
              <li key={guide.slug} className="border-b border-ink">
                <Link href={localizedPath(lang, `/guides/${guide.slug}`)} className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] gap-x-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-5">
                  <span className="pt-1.5 font-display text-sm font-semibold tabular-nums text-ink-3 transition-colors group-hover:text-signal-ink">0{index + 1}</span>
                  <span className="block transition-transform duration-300 group-hover:translate-x-1.5">
                    <span className="block font-display text-[1.4rem] font-bold leading-[1.15] tracking-[-0.02em]">{guide.title[lang]}</span>
                    <span className="mt-2.5 block max-w-[52ch] text-[15px] leading-6 text-ink-2">{guide.excerpt[lang]}</span>
                    <span className="mt-3 block text-[13px] font-medium text-ink-3">{guide.readTime[lang]}</span>
                  </span>
                  <ArrowUpRight className="mt-1.5 h-5 w-5 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-ink" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
