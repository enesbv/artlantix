'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { Order } from '@/lib/types';
import {
  Search,
  ArrowRight,
  Plus,
  Layers,
} from 'lucide-react';

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      const user = await getCurrentUser();
      const list = await getOrders(user?.id);
      setOrders(list);
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

  return (
    <div className="space-y-8">
      {/* Header & New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#141414]">
            Order History &amp; Projects
          </h1>
          <p className="text-xs text-[#737373] mt-1">
            Review artwork reconstructions, track revisions, and access production vector downloads.
          </p>
        </div>

        <Link
          href="/quote"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#E05328] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#C8461D] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Project Quote</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#EAE8E3] bg-white p-4 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'active', label: 'Active In-Progress' },
            { id: 'preview_ready', label: 'Preview Ready' },
            { id: 'in_review', label: 'In Review' },
            { id: 'completed', label: 'Completed Masters' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
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
            placeholder="Search order # or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] py-2 pl-9 pr-3 text-xs text-[#141414] placeholder-[#737373] focus:border-[#141414] focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-[#EAE8E3] bg-white shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-[#CCCCCC]" />
            <h3 className="mt-3 text-sm font-bold text-[#141414]">No orders found</h3>
            <p className="mt-1 text-xs text-[#737373]">
              {searchQuery ? 'No orders match your search query.' : 'You have no orders in this category.'}
            </p>
            <Link
              href="/quote"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#E05328] px-4 py-2 text-xs font-bold text-white hover:bg-[#C8461D]"
            >
              Start New Project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#EAE8E3] bg-[#F9F8F6] font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                <tr>
                  <th className="px-6 py-3.5">Order #</th>
                  <th className="px-6 py-3.5">Project Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Complexity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Turnaround</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE8E3]">
                {filteredOrders.map((order) => {
                  const statusBadge = {
                    quote_requested: { label: 'Quote Requested', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
                    in_review: { label: 'In Review', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
                    in_progress: { label: 'In Progress', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
                    preview_ready: { label: 'Preview Ready', bg: 'bg-[#FDF3F0] text-[#E05328] border-[#F6CEBF] font-bold' },
                    revision_requested: { label: 'Revision Requested', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
                    completed: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' },
                    cancelled: { label: 'Cancelled', bg: 'bg-gray-100 text-gray-700 border-gray-200' },
                  }[order.status] || { label: order.status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };

                  return (
                    <tr key={order.id} className="hover:bg-[#F9F8F6] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#141414]">
                        {order.order_number}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#141414]">{order.project_name}</div>
                        <div className="font-mono text-[10px] text-[#737373]">{new Date(order.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 capitalize text-[#737373]">
                        {order.artwork_type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 capitalize text-[#737373]">
                        {order.complexity}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] border ${statusBadge.bg}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#737373]">
                        {order.turnaround === 'express' ? (
                          <span className="font-semibold text-[#E05328]">Express (&lt;16h)</span>
                        ) : (
                          'Standard (24–48h)'
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-[#141414]">
                        ${order.final_price || order.estimated_price}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-[#E05328] hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
