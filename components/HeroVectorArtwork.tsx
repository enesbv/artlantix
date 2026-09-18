'use client';

import { useId, useRef } from 'react';
import styles from './HeroVectorArtwork.module.css';

const contours = [
  'M260 42 434 109v116c0 118-76 193-174 237C162 418 86 343 86 225V109Z',
  'M260 63 415 123v102c0 103-65 173-155 216C170 398 105 328 105 225V123Z',
  'M260 84 395 137v88c0 88-54 151-135 193C179 376 125 313 125 225V137Z',
  'M260 178c-25-38-68-58-108-55l39 45-54-17 46 51-40-7 54 47-35 2 66 37 32 64 32-64 66-37-35-2 54-47-40 7 46-51-54 17 39-45c-40-3-83 17-108 55Z',
  'M260 178c-6-24 4-43 23-48l31 15-24 10 11 15-26-3-15 35',
  'M152 123 228 220 260 272 292 220 368 123',
  'm191 168 48 64m-56-30 55 44m-41-4 40 20m92-94-48 64m56-30-55 44m41-4-40 20',
  'm228 281 10-35 22 26 22-26 10 35M260 272v73',
  'M181 318c20 25 46 45 79 63 33-18 59-38 79-63M204 331l56 30 56-30',
  'M176 109q84-35 168 0M230 109h60',
  'm245 103 15-15 15 15-15 15Z',
];
const nodes = [[260,42],[434,109],[434,225],[260,462],[86,225],[86,109],[260,178],[152,123],[368,123],[228,281],[292,281],[260,345],[260,381],[181,318],[339,318]];

function Drawing() {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    {contours.map((d, i) => <path key={d} d={d} pathLength="1" className={styles.line} style={{ animationDelay: `${i * 65}ms` }} />)}
  </g>;
}

export default function HeroVectorArtwork() {
  const id = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const spotRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const reset = () => {
    spotRef.current?.style.setProperty('transform', 'translate(260px, 250px)');
    trailRef.current?.style.setProperty('transform', 'translate(260px, 250px)');
  };
  return (
    <div className={styles.artwork} aria-hidden="true" onPointerLeave={reset} onPointerMove={(event) => {
      if (event.pointerType === 'touch' || !svgRef.current) return;
      const matrix = svgRef.current.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const transform = `translate(${point.x}px, ${point.y}px)`;
      spotRef.current?.style.setProperty('transform', transform);
      trailRef.current?.style.setProperty('transform', transform);
    }}>
      <svg ref={svgRef} viewBox="0 0 520 520" className={styles.svg}>
        <defs>
          <radialGradient id={`${id}-light`}><stop offset="0" stopColor="white" /><stop offset=".55" stopColor="white" stopOpacity=".95" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
          <radialGradient id={`${id}-wash`}><stop stopColor="#D9EFE0" stopOpacity=".65" /><stop offset="1" stopColor="#D9EFE0" stopOpacity="0" /></radialGradient>
          <pattern id={`${id}-grid`} width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#18794E" opacity=".16" /></pattern>
          <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="520" height="520">
            <g ref={trailRef} className={styles.trail}><circle r="165" fill={`url(#${id}-light)`} opacity=".5" /></g>
            <g ref={spotRef} className={styles.spot}><circle r="140" fill={`url(#${id}-light)`} /></g>
          </mask>
        </defs>
        <circle cx="260" cy="260" r="250" fill={`url(#${id}-wash)`} />
        <circle cx="260" cy="260" r="235" fill={`url(#${id}-grid)`} />
        <g stroke="#18794E" strokeWidth="1" opacity=".12" fill="none"><circle cx="260" cy="250" r="208" /><path d="M260 12v490M26 250h468" strokeDasharray="3 7" /></g>
        <g stroke="#9CB8A6" strokeWidth="1.25" opacity=".48"><Drawing /></g>
        <g className={styles.reveal} mask={`url(#${id}-mask)`}>
          <g stroke="#115C3B" strokeWidth="1.8"><Drawing /></g>
          <g stroke="#18794E" strokeWidth=".8" fill="none" opacity=".65"><path d="M434 225v92M86 225v92M181 318l-37-49M339 318l37-49M260 462l-61-28m61 28 61-28" />{[[434,317],[86,317],[144,269],[376,269],[199,434],[321,434]].map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#F9F8F6" />)}</g>
          <g fill="#F9F8F6" stroke="#18794E" strokeWidth="1.2">{nodes.map(([x,y]) => <rect key={`${x}-${y}`} x={x-3} y={y-3} width="6" height="6" rx=".7" />)}</g>
        </g>
      </svg>
    </div>
  );
}
