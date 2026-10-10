'use client';

import React, { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { Check, ChevronLeft, ChevronRight, Layers2, ScanLine } from 'lucide-react';

interface BeforeAfterSliderProps {
  title?: string;
  category?: string;
  initialSliderPos?: number;
}

function RenderVectorContent({ isWireframe }: { isWireframe: boolean }) {
  return (
    <svg
      viewBox="0 0 500 500"
      className="h-full max-h-[440px] w-full max-w-[440px]"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Artwork or Wireframe Representation */}
      <g className={isWireframe ? 'opacity-30' : 'opacity-100 transition-opacity duration-300'}>
        {/* Outer Shield Geometry */}
        <path
          d="M 250 40 L 410 110 C 410 270 340 380 250 450 C 160 380 90 270 90 110 Z"
          fill="var(--color-ink)"
          stroke="var(--color-ink)"
          strokeWidth="2"
        />
        {/* Inner Inset Hairline */}
        <path
          d="M 250 65 L 390 125 C 390 260 330 355 250 420 C 170 355 110 260 110 125 Z"
          fill="var(--color-paper)"
          stroke="var(--color-signal)"
          strokeWidth="3"
        />
        {/* Geometric Falcon Crest Wings & Beak */}
        <path
          d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z"
          fill="var(--color-ink)"
        />
        <path
          d="M 250 210 L 275 260 L 250 310 L 225 260 Z"
          fill="var(--color-signal)"
        />
        {/* Architectural Circle Guide */}
        <circle
          cx="250"
          cy="235"
          r="115"
          fill="none"
          stroke="var(--color-guide)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        {/* Bespoke Outlined Lettering */}
        <text
          x="250"
          y="380"
          fontFamily="sans-serif"
          fontWeight="800"
          fontSize="22"
          letterSpacing="5"
          fill="var(--color-ink)"
          textAnchor="middle"
        >
          ARTLANTIX
        </text>
        <text
          x="250"
          y="402"
          fontFamily="sans-serif"
          fontWeight="600"
          fontSize="10"
          letterSpacing="3"
          fill="var(--color-signal)"
          textAnchor="middle"
        >
          STUDIO · PRO
        </text>
      </g>

      {/* Wireframe and Bezier Tangent Nodes Overlay */}
      {isWireframe && (
        <g className="animate-in fade-in duration-200">
          {/* Vector Outlines */}
          <g stroke="var(--color-guide)" strokeWidth="1.5" fill="none">
            <path d="M 250 40 L 410 110 C 410 270 340 380 250 450 C 160 380 90 270 90 110 Z" />
            <path d="M 250 65 L 390 125 C 390 260 330 355 250 420 C 170 355 110 260 110 125 Z" />
            <path d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z" />
            <circle cx="250" cy="235" r="115" />
          </g>

          {/* Bezier Nodes (Squares) and Tangent Handles */}
          <g fill="var(--color-guide)" stroke="var(--color-paper-2)" strokeWidth="1.5">
            <rect x="246" y="36" width="8" height="8" />
            <rect x="406" y="106" width="8" height="8" />
            <rect x="246" y="446" width="8" height="8" />
            <rect x="86" y="106" width="8" height="8" />
            <rect x="246" y="136" width="8" height="8" />
            <rect x="326" y="196" width="8" height="8" />
            <rect x="346" y="266" width="8" height="8" />
            <rect x="146" y="266" width="8" height="8" />
            <rect x="166" y="196" width="8" height="8" />
            {/* Tangent guide lines */}
            <line x1="410" y1="110" x2="435" y2="195" stroke="var(--color-guide)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="435" cy="195" r="3.5" fill="var(--color-paper-2)" stroke="var(--color-guide)" strokeWidth="1.5" />
            <line x1="90" y1="110" x2="65" y2="195" stroke="var(--color-guide)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="65" cy="195" r="3.5" fill="var(--color-paper-2)" stroke="var(--color-guide)" strokeWidth="1.5" />
          </g>
        </g>
      )}
    </svg>
  );
}

