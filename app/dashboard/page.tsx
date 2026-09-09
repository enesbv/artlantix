'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { Order } from '@/lib/types';
import { calculateExpectedDelivery } from '@/lib/order-status';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Archive,
  Plus,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function load() {
      const u = await getCurrentUser();
      const data = await getOrders(u?.id);
      setOrders(data);
    }
    load();
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const previewReadyOrders = orders.filter((o) => o.status === 'preview_ready');
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const onTimeCount = completedOrders.filter((order) => {
    const expected = order.expected_delivery_at || calculateExpectedDelivery(order.created_at, order.turnaround);
    return new Date(order.updated_at).getTime() <= new Date(expected).getTime();
  }).length;
  const onTimeRate = completedOrders.length > 0
    ? `${Math.round((onTimeCount / completedOrders.length) * 100)}%`
    : '—';

  return (
    <div className="space-y-8">
      {/* Alert Banner for pending approval */}
      {previewReadyOrders.length > 0 && (
        <div className="rounded-xl border-2 border-[#18794E] bg-[#F2FCF5] p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#18794E] p-1.5 text-white mt-0.5">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">
                  Action Required: {previewReadyOrders.length} Artwork Preview Ready for Your Review
                </h3>
                <p className="text-xs text-[#555555] mt-0.5">
                  Order <strong className="text-[#111111]">{previewReadyOrders[0].order_number} ({previewReadyOrders[0].project_name})</strong> has a watermarked vector draft waiting. Inspect paths, request revisions, or approve to unlock master files.
                </p>
              </div>
            </div>

            <Link
              href={`/dashboard/orders/${previewReadyOrders[0].id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#18794E] transition-colors whitespace-nowrap"
            >
              <span>Review Artwork Draft</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Active Production</span>
            <Clock className="h-4 w-4 text-[#18794E]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111111]">
            {activeOrders.length}
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Currently redrawing &amp; in review
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Awaiting Approval</span>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111111]">
            {previewReadyOrders.length}
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Drafts uploaded for client QA
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Master Vectors Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111111]">
            {completedOrders.length}
          </div>
          <div className="mt-1 text-[11px] text-[#777777]">
            Permanent vector archive access
          </div>
        </div>

        <div className="rounded-xl border border-[#E6E4DF] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#666666]">
            <span>Studio Turnaround SLA</span>
            <ShieldCheck className="h-4 w-4 text-[#111111]" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[#111111]">
            {onTimeRate}
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            On-time delivery rate
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E6E4DF] bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
            Quick Actions:
          </span>
          <Link
            href="/quote"
            className="inline-flex items-center gap-1 rounded bg-[#111111] px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Upload New Artwork</span>
          </Link>
          <Link
            href="/dashboard/artwork"
            className="inline-flex items-center gap-1 rounded border border-[#E6E4DF] bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#111111] hover:bg-[#F4F3EF] transition-colors"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Browse Master Archive</span>
          </Link>
        </div>

        <div className="text-xs text-[#666666]">
          Need help with tolerances? Contact Senior QA via order thread.
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="rounded-xl border border-[#E6E4DF] bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E6E4DF] px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-[#111111]">Recent Studio Projects</h2>
            <p className="text-xs text-[#666666]">Track rebuild status, preview progress, and download deliverables</p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-[#18794E] hover:underline"
          >
            View all orders ({orders.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E6E4DF] bg-[#FAFAF8] text-[11px] font-bold uppercase tracking-wider text-[#666666]">
              <tr>
                <th className="px-6 py-3">Order Number</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Type &amp; Complexity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E4DF]/60">
              {orders.slice(0, 5).map((order) => {
                const statusBadge = {
                  quote_requested: { label: 'Quote Requested', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                  in_review: { label: 'In Review', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                  in_progress: { label: 'In Progress (Redrawing)', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                  preview_ready: { label: 'Preview Ready', bg: 'bg-[#E9F9EE] text-[#18794E] border-[#B4DFC4] font-bold' },
                  approved: { label: 'Approved · Packaging', bg: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' },
                  revision_requested: { label: 'Revision Requested', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
                  completed: { label: 'Completed (Delivered)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
                  cancelled: { label: 'Cancelled', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                return (
                  <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#111111]">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111111]">
                      {order.project_name}
                    </td>
                    <td className="px-6 py-4 text-[#555555]">
                      <span className="capitalize">{order.artwork_type.replace('_', ' ')}</span>
                      <span className="text-[#888888]"> · {order.complexity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] border ${statusBadge.bg}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#111111]">
                      ${order.final_price || order.estimated_price}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#18794E] hover:underline"
                      >
                        <span>Open Details</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
