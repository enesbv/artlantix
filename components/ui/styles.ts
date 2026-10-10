/** Shared class strings for the Atelier look, so buttons and layout rhythm stay identical across pages. */

export const container = 'mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-10';

/** Section title: Bricolage Grotesque, tight, large. */
export const sectionTitle = 'font-display text-[clamp(2.1rem,4.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ink';

/** Smaller variant for titles that sit in a narrow column. */
export const sectionTitleSm = 'font-display text-[clamp(2rem,3.4vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink';

/** Primary action: ink pill with an arrow chip that turns orange on hover. */
export const btnPrimary =
  'group inline-flex items-center justify-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-signal hover:text-ink';
export const btnChip =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5';

/** Quiet action: underlined with a hand-drawn feeling orange rule. */
export const textLink =
  'inline-flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-signal decoration-2 underline-offset-[7px] transition-colors hover:text-signal-ink';
