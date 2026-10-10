'use client';

import React from 'react';

type VisualKind = 'crest' | 'mascot' | 'lettering';

export default function MarketingVisual({
  kind = 'crest',
  compact = false,
  className = '',
}: {
  kind?: VisualKind;
  compact?: boolean;
  className?: string;
}) {
  const artwork = {
    crest: (
      <>
        <path d="M160 48 255 82v73c0 69-41 117-95 142-54-25-95-73-95-142V82Z" />
        <path d="M160 82v164M96 123h128" />
        <circle cx="160" cy="123" r="29" />
      </>
    ),
    mascot: (
      <>
        <path d="M91 231c11-83 44-135 75-135 26 0 54 29 67 77l26 24-40 7c-17 33-41 52-70 52-23 0-43-9-58-25Z" />
        <path d="m113 111-19-44 50 22M182 91l40-31-9 58M129 170l31 19 32-23M139 142h1M192 140h1" />
      </>
    ),
    lettering: (
      <>
        <path d="M57 213 115 91l48 122M78 170h66M169 213l43-122 51 122M190 170h49" />
        <path d="M52 235h218" />
      </>
    ),
  }[kind];

  return (
    <div className={`relative overflow-hidden bg-paper-3 ${compact ? 'aspect-[4/3]' : 'min-h-[430px]'} ${className}`}>
      <svg viewBox="0 0 320 340" className="absolute inset-0 h-full w-full p-8" aria-hidden="true" focusable="false">
        <g stroke="var(--color-rule)" strokeWidth="1">
          {[20, 60, 100, 140, 180, 220, 260, 300].map((x) => <path key={`v${x}`} d={`M${x} 0V340`} />)}
          {[40, 80, 120, 160, 200, 240, 280, 320].map((y) => <path key={`h${y}`} d={`M0 ${y}H320`} />)}
        </g>
        <g fill="none" stroke="var(--color-ink)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
          {artwork}
        </g>
        <g fill="var(--color-signal)" stroke="var(--color-ink)" strokeWidth="1.5">
          <rect x="60" y="77" width="10" height="10" />
          <rect x="250" y="77" width="10" height="10" />
          <rect x="155" y="292" width="10" height="10" />
        </g>
      </svg>
    </div>
  );
}
