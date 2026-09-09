'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AccessGate from '@/components/AccessGate';
import OrderNotifications from '@/components/OrderNotifications';
import { getCurrentUser } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Layers,
  Archive,
  Building2,
  User,
  ShieldCheck,
  Plus,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => {
      setUser(u);
    });
  }, [pathname]);

  const navItems = [
    { label: t('overview'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('orders'), href: '/dashboard/orders', icon: Layers },
    { label: t('vault'), href: '/dashboard/artwork', icon: Archive },
    { label: t('business'), href: '/dashboard/business', icon: Building2 },
    { label: t('account'), href: '/dashboard/account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      <Navbar />

      <div className="border-b border-[#EAE8E3] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#141414]">
                  {t('title')}
                </h1>
                {user?.account_type === 'business' && (
                  <span className="rounded-full bg-[#E9F9EE] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#18794E] border border-[#B4DFC4]">
                    {t('partner')}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] mt-1">
                {t('loggedIn')} <strong className="text-[#141414]">{user?.full_name || t('client')}</strong> ({user?.email})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <OrderNotifications />
              {user?.is_admin && (
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs font-bold text-[#141414] hover:border-[#141414] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#18794E]" />
                  <span>{t('adminDesk')}</span>
                </Link>
              )}

              <Link
                href="/quote"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#115C3B] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('newQuote')}</span>
              </Link>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="flex space-x-6 overflow-x-auto border-t border-[#EAE8E3]/60 pt-1 pb-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 border-b-2 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-[#18794E] text-[#18794E] font-bold'
                      : 'border-transparent text-[#737373] hover:border-[#CCCCCC] hover:text-[#141414]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <AccessGate>{children}</AccessGate>
      </main>
    </div>
  );
}
