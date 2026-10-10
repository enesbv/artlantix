import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import MarketingVisual from '@/components/MarketingVisual';
import { container, sectionTitle, textLink } from '@/components/ui/styles';
import { localizedPath, type MarketingCaseStudy, type MarketingLocale } from '@/lib/marketing';

interface Props {
  lang: MarketingLocale;
  title: string;
  body: string;
  demo: string;
  viewCase: string;
  allLabel: string;
  studies: MarketingCaseStudy[];
}

function Plate({ study, index, lang, demo, viewCase, variant }: { study: MarketingCaseStudy; index: number; lang: MarketingLocale; demo: string; viewCase: string; variant: 'large' | 'row' }) {
  // The category already starts with "Studio demonstration ·"; the plate keeps only the topic after it.
  const topic = study.category[lang].split('·').slice(1).join('·').trim() || study.category[lang];
  const large = variant === 'large';
  return (
    <Link
      href={localizedPath(lang, `/work/${study.slug}`)}
      className="group flex h-full flex-col border border-ink bg-paper-2 transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-ink)]"
    >
      <div className="flex items-center justify-between border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{demo}</span>
        <span className="text-ink-3">No. 00{index + 1}</span>
      </div>
      <div className={`flex flex-1 flex-col ${large ? '' : 'lg:grid lg:grid-cols-[.78fr_1fr]'}`}>
        <MarketingVisual
          kind={study.visual}
          compact
          className={`${large ? 'flex-1 lg:aspect-auto lg:min-h-[400px]' : 'lg:aspect-auto lg:min-h-[230px] lg:border-r lg:border-ink'}`}
        />
        <div className={`flex flex-col border-t border-ink p-5 sm:p-6 ${large ? 'lg:flex-row lg:items-end lg:justify-between lg:gap-10' : 'lg:border-t-0'}`}>
          <div>
            <p className="text-[13px] font-medium text-ink-3">{topic}</p>
            <h3 className={`mt-2 font-display font-bold leading-[1.1] tracking-[-0.02em] ${large ? 'text-[1.7rem] lg:text-[2rem]' : 'text-[1.35rem]'}`}>{study.title[lang]}</h3>
            <p className={`mt-3 text-[15px] leading-6 text-ink-2 ${large ? 'max-w-[48ch]' : ''}`}>{study.summary[lang]}</p>
          </div>
          <span className={`mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-ink ${large ? 'lg:mt-0 lg:shrink-0' : 'lg:mt-auto lg:pt-5'}`}>
            <span className="underline decoration-signal decoration-2 underline-offset-[7px]">{viewCase}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The case studies as drawing plates: one large, two beside it. Every plate carries the demonstration label. */
export default function WorkPlates({ lang, title, body, demo, viewCase, allLabel, studies }: Props) {
  const [first, ...rest] = studies;
  return (
    <section id="work" className="border-b border-rule bg-paper-3/55">
      <div className={`${container} py-20 lg:py-28`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <h2 className={sectionTitle}>{title}</h2>
          <p className="max-w-md text-[17px] leading-7 text-ink-2 lg:justify-self-end">{body}</p>
        </div>

        <div className="mt-14 grid gap-7 lg:grid-cols-12 lg:gap-9">
          {first && (
            <div className="lg:col-span-7">
              <Plate study={first} index={0} lang={lang} demo={demo} viewCase={viewCase} variant="large" />
            </div>
          )}
          <div className="grid gap-7 lg:col-span-5 lg:gap-9">
            {rest.map((study, i) => (
              <Plate key={study.slug} study={study} index={i + 1} lang={lang} demo={demo} viewCase={viewCase} variant="row" />
            ))}
          </div>
        </div>

        <Link href={localizedPath(lang, '/work')} className={`${textLink} mt-12`}>
          {allLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
