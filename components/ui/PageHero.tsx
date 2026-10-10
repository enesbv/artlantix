import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { container } from '@/components/ui/styles';

/** Splits a title so its last word carries the hand-drawn orange swash. */
export function SwashTitle({ text }: { text: string }) {
  const index = text.lastIndexOf(' ');
  if (index === -1) return <span className="swash">{text}</span>;
  return (
    <>
      {text.slice(0, index + 1)}
      <span className="swash">{text.slice(index + 1)}</span>
    </>
  );
}

interface Props {
  title: string;
  body?: string;
  meta?: string;
  back?: { href: string; label: string };
  aside?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Header of an inner page: big display title with a swash, short intro and a ruler edge underneath. */
export default function PageHero({ title, body, meta, back, aside, actions }: Props) {
  return (
    <section>
      <div className={`${container} grid gap-12 pb-14 pt-12 md:pt-16 lg:items-center lg:gap-16 lg:pb-20 lg:pt-20 ${aside ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]' : ''}`}>
        <div>
          {back && (
            <Link href={back.href} className="inline-flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-signal decoration-2 underline-offset-[7px] transition-colors hover:text-signal-ink">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {back.label}
            </Link>
          )}
          {meta && (
            <p className={`${back ? 'mt-10' : ''} flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-2`}>
              <span aria-hidden="true" className="h-2 w-2 bg-signal" />
              {meta}
            </p>
          )}
          <h1 className={`${back || meta ? 'mt-6' : ''} max-w-4xl font-display text-[clamp(2.5rem,5.6vw,5rem)] font-extrabold leading-[0.96] tracking-[-0.04em]`}>
            <SwashTitle text={title} />
          </h1>
          {body && <p className="mt-9 max-w-2xl text-lg leading-8 text-ink-2">{body}</p>}
          {actions && <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">{actions}</div>}
        </div>
        {aside}
      </div>
      <div className={container}>
        <div className="ruler" aria-hidden="true" />
      </div>
    </section>
  );
}
