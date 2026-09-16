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
    dotColor: 'bg-[#FF9A00]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
  },
  eps: {
    label: 'EPS',
    ext: '.eps',
    desc: 'Unflattened CMYK Vector EPS',
    dotColor: 'bg-[#10B981]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
  },
  svg: {
    label: 'SVG',
    ext: '.svg',
    desc: 'Clean W3C Scalable Web/UI',
    dotColor: 'bg-[#0284C7]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
  },
  pdf: {
    label: 'PDF',
    ext: '.pdf',
    desc: 'Press-Ready PDF/X-1a Standard',
    dotColor: 'bg-[#E11D48]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
  },
  png: {
    label: 'PNG',
    ext: '.png',
    desc: '4000px Transparent Raster (300 DPI)',
    dotColor: 'bg-[#737373]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
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
    dotColor: 'bg-[#737373]',
    bgColor: 'bg-white',
    borderColor: 'border-[#EAE8E3]',
    textColor: 'text-[#141414]',
  };

  const formattedSize = sizeBytes
    ? `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`
    : 'Ready';

  // 1. Compact Pill for Strips (e.g. Hero, Meta strip, How it works inline)
  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded border border-[#EAE8E3] bg-white px-2 py-0.5 text-[11px] font-sans font-medium tracking-wide text-[#141414] shadow-xs transition-colors hover:border-[#CCCCCC] ${className}`}
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
        className={`inline-flex items-center gap-2 rounded-md border border-[#EAE8E3] bg-white px-2.5 py-1 text-xs shadow-xs ${className}`}
      >
        <div className="flex items-center gap-1.5 font-sans text-xs font-bold text-[#141414]">
          <span className={`h-2 w-2 rounded-full ${meta.dotColor}`} />
          <span>{meta.label}</span>
        </div>
        <span className="h-3 w-px bg-[#EAE8E3]" />
        <span className="text-[11px] text-[#737373]">{meta.desc}</span>
      </div>
    );
  }

  // 3. Card View (e.g. Step 4 showcase)
  if (variant === 'card') {
    return (
      <div
        className={`flex items-center justify-between rounded-lg border border-[#EAE8E3] bg-white p-3.5 shadow-xs transition-all hover:border-[#141414] ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded border border-[#EAE8E3] bg-[#F9F8F6] font-sans text-xs font-bold text-[#141414]">
            {meta.label}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-bold text-[#141414]">{meta.ext}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
            </div>
            <p className="text-[11px] text-[#737373] leading-tight mt-0.5">{meta.desc}</p>
          </div>
        </div>
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#EAE8E3] bg-white text-[#141414] hover:bg-[#F5F4F0] transition-colors"
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
      className={`group flex flex-col justify-between rounded-xl border border-[#EAE8E3] bg-white p-4 shadow-xs transition-all hover:border-[#141414] hover:shadow-sm ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded border border-[#EAE8E3] bg-[#F9F8F6] px-2 py-0.5 font-sans text-xs font-bold text-[#141414]">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dotColor}`} />
            <span>{meta.label}</span>
          </span>
          <span className="font-sans text-[11px] text-[#737373]">{formattedSize}</span>
        </div>

        <div className="mt-3 font-semibold text-xs text-[#141414] truncate" title={filename || meta.ext}>
          {filename || `${meta.label}_Master_Export${meta.ext}`}
        </div>
        <p className="mt-1 text-[11px] text-[#737373] leading-relaxed">
          {meta.desc}
        </p>
      </div>

      <button
        onClick={onDownload}
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded border border-[#141414] bg-white py-2 text-xs font-bold text-[#141414] transition-all hover:bg-[#141414] hover:text-white"
      >
        <Download className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
        <span>Download {meta.label}</span>
      </button>
    </div>
  );
}
