'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { container, sectionTitle } from '@/components/ui/styles';

interface Step {
  title: string;
  text: string;
}

// Four anchors on a pen-tool curve (viewBox 1000 x 200). Each sits at the left edge of its text column.
const ANCHORS: Array<[number, number]> = [
  [6, 150],
  [256, 52],
  [506, 150],
  [756, 52],
];
const HANDLE = 125;

const PATH = [
  `M${ANCHORS[0][0]} ${ANCHORS[0][1]}`,
  ...ANCHORS.slice(1).map(([x, y], i) => {
    const [px, py] = ANCHORS[i];
    return `C${px + HANDLE} ${py} ${x - HANDLE} ${y} ${x} ${y}`;
  }),
  `H1400`,
].join('');

/**
 * The four steps as one continuous Bezier path with real anchors and handles, drawn on once
 * when it scrolls into view. On phones the same steps hang from a vertical dashed line.
 */
export default function ProcessPath({ title, steps, cta, href }: { title: string; steps: Step[]; cta: string; href: string }) {
  const pathRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = pathRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          node.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" aria-labelledby="process-heading" className="overflow-hidden bg-ink text-paper">
      <div className={`${container} py-20 lg:py-28`}>
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 id="process-heading" className={`${sectionTitle} max-w-3xl text-paper`}>{title}</h2>
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-3 self-start rounded-full border border-paper/35 py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors hover:border-signal hover:bg-signal hover:text-ink md:self-auto"
          >
            {cta}
            <span className="grid h-9 w-9 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </div>

        <div ref={pathRef} className="draw-on-view mt-16 lg:mt-20">
          <svg viewBox="0 0 1000 200" className="hidden w-full overflow-visible lg:block" aria-hidden="true" focusable="false">
            <g stroke="var(--color-paper)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5">
              {ANCHORS.map(([x, y]) => <line key={x} x1={x} y1={y + 14} x2={x} y2={200} />)}
            </g>
            <path d={PATH} data-draw pathLength={1} fill="none" stroke="var(--color-paper)" strokeWidth="3" strokeLinecap="round" />
            {ANCHORS.map(([x, y], i) => {
              const left = i === 0 ? null : x - HANDLE;
              return (
                <g key={x} data-pop style={{ '--delay': `${0.25 + i * 0.4}s` } as React.CSSProperties}>
                  <g stroke="var(--color-paper)" strokeOpacity="0.5" strokeWidth="1">
                    {left !== null && <line x1={left} y1={y} x2={x} y2={y} />}
                    <line x1={x} y1={y} x2={x + HANDLE} y2={y} />
                  </g>
                  <g fill="var(--color-ink)" stroke="var(--color-paper)" strokeOpacity="0.7" strokeWidth="1.2">
                    {left !== null && <circle cx={left} cy={y} r="4" />}
                    <circle cx={x + HANDLE} cy={y} r="4" />
                  </g>
                  <rect x={x - 7} y={y - 7} width="14" height="14" fill="var(--color-signal)" stroke="var(--color-paper)" strokeWidth="1.6" />
                </g>
              );
            })}
          </svg>

          <ol className="relative ml-[7px] border-l border-dashed border-paper/35 lg:ml-0 lg:grid lg:grid-cols-4 lg:border-l-0">
            {steps.map((step, index) => (
              <li key={step.title} className="relative pb-12 pl-9 last:pb-0 lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-5">
                <span aria-hidden="true" className="absolute -left-[8px] top-[6px] h-[15px] w-[15px] border border-paper bg-signal lg:hidden" />
                <span className="font-display text-sm font-semibold tabular-nums text-signal-hot">0{index + 1}</span>
                <h3 className="mt-2 font-display text-[1.65rem] font-bold leading-tight tracking-[-0.02em] text-paper">{step.title}</h3>
                <p className="mt-3 max-w-[30ch] text-[15px] leading-7 text-paper/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
