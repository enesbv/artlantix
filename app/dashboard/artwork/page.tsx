'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { triggerFileDownload, triggerMasterBundleZip } from '@/lib/services/storage';
import { Order } from '@/lib/types';
import DeliverableBadge from '@/components/DeliverableBadge';
import {
  Archive,
  Download,
  Search,
  Plus,
  Copy,
  Check,
} from 'lucide-react';

export default function ArtworkVaultPage() {
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      const all = await getOrders(user?.id);
      const masters = all.filter((o) => o.status === 'completed' || o.files?.some((f) => f.file_category === 'final_master'));
      setCompletedOrders(masters);
    }
    load();
  }, []);

  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredAssets = completedOrders.filter((order) => {
    const matchesSearch =
      order.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Archive className="h-5 w-5 text-[#E05328]" />
            <h1 className="text-xl font-bold tracking-tight text-[#141414]">
              Artwork Vault &amp; Digital Asset Archive
            </h1>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            Permanent studio archive. Approved vector master deliverables stored forever with instant re-download.
          </p>
        </div>

        <Link
          href="/quote"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E05328] px-4 py-2 text-xs font-bold text-white hover:bg-[#C8461D] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload New Asset</span>
        </Link>
      </div>

      {/* Vault Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#EAE8E3] bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#737373]" />
          <input
            type="text"
            placeholder="Search vault by project name or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] py-2 pl-9 pr-3 text-xs text-[#141414] placeholder-[#737373] focus:border-[#141414] focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#737373] px-2">
          <span>Archived Masters:</span>
          <strong className="text-[#141414]">{completedOrders.length} Files</strong>
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="rounded-2xl border border-[#EAE8E3] bg-white p-12 text-center">
          <Archive className="mx-auto h-10 w-10 text-[#CCCCCC]" />
          <h3 className="mt-3 text-sm font-bold text-[#141414]">No completed artwork in vault</h3>
          <p className="mt-1 text-xs text-[#737373]">
            Once you approve vector drafts in your orders, their master packages will automatically appear here forever.
          </p>
          <Link
            href="/quote"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#141414] px-4 py-2 text-xs font-bold text-white hover:bg-black"
          >
            Start Your First Vector Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((order) => {
            const masterFiles = order.files?.filter((f) => f.file_category === 'final_master') || [];
            const svgFile = masterFiles.find((f) => f.format === 'svg');

            return (
              <div
                key={order.id}
                className="flex flex-col rounded-2xl border border-[#EAE8E3] bg-white overflow-hidden shadow-xs hover:border-[#141414] transition-all"
              >
                {/* Visual Thumbnail */}
                <div className="relative h-48 w-full border-b border-[#EAE8E3] bg-[#F9F8F6] p-4 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => handleCopyOrderNumber(order.order_number)}
                      className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#737373] border border-[#EAE8E3] hover:border-[#141414] transition-colors"
                      title="Copy Order ID"
                    >
                      <span>{order.order_number}</span>
                      {copiedId === order.order_number ? (
                        <Check className="h-2.5 w-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-2.5 w-2.5" />
                      )}
                    </button>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      Master Approved
                    </span>
                  </div>

                  {/* Vector visual icon render */}
                  <svg viewBox="0 0 200 200" className="h-32 w-32 drop-shadow-xs">
                    <circle cx="100" cy="100" r="70" fill="#FFFFFF" stroke="#141414" strokeWidth="4" />
                    <circle cx="100" cy="100" r="58" fill="none" stroke="#E05328" strokeWidth="2" strokeDasharray="4 3" />
                    <path d="M 100 45 L 115 80 L 155 80 L 125 105 L 135 145 L 100 120 L 65 145 L 75 105 L 45 80 L 85 80 Z" fill="#141414" />
                  </svg>
                </div>

                {/* Metadata details */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-sm font-bold text-[#141414]">{order.project_name}</h3>
                  <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-[#737373]">
                    <span>Completed: {new Date(order.updated_at).toLocaleDateString()}</span>
                    <span className="font-semibold text-[#141414]">CMYK / Spot</span>
                  </div>

                  {/* Available Formats Badges */}
                  <div className="mt-4 border-t border-[#EAE8E3] pt-3">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">
                      Master Formats Available:
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <DeliverableBadge format="ai" variant="pill" />
                      <DeliverableBadge format="eps" variant="pill" />
                      <DeliverableBadge format="svg" variant="pill" />
                      <DeliverableBadge format="pdf" variant="pill" />
                      <DeliverableBadge format="png" variant="pill" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-[#EAE8E3]">
                    <button
                      onClick={() => triggerMasterBundleZip(order)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#141414] py-2 text-xs font-bold text-white hover:bg-black transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-[#E05328]" />
                      <span>Download Master Bundle (.ZIP)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (svgFile) triggerFileDownload(svgFile);
                          else triggerMasterBundleZip(order);
                        }}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[#EAE8E3] bg-white py-1.5 text-xs font-medium text-[#141414] hover:bg-[#F5F4F0]"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export SVG</span>
                      </button>

                      <Link
                        href={`/quote?reorder=${order.id}`}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[#E05328] bg-[#FDF3F0] py-1.5 text-xs font-semibold text-[#E05328] hover:bg-[#F6CEBF]"
                      >
                        <span>Order Variation</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
