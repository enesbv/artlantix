'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  getOrderById,
  approveOrder,
  requestRevision,
  addOrderMessage,
} from '@/lib/services/orders';
import { triggerFileDownload, triggerMasterBundleZip } from '@/lib/services/storage';
import { getCurrentUser } from '@/lib/services/auth';
import { Order, UserProfile } from '@/lib/types';
import DeliverableBadge, { DeliverableFormat } from '@/components/DeliverableBadge';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Send,
  MessageSquare,
  Layers,
  RotateCcw,
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Revision Modal State
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

  // New Message State
  const [chatMessage, setChatMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Action status message
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (orderId) {
        const found = await getOrderById(orderId);
        setOrder(found);
      }
      setLoading(false);
    }
    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="font-mono text-xs text-[#737373]">Loading order data...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-[#EAE8E3] bg-white p-12 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
        <h2 className="mt-3 text-base font-bold text-[#141414]">Order Not Found</h2>
        <p className="mt-1 text-xs text-[#737373]">The requested order ID does not exist or has been removed.</p>
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#141414] px-4 py-2 text-xs font-bold text-white hover:bg-black"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Handle Approve Artwork
  const handleApprove = async () => {
    if (!order) return;
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E05328', '#141414', '#10B981'],
      });

      const updated = await approveOrder(order.id, currentUser?.full_name || 'Alex Morgan');
      if (updated) {
        setOrder(updated);
        setActionSuccess('Artwork approved! Master vector deliverables unlocked below.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Request Revision
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFeedback.trim() || !order) return;
    setIsSubmittingRevision(true);
    try {
      const updated = await requestRevision(
        order.id,
        revisionFeedback,
        currentUser?.full_name || 'Alex Morgan'
      );
      if (updated) {
        setOrder(updated);
        setRevisionModalOpen(false);
        setRevisionFeedback('');
        setActionSuccess('Revision request sent to the production artist.');
      }
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Handle Sending a Message in the thread
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !order) return;
    setIsSendingMessage(true);
    try {
      const senderType = currentUser?.is_admin ? 'operator' : 'customer';
      const senderName = currentUser?.full_name || (senderType === 'operator' ? 'Elena Vance' : 'Alex Morgan');
      await addOrderMessage(
        order.id,
        currentUser?.id || 'usr_guest',
        senderName,
        senderType,
        chatMessage
      );
      const reloaded = await getOrderById(order.id);
      if (reloaded) setOrder(reloaded);
      setChatMessage('');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const customerUpload = order.files?.find((f) => f.file_category === 'customer_upload');
  const masterFiles = order.files?.filter((f) => f.file_category === 'final_master') || [];

  const statusConfig = {
    quote_requested: { label: 'Quote Requested', color: 'text-amber-800 bg-amber-50 border-amber-200' },
    in_review: { label: 'Feasibility Review', color: 'text-blue-800 bg-blue-50 border-blue-200' },
    in_progress: { label: 'Artist Actively Redrawing', color: 'text-purple-800 bg-purple-50 border-purple-200' },
    preview_ready: { label: 'Watermarked Preview Ready for Review', color: 'text-[#E05328] bg-[#FDF3F0] border-[#F6CEBF] font-bold' },
    revision_requested: { label: 'Revision In Progress (Round 1 of 2)', color: 'text-yellow-800 bg-yellow-50 border-yellow-200' },
    completed: { label: 'Approved & Master Vectors Unlocked', color: 'text-emerald-800 bg-emerald-50 border-emerald-200 font-bold' },
    cancelled: { label: 'Cancelled', color: 'text-gray-700 bg-gray-100 border-gray-200' },
  }[order.status] || { label: order.status, color: 'text-gray-700 bg-gray-100 border-gray-200' };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAE8E3] bg-white text-[#737373] hover:bg-[#F5F4F0] hover:text-[#141414] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#141414]">
                {order.project_name}
              </h1>
              <span className="font-mono text-xs font-semibold text-[#737373]">
                ({order.order_number})
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs text-[#737373] mt-0.5">
              <span>Submitted {new Date(order.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{order.artwork_type.replace('_', ' ')}</span>
              <span>•</span>
              <span className="capitalize">{order.complexity} Complexity</span>
              <span>•</span>
              <span>Price: <strong className="text-[#141414]">${order.final_price || order.estimated_price}</strong></span>
            </div>
          </div>
        </div>

        {/* Current status tag */}
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs border ${statusConfig.color}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
            <span>{statusConfig.label}</span>
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
          ✓ {actionSuccess}
        </div>
      )}

      {/* 1. DUAL VIEW COMPARISON: ORIGINAL VS COMPLETED/PREVIEW */}
      <div className="rounded-2xl border border-[#EAE8E3] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE8E3] pb-4">
          <div>
            <h2 className="text-sm font-bold text-[#141414]">Artwork Inspection &amp; Comparison</h2>
            <p className="text-xs text-[#737373]">
              Side-by-side comparison of original customer upload vs reconstructed vector draft
            </p>
          </div>
          <div className="font-mono text-xs text-[#737373]">
            Curvature Check: <strong className="text-emerald-700">100% Tangent Bezier</strong>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Side A: Original Upload */}
          <div className="flex flex-col rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#F5F4F0] px-4 py-2 text-xs font-semibold text-[#141414]">
              <span>A. Customer Submission</span>
              <span className="text-[10px] text-[#737373] font-mono">
                {customerUpload?.format.toUpperCase() || 'RASTER'}
              </span>
            </div>

            <div className="flex h-72 w-full items-center justify-center p-6 bg-[#F9F8F6]">
              {customerUpload?.url ? (
                <img
                  src={customerUpload.url}
                  alt="Original Artwork"
                  className="max-h-full max-w-full object-contain rounded filter contrast-90"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center text-[#737373]">
                  <Layers className="h-10 w-10 text-[#CCCCCC]" />
                  <span className="mt-2 text-xs font-medium">
                    {customerUpload?.filename || 'Original Raster File'}
                  </span>
                  <span className="text-[10px] font-mono text-[#999999]">
                    {customerUpload?.size_bytes ? `${(customerUpload.size_bytes / 1024 / 1024).toFixed(1)} MB` : '3.4 MB'}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-[#EAE8E3] bg-white p-3 font-mono text-[11px] text-[#737373] flex justify-between">
              <span>Source: Client Upload</span>
              <span>Status: Archived in Vault</span>
            </div>
          </div>

          {/* Side B: Vector Reconstruction / Watermarked Preview */}
          <div className="flex flex-col rounded-xl border-2 border-[#141414] bg-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#141414] bg-[#141414] px-4 py-2 text-xs font-bold text-white">
              <span>B. Artlantix Reconstructed Vector</span>
              <span className="text-[10px] text-[#E05328] uppercase font-mono">
                {order.status === 'completed' ? 'Master Approved' : 'Watermarked Preview'}
              </span>
            </div>

            <div className="relative flex h-72 w-full items-center justify-center p-6 bg-[#F9F8F6]">
              <svg viewBox="0 0 400 400" className="h-56 w-56 drop-shadow-xs">
                <circle cx="200" cy="200" r="150" fill="#FFFFFF" stroke="#141414" strokeWidth="6" />
                <circle cx="200" cy="200" r="130" fill="none" stroke="#E05328" strokeWidth="2.5" strokeDasharray="6 4" />
                <path d="M 200 80 L 235 150 L 310 150 L 250 195 L 270 270 L 200 225 L 130 270 L 150 195 L 90 150 L 165 150 Z" fill="#141414" />
                <circle cx="200" cy="200" r="22" fill="#E05328" />
                <text x="200" y="325" fontFamily="sans-serif" fontWeight="800" fontSize="16" letterSpacing="4" fill="#141414" textAnchor="middle">
                  {order.project_name.toUpperCase().slice(0, 16)}
                </text>
              </svg>

              {order.status !== 'completed' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                  <div className="rotate-[-25deg] text-3xl font-extrabold uppercase tracking-widest text-black/10">
                    ARTLANTIX PREVIEW DRAFT
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#EAE8E3] bg-white p-3 font-mono text-[11px] flex justify-between">
              <span className="text-emerald-700 font-semibold">✓ Tangency Verified</span>
              <span className="text-[#737373]">Tolerance: 0.01mm</span>
            </div>
          </div>
        </div>

        {/* ACTION BAR FOR PREVIEW APPROVAL OR REVISION */}
        {order.status === 'preview_ready' && (
          <div className="mt-8 rounded-2xl border-2 border-[#E05328] bg-[#FDF3F0] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-[#141414]">
                  Do you approve this reconstructed vector draft?
                </h3>
                <p className="text-xs text-[#737373] mt-1 max-w-xl">
                  Approving immediately unlocks your full master package (AI, EPS, SVG, PDF, and high-res transparent PNG). If adjustments are needed, you have 2 included revision rounds with our senior artist.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setRevisionModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#141414] bg-white px-4 py-2.5 text-xs font-bold text-[#141414] hover:bg-[#F5F4F0] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Request Revision</span>
                </button>

                <button
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E05328] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#C8461D] transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve &amp; Unlock Master Files</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {order.status === 'revision_requested' && (
          <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-xs text-yellow-900">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="h-4 w-4 text-yellow-700" />
              <span>Revision Request Received</span>
            </div>
            <p className="mt-1 text-[11px] text-yellow-800">
              Your senior vector artist is applying your feedback. You will receive an email and portal update once the revised draft is ready.
            </p>
          </div>
        )}
      </div>

      {/* 2. MASTER FILES DOWNLOAD DRAWER WITH TACTILE DELIVERABLE BADGES */}
      {order.status === 'completed' && (
        <div className="rounded-2xl border border-emerald-300 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-[#141414]">
                  Production Master Deliverables (Unlocked)
                </h2>
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                Archived permanently in your Artlantix Vault. Click any format badge to download immediately.
              </p>
            </div>

            <button
              onClick={() => triggerMasterBundleZip(order)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#141414] px-5 py-2.5 text-xs font-bold text-white hover:bg-black transition-colors"
            >
              <Download className="h-4 w-4 text-[#E05328]" />
              <span>Download Master Bundle (.ZIP)</span>
            </button>
          </div>

          {/* Primary Download Format Badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {masterFiles.map((file) => (
              <DeliverableBadge
                key={file.id}
                format={file.format as DeliverableFormat}
                variant="download-button"
                sizeBytes={file.size_bytes}
                filename={file.filename}
                onDownload={() => triggerFileDownload(file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. ACTIVITY LOG & MESSAGING THREAD */}
      <div className="rounded-2xl border border-[#EAE8E3] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#EAE8E3] pb-4">
          <MessageSquare className="h-4 w-4 text-[#E05328]" />
          <h2 className="text-sm font-bold text-[#141414]">
            Production Activity &amp; Artist Communications
          </h2>
        </div>

        <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
          {(!order.messages || order.messages.length === 0) ? (
            <div className="text-center py-6 font-mono text-xs text-[#737373]">
              No messages logged yet for this order.
            </div>
          ) : (
            order.messages.map((msg) => {
              const isOperator = msg.sender_type === 'operator';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col rounded-xl p-4 text-xs ${
                    isOperator
                      ? 'border border-[#EAE8E3] bg-[#F5F4F0] ml-0 sm:mr-12'
                      : 'border border-[#F6CEBF] bg-[#FDF3F0] mr-0 sm:ml-12'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#141414]">
                      {msg.sender_name || (isOperator ? 'Elena Vance (Production Lead)' : 'Client')}
                    </span>
                    <span className="font-mono text-[10px] text-[#737373]">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-2 leading-relaxed text-[#141414] whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t border-[#EAE8E3] pt-4">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message or instruction for the production artist..."
            className="flex-1 rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={isSendingMessage || !chatMessage.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#141414] px-4 py-2 text-xs font-bold text-white hover:bg-black transition-colors disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* REVISION REQUEST MODAL */}
      {revisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#EAE8E3] bg-white p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-[#E05328]" />
                <h3 className="text-sm font-bold text-[#141414]">Request Artwork Revision</h3>
              </div>
              <button
                onClick={() => setRevisionModalOpen(false)}
                className="text-xs text-[#737373] hover:text-[#141414]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="mt-4 space-y-4">
              <p className="text-xs text-[#737373] leading-relaxed">
                Detail the precise adjustments required. Your senior artist will refine the vector contours (Round 1 of 2 included).
              </p>

              <div>
                <label className="block text-xs font-bold text-[#141414]">
                  Revision Details &amp; Path Feedback
                </label>
                <textarea
                  required
                  rows={4}
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  placeholder="e.g., Please thicken the outer crest stroke by 0.5pt, slightly widen the serifs on the letter 'S', and remove the stray anchor node on the falcon eye..."
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] p-3 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevisionModalOpen(false)}
                  className="rounded-lg border border-[#EAE8E3] bg-white px-4 py-2 text-xs font-semibold text-[#737373] hover:bg-[#F5F4F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRevision || !revisionFeedback.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E05328] px-5 py-2 text-xs font-bold text-white hover:bg-[#C8461D] disabled:opacity-50"
                >
                  <span>{isSubmittingRevision ? 'Submitting...' : 'Submit Revision Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
