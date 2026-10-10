import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Lockup } from '@/components/brand/Brand';
import { MARK } from '@/lib/brand-art';

/** Shared field styling, so every input on the account pages reads like a form on a drawing sheet. */
export const authLabel = 'block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2';
export const authInput =
  'mt-2 w-full border border-rule-strong bg-paper px-3.5 py-2.5 text-[15px] text-ink transition-colors placeholder:text-ink-3 hover:border-ink focus:border-ink focus:bg-paper-2';
export const authButton =
  'flex w-full items-center justify-center gap-2.5 rounded-full bg-ink py-3 text-[15px] font-semibold text-paper transition-colors hover:bg-signal hover:text-ink disabled:pointer-events-none disabled:opacity-50';
export const authGhostButton =
  'flex w-full items-center justify-center gap-2.5 rounded-full border border-ink bg-paper-2 py-3 text-[15px] font-semibold text-ink transition-colors hover:bg-paper-3 disabled:pointer-events-none disabled:opacity-50';

/** The brand mark drawn large on the ink panel, with its construction circles showing. */
function Plate() {
  return (
    <svg viewBox="0 0 64 64" className="h-44 w-44" aria-hidden="true" focusable="false">
      <g stroke="var(--color-guide-soft)" strokeWidth="0.4" strokeDasharray="2.5 2" fill="none" opacity="0.65">
        <circle cx="32" cy="32" r="31" />
        <circle cx="32" cy="32" r="21" />
        <circle cx="32" cy="32" r="10" />
        <path d="M32 0v64M0 32h64M9 9l46 46M55 9 9 55" />
      </g>
      <path d={MARK.paper} fill="none" stroke="var(--color-paper)" strokeWidth="0.9" strokeLinejoin="round" />
      <path d={MARK.ink} fill="var(--color-paper)" stroke="var(--color-paper)" strokeWidth="0.9" strokeLinejoin="round" />
      <path d={MARK.accent} fill="var(--color-signal)" />
    </svg>
  );
}

interface Props {
  title: string;
  intro: string;
  /** Short lines printed on the ink panel, each one a plain fact about the account. */
  points: readonly string[];
  footer: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthShell({ title, intro, points, footer, children }: Props) {
  return (
    <div className="min-h-screen text-ink">
      <Navbar />

      <main className="mx-auto w-full max-w-[1320px] px-4 py-12 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid border border-ink bg-paper-2 shadow-[0_30px_60px_-34px_rgb(21_23_28/0.5)] lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
          <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-paper lg:flex">
            <Link href="/" className="inline-block text-paper">
              <Lockup inverted />
            </Link>

            <div className="py-10">
              <Plate />
            </div>

            <ul className="border-t border-paper/20">
              {points.map((point) => (
                <li key={point} className="flex gap-3 border-b border-paper/15 py-3 text-[14px] leading-6 text-paper/75 last:border-b-0">
                  <span aria-hidden="true" className="mt-[10px] h-1.5 w-1.5 shrink-0 bg-signal" />
                  {point}
                </li>
              ))}
            </ul>
          </aside>

          <div className="p-6 sm:p-10 lg:border-l lg:border-ink">
            <div className="mx-auto max-w-md">
              <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold leading-[1.04] tracking-[-0.035em]">{title}</h1>
              <p className="mt-4 text-[15px] leading-7 text-ink-2">{intro}</p>
              {children}
              <div className="mt-8 border-t border-rule pt-5 text-[15px] text-ink-2">{footer}</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
