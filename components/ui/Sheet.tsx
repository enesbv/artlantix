import React from 'react';

interface Props {
  caption: string;
  number?: string;
  children: React.ReactNode;
  cells?: Array<[label: string, value: string]>;
  className?: string;
}

/** A framed drawing sheet: caption bar on top, artwork in the middle, optional title block below. */
export default function Sheet({ caption, number, children, cells, className = '' }: Props) {
  return (
    <figure className={`m-0 border border-ink bg-paper-2 shadow-[0_30px_60px_-34px_rgb(21_23_28/0.5)] ${className}`}>
      <figcaption className="flex items-center justify-between gap-4 border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 shrink-0 bg-signal" />{caption}</span>
        {number && <span className="shrink-0 text-ink-3">{number}</span>}
      </figcaption>
      {children}
      {cells && cells.length > 0 && (
        <dl className="grid border-t border-ink" style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}>
          {cells.map(([label, value], index) => (
            <div key={label} className={`px-4 py-3 ${index > 0 ? 'border-l border-ink' : ''}`}>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</dt>
              <dd className="mt-1 text-[13px] font-medium leading-snug">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </figure>
  );
}
