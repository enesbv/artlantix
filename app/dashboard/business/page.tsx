'use client';

import React, { useState } from 'react';
import {
  Building2,
  Zap,
  ShieldCheck,
  UploadCloud,
  ArrowRight,
  Receipt,
} from 'lucide-react';

export default function BusinessHubPage() {
  const [bulkFiles, setBulkFiles] = useState<string[]>([]);
  const [whiteLabelActive, setWhiteLabelActive] = useState(true);
  const [batchSuccess, setBatchSuccess] = useState(false);

  const handleSimulateBulkDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setBulkFiles(names);
    }
  };

  const handleQueueBatch = () => {
    setBatchSuccess(true);
    setTimeout(() => setBatchSuccess(false), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E4DF] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#E25C34]" />
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">
              B2B Commercial Production Hub
            </h1>
          </div>
          <p className="text-xs text-[#666666] mt-0.5">
            Designed for commercial printers, screen printing shops, apparel decorators, and signage fabricators who need high-volume artwork prep.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            ✓ Priority Partner SLA Active
          </span>
        </div>
      </div>

      {/* B2B Operational Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#FAF0EC] text-[#E25C34]">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#111111]">Priority Production Queue</h3>
          <p className="mt-1 text-xs text-[#666666] leading-relaxed">
            Your orders skip public queues and route directly to senior vector leads with guaranteed &lt;16h turnaround.
          </p>
          <div className="mt-3 text-[11px] font-semibold text-[#E25C34]">
            Status: Guaranteed Priority
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#FAF0EC] text-[#E25C34]">
            <Receipt className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#111111]">Consolidated Monthly Invoicing</h3>
          <p className="mt-1 text-xs text-[#666666] leading-relaxed">
            Eliminate per-order credit card receipts. Receive an itemized Net-30 monthly tax invoice with PO numbers.
          </p>
          <div className="mt-3 text-[11px] font-semibold text-emerald-700">
            Terms: Net-30 Active
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#FAF0EC] text-[#E25C34]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-[#111111]">White-Label Delivery Packages</h3>
          <p className="mt-1 text-xs text-[#666666] leading-relaxed">
            All delivered ZIP packages are unbranded or carry your agency tag, ready to send straight to clients or presses.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="whitelabel"
              checked={whiteLabelActive}
              onChange={(e) => setWhiteLabelActive(e.target.checked)}
              className="accent-[#E25C34]"
            />
            <label htmlFor="whitelabel" className="text-xs font-semibold text-[#111111] cursor-pointer">
              White-label mode enabled
            </label>
          </div>
        </div>
      </div>

      {/* Bulk Batch Upload Tool */}
      <div className="rounded-xl border border-[#E6E4DF] bg-white p-8 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E6E4DF] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#111111]">
              Bulk Batch Artwork Upload
            </h2>
            <p className="text-xs text-[#666666]">
              Submit 5 to 50 client raster files at once for overnight shop prep.
            </p>
          </div>
          <span className="text-xs font-bold text-[#E25C34]">B2B Volume Discount: -20%</span>
        </div>

        {batchSuccess && (
          <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            ✓ Bulk batch received! 5 projects logged into the priority production queue. An operator will confirm specs.
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9D6CE] bg-[#FAFAF8] p-8 text-center">
          <UploadCloud className="h-10 w-10 text-[#E25C34]" />
          <div className="mt-3 text-sm font-bold text-[#111111]">
            Drop multi-file ZIP archive or select multiple artwork files
          </div>
          <p className="mt-1 text-xs text-[#777777]">
            Upload customer logos, embroidery patches, or raster sketches together.
          </p>
          <label className="mt-4 inline-flex cursor-pointer items-center gap-1.5 rounded bg-[#111111] px-4 py-2 text-xs font-bold text-white hover:bg-black">
            <span>Select Files from Machine</span>
            <input
              type="file"
              multiple
              accept="image/*,application/pdf,.zip"
              className="hidden"
              onChange={handleSimulateBulkDrop}
            />
          </label>
        </div>

        {bulkFiles.length > 0 && (
          <div className="mt-6 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-4">
            <div className="text-xs font-bold text-[#111111]">Selected Files ({bulkFiles.length}):</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {bulkFiles.map((fn, idx) => (
                <span key={idx} className="rounded bg-white border border-[#E6E4DF] px-2 py-1 text-xs font-mono text-[#555555]">
                  {fn}
                </span>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleQueueBatch}
                className="inline-flex items-center gap-2 rounded bg-[#E25C34] px-5 py-2 text-xs font-bold text-white hover:bg-[#D94A26]"
              >
                <span>Queue Entire Batch for Priority Redraw</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Corporate Billing & VAT Profile */}
      <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
        <h2 className="text-sm font-bold text-[#111111] border-b border-[#E6E4DF] pb-3">
          Corporate Billing &amp; Tax Information
        </h2>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#888888]">Company Legal Name:</span>
            <div className="font-semibold text-[#111111] mt-0.5">Atelier Creative Studio LLC</div>
          </div>
          <div>
            <span className="text-[#888888]">VAT / Tax Registration:</span>
            <div className="font-semibold text-[#111111] mt-0.5">US-829104882</div>
          </div>
          <div>
            <span className="text-[#888888]">Invoice Billing Cycle:</span>
            <div className="font-semibold text-[#111111] mt-0.5">Calendar Month-End (Net-30)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
