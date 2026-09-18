'use client';

import React, { useState } from 'react';
import {
  Layers,
  Palette,
  Eye,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';

export interface ColorSwatch {
  name: string;
  hex: string;
  rgb: string;
  cmyk: string;
  coveragePercent?: number;
}

const DEFAULT_SWATCHES: ColorSwatch[] = [
  { name: 'Onyx Rich Black', hex: '#141414', rgb: 'rgb(20, 20, 20)', cmyk: '75, 68, 67, 90', coveragePercent: 55 },
  { name: 'Forest Studio Green', hex: '#18794E', rgb: 'rgb(24, 121, 78)', cmyk: '84, 25, 78, 12', coveragePercent: 25 },
  { name: 'Light Mint Surface', hex: '#E9F9EE', rgb: 'rgb(233, 249, 238)', cmyk: '8, 0, 6, 0', coveragePercent: 12 },
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
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E3]/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F9EE] text-[#18794E]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              Stüdyo Kalite &amp; Katman Denetleyicisi
            </span>
            <h4 className="text-sm font-bold text-[#141414]">
              {projectName}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>0.01mm Tolerans Doğrulandı</span>
          </span>
        </div>
      </div>

      {/* Control Bar: View Modes & Background Backdrops */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Layer Mode Picker */}
        <div>
          <span className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-[#18794E]" />
            <span>Görünüm &amp; Üretim Modu</span>
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] p-1">
            <button
              type="button"
              onClick={() => onModeChange('full')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'full'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              Tam Renkli
            </button>
            <button
              type="button"
              onClick={() => onModeChange('wireframe')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'wireframe'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              Kontur / Nodes
            </button>
            <button
              type="button"
              onClick={() => onModeChange('monochrome')}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeMode === 'monochrome'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              Silüet / Folyo
            </button>
          </div>
        </div>

        {/* Backdrop Picker */}
        <div>
          <span className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5 text-[#18794E]" />
            <span>Arka Plan Zemini</span>
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] p-1">
            <button
              type="button"
              onClick={() => onBackdropChange('light')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'light'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full border border-[#CCC] bg-[#F9F8F6]" />
              <span>Açık</span>
            </button>
            <button
              type="button"
              onClick={() => onBackdropChange('dark')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'dark'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#141414]" />
              <span>Koyu</span>
            </button>
            <button
              type="button"
              onClick={() => onBackdropChange('grid')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition-all ${
                activeBackdrop === 'grid'
                  ? 'bg-white text-[#141414] shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full border border-[#CCC]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)',
                  backgroundSize: '4px 4px',
                }}
              />
              <span>Şeffaf Izgara</span>
            </button>
          </div>
        </div>
      </div>

      {/* Extracted Color Palette Section */}
      <div className="border-t border-[#EAE8E3]/70 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5 text-[#18794E]" />
            <span>Çizimde Kullanılan Renk Paleti</span>
          </span>
          <span className="text-[10px] text-[#737373]">
            Tıkla ve HEX kopyala
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {swatches.map((color) => {
            const isCopied = copiedHex === color.hex;

            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => copyToClipboard(color.hex)}
                className="group relative flex flex-col rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] p-3 text-left transition-all hover:border-[#18794E] hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="h-6 w-6 rounded-lg border border-black/10 shadow-2xs"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-[10px] text-[#737373] group-hover:text-[#18794E]">
                    {isCopied ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold">
                        <Check className="h-3 w-3" />
                        <span>Kopyalandı</span>
                      </span>
                    ) : (
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </span>
                </div>

                <span className="mt-2 text-xs font-bold text-[#141414]">
                  {color.hex}
                </span>

                <span className="text-[10px] text-[#737373] truncate">
                  {color.name}
                </span>

                <div className="mt-1 flex items-center justify-between text-[9px] text-[#737373] border-t border-[#EAE8E3]/60 pt-1">
                  <span>CMYK: {color.cmyk}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Production Verification Checklist */}
      <div className="rounded-xl border border-emerald-200 bg-[#E9F9EE] p-3.5 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#18794E] shrink-0" />
          <span className="text-[11px] leading-relaxed">
            <strong>Baskı &amp; Kesim Doğrulaması:</strong> Tüm bezier yolları kapatılmış, gereksiz çakışan düğüm noktaları temizlenmiş ve serigrafi/lazer kesim için katmanlandırılmıştır.
          </span>
        </div>
      </div>
    </div>
  );
}
