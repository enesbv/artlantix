'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { EMBLEM } from '@/lib/brand-art';
import type { HomeCopy } from '@/lib/home-copy';
import CropMarks from '@/components/home/CropMarks';
import styles from '@/components/home/HeroSheet.module.css';

const INK = 'var(--color-ink)';
const PAPER = 'var(--color-paper-2)';
const SIGNAL = 'var(--color-signal)';
const GUIDE = 'var(--color-guide)';

/** The finished vector drawing: every shape here is real geometry from lib/brand-art.ts. */
function EmblemFinal({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <rect width="400" height="400" fill={PAPER} />
      <g fill="none" stroke={INK}>
        {EMBLEM.strokes.map((s) => <path key={s.d} d={s.d} strokeWidth={s.w} />)}
        {EMBLEM.ticks.map((s) => <path key={s.d} d={s.d} strokeWidth={s.w} />)}
        <path d={EMBLEM.rays.d} strokeWidth={EMBLEM.rays.w} />
      </g>
      <path d={EMBLEM.paper} fill={PAPER} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={EMBLEM.ink} fill={INK} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={EMBLEM.accent} fill={SIGNAL} />
    </svg>
  );
}

/** Guides, outlines, Bezier handles and anchors of the same drawing, in construction blue. */
function EmblemConstruction({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke={GUIDE} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="6 4 1 4">
        <path d={EMBLEM.guides} />
        {EMBLEM.guideCircles.map((d) => <path key={d} d={d} />)}
      </g>
      <path d={EMBLEM.outline} fill="none" stroke={GUIDE} strokeWidth="1.1" />
      <g stroke={GUIDE} strokeWidth="0.9">
        {EMBLEM.handles.map(([x1, y1, x2, y2]) => <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />)}
      </g>
      <g fill={PAPER} stroke={GUIDE} strokeWidth="1">
        {EMBLEM.controls.map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" />)}
      </g>
      <g fill={PAPER} stroke={GUIDE} strokeWidth="1.2">
        {EMBLEM.anchors.map(([x, y]) => <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" />)}
      </g>
    </svg>
  );
}

function Note({ children, className, arrow }: { children: React.ReactNode; className: string; arrow: 'down-left' | 'up-right' }) {
  return (
    <p aria-hidden="true" className={`pointer-events-none absolute hidden select-none font-hand text-[1.45rem] font-semibold leading-none text-signal-ink md:block ${className}`}>
      <span className="block -rotate-3">{children}</span>
      <svg viewBox="0 0 70 44" className={`mt-1 h-9 w-14 ${arrow === 'up-right' ? 'ml-6 -scale-y-100' : '-scale-x-100'}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4C12 26 34 36 62 34M52 24l11 10-13 8" />
      </svg>
    </p>
  );
}

const SWEEP = [
  { t: 0, v: 50 },
  { t: 900, v: 14 },
  { t: 2300, v: 86 },
  { t: 3300, v: 52 },
];

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export default function HeroSheet({ demoLabel, copy }: { demoLabel: string; copy: HomeCopy['sheet'] }) {
  const artRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);

  const apply = (value: number) => {
    const v = Math.min(100, Math.max(0, value));
    artRef.current?.style.setProperty('--x', `${v}%`);
    if (rangeRef.current) {
      rangeRef.current.value = String(v);
      rangeRef.current.setAttribute('aria-valuetext', `${Math.round(v)}% ${copy.sliderValue}`);
    }
  };

  const fromPointer = (clientX: number) => {
    const rect = artRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    touched.current = true;
    apply(((clientX - rect.left) / rect.width) * 100);
  };

  // A single gentle sweep on load shows that the drawing can be scrubbed. Any interaction cancels it.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (touched.current) return;
      if (!start) start = now;
      const t = now - start;
      let i = SWEEP.findIndex((k, idx) => idx < SWEEP.length - 1 && t >= k.t && t < SWEEP[idx + 1].t);
      if (i === -1) i = SWEEP.length - 2;
      const a = SWEEP[i];
      const b = SWEEP[i + 1];
      const f = Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
      apply(a.v + (b.v - a.v) * ease(f));
      if (t < SWEEP[SWEEP.length - 1].t) raf = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => { raf = requestAnimationFrame(tick); }, 900);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* two loose sheets underneath give the page some depth without tilting the interactive one */}
      <div aria-hidden="true" className="absolute inset-0 hidden translate-x-3 translate-y-3 rotate-[2.2deg] border border-rule-strong bg-paper-3 md:block" />
      <div aria-hidden="true" className="absolute inset-0 hidden -translate-x-2 translate-y-1.5 -rotate-[1.6deg] border border-rule-strong bg-paper-2 md:block" />
      <CropMarks />

      <figure className="relative m-0 border border-ink bg-paper-2 shadow-[0_30px_60px_-30px_rgb(21_23_28/0.45)]">
        <figcaption className="flex items-center justify-between border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{demoLabel}</span>
          <span className="text-ink-3">{copy.number}</span>
        </figcaption>

        <div
          ref={artRef}
          className={`relative aspect-square overflow-hidden ${styles.art}`}
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e.clientX); }}
          onPointerMove={(e) => { if (e.pointerType === 'mouse' || dragging.current) fromPointer(e.clientX); }}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
        >
          {/* All three layers are scaled alike so the drawing keeps a margin inside the sheet; the clip and the mask live on the wrappers so they stay aligned with the split line. */}
          <div className="absolute inset-0 scale-[0.93]">
            <Image src="/art/compass-source.jpg" alt="" fill sizes="(min-width: 640px) 540px, 100vw" unoptimized className="object-contain" />
          </div>
          <div className={`absolute inset-0 ${styles.final}`}>
            <EmblemFinal className="h-full w-full scale-[0.93]" />
          </div>
          <div className={`absolute inset-0 ${styles.construction}`}>
            <EmblemConstruction className="h-full w-full scale-[0.93]" />
          </div>

          <span aria-hidden="true" className="absolute left-3 top-3 border border-rule-strong bg-paper-2/90 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-2">{copy.source}</span>
          <span aria-hidden="true" className="absolute right-3 top-3 border border-ink bg-ink px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-paper">{copy.redrawn}</span>

          <div aria-hidden="true" className={`pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-ink ${styles.line}`}>
            <span className="absolute -left-[4px] top-[46px] h-[9px] w-[9px] border border-ink bg-signal" />
            <span className="absolute -left-[4px] bottom-3 h-[9px] w-[9px] border border-ink bg-signal" />
          </div>
        </div>

        <div className="border-t border-ink px-3 pb-2 pt-3">
          <input
            ref={rangeRef}
            type="range"
            min={0}
            max={100}
            step={1}
            defaultValue={50}
            aria-label={copy.slider}
            aria-valuetext={`50% ${copy.sliderValue}`}
            className={styles.range}
            onChange={(e) => { touched.current = true; apply(Number(e.target.value)); }}
          />
        </div>

        <dl className="grid grid-cols-[1.25fr_.6fr_1.15fr] border-t border-ink text-ink">
          {[
            [copy.artwork, copy.artworkValue],
            [copy.scale, copy.scaleValue],
            [copy.status, copy.statusValue],
          ].map(([label, value], index) => (
            <div key={label} className={`px-4 py-3 ${index > 0 ? 'border-l border-ink' : ''}`}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</dt>
              <dd className="mt-1 text-[13px] font-medium leading-tight">{value}</dd>
            </div>
          ))}
        </dl>
      </figure>

      <Note arrow="down-left" className="-top-14 right-2">{copy.noteNodes}</Note>
      <Note arrow="up-right" className="-bottom-[4.6rem] left-3">{copy.noteTrace}</Note>
    </div>
  );
}
