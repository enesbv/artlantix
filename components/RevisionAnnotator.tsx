'use client';

import { MouseEvent, useState } from 'react';
import Image from 'next/image';
import { INPUT_LIMITS } from '@/lib/security';
import { RevisionAnnotation } from '@/lib/types';
import { RotateCcw, Trash2 } from 'lucide-react';

export default function RevisionAnnotator({ annotations, onChange, imageUrl }: {
  annotations: RevisionAnnotation[];
  onChange: (annotations: RevisionAnnotation[]) => void;
  imageUrl?: string;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(annotations[0]?.id || null);
  const selected = annotations.find((annotation) => annotation.id === selectedId);
  const hasReachedLimit = annotations.length >= INPUT_LIMITS.revisionMarkers;

  const addMarker = (event: MouseEvent<HTMLButtonElement>) => {
    if (hasReachedLimit) return;
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

  const undoLastMarker = () => {
    const next = annotations.slice(0, -1);
    onChange(next);
    setSelectedId(next.at(-1)?.id || null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">Mark the exact areas to change</p>
          <p id="revision-marker-help" className="mt-0.5 text-xs text-ink-3">
            {annotations.length} of {INPUT_LIMITS.revisionMarkers} markers added
          </p>
        </div>
        {annotations.length > 0 && (
          <button type="button" onClick={undoLastMarker} className="inline-flex items-center gap-1.5 border border-rule-strong bg-paper-2 px-3 py-2 text-xs font-semibold text-ink-2 hover:bg-paper">
            <RotateCcw className="h-3.5 w-3.5" /> Undo last
          </button>
        )}
      </div>
      <div className="relative overflow-hidden border border-rule-strong bg-paper">
        <button type="button" onClick={addMarker} aria-describedby="revision-marker-help" className={`relative block h-64 w-full ${hasReachedLimit ? 'cursor-not-allowed' : 'cursor-crosshair'}`} aria-label={hasReachedLimit ? 'Maximum number of revision markers reached' : 'Click the artwork to add a revision marker'}>
          {imageUrl ? (
            <Image src={imageUrl} alt="Artwork preview to annotate" fill sizes="(max-width: 768px) 100vw, 48rem" unoptimized className="object-contain p-4" />
          ) : <svg viewBox="0 0 400 400" className="mx-auto h-full max-w-full p-6" aria-hidden="true">
            <circle cx="200" cy="200" r="150" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="6" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="var(--color-guide)" strokeWidth="2.5" strokeDasharray="6 4" />
            <path d="M200 80 235 150 310 150 250 195 270 270 200 225 130 270 150 195 90 150 165 150Z" fill="var(--color-ink)" />
            <circle cx="200" cy="200" r="22" fill="var(--color-signal)" />
          </svg>}
          {annotations.map((annotation, index) => (
            <span key={annotation.id} className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md ${annotation.id === selectedId ? 'bg-ink' : 'bg-ink'}`} style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}>{index + 1}</span>
          ))}
        </button>
        <p className="border-t border-rule bg-paper-2 px-3 py-2 text-xs text-ink-3">{hasReachedLimit ? 'Marker limit reached. Remove or undo a marker to add another.' : 'Click the exact area that needs a change. You can add more than one marker.'}</p>
      </div>

      {selected && (
        <div className="rounded-xl border border-signal-line bg-signal-tint p-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="marker-note" className="text-sm font-bold">Marker {annotations.findIndex((item) => item.id === selected.id) + 1} note</label>
            <button type="button" onClick={removeSelected} className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
          </div>
          <input id="marker-note" autoFocus maxLength={INPUT_LIMITS.revisionMessage} value={selected.message} onChange={(event) => updateSelected(event.target.value)} placeholder="What should change at this point?" className="mt-2 w-full border border-rule-strong bg-paper-2 px-3 py-2.5 text-sm focus:border-ink focus:outline-hidden" />
        </div>
      )}

      {annotations.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {annotations.map((annotation, index) => <button key={annotation.id} type="button" onClick={() => setSelectedId(annotation.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${annotation.id === selectedId ? 'bg-ink text-white' : 'bg-paper text-ink-2'}`}>Marker {index + 1}</button>)}
        </div>
      )}
    </div>
  );
}
