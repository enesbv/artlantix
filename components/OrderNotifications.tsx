'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth';
import { getOrders } from '@/lib/services/orders';
import { Order } from '@/lib/types';
import { useTranslations } from 'next-intl';
import { getExpectedDelivery } from '@/lib/order-status';

const DISMISSED_KEY = 'artlantix_dismissed_notifications';

export default function OrderNotifications() {
  const t = useTranslations('dashboard');
  const tStatus = useTranslations('orderStatus');
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]'); } catch { return []; }
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => getCurrentUser()
      .then((user) => user ? getOrders(user.id) : [])
      .then((nextOrders) => { setOrders(nextOrders); setCurrentTime(Date.now()); })
      .catch(() => setOrders([]));
    void load();
    const interval = window.setInterval(load, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const isOverdue = (order: Order) => !['completed', 'cancelled'].includes(order.status)
    && currentTime > 0 && new Date(getExpectedDelivery(order)).getTime() < currentTime;
  const items = orders.filter((order) => ['preview_ready', 'completed', 'revision_requested'].includes(order.status) || isOverdue(order))
    .filter((order) => !dismissed.includes(`${order.id}:${order.status}`));

  const dismiss = (order: Order) => {
    const next = [...dismissed, `${order.id}:${order.status}`];
    setDismissed(next);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  };

  return (
    <div className="relative" ref={rootRef}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={t('notificationCount', { count: items.length })} className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#EAE8E3] bg-white text-[#141414] hover:bg-[#F5F4F0]">
        <Bell className="h-4 w-4" />
        {items.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#18794E] px-1 text-center text-[9px] font-bold leading-4 text-white">{items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-[#EAE8E3] bg-white p-2 shadow-xl">
          <div className="px-2 py-2 text-xs font-bold">{t('updates')}</div>
          {items.length === 0 ? <p className="px-2 py-5 text-center text-xs text-[#737373]">{t('caughtUp')}</p> : items.slice(0, 6).map((order) => (
            <div key={`${order.id}:${order.status}`} className="flex gap-2 rounded-lg p-2 hover:bg-[#F9F8F6]">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#18794E]" />
              <Link href={`/dashboard/orders/${order.id}`} onClick={() => setOpen(false)} className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">{order.project_name}</span>
                <span className={`block text-[11px] ${isOverdue(order) ? 'font-semibold text-red-700' : 'text-[#737373]'}`}>{isOverdue(order) ? t('overdue') : tStatus(order.status)}</span>
              </Link>
              <button type="button" onClick={() => dismiss(order)} aria-label={t('dismissNotification', { project: order.project_name })} className="h-6 p-1 text-[#737373] hover:text-[#141414]"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
