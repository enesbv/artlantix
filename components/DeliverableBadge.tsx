import React from 'react';
import { Download } from 'lucide-react';

export type DeliverableFormat = 'ai' | 'eps' | 'svg' | 'pdf' | 'png' | 'AI' | 'EPS' | 'SVG' | 'PDF' | 'PNG';

interface FormatConfig {
  label: string;
  ext: string;
  desc: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

export const FORMAT_META: Record<string, FormatConfig> = {
  ai: {
    label: 'AI',
    ext: '.ai',
    desc: 'Layered Adobe Illustrator CC',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  },
  eps: {
    label: 'EPS',
    ext: '.eps',
    desc: 'Unflattened CMYK Vector EPS',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  },
  svg: {
    label: 'SVG',
    ext: '.svg',
    desc: 'Clean W3C Scalable Web/UI',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  },
  pdf: {
    label: 'PDF',
    ext: '.pdf',
    desc: 'Press-Ready PDF/X-1a Standard',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  },
  png: {
    label: 'PNG',
    ext: '.png',
    desc: '4000px Transparent Raster (300 DPI)',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  },
};

export interface DeliverableBadgeProps {
  format: DeliverableFormat;
  variant?: 'pill' | 'badge' | 'card' | 'download-button';
  sizeBytes?: number;
  filename?: string;
  onDownload?: () => void;
  className?: string;
}

export default function DeliverableBadge({
  format,
  variant = 'pill',
  sizeBytes,
  filename,
  onDownload,
  className = '',
}: DeliverableBadgeProps) {
  const key = format.toLowerCase();
  const meta = FORMAT_META[key] || {
    label: format.toUpperCase(),
    ext: `.${key}`,
    desc: 'Production Deliverable',
    dotColor: 'bg-ink-3',
    bgColor: 'bg-paper-2',
    borderColor: 'border-rule',
    textColor: 'text-ink',
  };

  const formattedSize = sizeBytes
    ? `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
    : 'Ready';

  // 1. Compact Pill for Strips (e.g. Hero, Meta strip, How it works inline)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded border border-rule bg-paper-2 px-2 py-0.5 text-[11px] font-sans font-medium tracking-wide text-ink shadow-xs transition-colors hover:border-rule ${className}`}
        title={`${meta.label} - ${meta.desc}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
        <span className="font-semibold">{meta.label}</span>
      </span>
    );
  }

  // 2. Medium Badge with subtle label
  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-md border border-rule bg-paper-2 px-2.5 py-1 text-xs shadow-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-ink">
          <span className={`h-2 w-2 rounded-full ${meta.dotColor}`} />
          <span>{meta.label}</span>
        </div>
        <span className="h-3 w-px bg-paper-3" />
        <span className="text-[11px] text-ink-3">{meta.desc}</span>
      </div>
    );
  }

  // 3. Card View (e.g. Step 4 showcase)
  if (variant === 'card') {
    return (
      <div
        className={`flex items-center justify-between rounded-lg border border-rule bg-paper-2 p-3.5 shadow-xs transition-all hover:border-ink ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-rule bg-paper font-sans text-xs font-bold text-ink">
            {meta.label}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold text-ink">{meta.ext}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
            </div>
            <p className="text-[11px] text-ink-3 leading-tight mt-0.5">{meta.desc}</p>
          </div>
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex h-8 w-8 items-center justify-center rounded border border-rule bg-paper-2 text-ink hover:bg-paper transition-colors"
            title={`Download ${meta.label}`}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // 4. Download Button (Dashboard & Order Detail Deliverable)
  return (
    <div
      className={`group flex flex-col justify-between rounded-xl border border-rule bg-paper-2 p-4 shadow-xs transition-all hover:border-ink hover:shadow-sm ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded border border-rule bg-paper px-2 py-0.5 font-sans text-xs font-bold text-ink">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
            <span>{meta.label}</span>
          </span>
          <span className="font-sans text-[11px] text-ink-3">{formattedSize}</span>
        </div>

        <div className="mt-3 font-semibold text-xs text-ink truncate" title={filename || meta.ext}>
          {filename || `${meta.label}_Master_Export${meta.ext}`}
        </div>
        <p className="mt-1 text-[11px] text-ink-3 leading-relaxed">
          {meta.desc}
        </p>
      </div>

      <button
        onClick={onDownload}
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded border border-ink bg-paper-2 py-2 text-xs font-bold text-ink transition-all hover:bg-ink hover:text-white"
      >
        <Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
        <span>Download {meta.label}</span>
      </button>
    </div>
  );
}
