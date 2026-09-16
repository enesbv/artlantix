'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, FileCheck, Layers, LogOut, Menu, ShieldCheck, Sliders, User, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getCurrentUser, signOutUser, switchDemoPersona } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isDemoModeEnabled } from '@/lib/runtime-mode';
import { localizedPath, normalizeMarketingLocale } from '@/lib/marketing';

export default function Navbar() {
  const t = useTranslations('nav');
  const lang = normalizeMarketingLocale(useLocale());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { getCurrentUser().then(setUser); }, [pathname]);

  const publicLinks = [
    { href: localizedPath(lang, '/services'), label: t('capabilities') },
    { href: localizedPath(lang, '/work'), label: t('showcase') },
    { href: `${localizedPath(lang, '/')}#process`, label: t('process') },
    { href: localizedPath(lang, '/pricing'), label: t('pricing') },
    { href: localizedPath(lang, '/guides'), label: t('guides') },
    { href: localizedPath(lang, '/faq'), label: t('faq') },
  ];

  const switchPersona = (type: 'customer' | 'operator') => {
    const updated = switchDemoPersona(type);
    setUser(updated);
    setPersonaOpen(false);
    router.push(type === 'operator' ? '/admin/orders' : '/dashboard/orders');
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    router.push(localizedPath(lang, '/'));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DAD8D2] bg-[#F9F8F6]/95 backdrop-blur-xl">
      <div className="border-b border-[#EAE8E3] bg-white/70 px-4 py-1.5 text-xs text-[#5E625F]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#18794E]" /><span className="truncate font-medium">{t('guarantee')}</span></span>
          <div className="relative flex shrink-0 items-center gap-3">
            <LanguageSwitcher />
            {!isSupabaseConfigured() && isDemoModeEnabled() && (
              <>
                <button onClick={() => setPersonaOpen(!personaOpen)} className="hidden items-center gap-1.5 rounded-md border border-[#DAD8D2] bg-white px-2.5 py-1 font-medium text-[#102A20] sm:inline-flex"><Sliders className="h-3 w-3 text-[#18794E]" />{user?.is_admin ? t('demoOperator') : user ? t('demoCustomer') : t('guest')}</button>
                {personaOpen && <div className="absolute right-0 top-8 z-50 w-64 rounded-xl border border-[#DAD8D2] bg-white p-2 shadow-xl"><button onClick={() => switchPersona('customer')} className="flex w-full gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F2]"><User className="mt-0.5 h-4 w-4" /><span><strong className="block text-xs">{t('clientAccount')}</strong><small className="text-[#5E625F]">{t('clientDescription')}</small></span></button><button onClick={() => switchPersona('operator')} className="flex w-full gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F2]"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#18794E]" /><span><strong className="block text-xs">{t('operatorAccount')}</strong><small className="text-[#5E625F]">{t('operatorDescription')}</small></span></button></div>}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={localizedPath(lang, '/')} className="group flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102A20]"><Layers className="h-4 w-4 text-[#78D5A6]" /></span><span><strong className="block text-lg leading-none tracking-tight text-[#102A20]">Artlantix</strong><small className="mt-1 block font-mono text-[8px] uppercase tracking-[0.2em] text-[#5E625F]">{t('studio')}</small></span></Link>
        <nav className="hidden items-center gap-6 text-xs font-semibold text-[#5E625F] lg:flex">{publicLinks.map((item) => <Link key={item.href} href={item.href} className="transition hover:text-[#18794E]">{item.label}</Link>)}</nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? <><Link href={user.is_admin ? '/admin/orders' : '/dashboard/orders'} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102A20]">{user.is_admin ? <FileCheck className="h-4 w-4 text-[#18794E]" /> : <Layers className="h-4 w-4" />}{user.is_admin ? t('productionQueue') : t('myOrders')}</Link><button onClick={signOut} title={t('signOut')} className="text-[#5E625F] hover:text-[#102A20]"><LogOut className="h-4 w-4" /></button></> : <Link href="/login" className="text-xs font-bold text-[#102A20] hover:text-[#18794E]">{t('signIn')}</Link>}
          <Link href={localizedPath(lang, '/quote')} className="inline-flex items-center gap-2 rounded-xl bg-[#18794E] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#115C3B]">{t('getQuote')}<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={t('toggleMenu')} className="rounded-lg p-2 text-[#102A20] lg:hidden">{mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
      </div>
      {mobileOpen && <div className="border-t border-[#DAD8D2] bg-white px-4 py-5 lg:hidden"><nav className="flex flex-col gap-4 text-sm font-bold text-[#102A20]">{publicLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{item.label}</Link>)}<div className="mt-1 border-t border-[#EAE8E3] pt-4">{user ? <Link href={user.is_admin ? '/admin/orders' : '/dashboard/orders'}>{user.is_admin ? t('productionQueue') : t('myOrders')}</Link> : <Link href="/login">{t('signIn')}</Link>}</div><Link href={localizedPath(lang, '/quote')} onClick={() => setMobileOpen(false)} className="mt-1 rounded-xl bg-[#18794E] px-5 py-3 text-center text-white">{t('getQuote')}</Link></nav></div>}
    </header>
  );
}
