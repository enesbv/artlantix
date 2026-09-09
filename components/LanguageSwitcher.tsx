'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { persistLocale } from '@/lib/locale';
import { useLocale } from 'next-intl';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', short: 'DE', flag: '🇩🇪' },
  { code: 'tr', label: 'Türkçe', short: 'TR', flag: '🇹🇷' },
];

export default function LanguageSwitcher({ currentLocale }: { currentLocale?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const contextLocale = useLocale();
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        className="inline-flex items-center gap-1.5 rounded-md border border-[#EAE8E3] bg-white px-2.5 py-1 font-mono text-xs font-semibold text-[#141414] shadow-xs transition-colors hover:border-[#141414] focus:outline-hidden"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-3 w-3 text-[#737373]" />
        <span>{activeLang.short}</span>
        <span className="text-[9px] text-[#737373]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 z-50 mt-1 w-36 rounded-xl border border-[#EAE8E3] bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#737373]">
            Language
          </div>
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === activeLocale;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#F5F4F0] font-bold text-[#141414]'
                    : 'text-[#737373] hover:bg-[#F9F8F6] hover:text-[#141414]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                <span className="font-mono text-[10px] text-[#737373] uppercase">{lang.short}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
