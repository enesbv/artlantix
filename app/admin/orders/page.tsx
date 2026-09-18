'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import OrderChatHub from '@/components/OrderChatHub';
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
  Layers,
  PenTool,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Zap,
  Sparkles,
  Inbox,
  FileCheck,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

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
      try {
        const u = await getCurrentUser();
        setCurrentUser(u);
        const list = await getOrders(undefined, true, true);
        setOrders(list);
      } finally {
        setIsLoading(false);
      }
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
    setIsSubmittingAction(true);
    setActionError(null);

    try {
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

      const updatedList = await getOrders(undefined, true, true);
      setOrders(updatedList);
      setActionNotice(`Sipariş ${selectedOrder.order_number} başarıyla güncellendi!`);
      setTimeout(() => setActionNotice(null), 3000);
      setModalOpen(false);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Güncelleme kaydedilemedi.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Metrics
  const inProgressCount = orders.filter((o) => ['in_progress', 'preview_ready'].includes(o.status)).length;
  const pendingReviewCount = orders.filter((o) => ['quote_requested', 'in_review'].includes(o.status)).length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const revisionCount = orders.filter((o) => o.status === 'revision_requested').length;

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'review_queue') return ['quote_requested', 'in_review'].includes(o.status);
    if (statusFilter === 'in_progress') return o.status === 'in_progress';
    if (statusFilter === 'preview_ready') return o.status === 'preview_ready';
    if (statusFilter === 'revision_requested') return o.status === 'revision_requested';
    if (statusFilter === 'completed') return o.status === 'completed';
    return o.status === statusFilter;
  });

  return (
    <div className="flex-1 pb-16">
      {/* Top Bar matching reference */}
      <AdminHeader
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pendingReviewCount={pendingReviewCount}
      />

      <div className="w-full px-6 sm:px-8 pt-6 space-y-6">
        {/* Toast feedback */}
        {actionNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-2xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Overview Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[#141414]">Overview</h2>
            <p className="text-xs font-medium text-[#737373]">
              Stüdyo iş akışı, teslimat süreleri ve müşteri talepleri özeti.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3 py-2 text-xs font-bold text-[#5E625F] shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-[#18794E]" />
              <span>Bu Ay</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusFilter(statusFilter === 'review_queue' ? 'all' : 'review_queue')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                statusFilter === 'review_queue'
                  ? 'bg-[#102A20] text-white'
                  : 'bg-[#18794E] text-white hover:bg-[#115C3B]'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{statusFilter === 'review_queue' ? 'Tümünü Göster' : 'İnceleme Bekleyenler'}</span>
            </button>
          </div>
        </div>

        {/* 3 Large KPI Cards Grid (Reference Image Inspired) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Aktif Çizim Havuzu */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#18794E]">
                <PenTool className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-extrabold text-[#18794E]">
                2x ↗
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black tracking-tight text-[#141414]">
                  {isLoading ? '—' : inProgressCount}
                </span>
                <p className="text-xs font-bold text-[#141414] mt-0.5">Aktif Üretim Havuzu</p>
                <p className="text-[11px] text-[#737373]">Devam eden vektör çizimleri</p>
              </div>
              {/* Sparkline mini wave */}
              <svg className="h-10 w-24 text-emerald-500" viewBox="0 0 100 40" fill="none" stroke="currentColor">
                <path d="M0 30 Q 20 35, 40 20 T 70 15 T 100 5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 2: İnceleme & Teklif Bekleyen */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Inbox className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700">
                {pendingReviewCount > 0 ? 'Öncelikli' : 'Normal'}
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black tracking-tight text-[#141414]">
                  {isLoading ? '—' : pendingReviewCount}
                </span>
                <p className="text-xs font-bold text-[#141414] mt-0.5">İnceleme &amp; Teklif</p>
                <p className="text-[11px] text-[#737373]">Tolerans değerlendirmesi bekliyor</p>
              </div>
              {/* Sparkline mini wave */}
              <svg className="h-10 w-24 text-amber-500" viewBox="0 0 100 40" fill="none" stroke="currentColor">
                <path d="M0 25 Q 30 10, 60 28 T 100 8" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 3: Zamanında Teslimat Oranı (SLA) */}
          <div className="relative overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs transition-all hover:shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileCheck className="h-5 w-5" />
              </div>
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-extrabold text-blue-700">
                SLA %98 ↗
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black tracking-tight text-[#141414]">
                  %{completedCount > 0 ? '98.4' : '100'}
                </span>
                <p className="text-xs font-bold text-[#141414] mt-0.5">Zamanında Teslimat</p>
                <p className="text-[11px] text-[#737373]">&lt;16s Express ve Standart SLA</p>
              </div>
              {/* Sparkline mini wave */}
              <svg className="h-10 w-24 text-blue-500" viewBox="0 0 100 40" fill="none" stroke="currentColor">
                <path d="M0 35 Q 25 25, 50 15 T 80 10 T 100 4" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mid Section (3 Columns matching reference image layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Column 1: Üretim Durumu Dağılımı (Attendance & Time style widget) - 4 cols */}
          <div className="lg:col-span-4 rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#F0EFEB] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#18794E]">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-extrabold text-[#141414]">Üretim Dağılımı</h3>
              </div>
              <span className="text-[11px] font-bold text-[#737373]">{orders.length} Toplam İş</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black tracking-tight text-[#141414]">{orders.length}</p>
                <p className="text-[10px] font-semibold text-[#737373]">Kayıtlı Sipariş</p>
              </div>

              {/* Ring Chart Widget */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg className="h-20 w-20 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-[#EAE8E3]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#18794E]"
                    strokeDasharray="75, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xs font-extrabold text-[#141414]">%{orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0}</span>
                </div>
              </div>
            </div>

            {/* Distribution Rows */}
            <div className="mt-4 space-y-2 border-t border-[#F0EFEB] pt-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[#5E625F] font-medium">Tamamlanan</span>
                </div>
                <span className="font-extrabold text-[#141414]">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-[#5E625F] font-medium">Çizimde (Senior Artist)</span>
                </div>
                <span className="font-extrabold text-[#141414]">{orders.filter((o) => o.status === 'in_progress').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[#5E625F] font-medium">Önizleme Hazır</span>
                </div>
                <span className="font-extrabold text-[#141414]">{orders.filter((o) => o.status === 'preview_ready').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[#5E625F] font-medium">İnceleme &amp; Teklif</span>
                </div>
                <span className="font-extrabold text-[#141414]">{pendingReviewCount}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Üretim Pipeline Akışı (Hiring Pipeline style widget) - 4 cols */}
          <div className="lg:col-span-4 rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EFEB] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-[#141414]">Üretim Pipeline</h3>
                </div>
                <span className="text-[10px] font-bold text-[#18794E]">Canlı Akış</span>
              </div>

              {/* 3 Pipeline Stages */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-[#F0EFEB] bg-[#FAFAF8] p-3">
                  <span className="block text-2xl font-black text-[#141414]">{orders.length}</span>
                  <span className="mt-1 block text-[10px] font-bold text-[#737373]">Kabul</span>
                </div>
                <div className="rounded-xl border border-[#F0EFEB] bg-[#FAFAF8] p-3">
                  <span className="block text-2xl font-black text-[#18794E]">{inProgressCount}</span>
                  <span className="mt-1 block text-[10px] font-bold text-[#737373]">Çizimde</span>
                </div>
                <div className="rounded-xl border border-[#F0EFEB] bg-[#FAFAF8] p-3">
                  <span className="block text-2xl font-black text-amber-600">{pendingReviewCount + revisionCount}</span>
                  <span className="mt-1 block text-[10px] font-bold text-[#737373]">Revizyon/Onay</span>
                </div>
              </div>

              {/* Studio Artist Team Avatars */}
              <div className="mt-4 flex items-center justify-between border-t border-[#F0EFEB] pt-3">
                <span className="text-[11px] font-semibold text-[#737373]">Aktif Sanatçılar:</span>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {['EV', 'AM', 'TK', 'SR'].map((initials, idx) => (
                    <div
                      key={initials}
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${
                        idx === 0 ? 'bg-[#102A20]' : idx === 1 ? 'bg-[#18794E]' : idx === 2 ? 'bg-amber-600' : 'bg-blue-600'
                      }`}
                    >
                      {initials}
                    </div>
                  ))}
                  <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAE8E3] text-[9px] font-bold text-[#5E625F] ring-2 ring-white">
                    +3
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatusFilter('in_progress')}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-[#FAFAF8] py-2 text-xs font-bold text-[#141414] hover:bg-[#F0EFEB] transition-colors"
            >
              <span>Çizim Masasını Filtrele</span>
            </button>
          </div>

          {/* Column 3: Notice Board (Notice Board widget from reference image) - 4 cols */}
          <div className="lg:col-span-4 rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#F0EFEB] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-extrabold text-[#141414]">Notice Board</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className="text-[11px] font-bold text-[#18794E] hover:underline"
                >
                  Tümünü Gör
                </button>
              </div>

              {/* Feed items */}
              <div className="mt-3 space-y-3">
                {orders.slice(0, 3).map((ord) => (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setChatOrder(ord);
                      setChatModalOpen(true);
                    }}
                    className="w-full text-left rounded-xl p-2.5 transition-colors hover:bg-[#FAFAF8] border border-transparent hover:border-[#EAE8E3] group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[#18794E] text-[10px] font-bold">
                        {ord.customer_name?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs font-bold text-[#141414] group-hover:text-[#18794E] transition-colors">
                            {ord.customer_name || 'Müşteri'}
                          </p>
                          <span className="text-[10px] text-[#999999]">
                            {new Date(ord.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[#737373] mt-0.5">
                          {ord.project_name} ({ord.order_number})
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-[#F0EFEB] pt-3 text-center">
              <span className="text-[10px] font-medium text-[#737373]">
                Herhangi bir mesaja tıklayarak canlı sohbeti açabilirsiniz.
              </span>
            </div>
          </div>
        </div>

        {/* Minimalist Production Queue Section */}
        <div className="rounded-2xl border border-[#EAE8E3] bg-white shadow-2xs overflow-hidden">
          {/* Card Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#EAE8E3] p-4 sm:px-6 gap-3 bg-[#FAFAF8]">
            <div>
              <h3 className="text-sm font-extrabold text-[#141414]">Üretim Masası &amp; Sipariş Kuyruğu</h3>
              <p className="text-[11px] text-[#737373]">{filtered.length} sipariş listeleniyor</p>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tümü' },
                { id: 'review_queue', label: 'İnceleme' },
                { id: 'in_progress', label: 'Çizimde' },
                { id: 'preview_ready', label: 'Önizleme' },
                { id: 'revision_requested', label: 'Revizyon' },
                { id: 'completed', label: 'Tamamlandı' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                    statusFilter === tab.id
                      ? 'bg-[#102A20] text-white shadow-2xs'
                      : 'border border-[#EAE8E3] bg-white text-[#5E625F] hover:text-[#141414] hover:border-[#141414]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EAE8E3] bg-white text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                <tr>
                  <th className="px-6 py-3.5">Sipariş &amp; Tarih</th>
                  <th className="px-6 py-3.5">Müşteri</th>
                  <th className="px-6 py-3.5">Proje &amp; Tür</th>
                  <th className="px-6 py-3.5">Ücret &amp; SLA</th>
                  <th className="px-6 py-3.5">Durum</th>
                  <th className="px-6 py-3.5 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEB] bg-white">
                {filtered.map((order) => {
                  const statusBadge = {
                    quote_requested: { label: 'Teklif Talebi', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                    in_review: { label: 'İnceleniyor', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                    in_progress: { label: 'Çizimde', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                    preview_ready: { label: 'Önizleme Hazır', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    approved: { label: 'Onaylandı', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                    revision_requested: { label: 'Revizyon İstendi', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                    completed: { label: 'Tamamlandı', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    cancelled: { label: 'İptal', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                  }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                      {/* Order Number & Created */}
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-[#141414] block">{order.order_number}</span>
                        <span className="text-[10px] text-[#737373]">
                          {new Date(order.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAE8E3] text-[#141414] font-bold text-[10px]">
                            {order.customer_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <div className="font-bold text-[#141414]">{order.customer_name || 'Alex Morgan'}</div>
                            <div className="text-[10px] text-[#737373]">{order.customer_email || 'client@atelier.com'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Project Title */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#141414]">{order.project_name}</div>
                        <div className="text-[10px] capitalize text-[#737373]">
                          {order.artwork_type.replace('_', ' ')} · {order.complexity}
                        </div>
                      </td>

                      {/* Price & Turnaround */}
                      <td className="px-6 py-4">
                        <div className="font-black text-[#141414]">${order.final_price || order.estimated_price}</div>
                        <div>
                          {order.turnaround === 'express' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-[#18794E]">
                              ⚡ Express (&lt;16s)
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#737373]">Standart (48s)</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setChatOrder(order);
                              setChatModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 rounded-xl border border-[#EAE8E3] bg-white px-3 py-1.5 text-xs font-bold text-[#141414] hover:border-[#18794E] hover:text-[#18794E] transition-all shadow-2xs"
                            title="Müşteriyle Canlı Sohbet"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-[#18794E]" />
                            <span>Sohbet</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openOperatorModal(order)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#102A20] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-black transition-all shadow-2xs"
                          >
                            <PenTool className="h-3.5 w-3.5 text-[#18794E]" />
                            <span>İşlem Yap</span>
                          </button>

                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="rounded-xl border border-[#EAE8E3] bg-white p-2 text-[#737373] hover:text-[#141414] hover:border-[#141414] transition-colors shadow-2xs"
                            title="Müşteri Önizleme Sayfasını Aç"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Operator Live Chat Hub Modal */}
      {chatModalOpen && chatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#FAFAF8] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#18794E]">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-[#141414] block">
                    {chatOrder.project_name} ({chatOrder.order_number})
                  </span>
                  <span className="text-[10px] text-[#737373]">
                    Müşteri: {chatOrder.customer_name || 'Client'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#737373] hover:bg-[#F0EFEB] hover:text-[#141414] transition-colors"
              >
                ✕ Kapat
              </button>
            </div>
            <OrderChatHub
              orderId={chatOrder.id}
              initialMessages={chatOrder.messages || []}
              currentUserId={currentUser?.id || 'usr_admin_001'}
              currentUserName={currentUser?.full_name || 'Elena Vance (Production Lead)'}
              currentUserType="operator"
              projectTitle={chatOrder.project_name}
              orderStatus={chatOrder.status}
              className="border-none shadow-none rounded-none"
            />
          </div>
        </div>
      )}

      {/* Operator Action Modal */}
      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#EAE8E3] bg-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EAE8E3] bg-[#FAFAF8] px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#141414]">Üretim Aksiyonu &amp; Durum Güncelleme</h3>
                <p className="text-[11px] text-[#737373]">{selectedOrder.project_name} ({selectedOrder.order_number})</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs font-bold text-[#737373] hover:text-[#141414]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyOperatorUpdates} className="p-5 space-y-4 text-xs">
              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">
                  {actionError}
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-[#141414] mb-1">Yeni Üretim Durumu</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full rounded-xl border border-[#EAE8E3] bg-white px-3 py-2 text-xs font-semibold text-[#141414] focus:border-[#18794E] focus:outline-hidden"
                >
                  <option value="quote_requested">Quote Requested</option>
                  <option value="in_review">In Review (Tolerans İnceleme)</option>
                  <option value="in_progress">In Progress (Manuel Çizim)</option>
                  <option value="preview_ready">Preview Ready (Önizleme Hazır)</option>
                  <option value="approved">Approved (Onaylandı · Paketleme)</option>
                  <option value="revision_requested">Revision Requested (Revizyon)</option>
                  <option value="completed">Completed (Master Teslim Edildi)</option>
                  <option value="cancelled">Cancelled (İptal)</option>
                </select>
              </div>

              {/* Price adjustment */}
              <div>
                <label className="block text-xs font-bold text-[#141414] mb-1">Onaylanan Nihai Ücret ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={adjustedPrice}
                  onChange={(e) => setAdjustedPrice(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#EAE8E3] bg-white px-3 py-2 text-xs font-semibold text-[#141414] focus:border-[#18794E] focus:outline-hidden"
                />
              </div>

              {/* Master / Preview Deliverable upload */}
              <div className="rounded-xl border border-[#EAE8E3] bg-[#FAFAF8] p-3.5 space-y-2.5">
                <label className="block text-xs font-bold text-[#141414]">
                  Teslim Edilecek Dosya Adı / Formatı
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={deliverableFilename}
                      onChange={(e) => setDeliverableFilename(e.target.value)}
                      placeholder="e.g. Apex-Crest-Master.svg"
                      className="w-full rounded-lg border border-[#EAE8E3] bg-white px-3 py-1.5 text-xs text-[#141414] focus:border-[#18794E] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <select
                      value={selectedDeliverableFormat}
                      onChange={(e) => setSelectedDeliverableFormat(e.target.value as 'svg' | 'ai' | 'eps' | 'pdf')}
                      className="w-full rounded-lg border border-[#EAE8E3] bg-white px-2.5 py-1.5 text-xs font-bold text-[#141414]"
                    >
                      <option value="svg">SVG</option>
                      <option value="ai">AI</option>
                      <option value="eps">EPS</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Operator Note Message */}
              <div>
                <label className="block text-xs font-bold text-[#141414] mb-1">
                  Müşteriye İletilecek Mesaj (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={operatorMessage}
                  onChange={(e) => setOperatorMessage(e.target.value)}
                  placeholder="Vektörel çizim tamamlandı, eğriler düzeltildi..."
                  className="w-full rounded-xl border border-[#EAE8E3] bg-white p-3 text-xs text-[#141414] focus:border-[#18794E] focus:outline-hidden"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-[#EAE8E3] pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#EAE8E3] bg-white px-4 py-2 text-xs font-bold text-[#737373] hover:bg-[#F0EFEB]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="rounded-xl bg-[#18794E] px-5 py-2 text-xs font-bold text-white hover:bg-[#115C3B] disabled:opacity-50"
                >
                  {isSubmittingAction ? 'Kaydediliyor...' : 'Değişiklikleri Uygula & Bildir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
