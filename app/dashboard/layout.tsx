'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import AccessGate from '@/components/AccessGate';
import OrderNotifications from '@/components/OrderNotifications';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getCurrentUser, signOutUser } from '@/lib/services/auth';
import { trackingCopy } from '@/lib/customer-tracking';
import type { UserProfile } from '@/lib/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const lang = locale === 'tr' || locale === 'de' ? locale : 'en';
  const copy = trackingCopy[lang];
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    let active = true;
    getCurrentUser().then((nextUser) => { if (active) setUser(nextUser); }).catch(() => undefined);
    return () => { active = false; };
  }, [pathname]);

  return (
    <AccessGate>
      <div className="min-h-screen bg-[#F7F9F4] text-[#183D28]">
        <header className="border-b border-[#E1E7DA] bg-white">
          <div className="mx-auto flex min-h-20 max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/dashboard" className="flex flex-col gap-1"><span className="text-lg font-bold tracking-tight text-[#102A20]">Artlantix</span><span className="text-[11px] text-[#8B9781]">{copy.tracking}</span></Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <OrderNotifications />
              <details key={pathname} className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-[#E1E7DA] px-3 py-2.5 text-xs font-medium [&::-webkit-details-marker]:hidden">{copy.account}<ChevronDown className="h-3.5 w-3.5" /></summary>
                <nav aria-label={copy.account} className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-[#E1E7DA] bg-white p-2 shadow-lg">
                  <Link href="/dashboard" className="block rounded-lg px-3 py-2.5 text-xs hover:bg-[#F5F7F2]">{copy.tracking}</Link>
                  <Link href="/dashboard/account" className="block rounded-lg px-3 py-2.5 text-xs hover:bg-[#F5F7F2]">{copy.account}</Link>
                  <Link href="/dashboard/artwork" className="block rounded-lg px-3 py-2.5 text-xs hover:bg-[#F5F7F2]">{copy.archive}</Link>
                  {user?.account_type === 'business' && <Link href="/dashboard/business" className="block rounded-lg px-3 py-2.5 text-xs hover:bg-[#F5F7F2]">{copy.business}</Link>}
                  {user?.is_admin && <Link href="/admin/orders" className="block rounded-lg px-3 py-2.5 text-xs hover:bg-[#F5F7F2]">Admin</Link>}
                  <button type="button" disabled={signingOut} onClick={async () => { setSigningOut(true); try { await signOutUser(); router.push('/login'); } finally { setSigningOut(false); } }} className="flex w-full items-center gap-2 rounded-lg border-t border-[#E8EDE4] px-3 py-2.5 text-left text-xs hover:bg-[#F5F7F2] disabled:opacity-50"><LogOut className="h-3.5 w-3.5" />{copy.logout}</button>
                </nav>
              </details>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
      </div>
    </AccessGate>
  );
}
