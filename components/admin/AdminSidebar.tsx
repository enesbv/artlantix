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
    <aside className="relative z-40 flex w-full lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 flex-col border-r border-rule bg-paper-2 text-ink">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-rule px-5 bg-paper-2">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Artlantix ana sayfa">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-white">
            <Sparkles className="h-4 w-4 text-signal-ink" />
          </div>
          <div>
            <span className="block text-sm font-extrabold tracking-tight text-ink">
              Artlantix <span className="text-signal-ink">Studio</span>
            </span>
            <span className="block text-[10px] font-semibold text-ink-3">
              Üretim Masası
            </span>
          </div>
        </Link>
        <button type="button" onClick={handleSignOut} aria-label="Çıkış yap" className="border border-rule-strong p-2 text-ink-3 lg:hidden"><LogOut className="h-4 w-4" /></button>

      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 lg:py-5">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">
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
                    ? 'bg-ink text-white'
                    : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-white' : 'text-ink-3 group-hover:text-signal-ink'
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
      <div className="hidden border-t border-rule bg-paper-2 p-3 lg:block">
        <div className="flex items-center justify-between border border-rule-strong bg-paper-2 p-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white font-bold text-xs shadow-2xs">
              {currentUser?.full_name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-ink">
                {currentUser?.full_name || 'Operatör'}
              </p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-signal-ink" />
                <span className="truncate text-[10px] font-medium text-ink-3">
                  Operatör
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Çıkış Yap"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-3 hover:bg-paper-2 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
