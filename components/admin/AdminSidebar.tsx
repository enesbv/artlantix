'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  FileText,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { signOutUser } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';

interface AdminSidebarProps {
  currentUser?: UserProfile | null;
}

export default function AdminSidebar({
  currentUser,
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
      label: 'Siparişler',
      href: '/admin/orders',
      icon: Layers,
    },
    {
      id: 'content',
      label: 'Görsel CMS & Vitrin',
      href: '/admin/content',
      icon: FileText,
    },
  ];

  return (
    <aside className="relative z-40 flex w-full lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex-col border-r border-[#EAE8E3] bg-[#FAFAF8] text-[#141414]">
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
        <button type="button" onClick={handleSignOut} aria-label="Çıkış yap" className="rounded-lg border border-[#EAE8E3] p-2 text-[#737373] lg:hidden"><LogOut className="h-4 w-4" /></button>

      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 lg:py-5">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">
            Navigasyon
          </span>
        </div>
        <nav className="flex gap-2 lg:block lg:space-y-1">
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

              </Link>
            );
          })}
        </nav>

      </div>

      {/* Operator Profile Bottom Card */}
      <div className="hidden border-t border-[#EAE8E3] bg-white p-3 lg:block">
        <div className="flex items-center justify-between rounded-xl border border-[#EAE8E3] bg-[#FAFAF8] p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#18794E] text-white font-bold text-xs shadow-2xs">
              {currentUser?.full_name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#141414]">
                {currentUser?.full_name || 'Operatör'}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-[#18794E]" />
                <span className="truncate text-[10px] font-medium text-[#737373]">
                  Operatör
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
