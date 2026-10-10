import React from 'react';

interface Column {
  title: string;
  items: readonly string[];
}

/** Lists set as columns divided by ink rules, each item on its own hairline, so no card boxes are needed. */
export default function RuledColumns({ columns }: { columns: readonly Column[] }) {
  return (
    <div className="grid border-y border-ink md:grid-cols-3">
      {columns.map((column, index) => (
        <section
          key={column.title}
          className={`py-8 md:px-8 md:py-10 ${index === 0 ? 'md:pl-0' : 'border-t border-ink md:border-l md:border-t-0'} ${index === columns.length - 1 ? 'md:pr-0' : ''}`}
        >
          <h2 className="font-display text-xl font-bold tracking-[-0.02em]">{column.title}</h2>
          <ul className="mt-6">
            {column.items.map((item) => (
              <li key={item} className="flex gap-3 border-t border-rule py-3 text-[15px] leading-6 text-ink-2">
                <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 bg-signal" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
