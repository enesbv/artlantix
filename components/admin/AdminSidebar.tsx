'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  FileText,
  ExternalLink,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { signOutUser } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';

interface AdminSidebarProps {
  currentUser?: UserProfile | null;
  ordersNeedingReviewCount?: number;
}

export default function AdminSidebar({
  currentUser,
  ordersNeedingReviewCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/login');
  };

  const navItems = [
    {
      id: 'overview',
      label: 'Genel Bakış & Kuyruk',
      href: '/admin/orders',
      icon: Layers,
      badge: ordersNeedingReviewCount > 0 ? `${ordersNeedingReviewCount}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'content',
      label: 'Görsel CMS & Vitrin',
      href: '/admin/content',
      icon: FileText,
      badge: null,
    },
    {
      id: 'client_portal',
      label: 'Müşteri Görünümü',
      href: '/dashboard/orders',
      icon: ExternalLink,
      badge: null,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#EAE8E3] bg-[#FAFAF8] text-[#141414]">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#EAE8E3] px-5 bg-white">
        <Link href="/admin/orders" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102A20] text-white shadow-xs">
            <Sparkles className="h-4 w-4 text-[#18794E]" />
          </div>
          <div>
            <span className="block text-sm font-extrabold tracking-tight text-[#102A20]">
              Artlantix <span className="text-[#18794E]">Studio</span>
            </span>
            <span className="block text-[10px] font-semibold text-[#737373]">
              Üretim Masası
            </span>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Collapse menu"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#EAE8E3] bg-white text-[#737373] hover:text-[#141414] hover:border-[#102A20] transition-colors"
          title="Menüyü daralt"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
            Navigasyon
          </span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#18794E] text-white shadow-xs'
                    : 'text-[#5E625F] hover:bg-white hover:text-[#102A20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-[#737373] group-hover:text-[#18794E]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-[#18794E]' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Shift Status */}
        <div className="mt-8 rounded-xl border border-[#EAE8E3] bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-[#141414]">Stüdyo Mesaisi Açık</span>
          </div>
          <p className="mt-1 text-[10px] text-[#737373]">
            Vektör sanatçıları şu an aktif çizim masasında (09:00–19:00).
          </p>
          <div className="mt-2.5 flex items-center justify-between border-t border-[#F0EFEB] pt-2 text-[10px] text-[#737373]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#18794E]" />
              SLA Hedefi: &lt;16s Express
            </span>
          </div>
        </div>
      </div>

      {/* Operator Profile Bottom Card */}
      <div className="border-t border-[#EAE8E3] bg-white p-3">
        <div className="flex items-center justify-between rounded-xl border border-[#EAE8E3] bg-[#FAFAF8] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18794E] text-white font-bold text-xs shadow-2xs">
              {currentUser?.full_name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#141414]">
                {currentUser?.full_name || 'Elena Vance'}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#18794E]" />
                <span className="truncate text-[10px] font-medium text-[#737373]">
                  Production Lead
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Çıkış Yap"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#737373] hover:bg-white hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