function RenderRasterContent() {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-6 py-10 sm:px-10 filter blur-[1.2px] contrast-85">
      <svg
        viewBox="0 0 500 500"
        className="h-full max-h-[440px] w-full max-w-[440px] opacity-85"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          {/* Blurry jagged shield */}
          <path
            d="M 250 42 L 408 112 C 407 268 338 377 250 448 C 162 377 92 268 92 112 Z"
            fill="#282828"
            stroke="#383838"
            strokeWidth="6"
            strokeLinejoin="bevel"
          />
          <path
            d="M 250 67 L 388 127 C 388 258 328 352 250 417 C 172 352 112 258 112 127 Z"
            fill="#DDD7CD"
            stroke="#B85D43"
            strokeWidth="5"
          />
          {/* Jagged wings with stray AI artifacts */}
          <path
            d="M 250 143 L 328 203 L 288 223 L 348 272 L 250 252 L 152 272 L 208 222 L 172 203 Z"
            fill="#282828"
          />
          <path d="M 270 190 Q 295 180 310 195" stroke="#383838" strokeWidth="3" fill="none" />
          <path d="M 190 240 Q 210 250 230 240" stroke="#383838" strokeWidth="2.5" fill="none" />
          {/* Garbled AI typography */}
          <text
            x="250"
            y="379"
            fontFamily="sans-serif"
            fontWeight="700"
            fontSize="21"
            letterSpacing="4"
            fill="#383838"
            textAnchor="middle"
          >
            AR7LAN7IX
          </text>
          <text
            x="250"
            y="401"
            fontFamily="sans-serif"
            fontWeight="500"
            fontSize="9"
            letterSpacing="2"
            fill="#884433"
            textAnchor="middle"
          >
            5TUDIO · PRO
          </text>
        </g>
      </svg>

      {/* Raster pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'radial-gradient(var(--color-ink) 0.75px, transparent 0.75px), radial-gradient(var(--color-ink) 0.75px, var(--color-paper) 0.75px)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 4px 4px',
        }}
      />
    </div>
  );
}

const inspectionCopy = {
  tr: {
    category: 'Çizimin anatomisi', title: 'Apex Falcon Crest', demo: 'Stüdyo demonstrasyonu',
    artwork: 'Çizim', nodes: 'Vektör düğümleri', before: 'Önce', after: 'Sonra',
    raster: 'Raster kaynak', vector: 'Yeniden çizilen vektör', drag: 'Kaydırın, farkı keşfedin',
    comparison: 'Önce ve sonra karşılaştırması', position: 'Raster görünümü',
    features: [
      ['Temiz konturlar', 'Piksel izlerinden akıcı eğrilere.'],
      ['Kontrollü geometri', 'Düğüm görünümünde yapıyı inceleyin.'],
      ['Ölçeklenebilir çizim', 'Her boyutta aynı netlik.'],
    ],
  },
  en: {
    category: 'Anatomy of the artwork', title: 'Apex Falcon Crest', demo: 'Studio demonstration',
    artwork: 'Artwork', nodes: 'Vector nodes', before: 'Before', after: 'After',
    raster: 'Raster source', vector: 'Redrawn vector', drag: 'Slide to explore the difference',
    comparison: 'Before and after comparison', position: 'Raster view',
    features: [
      ['Clean contours', 'From pixel artifacts to flowing curves.'],
      ['Controlled geometry', 'Explore the structure in node view.'],
      ['Scalable artwork', 'The same clarity at every size.'],
    ],
  },
  de: {
    category: 'Aufbau der Zeichnung', title: 'Apex Falcon Crest', demo: 'Studio-Demonstration',
    artwork: 'Zeichnung', nodes: 'Vektorknoten', before: 'Vorher', after: 'Nachher',
    raster: 'Rastervorlage', vector: 'Neu gezeichneter Vektor', drag: 'Verschieben und den Unterschied entdecken',
    comparison: 'Vorher-Nachher-Vergleich', position: 'Rasteransicht',
    features: [
      ['Saubere Konturen', 'Von Pixelartefakten zu fließenden Kurven.'],
      ['Kontrollierte Geometrie', 'Die Struktur in der Knotenansicht erkunden.'],
      ['Skalierbare Zeichnung', 'Gleiche Klarheit in jeder Größe.'],
    ],
  },
};

export default function BeforeAfterSlider({
  title,
  initialSliderPos = 50,
}: BeforeAfterSliderProps) {
  const locale = useLocale();
  const copy = inspectionCopy[locale === 'tr' || locale === 'de' ? locale : 'en'];
  const [sliderPosition, setSliderPosition] = useState(Math.min(98, Math.max(2, initialSliderPos)));
  const [isDragging, setIsDragging] = useState(false);
  // The structural vector view is the clearest first impression of the studio work.
  const [isWireframe, setIsWireframe] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    setSliderPosition(Math.min(98, Math.max(2, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <figure className="m-0 border border-ink bg-paper-2 shadow-[0_30px_60px_-34px_rgb(21_23_28/0.5)]">
      <figcaption className="flex flex-col justify-between gap-4 border-b border-ink px-4 py-3.5 sm:px-5 md:flex-row md:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em]"><span aria-hidden="true" className="h-2 w-2 shrink-0 bg-signal" />{copy.demo}</p>
          <h3 className="mt-1.5 font-display text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">{title || copy.title}</h3>
        </div>
        <div className="flex shrink-0 self-start border border-ink" role="group" aria-label={copy.comparison}>
          {[{ value: true, label: copy.nodes, Icon: ScanLine }, { value: false, label: copy.artwork, Icon: Layers2 }].map(({ value, label, Icon }, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={isWireframe === value}
              onClick={() => setIsWireframe(value)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold transition-colors ${index > 0 ? 'border-l border-ink' : ''} ${isWireframe === value ? 'bg-ink text-paper' : 'text-ink hover:bg-paper-3'}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </figcaption>

      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={copy.comparison}
        aria-valuemin={2}
        aria-valuemax={98}
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuetext={`${copy.position}: ${Math.round(sliderPosition)}%`}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          event.currentTarget.focus({ preventScroll: true });
          event.currentTarget.setPointerCapture(event.pointerId);
          setIsDragging(true);
          handleMove(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) handleMove(event.clientX);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          setIsDragging(false);
        }}
        onPointerCancel={() => setIsDragging(false)}
        onLostPointerCapture={() => setIsDragging(false)}
        onKeyDown={(event) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          setSliderPosition((value) => event.key === 'Home' ? 2 : event.key === 'End' ? 98 : Math.min(98, Math.max(2, value + (['ArrowRight', 'ArrowUp'].includes(event.key) ? 2 : -2))));
        }}
        className="relative h-[340px] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden bg-paper focus-visible:outline-offset-[-5px] sm:h-[420px] lg:h-[480px]"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative flex h-full w-full items-center justify-center px-6 py-10 sm:px-10">
            <RenderVectorContent isWireframe={isWireframe} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-paper-3" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} aria-hidden="true">
          <div className="absolute inset-0">
            <RenderRasterContent />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-4 sm:inset-x-4 sm:top-4" aria-hidden="true">
          <span className="border border-rule-strong bg-paper-2/90 px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-2">{copy.before}</span>
          <span className="inline-flex items-center gap-1.5 border border-ink bg-ink px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-paper"><Check className="h-3 w-3" />{copy.after}</span>
        </div>

        <div className="pointer-events-none absolute inset-y-0 z-10 w-px -translate-x-1/2 bg-ink" style={{ left: `${sliderPosition}%` }} aria-hidden="true">
          <span className="absolute -left-[4px] top-14 h-[9px] w-[9px] border border-ink bg-signal" />
          <span className="absolute -left-[4px] bottom-4 h-[9px] w-[9px] border border-ink bg-signal" />
          <div className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-ink bg-paper-2 text-ink shadow-[3px_3px_0_0_var(--color-ink)] transition-transform ${isDragging ? 'scale-105' : ''}`}>
            <ChevronLeft className="h-4 w-4 shrink-0" /><ChevronRight className="h-4 w-4 shrink-0" />
          </div>
        </div>
      </div>

      <div className="grid border-t border-ink sm:grid-cols-3">
        {copy.features.map(([heading, description], index) => (
          <div key={heading} className={`flex gap-3 px-4 py-4 sm:px-5 ${index > 0 ? 'border-t border-ink sm:border-l sm:border-t-0' : ''}`}>
            <span className="pt-0.5 font-display text-sm font-semibold tabular-nums text-signal-ink">0{index + 1}</span>
            <div>
              <p className="text-sm font-semibold text-ink">{heading}</p>
              <p className="mt-1 text-xs leading-5 text-ink-3">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
