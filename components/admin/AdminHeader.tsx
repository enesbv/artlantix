'use client';

import React from 'react';
import { Search, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';

interface AdminHeaderProps {
  currentUser?: UserProfile | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  pendingReviewCount?: number;
}

export default function AdminHeader({
  currentUser,
  searchQuery,
  onSearchChange,
  pendingReviewCount = 0,
}: AdminHeaderProps) {
  const firstName = currentUser?.full_name?.split(' ')[0] || 'Elena';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#EAE8E3] bg-[#FAFAF8]/95 px-6 sm:px-8 backdrop-blur-md">
      {/* Left: Warm Greeting */}
      <div>
        <h1 className="text-base font-extrabold tracking-tight text-[#141414] sm:text-lg">
          İyi Çalışmalar {firstName}!
        </h1>
        <p className="text-[11px] font-medium text-[#737373]">
          Artlantix Vektör Üretim &amp; QA Masasına Hoş Geldiniz
        </p>
      </div>

      {/* Right: Search, Notifications, Client Switcher */}
      <div className="flex items-center gap-3">
        {/* Search Pill */}
        <div className="relative w-48 sm:w-64 md:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#999999]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Sipariş, müşteri veya proje ara..."
            className="h-9 w-full rounded-full border border-[#EAE8E3] bg-white pl-9 pr-4 text-xs text-[#141414] placeholder:text-[#999999] shadow-2xs transition-all focus:border-[#18794E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#18794E]/10"
          />
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE8E3] bg-white text-[#5E625F] hover:text-[#18794E] hover:border-[#18794E] transition-colors shadow-2xs"
            title={`${pendingReviewCount} sipariş inceleme bekliyor`}
          >
            <Bell className="h-4 w-4" />
            {pendingReviewCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                {pendingReviewCount}
              </span>
            )}
          </button>
        </div>

        {/* Switch to Client View Pill */}
        <Link
          href="/dashboard/orders"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#EAE8E3] bg-white px-3.5 py-1.5 text-xs font-bold text-[#5E625F] hover:text-[#102A20] hover:border-[#102A20] transition-colors shadow-2xs"
          title="Müşteri portalını görüntüle"
        >
          <ExternalLink className="h-3.5 w-3.5 text-[#18794E]" />
          <span>Müşteri Portalı</span>
        </Link>

        {/* Operator Badge Avatar */}
        <div className="flex items-center gap-2 rounded-full border border-[#EAE8E3] bg-white p-1 pl-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102A20] text-white text-[11px] font-bold">
            {firstName.charAt(0)}
          </div>
          <div className="hidden pr-2.5 text-left md:block">
            <span className="block text-[11px] font-bold leading-tight text-[#141414]">
              {currentUser?.full_name || 'Elena Vance'}
            </span>
            <span className="block text-[9px] font-semibold text-[#18794E]">
              Stüdyo Yöneticisi
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
