import React from 'react';
import { MARK, WORDMARK } from '@/lib/brand-art';

/**
 * The compass star on its own. Takes its ink from `currentColor`; on a dark background pass `inverted`
 * so the light facet becomes dark and the star keeps its two tones.
 */
export function Mark({ size = 28, className = '', inverted = false }: { size?: number; className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true" focusable="false">
      <path d={MARK.paper} fill={inverted ? 'var(--color-ink)' : 'var(--color-paper-2)'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={MARK.ink} fill="currentColor" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d={MARK.accent} fill="var(--color-signal)" />
    </svg>
  );
}

/** The logotype: Bricolage Grotesque outlines with the dot of the "i" replaced by an orange pixel. */
export function Wordmark({ className = '' }: { className?: string }) {
  const { dot } = WORDMARK;
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} role="img" aria-label="Artlantix">
      <path d={WORDMARK.d} fill="currentColor" />
      <rect x={dot.x} y={dot.y} width={dot.size} height={dot.size} fill="var(--color-signal)" />
    </svg>
  );
}

/** Star mark and logotype side by side. */
export function Lockup({ className = '', inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={28} inverted={inverted} />
      <Wordmark className="h-[19px] w-auto" />
    </span>
  );
}
