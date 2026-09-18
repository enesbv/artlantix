'use client';

import { useId, useRef, type ReactNode } from 'react';
import styles from './HeroVectorArtwork.module.css';

const curves = [
  'M-100 520C180 680 330 10 650 110S1050 700 1540 430',
  'M-100 555C180 715 330 45 650 145S1050 735 1540 465',
  'M-80 200C200-60 480 40 760 250S1160 640 1510 180',
  'M-70 650C240 420 480 730 820 510S1060-80 1510 80',
  'M780-100C600 120 1150 180 1090 390S830 740 1530 650',
];
const anchors = [[650,110],[760,250],[820,510],[1090,390]];
const handles = [[330,10],[970,210],[480,40],[1040,460],[480,730],[1160,290],[1150,180],[1030,600]];

function Curves() {
  return <g fill="none" strokeLinecap="round">{curves.map((d,i) => <path key={d} d={d} vectorEffect="non-scaling-stroke" pathLength="1" className={styles.line} style={{animationDelay:`${i * 100}ms`}} />)}</g>;
}

export default function HeroVectorArtwork({ children }: { children: ReactNode }) {
  const id = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const spotRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGGElement>(null);
  const reset = () => {
    spotRef.current?.style.setProperty('transform', 'translate(1080px, 340px)');
    trailRef.current?.style.setProperty('transform', 'translate(1080px, 340px)');
  };
  return (
    <section className={styles.hero} onPointerLeave={reset} onPointerMove={(event) => {
      if (event.pointerType === 'touch' || !svgRef.current) return;
      const matrix = svgRef.current.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const transform = `translate(${point.x}px, ${point.y}px)`;
      spotRef.current?.style.setProperty('transform', transform);
      trailRef.current?.style.setProperty('transform', transform);
    }}>
      <div className={styles.artwork} aria-hidden="true">
        <svg ref={svgRef} viewBox="0 0 1440 720" preserveAspectRatio="none" className={styles.svg}>
          <defs>
            <radialGradient id={`${id}-light`}><stop stopColor="white" /><stop offset=".4" stopColor="white" stopOpacity=".9" /><stop offset="1" stopColor="white" stopOpacity="0" /></radialGradient>
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1440" height="720">
              <g ref={trailRef} className={styles.trail}><circle r="260" fill={`url(#${id}-light)`} opacity=".4" /></g>
              <g ref={spotRef} className={styles.spot}><circle r="210" fill={`url(#${id}-light)`} /></g>
            </mask>
          </defs>
          <g stroke="#18794E" strokeWidth="1" opacity=".16"><Curves /></g>
          <g className={styles.reveal} mask={`url(#${id}-mask)`}>
            <g stroke="#18794E" strokeWidth="1.5"><Curves /></g>
            <g stroke="#18794E" strokeWidth=".7" opacity=".6" fill="none">
              <path d="M330 10 970 210M480 40 1040 460M480 730 1160 290M1150 180 1030 600" vectorEffect="non-scaling-stroke" />
              {handles.map(([x,y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#F9F8F6" />)}
            </g>
            <g stroke="#18794E" fill="#F9F8F6" strokeWidth="1.2">{anchors.map(([x,y]) => <rect key={`${x}-${y}`} x={x-4} y={y-4} width="8" height="8" rx="1" />)}</g>
          </g>
        </svg>
      </div>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
