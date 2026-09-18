'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, FileCheck, Layers, LogOut, Menu, X, ShieldCheck, User } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getCurrentUser, signOutUser, switchDemoPersona } from '@/lib/services/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isDemoModeEnabled } from '@/lib/runtime-mode';
import { UserProfile } from '@/lib/types';
import { localizedPath, normalizeMarketingLocale } from '@/lib/marketing';

export default function Navbar() {
  const t = useTranslations('nav');
  const lang = normalizeMarketingLocale(useLocale());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  const publicLinks = [
    { href: localizedPath(lang, '/business'), label: t('business') },
    { href: `${localizedPath(lang, '/')}#services`, label: t('capabilities') },
    { href: `${localizedPath(lang, '/')}#work`, label: t('showcase') },
    { href: `${localizedPath(lang, '/')}#process`, label: t('process') },
    { href: `${localizedPath(lang, '/')}#pricing`, label: t('pricing') },
    { href: localizedPath(lang, '/guides'), label: t('guides') },
    { href: `${localizedPath(lang, '/')}#faq`, label: t('faq') },
  ];

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    router.push(localizedPath(lang, '/'));
  };

  const handleSwitchPersona = (role: 'customer' | 'operator') => {
    const updated = switchDemoPersona(role);
    setUser(updated);
    if (role === 'operator') {
      router.push('/admin/orders');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DAD8D2] bg-[#F9F8F6]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={localizedPath(lang, '/')} className="group flex items-center gap-3">
          <strong className="block text-lg leading-none tracking-tight text-[#102A20]">Artlantix</strong>
        </Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold text-[#5E625F] lg:flex">
          {publicLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#18794E]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {/* Demo Persona 1-Click Switcher */}
          {!isSupabaseConfigured() && isDemoModeEnabled() && (
            <div className="flex items-center rounded-lg border border-[#DAD8D2] bg-[#F4F3EF] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSwitchPersona('customer')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-bold transition-all ${
                  user && !user.is_admin
                    ? 'bg-white text-[#102A20] shadow-xs'
                    : 'text-[#5E625F] hover:text-[#102A20]'
                }`}
                title="Müşteri Portalı (Alex Morgan)"
              >
                <User className="h-3 w-3" />
                <span>Müşteri</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPersona('operator')}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-bold transition-all ${
                  user?.is_admin
                    ? 'bg-[#18794E] text-white shadow-xs'
                    : 'text-[#5E625F] hover:text-[#18794E]'
                }`}
                title="Admin / Operatör Kuyruğu (Elena Vance)"
              >
                <ShieldCheck className="h-3 w-3" />
                <span>Operatör (Admin)</span>
              </button>
            </div>
          )}

          <LanguageSwitcher />

          {user ? (
            <>
              <Link
                href={user.is_admin ? '/admin/orders' : '/dashboard'}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102A20]"
              >
                {user.is_admin ? (
                  <FileCheck className="h-4 w-4 text-[#18794E]" />
                ) : (
                  <Layers className="h-4 w-4" />
                )}
                {user.is_admin ? t('productionQueue') : t('myOrders')}
              </Link>
              <button onClick={signOut} title={t('signOut')} className="text-[#5E625F] hover:text-[#102A20]">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className="text-xs font-bold text-[#102A20] hover:text-[#18794E]">
              {t('signIn')}
            </Link>
          )}

          <Link
            href={localizedPath(lang, '/quote')}
            className="inline-flex items-center gap-2 rounded-xl bg-[#18794E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#115C3B]"
          >
            {t('getQuote')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={t('toggleMenu')}
          className="rounded-lg p-2 text-[#102A20] lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-[#DAD8D2] bg-white px-4 py-5 lg:hidden">
          <nav className="flex flex-col gap-4 text-sm font-bold text-[#102A20]">
            {!isSupabaseConfigured() && isDemoModeEnabled() && (
              <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-3">
                <span className="text-xs text-[#5E625F]">Demo Rolü:</span>
                <div className="flex items-center rounded-lg border border-[#DAD8D2] bg-[#F4F3EF] p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => { handleSwitchPersona('customer'); setMobileOpen(false); }}
                    className={`rounded-md px-2.5 py-1 ${user && !user.is_admin ? 'bg-white font-bold shadow-xs' : 'text-[#5E625F]'}`}
                  >
                    Müşteri
                  </button>
                  <button
                    type="button"
                    onClick={() => { handleSwitchPersona('operator'); setMobileOpen(false); }}
                    className={`rounded-md px-2.5 py-1 ${user?.is_admin ? 'bg-[#18794E] text-white font-bold shadow-xs' : 'text-[#5E625F]'}`}
                  >
                    Operatör
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-4">
              <span>{t('language')}</span>
              <LanguageSwitcher />
            </div>
            {publicLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-[#EAE8E3] pt-4">
              {user ? (
                <Link href={user.is_admin ? '/admin/orders' : '/dashboard'} onClick={() => setMobileOpen(false)}>
                  {user.is_admin ? t('productionQueue') : t('myOrders')}
                </Link>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}>{t('signIn')}</Link>
              )}
            </div>
            <Link
              href={localizedPath(lang, '/quote')}
              onClick={() => setMobileOpen(false)}
              className="mt-1 rounded-xl bg-[#18794E] px-5 py-3 text-center text-white"
            >
              {t('getQuote')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
