import React from 'react';
import type { HomeCopy } from '@/lib/home-copy';
import { container, sectionTitle } from '@/components/ui/styles';
import DefectArt, { type DefectKind } from '@/components/home/DefectArt';

const kinds: DefectKind[] = ['ai', 'pixels', 'scan', 'traced'];

// Hairlines between the four specimens: stacked on phones, 2 x 2 on tablets, one row on desktops.
const cellBorders = [
  '',
  'border-t sm:border-l lg:border-l',
  'border-t sm:border-t-0 lg:border-l',
  'border-t sm:border-l lg:border-l',
];
const cellBordersSm = ['', '', 'sm:border-t', 'sm:border-t'];

export default function ProblemSheet({ copy }: { copy: HomeCopy['problem'] }) {
  const [first, ...rest] = copy.statement.split('. ');
  return (
    <section id="problem" className="border-b border-rule">
      <div className={`${container} py-20 lg:py-28`}>
        <h2 className={`${sectionTitle} max-w-4xl`}>{copy.title}</h2>

        <ol className="mt-14 grid border-y border-ink sm:grid-cols-2 lg:grid-cols-4">
          {copy.items.map((item, index) => (
            <li key={item.title} className={`flex flex-col border-ink px-5 py-7 sm:px-6 lg:py-8 ${cellBorders[index]} ${cellBordersSm[index]}`}>
              <div className="flex items-start justify-between">
                <span className="font-display text-sm font-semibold text-signal-ink">0{index + 1}</span>
              </div>
              <div className="mt-4 aspect-square w-full max-w-[210px] border border-rule-strong bg-paper-2 p-3">
                <DefectArt kind={kinds[index]} />
              </div>
              <h3 className="mt-6 font-display text-[1.35rem] font-bold leading-tight tracking-[-0.015em]">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-ink-2">{item.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-16 max-w-4xl font-display text-[clamp(1.75rem,3.3vw,3rem)] font-semibold leading-[1.12] tracking-[-0.025em]">
          <span className="text-ink-3">{first}. </span>
          <span>{rest.join('. ')}</span>
        </p>
      </div>
    </section>
  );
}
