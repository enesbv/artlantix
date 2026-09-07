import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck } from 'lucide-react';
import DeliverableBadge from '@/components/DeliverableBadge';

export default function Footer() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-[#F1F5F9] text-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#0F172A] bg-[#0F172A] text-white">
                <Layers className="h-4 w-4 text-[#D94A26]" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-[#0F172A]">
                Artlantix
              </span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#475569] max-w-sm">
              Artlantix is a specialized manual vectorization &amp; artwork reconstruction studio. We transform AI sketches, low-res scans, and raster graphics into pristine mathematical vector assets engineered for high-precision print, embroidery, CNC cutting, and apparel manufacturing.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#0F172A]">
              <ShieldCheck className="h-4 w-4 text-[#D94A26]" />
              <span>Zero Automated Auto-Trace · 100% Master Artist Redrawn</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#475569] mr-1">Deliverables:</span>
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
              Capabilities
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  AI Logo Reconstruction
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  Raster to Clean Vector
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  Font &amp; Typography Rebuild
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  Screen Print &amp; DTF Separation
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#0F172A] transition-colors">
                  Vinyl Cut &amp; CNC Optimization
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/quote" className="hover:text-[#0F172A] transition-colors font-medium text-[#D94A26]">
                  Instant Quote Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0F172A] transition-colors">
                  Client Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/artwork" className="hover:text-[#0F172A] transition-colors">
                  Artwork Vault / Archive
                </Link>
              </li>
              <li>
                <Link href="/dashboard/business" className="hover:text-[#0F172A] transition-colors">
                  B2B Production Hub
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="hover:text-[#0F172A] transition-colors">
                  Operator Queue (Admin)
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Standards & Legal */}
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#0F172A]">
              Studio Standards
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-[#475569]">
              <li>24–48h Standard Delivery SLA</li>
              <li>2 Revision Rounds Included</li>
              <li>Strict Tangency Curvature</li>
              <li>Full Commercial Copyright Release</li>
              <li>Non-Disclosure &amp; Vault Privacy</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#E2E8F0] pt-8 text-xs text-[#475569] sm:flex-row">
          <p>© {new Date().getFullYear()} Artlantix Studio Inc. High-End Vector Engineering.</p>
          <div className="flex gap-6">
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Commercial License</span>
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#0F172A] cursor-pointer transition-colors">Security &amp; RLS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
