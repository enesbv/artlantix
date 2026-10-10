import React from 'react';

function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={`pointer-events-none absolute hidden h-6 w-6 text-ink/55 md:block ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M2 24H14M24 2V14" />
    </svg>
  );
}

/**
 * Print crop marks around the nearest `relative` parent. They sit just outside the trim edge,
 * like the marks a printer reads to cut a proof, and are hidden on small screens.
 */
export default function CropMarks() {
  return (
    <>
      <Corner className="-left-7 -top-7" />
      <Corner className="-right-7 -top-7 scale-x-[-1]" />
      <Corner className="-bottom-7 -left-7 scale-y-[-1]" />
      <Corner className="-bottom-7 -right-7 scale-[-1]" />
    </>
  );
}
