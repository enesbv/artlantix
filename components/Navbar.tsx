'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, LogOut, Menu, X } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Lockup } from '@/components/brand/Brand';
import { container } from '@/components/ui/styles';
import { getCurrentUser, signOutUser } from '@/lib/services/auth';
import { homeCopy } from '@/lib/home-copy';
import { UserProfile } from '@/lib/types';
import { localizedPath, normalizeMarketingLocale } from '@/lib/marketing';

// Underline that grows from the left on hover and focus, in the same orange as the hero swash.
const linkClass =
  'relative py-2 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-signal after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100';

export default function Navbar() {
  const t = useTranslations('nav');
  const lang = normalizeMarketingLocale(useLocale());
  const nav = homeCopy[lang].nav;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  // While the full-screen menu is open the page behind it must not scroll, and Escape closes it.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const publicLinks = [
    { href: `${localizedPath(lang, '/')}#work`, label: t('showcase') },
    { href: `${localizedPath(lang, '/')}#services`, label: t('capabilities') },
    { href: `${localizedPath(lang, '/')}#process`, label: t('process') },
    { href: `${localizedPath(lang, '/')}#pricing`, label: t('pricing') },
    { href: localizedPath(lang, '/guides'), label: t('guides') },
    { href: localizedPath(lang, '/faq'), label: t('faq') },
    { href: localizedPath(lang, '/business'), label: t('business') },
  ];

  const accountHref = user ? (user.is_admin ? '/admin/orders' : '/dashboard') : '/login';
  const accountLabel = user ? (user.is_admin ? t('productionQueue') : t('myOrders')) : t('signIn');

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setMobileOpen(false);
    router.push(localizedPath(lang, '/'));
  };

  return (
    <>
      <a href="#main" className="sr-only z-[60] bg-ink px-4 py-2 text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {nav.skip}
      </a>
      <header className="sticky top-0 z-50 border-b border-rule bg-paper/85 backdrop-blur-md">
        <div className={`${container} flex h-16 items-center justify-between gap-6`}>
          <Link href={localizedPath(lang, '/')} className="shrink-0 text-ink">
            <Lockup />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
            {publicLinks.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 xl:flex">
            <LanguageSwitcher />
            <Link href={accountHref} className={linkClass}>{accountLabel}</Link>
            {user && (
              <button type="button" onClick={signOut} title={t('signOut')} aria-label={t('signOut')} className="-ml-2 p-1.5 text-ink-2 transition-colors hover:text-ink">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <Link
              href={localizedPath(lang, '/quote')}
              className="group inline-flex items-center gap-2.5 rounded-full bg-ink py-2 pl-5 pr-2 text-[14px] font-semibold text-paper transition-colors duration-200 hover:bg-signal hover:text-ink"
            >
              {nav.quote}
              <span className="grid h-7 w-7 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? nav.close : nav.menu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="-mr-2 grid h-11 w-11 place-items-center text-ink xl:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[65px] z-40 overflow-y-auto bg-paper xl:hidden">
          <div className={`${container} pb-10 pt-4`}>
            <nav aria-label="Main" className="flex flex-col">
              {publicLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between border-b border-ink/80 py-4 font-display text-[1.75rem] font-bold tracking-[-0.02em]"
                >
                  {item.label}
                  <ArrowRight className="h-5 w-5 text-ink-3" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="mt-8 flex items-center justify-between gap-4">
              <LanguageSwitcher />
              <div className="flex items-center gap-4">
                <Link href={accountHref} onClick={() => setMobileOpen(false)} className="text-[15px] font-semibold underline decoration-signal decoration-2 underline-offset-[6px]">
                  {accountLabel}
                </Link>
                {user && (
                  <button type="button" onClick={signOut} aria-label={t('signOut')} className="p-1.5 text-ink-2">
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <Link
              href={localizedPath(lang, '/quote')}
              onClick={() => setMobileOpen(false)}
              className="group mt-8 flex items-center justify-between rounded-full bg-ink py-2.5 pl-7 pr-2.5 text-base font-semibold text-paper"
            >
              {nav.quote}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-signal text-ink">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
