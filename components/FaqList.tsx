'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FaqList({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-[#DAD8D2] border-y border-[#DAD8D2]">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-bold text-[#141414]"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? -1 : index)}
            >
              <span>{item.q}</span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-[#18794E] transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            {expanded && <p className="max-w-3xl pb-6 text-sm leading-7 text-[#5E625F]">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}
