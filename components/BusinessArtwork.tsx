export default function BusinessArtwork({ kind = 0 }: { kind?: number }) {
  return (
    <svg viewBox="0 0 400 240" fill="none" aria-hidden="true" className="h-full w-full">
      {kind === 0 ? <>
        <path d="M25 195h350M55 195V82l145-44 145 44v113" stroke="#B4C6BB" strokeWidth="2" />
        <path d="M80 98h240v69H80z" fill="#173F2D" />
        <path d="m107 146 15-33 15 33m-24-9h19M149 146v-33h15c17 0 17 18 0 18h-15m15 0 13 15M188 113h30m-15 0v33M229 113v33h23M263 146l15-33 15 33m-24-9h19" stroke="#E9F9EE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M80 91v-9m240 9v-9M70 98h-9m9 69h-9M80 177v9m240-9v9m10-88h9m-9 69h9" stroke="#18794E" strokeWidth="2" />
        <path d="M90 195v-16h53v16m113 0v-16h53v16" stroke="#B4C6BB" strokeWidth="2" />
      </> : kind === 1 ? <>
        <rect x="75" y="59" width="218" height="130" rx="6" fill="#C7D8CE" transform="rotate(-8 75 59)" />
        <rect x="91" y="67" width="218" height="130" rx="6" fill="#E1E9E3" transform="rotate(-3 91 67)" />
        <rect x="105" y="73" width="218" height="130" rx="6" fill="#FCFCF8" stroke="#C7D8CE" />
        <path d="m132 122 16-28 16 28Zm7-7h18" stroke="#18794E" strokeWidth="3" strokeLinejoin="round" />
        <path d="M132 153h68m-68 10h43M250 105h47m-47 10h34M250 175h47" stroke="#A0B3A7" strokeWidth="3" />
        <path d="M96 64h-9v-9m245 9h9v-9M96 212h-9v9m245-9h9v9" stroke="#18794E" strokeWidth="1.5" />
      </> : kind === 2 ? <>
        <path d="m146 42-58 30 24 49 24-10v95h130v-95l24 10 24-49-58-30c-19 20-91 20-110 0Z" fill="#E1E9E3" stroke="#A0B3A7" strokeWidth="2" />
        <path d="M176 49q24 32 49 0" stroke="#A0B3A7" strokeWidth="2" />
        <path d="m198 87 36 14v27q-2 24-36 43-34-19-36-43v-27Z" fill="#18794E" />
        <path d="m198 101 7 15 16 2-12 11 3 17-14-8-14 8 3-17-12-11 16-2Z" fill="#E9F9EE" />
        <circle cx="307" cy="178" r="10" fill="#18794E" /><circle cx="331" cy="178" r="10" fill="#D5AB72" /><circle cx="355" cy="178" r="10" fill="#233B30" />
      </> : <>
        <rect x="57" y="40" width="180" height="160" rx="6" fill="#FCFCF8" stroke="#C7D8CE" />
        <path d="m105 141 41-72 41 72Zm19-32h45" stroke="#18794E" strokeWidth="4" strokeLinejoin="round" />
        <path d="M90 160h115m-115 10h71" stroke="#CBD8CF" strokeWidth="3" />
        <rect x="215" y="103" width="132" height="99" rx="5" fill="#173F2D" />
        <path d="m250 168 30-42 30 42Zm15-20h29" stroke="#E9F9EE" strokeWidth="3" />
        <rect x="260" y="41" width="23" height="23" rx="4" fill="#18794E" /><rect x="290" y="41" width="23" height="23" rx="4" fill="#B4DFC4" /><rect x="320" y="41" width="23" height="23" rx="4" fill="#D5AB72" />
      </>}
    </svg>
  );
}
