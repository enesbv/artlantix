'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { downloadAllMasterFiles, triggerFileDownload } from '@/lib/services/storage';
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
      const all = await getOrders(user?.id, false, true);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rule pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Archive className="h-5 w-5 text-signal-ink" />
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Artwork Vault &amp; Digital Asset Archive
            </h1>
          </div>
          <p className="text-xs text-ink-3 mt-1">
            Your studio archive. Approved vector masters stay available here for re-download.
          </p>
        </div>

        <Link
          href="/quote"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-signal-ink transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload New Asset</span>
        </Link>
      </div>

      {/* Vault Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-ink bg-paper-2 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-ink-3" />
          <input
            type="text"
            placeholder="Search vault by project name or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-rule-strong bg-paper py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-3 focus:border-ink focus:bg-paper-2 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 font-sans text-xs text-ink-3 px-2">
          <span>Archived Masters:</span>
          <strong className="text-ink">{completedOrders.length} Files</strong>
        </div>
      </div>

      {/* Asset Grid */}
      {filteredAssets.length === 0 ? (
        <div className="border border-ink bg-paper-2 p-12 text-center">
          <Archive className="mx-auto h-10 w-10 text-paper-3" />
          <h3 className="mt-3 text-sm font-bold text-ink">No completed artwork in vault</h3>
          <p className="mt-1 text-xs text-ink-3">
            Once you approve vector drafts in your orders, their master packages will automatically appear here forever.
          </p>
          <Link
            href="/quote"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-black"
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
                className="flex flex-col border border-ink bg-paper-2 overflow-hidden hover:border-ink transition-all"
              >
                {/* Visual Thumbnail */}
                <div className="relative h-48 w-full border-b border-rule bg-paper p-4 flex items-center justify-center">
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => handleCopyOrderNumber(order.order_number)}
                      className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2.5 py-0.5 text-[10px] font-sans font-semibold text-ink-3 border border-rule hover:border-ink transition-colors"
                      title="Copy Order ID"
                    >
                      <span>{order.order_number}</span>
                      {copiedId === order.order_number ? (
                        <Check className="h-2.5 w-2.5 text-ok" />
                      ) : (
                        <Copy className="h-2.5 w-2.5" />
                      )}
                    </button>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="rounded-full bg-ok-tint px-2.5 py-0.5 font-sans text-[10px] font-bold text-ok-ink border border-ok-line">
                      Master Approved
                    </span>
                  </div>

                  {/* Vector visual icon render */}
                  <svg viewBox="0 0 200 200" className="h-32 w-32 drop-shadow-xs">
                    <circle cx="100" cy="100" r="70" fill="var(--color-paper-2)" stroke="var(--color-ink)" strokeWidth="4" />
                    <circle cx="100" cy="100" r="58" fill="none" stroke="var(--color-guide)" strokeWidth="2" strokeDasharray="4 3" />
                    <path d="M 100 45 L 115 80 L 155 80 L 125 105 L 135 145 L 100 120 L 65 145 L 75 105 L 45 80 L 85 80 Z" fill="var(--color-ink)" />
                  </svg>
                </div>

                {/* Metadata details */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-sm font-bold text-ink">{order.project_name}</h3>
                  <div className="mt-1 flex items-center justify-between font-sans text-[11px] text-ink-3">
                    <span>Completed: {new Date(order.updated_at).toLocaleDateString()}</span>
                    <span className="font-semibold text-ink">CMYK / Spot</span>
                  </div>

                  {/* Available Formats Badges */}
                  <div className="mt-4 border-t border-rule pt-3">
                    <div className="font-sans text-[10px] uppercase tracking-wider text-ink-3">
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
                  <div className="mt-6 flex flex-col gap-2 pt-2 border-t border-rule">
                    <button
                      onClick={() => void downloadAllMasterFiles(order)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink py-2 text-xs font-bold text-white hover:bg-black transition-colors"
                    >
                      <Download className="h-3.5 w-3.5 text-signal-ink" />
                      <span>Download All Master Files</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          if (svgFile) triggerFileDownload(svgFile);
                          else void downloadAllMasterFiles(order);
                        }}
                        className="flex items-center justify-center gap-1 border border-rule-strong bg-paper-2 py-1.5 text-xs font-medium text-ink hover:bg-paper"
                      >
                        <Download className="h-3 w-3" />
                        <span>Export SVG</span>
                      </button>

                      <Link
                        href={`/quote?reorder=${order.id}`}
                        className="flex items-center justify-center gap-1 rounded-lg border border-ink bg-signal-tint py-1.5 text-xs font-semibold text-signal-ink hover:bg-signal-line"
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
