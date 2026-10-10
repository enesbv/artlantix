'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import ServiceVisual from '@/components/ServiceVisual';
import { container, sectionTitle, textLink } from '@/components/ui/styles';
import { localizedPath, type MarketingLocale, type MarketingService } from '@/lib/marketing';

interface Props {
  lang: MarketingLocale;
  title: string;
  body: string;
  allLabel: string;
  allHref: string;
  from: string;
  typical: string;
  idealFor: string;
  included: string;
  services: MarketingService[];
}

/**
 * Services as an index, like the contents page of a pattern book: a ruled list on the left and a
 * sticky drawing sheet on the right that follows whichever row is hovered or focused.
 */
export default function ServicesIndex({ lang, title, body, allLabel, allHref, from, typical, idealFor, included, services }: Props) {
  const [active, setActive] = useState(0);
  const current = services[active] ?? services[0];

  return (
    <section id="services" className="border-b border-rule">
      <div className={`${container} py-20 lg:py-28`}>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h2 className={`${sectionTitle} max-w-3xl`}>{title}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-ink-2">{body}</p>
          </div>
          <Link href={allHref} className={`${textLink} self-start lg:self-auto`}>{allLabel}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)] lg:gap-16">
          <ul className="border-t border-ink">
            {services.map((service, index) => (
              <li key={service.slug} className="border-b border-ink">
                <Link
                  href={localizedPath(lang, `/services/${service.slug}`)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-x-3 py-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-5 lg:py-7"
                >
                  <span className={`pt-2 font-display text-sm font-semibold tabular-nums transition-colors ${active === index ? 'text-signal-ink' : 'text-ink-3'}`}>0{index + 1}</span>
                  <span className="block transition-transform duration-300 group-hover:translate-x-1.5">
                    <span className="block font-display text-[clamp(1.45rem,2.5vw,2.15rem)] font-bold leading-[1.1] tracking-[-0.025em]">{service.title[lang]}</span>
                    <span className="mt-2.5 block max-w-[54ch] text-[15px] leading-6 text-ink-2">{service.short[lang]}</span>
                    <span className="mt-3 block text-[13px] font-medium text-ink-3 sm:hidden">{from} ${service.startingPrice} · {typical} {service.turnaround[lang]}</span>
                  </span>
                  <span className="flex flex-col items-end gap-2 pt-1.5 text-right">
                    <ArrowUpRight className="h-5 w-5 text-ink-3 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-ink" aria-hidden="true" />
                    <span className="hidden sm:block">
                      <span className="block text-[13px] font-semibold text-ink">{from} ${service.startingPrice}</span>
                      <span className="mt-0.5 block text-[13px] font-medium text-ink-3">{typical} {service.turnaround[lang]}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <aside aria-hidden="true" className="hidden lg:block">
            <figure className="sticky top-28 m-0 border border-ink bg-paper-2 shadow-[0_30px_60px_-34px_rgb(21_23_28/0.5)]">
              <figcaption className="flex items-center justify-between border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
                <span className="flex items-center gap-2"><span className="h-2 w-2 bg-signal" />0{active + 1} / 0{services.length}</span>
                <span className="text-ink-3">{current.title[lang]}</span>
              </figcaption>
              <div key={current.slug} className="swap-in">
                <ServiceVisual slug={current.slug} />
              </div>
              <dl className="grid grid-cols-2 border-t border-ink">
                <div className="px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{idealFor}</dt>
                  <dd className="mt-1 text-[13px] font-medium leading-snug">{current.idealFor[lang].slice(0, 2).join(' · ')}</dd>
                </div>
                <div className="border-l border-ink px-4 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{included}</dt>
                  <dd className="mt-1 text-[13px] font-medium leading-snug">{current.includes[lang][0]}</dd>
                </div>
              </dl>
            </figure>
          </aside>
        </div>
      </div>
    </section>
  );
}
