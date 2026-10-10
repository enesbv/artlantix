'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ADMIN_STATUS_LABELS } from '@/lib/admin-orders';
import { getExpectedDelivery } from '@/lib/order-status';
import { Order, OrderStatus, UserProfile } from '@/lib/types';
import { PenTool, ExternalLink, MessageSquare, CheckCircle2, RefreshCw, Inbox } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chatOrder, setChatOrder] = useState<Order | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const submittingRef = useRef(false);
  const refreshingRef = useRef(false);

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

  const refreshOrders = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    try {
      const user = await getCurrentUser();
      setRefreshing(true);
      if (!user?.is_admin) throw new Error('Bu panel için operatör hesabı gerekiyor.');
      setCurrentUser(user);
      const list = await getOrders(undefined, true, false, true);
      setOrders(list);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Siparişler yüklenemedi.');
    } finally {
      refreshingRef.current = false;
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshOrders(), 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !submittingRef.current) void refreshOrders();
    }, 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); };
  }, [refreshOrders]);

  const changeSearch = (value: string) => { setSearchQuery(value); setPage(1); };
  const changeFilter = (value: string) => { setStatusFilter(value); setPage(1); };

  useEffect(() => {
    if (!modalOpen && !chatModalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []);
    focusable()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submittingRef.current) {
        setModalOpen(false); setChatModalOpen(false);
      }
      if (event.key === 'Tab') {
        const elements = focusable();
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); previousFocus?.focus(); };
  }, [modalOpen, chatModalOpen]);

  const openOperatorModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdjustedPrice(order.final_price ?? order.estimated_price);
    setDeliverableFilename('');
    setDeliverableFile(null);
    setActionError(null);
    setOperatorMessage('');
    setModalOpen(true);
  };

  const handleApplyOperatorUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !currentUser?.is_admin || submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmittingAction(true);
    setActionError(null);

    try {
      if (!Number.isFinite(adjustedPrice) || adjustedPrice < 0) throw new Error('Geçerli bir ücret girin.');
      if (deliverableFile) {
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

      setActionNotice(`Sipariş ${selectedOrder.order_number} başarıyla güncellendi!`);
      setTimeout(() => setActionNotice(null), 3000);
      setModalOpen(false);
      await refreshOrders();
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : 'Güncelleme kaydedilemedi.');
    } finally {
      submittingRef.current = false;
      setIsSubmittingAction(false);
    }
  };

  const pendingReviewCount = orders.filter((order) => ['quote_requested', 'in_review'].includes(order.status)).length;
  const filters = [
    { id: 'all', label: 'Tümü', count: orders.length },
    { id: 'review_queue', label: 'İnceleme', count: pendingReviewCount },
    ...(['in_progress', 'revision_requested', 'approved', 'preview_ready', 'completed', 'cancelled'] as OrderStatus[]).map((status) => ({
      id: status, label: ADMIN_STATUS_LABELS[status], count: orders.filter((order) => order.status === status).length,
    })),
  ];
  const filtered = orders.filter((order) => {
    const query = searchQuery.trim().toLocaleLowerCase('tr');
    const matches = [order.order_number, order.project_name, order.customer_name, order.customer_email]
      .some((value) => value?.toLocaleLowerCase('tr').includes(query));
    return matches && (statusFilter === 'all' || (statusFilter === 'review_queue'
      ? ['quote_requested', 'in_review'].includes(order.status) : order.status === statusFilter));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pageCount);
  const visibleOrders = filtered.slice((currentPage - 1) * 20, currentPage * 20);

  const actions = (order: Order) => (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => openOperatorModal(order)} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-signal-ink"><PenTool className="h-3.5 w-3.5" />Güncelle</button>
      <button type="button" onClick={() => { setChatOrder(order); setChatModalOpen(true); }} className="inline-flex items-center gap-1.5 border border-rule-strong px-3 py-2 text-xs font-medium hover:bg-paper"><MessageSquare className="h-3.5 w-3.5" />Mesaj</button>
      <Link href={`/dashboard/orders/${order.id}`} aria-label={`${order.project_name} detayları`} className="border border-rule-strong p-2 hover:bg-paper"><ExternalLink className="h-3.5 w-3.5" /></Link>
    </div>
  );
  const badge = (order: Order) => <span className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${['quote_requested', 'revision_requested'].includes(order.status) ? 'bg-amber-50 text-amber-800' : 'bg-signal-tint text-signal-ink'}`}>{ADMIN_STATUS_LABELS[order.status]}</span>;

  return (
    <div className="min-w-0 flex-1 pb-10">
      <AdminHeader currentUser={currentUser} searchQuery={searchQuery} onSearchChange={changeSearch} orders={orders} onOpenOrder={openOperatorModal} loading={isLoading} error={loadError} />
      <div className="mx-auto max-w-[1600px] space-y-6 px-4 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div><h2 className="text-2xl font-semibold tracking-tight text-ink">Siparişler</h2><p className="mt-1 text-sm text-ink-3">İncele, üretimi takip et ve teslim et.</p></div>
          <button type="button" disabled={refreshing || isSubmittingAction} onClick={() => void refreshOrders()} className="inline-flex items-center gap-2 border border-rule-strong bg-paper-2 px-3 py-2 text-xs font-semibold disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />Yenile</button>
        </div>
        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError} Yenile düğmesiyle tekrar deneyin.</p>}
        {actionNotice && <p role="status" className="flex items-center gap-2 rounded-xl border border-signal-line bg-signal-tint p-4 text-sm text-signal-ink"><CheckCircle2 className="h-4 w-4" />{actionNotice}</p>}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {filters.filter((filter) => ['review_queue', 'in_progress', 'revision_requested', 'approved'].includes(filter.id)).map((filter) => (
            <button type="button" key={filter.id} aria-pressed={statusFilter === filter.id} onClick={() => { changeSearch(''); changeFilter(filter.id); }} className={`rounded-2xl border p-4 text-left transition-colors sm:p-5 ${statusFilter === filter.id ? 'border-ink bg-signal-tint' : 'border-rule bg-paper-2 hover:border-signal-line'}`}>
              <p className="text-xs font-medium text-ink-3">{filter.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{isLoading ? '—' : filter.count}</p>
            </button>
          ))}
        </div>

        <section className="overflow-hidden border border-ink bg-paper-2">
          <div className="flex flex-wrap gap-2 border-b border-rule p-4">
            {filters.map((filter) => <button key={filter.id} type="button" aria-pressed={statusFilter === filter.id} onClick={() => changeFilter(filter.id)} className={`rounded-lg px-3 py-2 text-xs font-medium ${statusFilter === filter.id ? 'bg-ink text-white' : 'bg-paper text-ink-3 hover:bg-signal-tint'}`}>{filter.label} <span className="ml-1 opacity-65">{isLoading ? '—' : filter.count}</span></button>)}
          </div>
          {isLoading ? <div role="status" aria-label="Siparişler yükleniyor" className="space-y-3 p-5">{[1, 2, 3].map((row) => <div key={row} className="h-16 animate-pulse rounded-xl bg-paper" />)}</div>
            : filtered.length === 0 ? <div className="p-12 text-center"><Inbox className="mx-auto h-7 w-7 text-ink-3" /><p className="mt-3 text-sm text-ink-3">{loadError ? 'Sipariş listesi alınamadı.' : 'Bu görünümde sipariş bulunamadı.'}</p>{(searchQuery || statusFilter !== 'all') && <button type="button" onClick={() => { changeSearch(''); changeFilter('all'); }} className="mt-3 text-xs font-semibold text-signal-ink">Filtreleri temizle</button>}</div>
            : <>
              <div className="divide-y divide-rule lg:hidden">
                {visibleOrders.map((order) => <article key={order.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-semibold text-ink">{order.project_name}</h3><p className="mt-1 break-all text-[11px] text-ink-3">{order.order_number}</p></div>{badge(order)}</div>
                  <p className="text-xs text-ink-3">{order.customer_name || 'Müşteri bilgisi yok'} · ${order.final_price ?? order.estimated_price}</p>
                  <p className="text-xs text-ink-3">Tahmini teslim: {new Date(getExpectedDelivery(order)).toLocaleDateString('tr-TR')}</p>{actions(order)}
                </article>)}
              </div>
              <div className="hidden overflow-x-auto lg:block"><table className="w-full text-left text-xs">
                <thead className="bg-paper-2 text-ink-3"><tr>{['Proje / Sipariş', 'Müşteri', 'Durum', 'Tahmini teslim', 'Ücret', 'İşlemler'].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead>
                <tbody className="divide-y divide-rule">{visibleOrders.map((order) => <tr key={order.id} className="hover:bg-paper-2">
                  <td className="max-w-64 px-5 py-4"><p className="break-words font-semibold text-ink">{order.project_name}</p><p className="mt-1 break-all text-[10px] text-ink-3">{order.order_number}</p></td>
                  <td className="px-5 py-4"><p>{order.customer_name || '—'}</p><p className="mt-1 text-[10px] text-ink-3">{order.customer_email || '—'}</p></td>
                  <td className="px-5 py-4">{badge(order)}</td>
                  <td className="whitespace-nowrap px-5 py-4"><p>{new Date(getExpectedDelivery(order)).toLocaleDateString('tr-TR')}</p><p className="mt-1 text-[10px] text-ink-3">{order.turnaround === 'express' ? 'Express' : 'Standart'}</p></td>
                  <td className="px-5 py-4 font-semibold">${order.final_price ?? order.estimated_price}</td><td className="px-5 py-4">{actions(order)}</td>
                </tr>)}</tbody>
              </table></div>
            </>}
          {filtered.length > 20 && <div className="flex items-center justify-between border-t border-rule p-4 text-xs"><span>{currentPage} / {pageCount} · {filtered.length} sipariş</span><div className="flex gap-3"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="disabled:opacity-30">Önceki</button><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="disabled:opacity-30">Sonraki</button></div></div>}
        </section>
      </div>

      {/* Operator Live Chat Hub Modal */}
      {chatModalOpen && chatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div role="dialog" aria-modal="true" aria-label="Sipariş mesajları" className="w-full max-w-2xl overflow-hidden border border-ink bg-paper-2 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule bg-paper-2 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-ok-tint text-signal-ink">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-ink block">
                    {chatOrder.project_name} ({chatOrder.order_number})
                  </span>
                  <span className="text-[10px] text-ink-3">
                    Müşteri: {chatOrder.customer_name || 'Client'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-ink-3 hover:bg-paper hover:text-ink transition-colors"
              >
                ✕ Kapat
              </button>
            </div>
            <OrderChatHub
              orderId={chatOrder.id}
              initialMessages={[]}
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
          <div role="dialog" aria-modal="true" aria-label="Siparişi güncelle" className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border border-ink bg-paper-2 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-rule bg-paper-2 px-5 py-4">
              <div>
                <h3 className="text-sm font-extrabold text-ink">Üretim Aksiyonu &amp; Durum Güncelleme</h3>
                <p className="text-[11px] text-ink-3">{selectedOrder.project_name} ({selectedOrder.order_number})</p>
              </div>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={() => setModalOpen(false)}
                className="text-xs font-bold text-ink-3 hover:text-ink"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handleApplyOperatorUpdates} className="p-5 space-y-4 text-xs">
              <fieldset disabled={isSubmittingAction} className="space-y-4">
              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">
                  {actionError}
                </div>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Yeni Üretim Durumu</label>
                <select
                  aria-label="Yeni üretim durumu"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full border border-rule-strong bg-paper-2 px-3 py-2 text-xs font-semibold text-ink focus:border-ink focus:outline-hidden"
                >
                  {Object.entries(ADMIN_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>

              {/* Price adjustment */}
              <div>
                <label className="block text-xs font-bold text-ink mb-1">Onaylanan Nihai Ücret ($)</label>
                <input
                  type="number"
                  aria-label="Nihai ücret (USD)"
                  min="0"
                  step="1"
                  value={adjustedPrice}
                  onChange={(e) => setAdjustedPrice(Number(e.target.value))}
                  className="w-full border border-rule-strong bg-paper-2 px-3 py-2 text-xs font-semibold text-ink focus:border-ink focus:outline-hidden"
                />
              </div>

              {/* Master / Preview Deliverable upload */}
              <div className="border border-rule-strong bg-paper-2 p-3.5 space-y-2.5">
                <label className="block text-xs font-bold text-ink">
                  Önizleme / master dosyası (isteğe bağlı)
                </label>
                <input aria-label="Teslim dosyası" type="file" accept=".svg,.ai,.eps,.pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setDeliverableFile(file);
                    setDeliverableFilename(file?.name || '');
                    const format = file?.name.split('.').pop()?.toLowerCase();
                    if (format && ['svg', 'ai', 'eps', 'pdf'].includes(format)) setSelectedDeliverableFormat(format as 'svg' | 'ai' | 'eps' | 'pdf');
                  }} className="block w-full border border-rule-strong bg-paper-2 p-2 text-xs" />
                <p className="text-ink-3">Tamamlandı durumunda master, diğer durumlarda önizleme olarak kaydedilir.</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      aria-label="Teslim dosyası adı"
                      value={deliverableFilename}
                      onChange={(e) => setDeliverableFilename(e.target.value)}
                      placeholder="e.g. Apex-Crest-Master.svg"
                      className="w-full border border-rule-strong bg-paper-2 px-3 py-1.5 text-xs text-ink focus:border-ink focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <select
                      aria-label="Teslim dosyası formatı"
                      value={selectedDeliverableFormat}
                      onChange={(e) => setSelectedDeliverableFormat(e.target.value as 'svg' | 'ai' | 'eps' | 'pdf')}
                      className="w-full border border-rule-strong bg-paper-2 px-2.5 py-1.5 text-xs font-bold text-ink"
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
                <label className="block text-xs font-bold text-ink mb-1">
                  Müşteriye İletilecek Mesaj (Opsiyonel)
                </label>
                <textarea
                  aria-label="Müşteriye mesaj"
                  rows={2}
                  value={operatorMessage}
                  onChange={(e) => setOperatorMessage(e.target.value)}
                  placeholder="Vektörel çizim tamamlandı, eğriler düzeltildi..."
                  className="w-full border border-rule-strong bg-paper-2 p-3 text-xs text-ink focus:border-ink focus:outline-hidden"
                />
              </div>

              {/* Modal buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-rule pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="border border-rule-strong bg-paper-2 px-4 py-2 text-xs font-bold text-ink-3 hover:bg-paper"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="rounded-xl bg-ink px-5 py-2 text-xs font-bold text-white hover:bg-signal-ink disabled:opacity-50"
                >
                  {isSubmittingAction ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
              </fieldset>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
