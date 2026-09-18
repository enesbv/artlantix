'use client';

import React from 'react';

type VisualKind = 'crest' | 'mascot' | 'lettering';

export default function MarketingVisual({
  kind = 'crest',
  compact = false,
}: {
  kind?: VisualKind;
  compact?: boolean;
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
    <div className={`relative overflow-hidden rounded-2xl border border-[#CFE8D8] bg-[#102A20] ${compact ? 'aspect-[4/3]' : 'min-h-[430px]'}`}>
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(#B4DFC4_1px,transparent_1px),linear-gradient(90deg,#B4DFC4_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#2CB67D]/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[#B4DFC4]/15 blur-3xl" />
      <svg viewBox="0 0 320 340" className="absolute inset-0 h-full w-full p-8" aria-hidden="true">
        <g fill="none" stroke="#DFF7E7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
          {artwork}
        </g>
        <g fill="#2CB67D">
          <circle cx="65" cy="82" r="5" />
          <circle cx="255" cy="82" r="5" />
          <circle cx="160" cy="297" r="5" />
        </g>
      </svg>
    </div>
  );
}
