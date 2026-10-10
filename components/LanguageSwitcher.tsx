'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, ChevronDown } from 'lucide-react';
import { persistLocale } from '@/lib/locale';
import { useLocale, useTranslations } from 'next-intl';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'de', label: 'Deutsch', short: 'DE' },
  { code: 'tr', label: 'Türkçe', short: 'TR' },
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const contextLocale = useLocale();
  const t = useTranslations('nav');
  const rawPathname = usePathname() || '/';
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derive locale automatically if not explicitly provided
  let activeLocale = currentLocale || contextLocale;
  if (!activeLocale) {
    if (rawPathname.startsWith('/de/') || rawPathname === '/de') {
      activeLocale = 'de';
    } else if (rawPathname.startsWith('/tr/') || rawPathname === '/tr') {
      activeLocale = 'tr';
    } else {
      activeLocale = 'en';
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const activeLang = LANGUAGES.find((l) => l.code === activeLocale) || LANGUAGES[0];

  const handleSelectLanguage = (targetLocale: string) => {
    setIsOpen(false);
    if (targetLocale === activeLocale) return;

    // Strip existing locale prefix (/de or /tr or /en) from rawPathname
    let unlocalizedPath = rawPathname;
    if (unlocalizedPath.startsWith('/de/') || unlocalizedPath === '/de') {
      unlocalizedPath = unlocalizedPath.replace(/^\/de/, '') || '/';
    } else if (unlocalizedPath.startsWith('/tr/') || unlocalizedPath === '/tr') {
      unlocalizedPath = unlocalizedPath.replace(/^\/tr/, '') || '/';
    } else if (unlocalizedPath.startsWith('/en/') || unlocalizedPath === '/en') {
      unlocalizedPath = unlocalizedPath.replace(/^\/en/, '') || '/';
    }

    // Target path: for default 'en', keep unlocalized; for 'de'/'tr', prepend prefix
    let newPath = unlocalizedPath;
    if (targetLocale !== 'en') {
      newPath = `/${targetLocale}${unlocalizedPath === '/' ? '' : unlocalizedPath}`;
    }

    // Private and auth routes are not locale-prefixed; update their provider in place.
    if (unlocalizedPath.startsWith('/admin') || unlocalizedPath.startsWith('/dashboard') || unlocalizedPath.startsWith('/login') || unlocalizedPath.startsWith('/signup')) {
      persistLocale(targetLocale);
      router.refresh();
      return;
    }

    if (!['/', '/quote'].includes(unlocalizedPath)) {
      newPath = targetLocale === 'en' ? '/' : `/${targetLocale}`;
    }
    persistLocale(targetLocale);
    router.push(`${newPath}${window.location.search}${window.location.hash}`);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 items-center gap-1.5 border border-ink bg-paper-2 px-3 text-[13px] font-semibold tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-paper"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${t('language')}: ${activeLang.label}`}
      >
        <span>{activeLang.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 border border-ink bg-paper-2 shadow-[5px_5px_0_0_var(--color-ink)]">
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === activeLocale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                aria-current={isSelected ? 'true' : undefined}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-[14px] transition-colors hover:bg-paper-3 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-rule ${isSelected ? 'font-semibold text-ink' : 'text-ink-2'}`}
              >
                <span>{lang.label}</span>
                {isSelected ? <Check className="h-4 w-4 text-signal-ink" aria-hidden="true" /> : <span className="text-[11px] font-semibold tracking-[0.06em] text-ink-3">{lang.short}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
