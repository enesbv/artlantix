export default function TrackingStageArtwork({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 200 180" className="h-40 w-44 sm:h-44 sm:w-48" fill="none" aria-hidden="true">
      <circle cx="100" cy="88" r="72" fill="var(--color-paper-3)" />
      <circle cx="163" cy="39" r="5" fill="var(--color-signal-tint)" />
      <circle cx="32" cy="128" r="3" fill="var(--color-signal-line)" />
      {step === 0 ? <>
        <rect x="57" y="30" width="85" height="113" rx="3" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="3" />
        <rect x="80" y="23" width="39" height="15" rx="2" fill="var(--color-ink)" />
        <path d="M75 58H113M75 70H100M75 85H121" stroke="var(--color-signal-line)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="125" cy="110" r="25" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="4" />
        <path d="m144 130 16 16" stroke="var(--color-ink)" strokeWidth="7" strokeLinecap="round" />
        <path d="m114 109 8 8 13-15" stroke="var(--color-ink)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </> : step === 1 ? <>
        <rect x="43" y="39" width="114" height="102" rx="3" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="3" />
        <path d="M59 121c8-65 61-67 81-42" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
        <path d="m59 121 0-60m81 18-27-31" stroke="var(--color-guide)" strokeWidth="2" strokeDasharray="4 4" />
        <rect x="54" y="116" width="10" height="10" fill="var(--color-signal)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <rect x="135" y="74" width="10" height="10" fill="var(--color-signal)" stroke="var(--color-ink)" strokeWidth="1.5" />
        <circle cx="59" cy="61" r="4" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="2" />
        <path d="m123 103 23-50 17 8-23 50-18 12Z" fill="var(--color-ink)" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="m123 103 17 8-18 12Z" fill="var(--color-signal-tint)" />
        <path d="m146 53 4-9c2-5 7-5 12-3s7 6 5 11l-4 9" fill="var(--color-signal-tint)" stroke="var(--color-ink)" strokeWidth="2.5" />
      </> : <>
        <path d="M42 64a10 10 0 0 1 10-10h35l11 12h49a10 10 0 0 1 10 10v56a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10Z" fill="var(--color-signal-tint)" stroke="var(--color-ink)" strokeWidth="3" />
        <rect x="66" y="34" width="62" height="90" rx="2" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="3" />
        <path d="M80 53h34M80 65h25M80 77h34" stroke="var(--color-signal-line)" strokeWidth="4" strokeLinecap="round" />
        <path d="M42 85h115v47a10 10 0 0 1-10 10H52a10 10 0 0 1-10-10Z" fill="var(--color-paper-3)" stroke="var(--color-ink)" strokeWidth="3" />
        <circle cx="140" cy="127" r="25" fill="var(--color-signal)" stroke="var(--color-paper-2)" strokeWidth="5" />
        <path d="m129 126 8 8 14-16" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </>}
    </svg>
  );
}
