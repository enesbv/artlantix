'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
  title?: string;
  category?: string;
  initialSliderPos?: number;
}

export default function BeforeAfterSlider({
  title = 'AI Concept & Degraded Raster vs. Master Hand-Crafted Vector',
  category = 'Precision Studio Inspection',
  initialSliderPos = 50,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialSliderPos);
  const [isDragging, setIsDragging] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'artwork' | 'wireframe'>('artwork');
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.min(Math.max((x / rect.width) * 100, 2), 98);
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const isWireframe = activeViewMode === 'wireframe';

  return (
    <div className="w-full rounded-2xl border border-[#EAE8E3] bg-white p-4 sm:p-7 shadow-xs">
      {/* Top Gallery Caption Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E3]/70 pb-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#EAE8E3] bg-[#F5F4F0] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-[#141414]">
            {category}
          </span>
          <span className="text-xs font-semibold tracking-tight text-[#141414]">
            {title}
          </span>
        </div>

        {/* Minimalist Floating Segmented Pill */}
        <div className="inline-flex self-start sm:self-auto rounded-full border border-[#EAE8E3] bg-[#F9F8F6] p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveViewMode('artwork')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 ${
              activeViewMode === 'artwork'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#737373] hover:text-[#141414]'
            }`}
          >
            Artwork View
          </button>
          <button
            type="button"
            onClick={() => setActiveViewMode('wireframe')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all duration-200 ${
              activeViewMode === 'wireframe'
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#737373] hover:text-[#141414]'
            }`}
          >
            Vector Wireframe &amp; Nodes
          </button>
        </div>
      </div>

      {/* Cinematic Viewport Canvas */}
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        className="relative h-[380px] sm:h-[480px] lg:h-[540px] w-full select-none overflow-hidden rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] cursor-ew-resize"
      >
        {/* RIGHT SIDE: RECONSTRUCTED VECTOR ARTWORK */}
        <div className="absolute inset-0 flex items-center justify-center bg-[#F9F8F6]">
          <div className="relative flex h-full w-full items-center justify-center p-8 sm:p-12">
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
                  stroke="#E05328"
                  strokeWidth="3"
                />
                {/* Geometric Falcon Crest Wings & Beak */}
                <path
                  d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z"
                  fill="#141414"
                />
                <path
                  d="M 250 210 L 275 260 L 250 310 L 225 260 Z"
                  fill="#E05328"
                />
                {/* Architectural Circle Guide */}
                <circle
                  cx="250"
                  cy="235"
                  r="115"
                  fill="none"
                  stroke="#E05328"
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
                  fill="#E05328"
                  textAnchor="middle"
                >
                  STUDIO · PRO
                </text>
              </g>

              {/* Wireframe and Bezier Tangent Nodes Overlay */}
              {isWireframe && (
                <g className="animate-in fade-in duration-200">
                  {/* Vector Outlines */}
                  <g stroke="#E05328" strokeWidth="1.5" fill="none">
                    <path d="M 250 40 L 410 110 C 410 270 340 380 250 450 C 160 380 90 270 90 110 Z" />
                    <path d="M 250 65 L 390 125 C 390 260 330 355 250 420 C 170 355 110 260 110 125 Z" />
                    <path d="M 250 140 L 330 200 L 290 220 L 350 270 L 250 250 L 150 270 L 210 220 L 170 200 Z" />
                    <circle cx="250" cy="235" r="115" />
                  </g>

                  {/* Bezier Nodes (Squares) and Tangent Handles */}
                  <g fill="#E05328" stroke="#FFFFFF" strokeWidth="1.5">
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
                    <line x1="410" y1="110" x2="435" y2="195" stroke="#E05328" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="435" cy="195" r="3.5" fill="#FFFFFF" stroke="#E05328" strokeWidth="1.5" />
                    <line x1="90" y1="110" x2="65" y2="195" stroke="#E05328" strokeWidth="1" strokeDasharray="2 2" />
                    <circle cx="65" cy="195" r="3.5" fill="#FFFFFF" stroke="#E05328" strokeWidth="1.5" />
                  </g>
                </g>
              )}
            </svg>
          </div>

          {/* Right Floating Badge */}
          <div className="absolute bottom-4 right-4 rounded-full border border-[#EAE8E3] bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-[#141414] shadow-xs backdrop-blur-sm">
            <span className="text-[#E05328] mr-1.5">●</span>
            <span>Master Vector {isWireframe ? '(Wireframe Nodes)' : '(Clean Bezier)'}</span>
          </div>
        </div>

        {/* LEFT SIDE: ORIGINAL LOW-RES RASTER / AI ARTIFACT (CLIPPED) */}
        <div
          className="absolute inset-0 overflow-hidden bg-[#F0EDE6]"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ width: `${containerWidth}px` }}
          >
            <div className="relative flex h-full w-full items-center justify-center p-8 sm:p-12 filter blur-[1.2px] contrast-85">
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
                    fontFamily="monospace"
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
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#141414 0.75px, transparent 0.75px), radial-gradient(#141414 0.75px, #F0EDE6 0.75px)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0, 4px 4px',
                }}
              />
            </div>

            {/* Left Floating Badge */}
            <div className="absolute bottom-4 left-4 rounded-full border border-[#D9D6CE] bg-[#141414]/85 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-sm">
              Original Upload (AI / Blurry Raster)
            </div>
          </div>
        </div>

        {/* SLEEK TACTILE DRAGGING HANDLE */}
        <div
          className="absolute top-0 bottom-0 z-20 flex w-px items-center justify-center bg-[#141414] cursor-ew-resize"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Tactile Puck */}
          <div className="flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[#EAE8E3] bg-white shadow-md transition-transform duration-100 hover:scale-105 active:scale-95">
            <div className="flex items-center gap-0.5 text-[#141414]">
              <span className="text-[10px] font-bold">‹</span>
              <span className="h-3 w-px bg-[#141414]" />
              <span className="text-[10px] font-bold">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Editorial Meta Bar */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#EAE8E3]/70 pt-4 text-left">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">01 / Craftsmanship</span>
          <p className="mt-0.5 text-xs font-bold text-[#141414]">100% Hand-Drawn Beziers</p>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">02 / Path Efficiency</span>
          <p className="mt-0.5 text-xs font-bold text-emerald-700">94% Node Reduction</p>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">03 / Master Suite</span>
          <p className="mt-0.5 text-xs font-bold text-[#141414]">AI · EPS · SVG · PDF · PNG</p>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">04 / Industrial Readiness</span>
          <p className="mt-0.5 text-xs font-bold text-[#E05328]">Screen Print &amp; Laser Cut Ready</p>
        </div>
      </div>
    </div>
  );
}
