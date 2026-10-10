'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';
import { Lockup } from '@/components/brand/Brand';
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
      <div className="min-h-screen bg-paper text-ink">
        <header className="border-b border-ink bg-paper-2">
          <div className="mx-auto flex min-h-20 max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <Link href="/dashboard" className="flex items-center gap-3 text-ink">
              <Lockup />
              <span className="hidden border-l border-rule-strong pl-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3 sm:inline">{copy.tracking}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <OrderNotifications />
              <details key={pathname} className="relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 border border-ink px-3 py-2.5 text-[13px] font-semibold [&::-webkit-details-marker]:hidden">{copy.account}<ChevronDown className="h-3.5 w-3.5" /></summary>
                <nav aria-label={copy.account} className="absolute right-0 top-12 z-40 w-56 border border-ink bg-paper-2 p-2 shadow-[0_24px_50px_-28px_rgb(21_23_28/0.55)]">
                  <Link href="/dashboard" className="block px-3 py-2.5 text-[13px] hover:bg-paper-3">{copy.tracking}</Link>
                  <Link href="/dashboard/account" className="block px-3 py-2.5 text-[13px] hover:bg-paper-3">{copy.account}</Link>
                  <Link href="/dashboard/artwork" className="block px-3 py-2.5 text-[13px] hover:bg-paper-3">{copy.archive}</Link>
                  {user?.account_type === 'business' && <Link href="/dashboard/business" className="block px-3 py-2.5 text-[13px] hover:bg-paper-3">{copy.business}</Link>}
                  {user?.is_admin && <Link href="/admin/orders" className="block px-3 py-2.5 text-[13px] hover:bg-paper-3">Admin</Link>}
                  <button type="button" disabled={signingOut} onClick={async () => { setSigningOut(true); try { await signOutUser(); router.push('/login'); } finally { setSigningOut(false); } }} className="flex w-full items-center gap-2 rounded-lg border-t border-rule px-3 py-2.5 text-left text-xs hover:bg-paper disabled:opacity-50"><LogOut className="h-3.5 w-3.5" />{copy.logout}</button>
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
