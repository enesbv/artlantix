'use client';

import React, { useId, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

/** Accordion as ruled rows: numbered questions in the display face and a square plus/minus toggle. */
export default function FaqList({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  const [open, setOpen] = useState(0);
  const uid = useId();

  return (
    <div className="border-t border-ink">
      {items.map((item, index) => {
        const expanded = open === index;
        const panelId = `${uid}-panel-${index}`;
        return (
          <div key={item.q} className="border-b border-ink">
            <h3 className="m-0">
              <button
                type="button"
                className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span className="flex gap-4 sm:gap-5">
                  <span aria-hidden="true" className={`pt-1.5 font-display text-sm font-semibold tabular-nums transition-colors ${expanded ? 'text-signal-ink' : 'text-ink-3'}`}>0{index + 1}</span>
                  <span className="font-display text-[1.2rem] font-bold leading-snug tracking-[-0.015em] sm:text-[1.35rem]">{item.q}</span>
                </span>
                <span aria-hidden="true" className={`grid h-8 w-8 shrink-0 place-items-center border border-ink transition-colors ${expanded ? 'bg-ink text-paper' : 'group-hover:bg-signal-tint'}`}>
                  {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
            </h3>
            <div id={panelId} inert={!expanded} className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              <div className="overflow-hidden">
                <p className="max-w-[62ch] pb-7 pl-[2.25rem] text-[15px] leading-7 text-ink-2 sm:pl-[2.75rem]">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
