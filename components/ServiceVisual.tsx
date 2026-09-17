import React from 'react';

export default function ServiceVisual({ slug }: { slug: string }) {
  const artwork: Record<string, React.ReactNode> = {
    'ai-logo-vectorization': <>
      <g fill="#B4DFC4" stroke="none"><path d="m91 43 28 19-10 32H74L63 62Z" /><path d="m91 53 15 12-6 17H82l-6-17Z" fill="#F3FBF6" /></g>
      <path d="M139 71h26m-8-7 8 7-8 7" stroke="#8FC9A6" />
      <path d="m216 35 36 25-14 42h-44l-14-42Z" fill="#E9F9EE" />
      <path d="m216 49 21 15-8 25h-26l-8-25Z" />
      <g fill="#18794E" stroke="none"><circle cx="216" cy="35" r="4" /><circle cx="252" cy="60" r="4" /><circle cx="238" cy="102" r="4" /><circle cx="180" cy="60" r="4" /></g>
      <path d="m267 30 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#18794E" stroke="none" />
    </>,
    'low-resolution-logo-rebuild': <>
      <g fill="#B4DFC4" stroke="none">{[[58,48],[70,36],[82,36],[94,48],[106,60],[58,60],[58,72],[70,84],[82,84],[94,72],[106,72]].map(([x,y]) => <rect key={`${x}-${y}`} x={x} y={y} width="12" height="12" />)}</g>
      <path d="M141 71h26m-8-7 8 7-8 7" stroke="#8FC9A6" />
      <path d="M194 98V45h23c34 0 34 53 0 53Z" fill="#E9F9EE" />
      <path d="M208 85V58h9c16 0 16 27 0 27Z" />
      <path d="M194 45h48M194 98h48" stroke="#8FC9A6" strokeDasharray="4 5" />
      <g fill="#18794E" stroke="none"><rect x="190" y="41" width="8" height="8" /><rect x="190" y="94" width="8" height="8" /><circle cx="242" cy="71" r="4" /></g>
    </>,
    'typography-reconstruction': <>
      <path d="M52 109h218M52 34h218M52 84h218" stroke="#B4DFC4" strokeDasharray="4 6" />
      <path d="m79 107 34-69 33 69M92 82h41" strokeWidth="6" />
      <path d="M165 107V39h26c32 0 32 34 0 34h-26m26 0 27 34" strokeWidth="6" />
      <path d="M113 38V20m-24 0h48M202 56h40v34" stroke="#8FC9A6" />
      <g fill="#18794E" stroke="none"><rect x="109" y="34" width="8" height="8" /><rect x="89" y="78" width="8" height="8" /><circle cx="202" cy="56" r="4" /><circle cx="242" cy="90" r="4" /></g>
    </>,
    'mascot-vectorization': <>
      <path d="m118 48-14-25 39 13h35l39-13-14 25 11 36-20 29-33 13-33-13-21-29Z" fill="#E9F9EE" />
      <path d="m129 66 18 8-12 8m58-16-18 8 12 8M144 91l17 12 17-12-17-6Z" fill="#18794E" />
      <path d="m118 48 19 2 24 35 23-35 19-2M161 103v15M75 58h21M225 58h21M83 81h14M224 81h14" stroke="#8FC9A6" />
      <g fill="#18794E" stroke="none"><circle cx="118" cy="48" r="4" /><circle cx="203" cy="48" r="4" /><circle cx="161" cy="126" r="4" /></g>
    </>,
    'screen-print-separation': <>
      <g strokeWidth="2"><rect x="65" y="27" width="99" height="88" rx="8" fill="#DFF0FA" stroke="#529DC0" /><rect x="109" y="35" width="99" height="88" rx="8" fill="#FAE8DF" stroke="#D08C70" /><rect x="153" y="43" width="99" height="88" rx="8" fill="#E9F9EE" /></g>
      <path d="m203 62 8 17 19 3-14 13 3 19-16-9-17 9 3-19-14-13 19-3Z" fill="#18794E" />
      <g strokeWidth="1.5"><path d="M75 40h10m-5-5v10M119 48h10m-5-5v10M163 56h10m-5-5v10" /></g>
      <g stroke="none"><circle cx="87" cy="116" r="4" fill="#529DC0" /><circle cx="131" cy="124" r="4" fill="#D08C70" /><circle cx="175" cy="132" r="4" fill="#18794E" /></g>
    </>,
    'cnc-laser-cut-vector': <>
      <path d="M89 102V63l32-24h75l33 24v39h-44V76h-53v26Z" fill="#E9F9EE" />
      <path d="M78 113V58l39-30h84l39 30v55h-65V87h-32v26Z" stroke="#8FC9A6" strokeDasharray="5 5" />
      <path d="M228 16h33v19h-33ZM245 35v15m-6 0h12m-6 4v8" strokeWidth="2" />
      <circle cx="245" cy="67" r="3" fill="#18794E" stroke="none" />
      <g fill="#18794E" stroke="none"><rect x="85" y="98" width="8" height="8" /><rect x="117" y="35" width="8" height="8" /><rect x="225" y="59" width="8" height="8" /></g>
    </>,
  };
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border border-[#DCEDE2] bg-[#F3FBF6]">
      <svg aria-hidden="true" viewBox="0 0 320 150" className="h-40 w-full transition-transform duration-300 group-hover:scale-[1.03]" fill="none" stroke="#18794E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="#DCEDE2" strokeWidth="1">{[40,80,120,160,200,240,280].map((x) => <path key={x} d={`M${x} 0v150`} />)}{[30,60,90,120].map((y) => <path key={y} d={`M0 ${y}h320`} />)}</g>
        {artwork[slug]}
      </svg>
    </div>
  );
}
