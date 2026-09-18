'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Bell, ArrowUpRight } from 'lucide-react';
import { getOperatorAlerts } from '@/lib/admin-orders';
import type { Order, UserProfile } from '@/lib/types';

interface AdminHeaderProps {
  currentUser?: UserProfile | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  orders: Order[];
  onOpenOrder: (order: Order) => void;
  loading?: boolean;
  error?: string | null;
}

export default function AdminHeader({ currentUser, searchQuery, onSearchChange, orders, onOpenOrder, loading, error }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const initial = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => { window.clearTimeout(initial); window.clearInterval(interval); document.removeEventListener('pointerdown', close); };
  }, []);
  const alerts = getOperatorAlerts(orders, now);
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E7DD] bg-[#FAFBF8]/95 px-4 py-4 backdrop-blur-md sm:px-8">
      <div className="hidden xl:block"><p className="text-sm font-semibold text-[#102A20]">Üretim masası</p><p className="mt-1 text-xs text-[#7A8773]">{currentUser?.full_name || 'Operatör'}</p></div>
      <div className="relative min-w-0 flex-1 xl:max-w-lg">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#87957E]" />
        <input aria-label="Sipariş ara" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Sipariş, müşteri veya proje ara…" className="h-10 w-full rounded-xl border border-[#DEE5D8] bg-white pl-10 pr-3 text-xs outline-none focus:border-[#18794E] focus:ring-2 focus:ring-[#18794E]/10" />
      </div>
      <div className="relative" ref={rootRef} onKeyDown={(event) => {
        if (event.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
      }}>
        <button ref={buttonRef} type="button" onClick={() => { setNow(Date.now()); setOpen(!open); }} aria-expanded={open} aria-controls="operator-notifications" aria-label={`Bildirimler, ${alerts.length} işlem bekliyor`} className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#DEE5D8] bg-white text-[#18794E] hover:bg-[#E9F9EE]">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#18794E] px-1 text-center text-[9px] leading-4 text-white">{alerts.length}</span>}
        </button>
        {open && <section id="operator-notifications" aria-label="İşlem bekleyen siparişler" className="absolute right-0 top-12 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DDE5D7] bg-white shadow-xl">
          <div className="border-b border-[#E8EDE4] px-4 py-3"><h2 className="text-sm font-semibold text-[#102A20]">İşlem bekleyenler</h2><p className="mt-1 text-[11px] text-[#7B8873]">İnceleme, revizyon, teslim ve gecikme uyarıları.</p></div>
          <div className="max-h-80 overflow-y-auto p-2">
            {loading ? <p role="status" className="p-4 text-xs text-[#71806F]">Bildirimler yükleniyor…</p> : error ? <p role="alert" className="p-4 text-xs text-red-700">Bildirimler güncellenemedi. Sipariş listesini yenileyin.</p> : alerts.length === 0 ? <p className="p-6 text-center text-xs text-[#71806F]">İşlem bekleyen bildirim yok.</p> : alerts.map(({ order, reason, overdue }) => (
              <button key={order.id} type="button" onClick={() => { setOpen(false); onOpenOrder(order); }} className="flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left hover:bg-[#F5F7F2]">
                <span className="min-w-0"><span className="block truncate text-xs font-semibold text-[#183D28]">{order.project_name}</span><span className={`mt-1 block text-[11px] ${overdue ? 'text-red-700' : 'text-[#77866E]'}`}>{reason}</span><span className="mt-1 block break-all text-[10px] text-[#98A28F]">{order.order_number}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-[#18794E]" />
              </button>
            ))}
          </div>
        </section>}
      </div>
    </header>
  );
}
