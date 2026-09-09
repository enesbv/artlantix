'use client';

import { MouseEvent, useState } from 'react';
import Image from 'next/image';
import { RevisionAnnotation } from '@/lib/types';
import { Trash2 } from 'lucide-react';

export default function RevisionAnnotator({ annotations, onChange, imageUrl }: {
  annotations: RevisionAnnotation[];
  onChange: (annotations: RevisionAnnotation[]) => void;
  imageUrl?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(annotations[0]?.id || null);
  const selected = annotations.find((annotation) => annotation.id === selectedId);

  const addMarker = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const annotation: RevisionAnnotation = {
      id: crypto.randomUUID(),
      x: Math.round(((event.clientX - rect.left) / rect.width) * 1000) / 10,
      y: Math.round(((event.clientY - rect.top) / rect.height) * 1000) / 10,
      message: '',
      created_at: new Date().toISOString(),
    };
    onChange([...annotations, annotation]);
    setSelectedId(annotation.id);
  };

  const updateSelected = (message: string) => {
    onChange(annotations.map((annotation) => annotation.id === selectedId ? { ...annotation, message } : annotation));
  };

  const removeSelected = () => {
    const next = annotations.filter((annotation) => annotation.id !== selectedId);
    onChange(next);
    setSelectedId(next[0]?.id || null);
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-[#EAE8E3] bg-[#F9F8F6]">
        <button type="button" onClick={addMarker} className="relative block h-64 w-full cursor-crosshair" aria-label="Click the artwork to add a revision marker">
          {imageUrl ? (
            <Image src={imageUrl} alt="Artwork preview to annotate" fill sizes="(max-width: 768px) 100vw, 48rem" unoptimized className="object-contain p-4" />
          ) : <svg viewBox="0 0 400 400" className="mx-auto h-full max-w-full p-6" aria-hidden="true">
            <circle cx="200" cy="200" r="150" fill="#FFF" stroke="#141414" strokeWidth="6" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="#18794E" strokeWidth="2.5" strokeDasharray="6 4" />
            <path d="M200 80 235 150 310 150 250 195 270 270 200 225 130 270 150 195 90 150 165 150Z" fill="#141414" />
            <circle cx="200" cy="200" r="22" fill="#18794E" />
          </svg>}
          {annotations.map((annotation, index) => (
            <span key={annotation.id} className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md ${annotation.id === selectedId ? 'bg-[#141414]' : 'bg-[#18794E]'}`} style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}>{index + 1}</span>
          ))}
        </button>
        <p className="border-t border-[#EAE8E3] bg-white px-3 py-2 text-[11px] text-[#737373]">Click the exact area that needs a change. You can add more than one marker.</p>
      </div>

      {selected && (
        <div className="rounded-xl border border-[#B4DFC4] bg-[#E9F9EE] p-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="marker-note" className="text-xs font-bold">Marker {annotations.findIndex((item) => item.id === selected.id) + 1} note</label>
            <button type="button" onClick={removeSelected} className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700"><Trash2 className="h-3 w-3" /> Remove</button>
          </div>
          <input id="marker-note" autoFocus value={selected.message} onChange={(event) => updateSelected(event.target.value)} placeholder="What should change at this point?" className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-white px-3 py-2 text-xs focus:border-[#141414] focus:outline-hidden" />
        </div>
      )}

      {annotations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {annotations.map((annotation, index) => <button key={annotation.id} type="button" onClick={() => setSelectedId(annotation.id)} className={`rounded-full px-3 py-1 text-[11px] ${annotation.id === selectedId ? 'bg-[#141414] text-white' : 'bg-[#F5F4F0] text-[#555]'}`}>Marker {index + 1}</button>)}
        </div>
      )}
    </div>
  );
}
