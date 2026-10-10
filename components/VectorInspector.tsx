'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { Layers, Palette, Eye, Check, Copy, Maximize2 } from 'lucide-react';

/** Every label the inspector shows, in the reader's language. */
const COPY = {
  en: {
    eyebrow: 'Layer inspector', view: 'View', backdrop: 'Backdrop', palette: 'Colors in this drawing',
    copyHint: 'Click a swatch to copy its HEX', copied: 'Copied',
    full: 'Full color', wireframe: 'Outline / nodes', monochrome: 'Silhouette',
    light: 'Light', dark: 'Dark', grid: 'Grid',
    note: 'These views are drawing aids: they show the paths, the nodes and the colors the studio is working with.',
  },
  de: {
    eyebrow: 'Ebenen-Prüfer', view: 'Ansicht', backdrop: 'Hintergrund', palette: 'Farben dieser Zeichnung',
    copyHint: 'Farbfeld anklicken, um den HEX-Wert zu kopieren', copied: 'Kopiert',
    full: 'Vollfarbe', wireframe: 'Kontur / Knoten', monochrome: 'Silhouette',
    light: 'Hell', dark: 'Dunkel', grid: 'Raster',
    note: 'Diese Ansichten sind Zeichenhilfen: Sie zeigen Pfade, Knoten und die Farben, mit denen das Studio arbeitet.',
  },
  tr: {
    eyebrow: 'Katman denetleyici', view: 'Görünüm', backdrop: 'Arka plan', palette: 'Bu çizimdeki renkler',
    copyHint: 'HEX kodunu kopyalamak için renge tıklayın', copied: 'Kopyalandı',
    full: 'Tam renkli', wireframe: 'Kontur / düğümler', monochrome: 'Siluet',
    light: 'Açık', dark: 'Koyu', grid: 'Izgara',
    note: 'Bu görünümler bir çizim yardımcısıdır: stüdyonun çalıştığı yolları, düğümleri ve renkleri gösterir.',
  },
} as const;

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  coveragePercent?: number;
}

const DEFAULT_SWATCHES: ColorSwatch[] = [
  { name: 'Onyx Rich Black', hex: '#15171C', rgb: 'rgb(21, 23, 28)', cmyk: '75, 68, 67, 90', coveragePercent: 55 },
  { name: 'Signal Orange', hex: '#EB4A1E', rgb: 'rgb(235, 74, 30)', cmyk: '0, 69, 87, 8', coveragePercent: 25 },
  { name: 'Paper White', hex: '#FBF8F1', rgb: 'rgb(251, 248, 241)', cmyk: '0, 1, 4, 2', coveragePercent: 12 },
  { name: 'Sand Warm Neutral', hex: '#DDD7CD', rgb: 'rgb(221, 215, 205)', cmyk: '12, 11, 17, 0', coveragePercent: 8 },
];

interface VectorInspectorProps {
  projectName?: string;
  swatches?: ColorSwatch[];
  activeMode: 'full' | 'wireframe' | 'monochrome';
  activeBackdrop: 'light' | 'dark' | 'grid';
  onModeChange: (mode: 'full' | 'wireframe' | 'monochrome') => void;
  onBackdropChange: (backdrop: 'light' | 'dark' | 'grid') => void;
}

export default function VectorInspector({
  projectName = 'Artwork Vector Draft',
  swatches = DEFAULT_SWATCHES,
  activeMode,
  activeBackdrop,
  onModeChange,
  onBackdropChange,
}: VectorInspectorProps) {
  const locale = useLocale();
  const copy = COPY[locale === 'tr' || locale === 'de' ? locale : 'en'];
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="w-full border border-ink bg-paper-2 p-5 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal-tint text-signal-ink">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{copy.eyebrow}</span>
            <h4 className="text-sm font-bold text-ink">
              {projectName}
            </h4>
          </div>
        </div>

      </div>

      {/* Control Bar: View Modes & Background Backdrops */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Layer Mode Picker */}
        <div>
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-signal-ink" />
            <span>{copy.view}</span>
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 border border-rule-strong bg-paper p-1">
            <button
              type="button"
              onClick={() => onModeChange('full')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'full'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {copy.full}
            </button>
            <button
              type="button"
              onClick={() => onModeChange('wireframe')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'wireframe'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {copy.wireframe}
            </button>
            <button
              type="button"
              onClick={() => onModeChange('monochrome')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'monochrome'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              {copy.monochrome}
            </button>
          </div>
        </div>

        {/* Backdrop Picker */}
        <div>
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-signal-ink" />
            <span>{copy.backdrop}</span>
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 border border-rule-strong bg-paper p-1">
            <button
              type="button"
              onClick={() => onBackdropChange('light')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'light'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full border border-rule bg-paper" />
              <span>{copy.light}</span>
            </button>
            <button
              type="button"
              onClick={() => onBackdropChange('dark')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'dark'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-ink" />
              <span>{copy.dark}</span>
            </button>
            <button
              type="button"
              onClick={() => onBackdropChange('grid')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'grid'
                  ? 'bg-paper-2 text-ink'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full border border-rule"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #cfc8b8 25%, transparent 25%), linear-gradient(-45deg, #cfc8b8 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cfc8b8 75%), linear-gradient(-45deg, transparent 75%, #cfc8b8 75%)',
                  backgroundSize: '4px 4px',
                }}
              />
              <span>{copy.grid}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Color Palette Section */}
      <div className="border-t border-rule/70 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-signal-ink" />
            <span>{copy.palette}</span>
          </span>
          <span className="text-[10px] text-ink-3">{copy.copyHint}</span>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {swatches.map((color) => {
            const isCopied = copiedHex === color.hex;

            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => copyToClipboard(color.hex)}
                className="group relative flex flex-col border border-rule-strong bg-paper p-3 text-left transition-all hover:border-ink hover:bg-paper-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="h-6 w-6 rounded-lg border border-black/10 shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-ink-3 group-hover:text-signal-ink">
                    {isCopied ? (
                      <span className="inline-flex items-center gap-0.5 text-ok font-bold">
                        <Check className="h-3 w-3" />
                        <span>{copy.copied}</span>
                      </span>
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                </div>

                <span className="mt-2 text-xs font-bold text-ink">
                  {color.hex}
                </span>

                <span className="text-[10px] text-ink-3 truncate">
                  {color.name}
                </span>

                <div className="mt-1 flex items-center justify-between text-[9px] text-ink-3 border-t border-rule/60 pt-1">
                  <span>CMYK: {color.cmyk}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* What the views are for; it does not claim the file has passed any check. */}
      <p className="border-t border-rule pt-4 text-[12px] leading-5 text-ink-3">{copy.note}</p>
    </div>
  );
}
