import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MARK } from '@/lib/brand-art';
import { btnChip, btnPrimary, container, sectionTitle } from '@/components/ui/styles';

interface Props {
  title: string;
  body: string;
  action: string;
  href: string;
  formats: string;
}

/** The closing call to action, drawn as the drop zone a customer would actually use. */
export default function DropCta({ title, body, action, href, formats }: Props) {
  return (
    <section className="pb-20 pt-20 lg:pb-28 lg:pt-28">
      <div className={container}>
        <div className="relative overflow-hidden border-2 border-dashed border-signal bg-signal-tint/45 px-6 py-14 sm:px-12 lg:px-20 lg:py-20">
          <svg viewBox="0 0 120 150" className="bob absolute right-12 top-1/2 hidden h-40 w-auto -translate-y-1/2 lg:block xl:right-20 xl:h-48" aria-hidden="true" focusable="false">
            <path d="M14 8h64l28 28v106H14Z" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
            <path d="M78 8v28h28" fill="var(--color-paper-3)" stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
            <g transform="translate(28 56) scale(1)">
              <path d={MARK.paper} fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinejoin="round" />
              <path d={MARK.ink} fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth="1.8" strokeLinejoin="round" />
              <path d={MARK.accent} fill="var(--color-signal)" />
            </g>
          </svg>

          <h2 className={`${sectionTitle} max-w-3xl`}>{title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">{body}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href={href} className={btnPrimary}>
              {action}
              <span className={btnChip}><ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
            </Link>
            <p className="text-sm text-ink-2">{formats}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
