'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck } from 'lucide-react';
import DeliverableBadge from '@/components/DeliverableBadge';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#F1F5F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0F172A] bg-[#0F172A] text-white">
                <Layers className="h-4 w-4 text-[#18794E]" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#0F172A]">
                Artlantix
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#475569] max-w-sm">
              {t('description')}
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
              <ShieldCheck className="h-4 w-4 text-[#18794E]" />
              <span>{t('craftsmanship')}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#475569] mr-1">{t('deliverables')}:</span>
              <DeliverableBadge format="ai" variant="pill" />
              <DeliverableBadge format="eps" variant="pill" />
              <DeliverableBadge format="svg" variant="pill" />
              <DeliverableBadge format="pdf" variant="pill" />
              <DeliverableBadge format="png" variant="pill" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              {t('capabilities')}
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  {t('aiLogo')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  {t('raster')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  {t('typography')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  {t('screenPrint')}
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  {t('cnc')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              {t('platform')}
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/quote" className="hover:text-[#0F172A] transition-colors font-medium text-[#18794E]">
                  {t('quote')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0F172A] transition-colors">
                  {t('portal')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/artwork" className="hover:text-[#0F172A] transition-colors">
                  {t('vault')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/business" className="hover:text-[#0F172A] transition-colors">
                  {t('business')}
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="hover:text-[#0F172A] transition-colors">
                  {t('operator')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Standards & Legal */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              {t('standards')}
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>{t('deliveryTarget')}</li>
              <li>{t('revisionPolicy')}</li>
              <li>{t('curves')}</li>
              <li>{t('rights')}</li>
              <li>{t('privacy')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#E2E8F0] pt-8 text-xs text-[#475569] sm:flex-row">
          <p>© {new Date().getFullYear()} Artlantix. {t('copyright')}</p>
          <div className="flex gap-6">
            <span>{t('terms')}</span>
            <span>{t('license')}</span>
            <span>{t('privacyPolicy')}</span>
            <span>{t('security')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
