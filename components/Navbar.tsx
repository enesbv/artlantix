'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, signOutUser, switchDemoPersona } from '@/lib/services/auth';
import { UserProfile } from '@/lib/types';
import {
  Menu,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  Sliders,
  LogOut,
  FileCheck,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const t = useTranslations('nav');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaOpen, setPersonaOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  const handleSwitchPersona = (type: 'customer' | 'operator') => {
    const updated = switchDemoPersona(type);
    setUser(updated);
    setPersonaOpen(false);
    if (type === 'operator') {
      router.push('/admin/orders');
    } else {
      router.push('/dashboard/orders');
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md">
      {/* Top micro-bar for Demo Switcher & Studio Assurance */}
      <div className="border-b border-[#E2E8F0]/60 bg-[#F8FAFC] px-4 py-1.5 text-xs text-[#475569]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
            <span className="font-medium text-[#0F172A]">{t('guarantee')}</span>
          </div>

          <div className="relative flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden sm:block h-3.5 w-px bg-[#E2E8F0]" />
            {!isSupabaseConfigured() && <>
            <span className="hidden md:inline text-[11px] text-[#475569]">{t('persona')}:</span>
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-0.5 text-xs font-medium text-[#0F172A] hover:border-[#0F172A] transition-colors"
            >
              <Sliders className="h-3 w-3 text-[#18794E]" />
              <span>{user?.is_admin ? t('demoOperator') : user ? t('demoCustomer') : t('guest')}</span>
              <span className="text-[9px] text-[#475569]">▼</span>
            </button>

            {personaOpen && (
              <div className="absolute right-0 top-7 z-50 w-64 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-lg">
                <p className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
                  {t('switchDemo')}
                </p>
                <button
                  onClick={() => handleSwitchPersona('customer')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F9] transition-colors"
                >
                  <User className="h-4 w-4 mt-0.5 text-[#0F172A]" />
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">{t('clientAccount')}</div>
                    <div className="text-[10px] text-[#475569]">{t('clientDescription')}</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitchPersona('operator')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F9] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-[#18794E]" />
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">{t('operatorAccount')}</div>
                    <div className="text-[10px] text-[#475569]">{t('operatorDescription')}</div>
                  </div>
                </button>
              </div>
            )}
            </>}
          </div>
        </div>
      </div>

      {/* Main Studio Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Wordmark */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0F172A] bg-[#0F172A] text-white transition-transform group-hover:scale-105">
            <Layers className="h-4 w-4 text-[#18794E]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#0F172A]">
              Artlantix
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#475569] -mt-1 font-mono">
              {t('studio')}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#475569]">
          <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
            {t('capabilities')}
          </Link>
          <Link href="/#before-after" className="hover:text-[#0F172A] transition-colors">
            {t('showcase')}
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#0F172A] transition-colors">
            {t('process')}
          </Link>
          <Link href="/#moat" className="hover:text-[#0F172A] transition-colors">
            {t('whyManual')}
          </Link>
          <Link href="/#pricing" className="hover:text-[#0F172A] transition-colors">
            {t('pricing')}
          </Link>
          <Link href="/dashboard/business" className="hover:text-[#0F172A] transition-colors">
            {t('forBusiness')}
          </Link>
          <Link href="/#faq" className="hover:text-[#0F172A] transition-colors">
            {t('faq')}
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.is_admin ? (
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#18794E] transition-colors"
                >
                  <FileCheck className="h-4 w-4 text-[#18794E]" />
                  <span>{t('productionQueue')}</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#18794E] transition-colors"
                >
                  <Layers className="h-4 w-4 text-[#0F172A]" />
                  <span>{t('myOrders')}</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                {t('portal')}
              </Link>

              <button
                onClick={handleSignOut}
                className="text-[#475569] hover:text-[#0F172A] transition-colors"
                title={t('signOut')}
              >
                <LogOut className="h-4 w-4" />
              </button>

              <Link
                href="/quote"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#115C3B] transition-colors"
              >
                <span>{t('getQuote')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#18794E] transition-colors"
              >
                {t('signIn')}
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#115C3B] transition-colors"
              >
                <span>{t('getQuote')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded p-2 text-[#0F172A] hover:bg-[#F1F5F9]"
            aria-label={t('toggleMenu')}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E2E8F0] bg-white px-4 py-4 sm:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <span className="font-mono text-xs text-[#475569]">{t('language')}</span>
              <LanguageSwitcher />
            </div>
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('capabilities')}
            </Link>
            <Link
              href="/#before-after"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('showcase')}
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('process')}
            </Link>
            <Link
              href="/#moat"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('whyManual')}
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('pricing')}
            </Link>
            <Link
              href="/dashboard/business"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('forBusiness')}
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              {t('faq')}
            </Link>

            <div className="mt-2 border-t border-[#E2E8F0] pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.is_admin ? "/admin/orders" : "/dashboard/orders"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-[#0F172A]"
                  >
                    {user.is_admin ? t('productionQueue') : t('myOrders')}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-[#475569]"
                  >
                    {t('portal')}
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#0F172A]"
                >
                    {t('signIn')}
                </Link>
              )}
              <Link
                href="/quote"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-[#18794E] py-2.5 text-xs font-semibold text-white hover:bg-[#115C3B]"
              >
                {t('getQuote')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
