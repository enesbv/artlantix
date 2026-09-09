'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getOrders,
  updateOrderStatus,
  addOrderMessage,
  addOperatorDeliverable,
} from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Order, OrderStatus, UserProfile } from '@/lib/types';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  PenTool,
  Layers,
  FileText,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Operator Action Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('in_progress');
  const [adjustedPrice, setAdjustedPrice] = useState<number>(0);
  const [operatorMessage, setOperatorMessage] = useState('');
  const [selectedDeliverableFormat, setSelectedDeliverableFormat] = useState<'svg' | 'ai' | 'eps' | 'pdf'>('svg');
  const [deliverableFilename, setDeliverableFilename] = useState('');
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const u = await getCurrentUser();
      setCurrentUser(u);
      // Admin sees ALL orders
      const list = await getOrders(undefined, true, true);
      setOrders(list);
    }
    load();
  }, []);

  const openOperatorModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdjustedPrice(order.final_price || order.estimated_price);
    setDeliverableFilename(`${order.project_name.replace(/\s+/g, '-')}-Master.svg`);
    setDeliverableFile(null);
    setActionError(null);
    setOperatorMessage('');
    setModalOpen(true);
  };

  const handleApplyOperatorUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (isSupabaseConfigured() && ['preview_ready', 'completed'].includes(newStatus) && !deliverableFile) {
      setActionError('Choose the real preview or master file before setting this delivery status.');
      return;
    }
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      // Upload first so a delivery status is never shown without its file.
      if (deliverableFile || (!isSupabaseConfigured() && deliverableFilename.trim())) {
        const category = newStatus === 'completed' ? 'final_master' : 'preview_watermarked';
        await addOperatorDeliverable(
          selectedOrder.id,
          category,
          selectedDeliverableFormat,
          deliverableFilename.trim() || deliverableFile?.name || `deliverable.${selectedDeliverableFormat}`,
          deliverableFile || undefined
        );
      }

      await updateOrderStatus(selectedOrder.id, newStatus, adjustedPrice, undefined, currentUser?.full_name);

      if (operatorMessage.trim()) {
        await addOrderMessage(
          selectedOrder.id,
          currentUser?.id || 'usr_admin_001',
          currentUser?.full_name || 'Elena Vance (Production Lead)',
          'operator',
          operatorMessage.trim()
        );
      }

      // Refresh orders
      const updatedList = await getOrders(undefined, true, true);
      setOrders(updatedList);
      setActionNotice(`Order ${selectedOrder.order_number} successfully updated!`);
      setTimeout(() => setActionNotice(null), 3000);
      setModalOpen(false);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'The operator update could not be saved.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111]">
      <Navbar />

      {/* Internal Operator Header */}
      <div className="border-b border-[#E6E4DF] bg-[#F4F3EF]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111111] text-white">
                <ShieldCheck className="h-4 w-4 text-[#18794E]" />
              </div>
              <div>
                <h1 className="text-base font-bold text-[#111111]">
                  Internal Studio Production Queue (QA Panel)
                </h1>
                <p className="text-[11px] text-[#666666]">
                  Operator console to assign artists, update redraw statuses, adjust quote prices, and deliver master files.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#737373]">Active Operator:</span>
              <span className="rounded-md border border-[#EAE8E3] bg-white px-2.5 py-1 font-mono text-xs font-bold text-[#141414]">
                Elena Vance (Senior Vector Lead)
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="flex space-x-6 border-t border-[#EAE8E3]/60 pt-1 pb-1 font-mono text-xs mt-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 border-b-2 border-[#18794E] py-2 font-bold text-[#18794E] transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Production Queue</span>
            </Link>

            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1.5 border-b-2 border-transparent py-2 font-medium text-[#737373] hover:border-[#CCCCCC] hover:text-[#141414] transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Visual Content CMS</span>
            </Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {actionNotice && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
            ✓ {actionNotice}
          </div>
        )}

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-[#E6E4DF] bg-white p-4 shadow-xs">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Jobs' },
              { id: 'quote_requested', label: 'Pending Review' },
              { id: 'in_progress', label: 'Redrawing' },
              { id: 'preview_ready', label: 'Preview Ready' },
              { id: 'revision_requested', label: 'Revisions' },
              { id: 'completed', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#FAFAF8] text-[#666666] hover:text-[#111111]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#888888]" />
            <input
              type="text"
              placeholder="Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded border border-[#E6E4DF] bg-[#FAFAF8] py-1.5 pl-8 pr-3 text-xs text-[#111111] focus:border-[#111111] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Production Queue Table */}
        <div className="rounded-xl border border-[#E6E4DF] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E6E4DF] bg-[#FAFAF8] text-[11px] font-bold uppercase tracking-wider text-[#666666]">
                <tr>
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Project Title</th>
                  <th className="px-6 py-3">Type &amp; Complexity</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Turnaround</th>
                  <th className="px-6 py-3 text-right">Production Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E4DF]/60">
                {filtered.map((order) => {
                  const statusBadge = {
                    quote_requested: { label: 'Quote Requested', bg: 'bg-amber-50 text-amber-800 border-amber-200 font-bold' },
                    in_review: { label: 'In Review', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                    in_progress: { label: 'In Progress', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                    preview_ready: { label: 'Preview Ready', bg: 'bg-[#E9F9EE] text-[#18794E] border-[#B4DFC4] font-bold' },
                    approved: { label: 'Approved · Packaging', bg: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' },
                    revision_requested: { label: 'Revision Requested', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200 font-bold' },
                    completed: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    cancelled: { label: 'Cancelled', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                  }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#111111]">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#111111]">{order.customer_name || 'Alex Morgan'}</div>
                        <div className="text-[10px] text-[#777777]">{order.customer_email || 'client@atelier.com'}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#111111]">
                        {order.project_name}
                      </td>
                      <td className="px-6 py-4 capitalize text-[#555555]">
                        {order.artwork_type.replace('_', ' ')} · {order.complexity}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#111111]">
                        ${order.final_price || order.estimated_price}
                        {order.needs_manual_review && (
                          <span className="ml-1 text-[10px] text-amber-700 font-normal">
                            (Review needed)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#555555]">
                        {order.turnaround === 'express' ? (
                          <span className="font-bold text-[#18794E]">Express (&lt;16h)</span>
                        ) : (
                          'Standard'
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="rounded border border-[#E6E4DF] bg-white p-1.5 text-[#666666] hover:text-[#111111]"
                            title="View Client View"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => openOperatorModal(order)}
                            className="inline-flex items-center gap-1 rounded bg-[#111111] px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-colors"
                          >
                            <PenTool className="h-3 w-3 text-[#18794E]" />
                            <span>Operator Action</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* OPERATOR MODAL */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#E6E4DF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#18794E]" />
                  <h3 className="text-sm font-bold text-[#111111]">
                    Operator Action: {selectedOrder.order_number}
                  </h3>
                </div>
                <p className="text-[11px] text-[#666666]">
                  {selectedOrder.project_name} · Client: {selectedOrder.customer_name || 'Alex Morgan'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-[#888888] hover:text-[#111111]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOperatorUpdates} className="mt-4 space-y-4 text-xs">
              {/* Status transition dropdown */}
              <div>
                <label className="block font-bold text-[#111111]">Update Order Lifecycle Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="mt-1 w-full rounded border border-[#E6E4DF] bg-white p-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
                >
                  <option value="in_review">In Review (Verifying artwork feasibility)</option>
                  <option value="in_progress">In Progress (Designer actively redrawing paths)</option>
                  <option value="preview_ready">Preview Ready (Watermarked draft uploaded to portal)</option>
                  <option value="approved">Approved (Preparing master package)</option>
                  <option value="revision_requested">Revision Requested (Client adjusting feedback)</option>
                  <option value="completed">Completed (Unlock full master vectors)</option>
                </select>
              </div>

              {/* Price adjustment */}
              <div>
                <label className="block font-bold text-[#111111]">
                  Final Price Adjustment ($)
                </label>
                <input
                  type="number"
                  value={adjustedPrice}
                  onChange={(e) => setAdjustedPrice(Number(e.target.value))}
                  className="mt-1 w-full rounded border border-[#E6E4DF] bg-white p-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
                />
                <span className="text-[10px] text-[#888888]">
                  Estimated original: ${selectedOrder.estimated_price}
                </span>
              </div>

              {/* Deliverable file */}
              <div className="border-t border-[#E6E4DF] pt-3">
                <label className="block font-bold text-[#111111]">
                  Attach Vector Deliverable / Preview File
                </label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={selectedDeliverableFormat}
                    onChange={(e) => setSelectedDeliverableFormat(e.target.value as 'svg' | 'ai' | 'eps' | 'pdf')}
                    className="w-24 rounded border border-[#E6E4DF] bg-white p-2 text-xs uppercase"
                  >
                    <option value="svg">.SVG</option>
                    <option value="ai">.AI</option>
                    <option value="eps">.EPS</option>
                    <option value="pdf">.PDF</option>
                  </select>
                  <input
                    type="text"
                    value={deliverableFilename}
                    onChange={(e) => setDeliverableFilename(e.target.value)}
                    placeholder="filename.svg"
                    className="flex-1 rounded border border-[#E6E4DF] bg-white p-2 text-xs text-[#111111]"
                  />
                </div>
                <input
                  type="file"
                  accept=".svg,.ai,.eps,.pdf,.png"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] || null;
                    setDeliverableFile(nextFile);
                    if (nextFile) {
                      setDeliverableFilename(nextFile.name);
                      const extension = nextFile.name.split('.').pop()?.toLowerCase();
                      if (extension && ['svg', 'ai', 'eps', 'pdf'].includes(extension)) {
                        setSelectedDeliverableFormat(extension as 'svg' | 'ai' | 'eps' | 'pdf');
                      }
                    }
                  }}
                  className="mt-2 block w-full text-[11px] text-[#666] file:mr-3 file:rounded file:border-0 file:bg-[#141414] file:px-3 file:py-2 file:text-[11px] file:font-bold file:text-white"
                />
                <p className="mt-1 text-[10px] text-[#888]">
                  {isSupabaseConfigured() ? 'A real file is required for preview-ready and completed statuses.' : 'Demo mode can create a placeholder from the filename.'}
                </p>
              </div>

              {actionError && <p role="alert" className="rounded bg-red-50 p-3 text-[11px] font-medium text-red-700">{actionError}</p>}

              {/* Message to Customer */}
              <div className="border-t border-[#E6E4DF] pt-3">
                <label className="block font-bold text-[#111111]">
                  Post Status Update / Question to Customer
                </label>
                <textarea
                  rows={3}
                  value={operatorMessage}
                  onChange={(e) => setOperatorMessage(e.target.value)}
                  placeholder="e.g., Preview draft v1 uploaded! We cleaned up the distorted AI lettering and matched authentic Futura Bold. Please review above."
                  className="mt-1 w-full rounded border border-[#E6E4DF] bg-white p-2 text-xs text-[#111111] focus:border-[#111111] focus:outline-hidden"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E4DF]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-[#E6E4DF] bg-white px-4 py-2 text-xs font-semibold text-[#666666] hover:bg-[#F4F3EF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="inline-flex items-center gap-1.5 rounded bg-[#18794E] px-5 py-2 text-xs font-bold text-white hover:bg-[#18794E] disabled:opacity-50"
                >
                  <span>{isSubmittingAction ? 'Saving...' : 'Apply Updates & Notify Client'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
