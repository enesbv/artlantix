'use client';

import React, { useState, useRef } from 'react';
import { useLocale } from 'next-intl';
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Layers2, ScanLine } from 'lucide-react';

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
          fill="#141414"
          stroke="#141414"
          strokeWidth="2"
        />
        {/* Inner Inset Hairline */}
        <path
          d="M 250 65 L 390 125 C 390 260 330 355 250 420 C 170 355 110 260 110 125 Z"
          fill="#F9F8F6"
          stroke="#18794E"
          strokeWidth="3"
        />
        {/* Geometric Falcon Crest Wings & Beak */}
        <path
          d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z"
          fill="#141414"
        />
        <path
          d="M 250 210 L 275 260 L 250 310 L 225 260 Z"
          fill="#18794E"
        />
        {/* Architectural Circle Guide */}
        <circle
          cx="250"
          cy="235"
          r="115"
          fill="none"
          stroke="#18794E"
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
          fill="#141414"
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
          fill="#18794E"
          textAnchor="middle"
        >
          STUDIO · PRO
        </text>
      </g>

      {/* Wireframe and Bezier Tangent Nodes Overlay */}
      {isWireframe && (
        <g className="animate-in fade-in duration-200">
          {/* Vector Outlines */}
          <g stroke="#18794E" strokeWidth="1.5" fill="none">
            <path d="M 250 40 L 410 110 C 410 270 340 380 250 450 C 160 380 90 270 90 110 Z" />
            <path d="M 250 65 L 390 125 C 390 260 330 355 250 420 C 170 355 110 260 110 125 Z" />
            <path d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z" />
            <circle cx="250" cy="235" r="115" />
          </g>

          {/* Bezier Nodes (Squares) and Tangent Handles */}
          <g fill="#18794E" stroke="#FFFFFF" strokeWidth="1.5">
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
            <line x1="410" y1="110" x2="435" y2="195" stroke="#18794E" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="435" cy="195" r="3.5" fill="#FFFFFF" stroke="#18794E" strokeWidth="1.5" />
            <line x1="90" y1="110" x2="65" y2="195" stroke="#18794E" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="65" cy="195" r="3.5" fill="#FFFFFF" stroke="#18794E" strokeWidth="1.5" />
          </g>
        </g>
      )}
    </svg>
  );
}

function RenderRasterContent() {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-8 py-16 sm:px-12 filter blur-[1.2px] contrast-85">
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
            'radial-gradient(#141414 0.75px, transparent 0.75px), radial-gradient(#141414 0.75px, #F0EDE6 0.75px)',
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
    <div className="overflow-hidden rounded-[1.5rem] border border-[#DDE5DE] bg-white shadow-[0_16px_60px_-32px_rgba(16,42,32,0.22)] sm:rounded-[2rem]">
      <div className="flex flex-col justify-between gap-5 px-5 py-5 sm:px-8 sm:py-6 md:flex-row md:items-center">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-[#102A20] sm:text-lg">{title || copy.title}</h3>
        </div>
        <div className="flex shrink-0 gap-1 self-start rounded-xl bg-[#F0F3EF] p-1" role="group" aria-label={copy.comparison}>
          {[{ value: true, label: copy.nodes, Icon: ScanLine }, { value: false, label: copy.artwork, Icon: Layers2 }].map(({ value, label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-pressed={isWireframe === value}
              onClick={() => setIsWireframe(value)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18794E] sm:px-4 ${isWireframe === value ? 'bg-[#102A20] text-white shadow-sm' : 'text-[#5E6C62] hover:bg-white hover:text-[#102A20]'}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2 sm:px-3">
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
          className="relative h-[360px] w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl bg-[#F5F7F2] outline-none focus-visible:ring-2 focus-visible:ring-[#18794E] focus-visible:ring-offset-2 sm:h-[440px] lg:h-[460px]"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'linear-gradient(#DCE4D9 1px, transparent 1px), linear-gradient(90deg, #DCE4D9 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative flex h-full w-full items-center justify-center px-8 py-16 sm:px-12">
              <RenderVectorContent isWireframe={isWireframe} />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-[#EEECE6]" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} aria-hidden="true">
            <div className="absolute inset-0">
              <RenderRasterContent />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-4 top-5 flex items-start justify-between gap-4 sm:inset-x-6" aria-hidden="true">
            <div>
              <span className="inline-flex rounded-md border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#5D625B]">{copy.before}</span>
              <p className="mt-2 text-xs text-[#70776D]">{copy.raster}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#B4DFC4] bg-[#E9F9EE] px-2.5 py-1 text-[11px] font-semibold text-[#115C3B]"><Check className="h-3 w-3" />{copy.after}</span>
              <p className="mt-2 text-xs text-[#546A59]">{copy.vector}</p>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#18794E]/65" style={{ left: `${sliderPosition}%` }} aria-hidden="true">
            <div className={`absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[5px] border-white bg-[#18794E] text-white shadow-[0_3px_18px_rgba(16,42,32,0.22)] transition-transform ${isDragging ? 'scale-110' : ''}`}>
              <ChevronLeft className="h-4 w-4 shrink-0" /><ChevronRight className="h-4 w-4 shrink-0" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center" aria-hidden="true">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3.5 py-2 text-[11px] font-medium text-[#526357] shadow-sm">
              <ArrowLeftRight className="h-3.5 w-3.5 text-[#18794E]" />{copy.drag}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
