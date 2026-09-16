'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { Order } from '@/lib/types';
import { getExpectedDelivery } from '@/lib/order-status';
import { useTranslations } from 'next-intl';
import {
  Search,
  ArrowRight,
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function OrdersListPage() {
  const t = useTranslations('ordersPage');
  const tStatus = useTranslations('orderStatus');
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 6;

  useEffect(() => {
    async function fetchOrders() {
      try {
        const user = await getCurrentUser();
        const list = await getOrders(user?.id);
        setOrders(list);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.project_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return order.status !== 'completed' && order.status !== 'cancelled';
    if (activeFilter === 'preview_ready') return order.status === 'preview_ready';
    if (activeFilter === 'in_review') return order.status === 'in_review' || order.status === 'quote_requested';
    if (activeFilter === 'completed') return order.status === 'completed';

    return true;
  });
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const visibleOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* Header & New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#141414]">
            {t('title')}
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            {t('description')}
          </p>
        </div>

        <Link
          href="/quote"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#115C3B] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t('newQuote')}</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#EAE8E3] bg-white p-4 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: t('all') },
            { id: 'active', label: t('active') },
            { id: 'preview_ready', label: t('preview') },
            { id: 'in_review', label: t('review') },
            { id: 'completed', label: t('completed') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeFilter === tab.id
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'bg-[#F9F8F6] text-[#737373] hover:bg-[#F5F4F0] hover:text-[#141414]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-[#737373]" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] py-2 pl-9 pr-3 text-xs text-[#141414] placeholder-[#737373] focus:border-[#141414] focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-[#EAE8E3] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div role="status" aria-label="Loading orders" className="space-y-3 p-5">
            {[1, 2, 3, 4].map((row) => <div key={row} className="h-16 animate-pulse rounded-xl bg-[#F1F0EC]" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-[#CCCCCC]" />
            <h3 className="mt-3 text-sm font-bold text-[#141414]">{t('emptyTitle')}</h3>
            <p className="mt-1 text-xs text-[#737373]">
              {searchQuery ? t('emptySearch') : t('emptyCategory')}
            </p>
            <Link
              href="/quote"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#115C3B]"
            >
              {t('startProject')}
            </Link>
          </div>
        ) : (
          <>
          <div className="divide-y divide-[#EAE8E3] md:hidden">
            {visibleOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block p-4 transition-colors hover:bg-[#F9F8F6]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#141414]">{order.project_name}</p>
                    <p className="mt-0.5 font-sans text-[10px] text-[#737373]">{order.order_number}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#EAE8E3] bg-[#F9F8F6] px-2 py-1 text-[10px] font-bold text-[#555]">
                    {tStatus(order.status)}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#737373]">
                  <span className="capitalize">{order.complexity} · {order.turnaround}</span>
                  <span className="text-right font-sans font-bold text-[#141414]">${order.final_price || order.estimated_price}</span>
                  <span>{t('expected')} {new Date(getExpectedDelivery(order)).toLocaleDateString()}</span>
                  <span className="flex items-center justify-end gap-1 font-bold text-[#18794E]">{t('manage')} <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EAE8E3] bg-[#F9F8F6] font-sans text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                <tr>
                  <th className="px-6 py-3.5">{t('orderNumber')}</th>
                  <th className="px-6 py-3.5">{t('project')}</th>
                  <th className="px-6 py-3.5">{t('type')}</th>
                  <th className="px-6 py-3.5">{t('complexity')}</th>
                  <th className="px-6 py-3.5">{t('status')}</th>
                  <th className="px-6 py-3.5">{t('turnaround')}</th>
                  <th className="px-6 py-3.5">{t('price')}</th>
                  <th className="px-6 py-3.5 text-right">{t('details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E3]">
                {visibleOrders.map((order) => {
                  const statusBadge = {
                    quote_requested: { label: tStatus('quote_requested'), bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                    in_review: { label: tStatus('in_review'), bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                    in_progress: { label: tStatus('in_progress'), bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                    preview_ready: { label: tStatus('preview_ready'), bg: 'bg-[#E9F9EE] text-[#18794E] border-[#B4DFC4] font-bold' },
                    approved: { label: tStatus('approved'), bg: 'bg-blue-50 text-blue-800 border-blue-200 font-bold' },
                    revision_requested: { label: tStatus('revision_requested'), bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
                    completed: { label: tStatus('completed'), bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
                    cancelled: { label: tStatus('cancelled'), bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                  }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                  return (
                    <tr key={order.id} className="hover:bg-[#F9F8F6] transition-colors">
                      <td className="px-6 py-4 font-sans font-bold text-[#141414]">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#141414]">{order.project_name}</div>
                        <div className="font-sans text-[10px] text-[#737373]">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-[#737373]">
                        {order.artwork_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 capitalize text-[#737373]">
                        {order.complexity}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[10px] border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#737373]">
                        {order.turnaround === 'express' ? (
                          <span className="font-semibold text-[#18794E]">{t('express')}</span>
                        ) : (
                          t('standard')
                        )}
                      </td>
                      <td className="px-6 py-4 font-sans font-semibold text-[#141414]">
                        ${order.final_price || order.estimated_price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-[#18794E] hover:underline"
                        >
                          <span>{t('manage')}</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
        {filteredOrders.length > pageSize && (
          <div className="flex items-center justify-between border-t border-[#EAE8E3] px-4 py-3 text-xs">
            <span className="text-[#737373]">{t('showing', { start: (page - 1) * pageSize + 1, end: Math.min(page * pageSize, filteredOrders.length), total: filteredOrders.length })}</span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg border border-[#EAE8E3] p-2 disabled:opacity-40" aria-label={t('previous')}><ChevronLeft className="h-4 w-4" /></button>
              <span className="font-sans">{page} / {pageCount}</span>
              <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-lg border border-[#EAE8E3] p-2 disabled:opacity-40" aria-label={t('next')}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
