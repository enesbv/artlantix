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

export default function Navbar() {
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
            <span className="font-medium text-[#0F172A]">100% Hand-Crafted Studio Reconstruction</span>
            <span className="hidden sm:inline text-[#CBD5E1]">·</span>
            <span className="hidden sm:inline">Zero auto-trace shortcuts</span>
          </div>

          <div className="relative flex items-center gap-3">
            <LanguageSwitcher />
            <div className="hidden sm:block h-3.5 w-px bg-[#E2E8F0]" />
            {!isSupabaseConfigured() && <>
            <span className="hidden md:inline text-[11px] text-[#475569]">Demo:</span>
            <button
              onClick={() => setPersonaOpen(!personaOpen)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-0.5 text-xs font-medium text-[#0F172A] hover:border-[#0F172A] transition-colors"
            >
              <Sliders className="h-3 w-3 text-[#D94A26]" />
              <span>{user?.is_admin ? 'Elena (Senior QA Lead)' : user ? 'Alex (Studio Client)' : 'Guest Mode'}</span>
              <span className="text-[9px] text-[#475569]">▼</span>
            </button>

            {personaOpen && (
              <div className="absolute right-0 top-7 z-50 w-64 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-lg">
                <p className="px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#475569]">
                  Switch Demo Account
                </p>
                <button
                  onClick={() => handleSwitchPersona('customer')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F9] transition-colors"
                >
                  <User className="h-4 w-4 mt-0.5 text-[#0F172A]" />
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">Client Account</div>
                    <div className="text-[10px] text-[#475569]">Alex Morgan (Client Portal &amp; Vault)</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSwitchPersona('operator')}
                  className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-[#F1F5F9] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-[#D94A26]" />
                  <div>
                    <div className="text-xs font-semibold text-[#0F172A]">Senior Operator / QA</div>
                    <div className="text-[10px] text-[#475569]">Elena Vance (Production Queue)</div>
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
            <Layers className="h-4 w-4 text-[#D94A26]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#0F172A]">
              Artlantix
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#475569] -mt-1 font-mono">
              Artwork Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-[#475569]">
          <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
            Capabilities
          </Link>
          <Link href="/#before-after" className="hover:text-[#0F172A] transition-colors">
            Showcase
          </Link>
          <Link href="/#how-it-works" className="hover:text-[#0F172A] transition-colors">
            Process
          </Link>
          <Link href="/#moat" className="hover:text-[#0F172A] transition-colors">
            Why Manual
          </Link>
          <Link href="/#pricing" className="hover:text-[#0F172A] transition-colors">
            Pricing
          </Link>
          <Link href="/dashboard/business" className="hover:text-[#0F172A] transition-colors">
            For Business
          </Link>
          <Link href="/#faq" className="hover:text-[#0F172A] transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.is_admin ? (
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#D94A26] transition-colors"
                >
                  <FileCheck className="h-4 w-4 text-[#D94A26]" />
                  <span>Production Queue</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/orders"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-[#D94A26] transition-colors"
                >
                  <Layers className="h-4 w-4 text-[#0F172A]" />
                  <span>My Orders</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                className="text-xs font-medium text-[#475569] hover:text-[#0F172A] transition-colors"
              >
                Portal
              </Link>

              <button
                onClick={handleSignOut}
                className="text-[#475569] hover:text-[#0F172A] transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>

              <Link
                href="/quote"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D94A26] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B93816] transition-colors"
              >
                <span>New Project Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-xs font-semibold text-[#0F172A] hover:text-[#D94A26] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D94A26] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B93816] transition-colors"
              >
                <span>Get Instant Quote</span>
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
            aria-label="Toggle Menu"
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
              <span className="font-mono text-xs text-[#475569]">Studio Language</span>
              <LanguageSwitcher />
            </div>
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              Capabilities
            </Link>
            <Link
              href="/#before-after"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              Showcase
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              Process
            </Link>
            <Link
              href="/#moat"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              Why Manual
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              Pricing
            </Link>
            <Link
              href="/dashboard/business"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              For Business
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-[#0F172A]"
            >
              FAQ
            </Link>

            <div className="mt-2 border-t border-[#E2E8F0] pt-3 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.is_admin ? "/admin/orders" : "/dashboard/orders"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-semibold text-[#0F172A]"
                  >
                    {user.is_admin ? "Operator Production Queue" : "My Orders"}
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-[#475569]"
                  >
                    Client Portal
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-[#0F172A]"
                >
                  Log In
                </Link>
              )}
              <Link
                href="/quote"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-[#D94A26] py-2.5 text-xs font-semibold text-white hover:bg-[#B93816]"
              >
                Get Instant Quote
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
