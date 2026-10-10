import React, { useId } from 'react';
import { DEFECTS, MARK } from '@/lib/brand-art';

export type DefectKind = 'ai' | 'pixels' | 'scan' | 'traced';

const INK = 'var(--color-ink)';

/** Four ways a logo file goes wrong, all drawn from the Artlantix star so they can be compared at a glance. */
export default function DefectArt({ kind }: { kind: DefectKind }) {
  const id = useId().replace(/:/g, '');

  if (kind === 'pixels') {
    return (
      <svg viewBox={`0 0 ${DEFECTS.pixelsSize} ${DEFECTS.pixelsSize}`} className="h-full w-full" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
        <path d={DEFECTS.pixels} fill={INK} />
        <rect x="10" y="10" width="2" height="2" fill="var(--color-signal)" />
      </svg>
    );
  }

  if (kind === 'ai') {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <filter id={`${id}-soft`} x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>
        </defs>
        <path d={DEFECTS.aiStar} fill="none" stroke={INK} strokeOpacity="0.2" strokeWidth="1.2" transform="translate(4 -3) scale(0.97)" />
        <g filter={`url(#${id}-soft)`}>
          <path d={DEFECTS.aiRing} fill="none" stroke={INK} strokeOpacity="0.85" strokeWidth="2.6" />
          <path d={DEFECTS.aiStar} fill={INK} fillOpacity="0.9" />
          <circle cx="60" cy="60" r="4.2" fill="var(--color-signal)" />
        </g>
      </svg>
    );
  }

  if (kind === 'scan') {
    return (
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <pattern id={`${id}-dots`} width="3.6" height="3.6" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
            <circle cx="1.8" cy="1.8" r="1.2" fill={INK} />
          </pattern>
          <filter id={`${id}-rough`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
          </filter>
        </defs>
        <ellipse cx="86" cy="34" rx="18" ry="9" fill="var(--color-paper-3)" transform="rotate(-24 86 34)" />
        <g transform="rotate(-3 60 60)" filter={`url(#${id}-rough)`}>
          <circle cx="60" cy="60" r="54" fill="none" stroke={INK} strokeOpacity="0.7" strokeWidth="2.4" strokeDasharray="2.4 1.2" />
          <g transform="translate(60 60) scale(1.72) translate(-32 -32)">
            <path d={MARK.ink} fill={`url(#${id}-dots)`} />
            <path d={MARK.paper} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.7" />
          </g>
        </g>
        <g fill={INK} fillOpacity="0.5">
          {[[14, 22, 0.9], [27, 98, 0.7], [101, 88, 1.1], [92, 14, 0.7], [18, 64, 0.6], [74, 106, 0.8], [106, 52, 0.6], [44, 12, 0.8]].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true" focusable="false">
      <path d={DEFECTS.tracedRing} fill="none" stroke={INK} strokeWidth="1.6" />
      <path d={DEFECTS.tracedStar} fill={INK} fillOpacity="0.92" stroke={INK} strokeWidth="0.8" />
      <g fill="var(--color-paper-2)" stroke="var(--color-guide)" strokeWidth="0.55">
        {DEFECTS.tracedNodes.map(([x, y]) => <rect key={`${x}-${y}`} x={x - 1.3} y={y - 1.3} width="2.6" height="2.6" />)}
      </g>
    </svg>
  );
}
