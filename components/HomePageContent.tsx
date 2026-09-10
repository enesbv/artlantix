'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import DeliverableBadge from '@/components/DeliverableBadge';
import { BeforeAfterShowcase } from '@/lib/types';
import {
  getSiteSettings,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  getPortfolioItems,
} from '@/lib/services/content';
import { useTranslations } from 'next-intl';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import {
  ArrowRight,
  ChevronDown,
  Layers,
  Cpu,
  Sparkles,
  Scissors,
  Printer,
  FileCode,
} from 'lucide-react';

interface HomePageContentProps {
  locale?: string;
}

export default function HomePageContent({ locale = 'en' }: HomePageContentProps) {
  const tHero = useTranslations('hero');
  const tMetrics = useTranslations('metrics');
  const tShowcase = useTranslations('showcase');
  const tMoat = useTranslations('moat');
  const tHow = useTranslations('howItWorks');
  const tPricing = useTranslations('pricing');
  const tCta = useTranslations('cta');
  const tServices = useTranslations('services');
  const demoMode = !isSupabaseConfigured();

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [portfolioItems, setPortfolioItems] = useState<BeforeAfterShowcase[]>([]);
  const [activeSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [galleryViewMode, setGalleryViewMode] = useState<Record<string, 'before' | 'after'>>({});

  const toggleCardView = (id: string, mode: 'before' | 'after') => {
    setGalleryViewMode(prev => ({ ...prev, [id]: mode }));
  };

  const categories = ['All', ...Array.from(new Set(portfolioItems.map(item => item.category).filter(Boolean)))];

  const filteredShowcases = activeCategory === 'All'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeCategory);

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      try {
        const [loadedSettings, loadedItems] = await Promise.all([
          getSiteSettings(),
          getPortfolioItems(true),
        ]);
        if (isMounted) {
          setSettings(loadedSettings);
          setPortfolioItems(loadedItems);
        }
      } catch (err) {
        console.error('Failed to load CMS content:', err);
      }
    }
    loadContent();
    const handleUpdate = () => { loadContent(); };
    window.addEventListener('artlantix_content_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('artlantix_content_updated', handleUpdate);
    };
  }, []);


  const quoteHref = locale && locale !== 'en' ? `/${locale}/quote` : '/quote';
  const heroShowcaseItem = portfolioItems[activeSlide] || portfolioItems[0];

  const faqs = [
    {
      q: 'Which vector file formats are delivered?',
      a: 'Every completed order includes: Adobe Illustrator (.AI, fully layered), Encapsulated PostScript (.EPS, unflattened CMYK vector), Scalable Vector Graphics (.SVG, clean web/UI ready), Press-Ready PDF (.PDF/X-1a), and 4000px transparent PNGs at 300 DPI.',
    },
    {
      q: 'Why not just use Illustrator Image Trace or free online vectorizers?',
      a: 'Automated trace tools create thousands of jagged, unclosed anchor points, rough stair-stepped lines, muddy color bleed, and unusable paths that jam vinyl cutters. Artlantix artists draw every path manually using minimum anchor points and mathematical tangency for flawless physical reproduction.',
    },
    {
      q: 'How do you fix illegible AI-generated typography?',
      a: 'AI generators create pseudo-lettering with hallucinated, broken characters that cannot be edited or cut. Our typographic artists identify the closest authentic typeface, re-typeset the wording with proper kerning, or manually hand-draft bespoke letterforms with smooth bezier contours.',
    },
    {
      q: 'What is the standard turnaround time?',
      a: 'Standard turnaround is 24\u201348 hours for Simple and Standard tiers. Priority Express dispatch guarantees final delivery under 12\u201316 hours.',
    },
    {
      q: 'How do revision rounds work?',
      a: 'Every project includes up to 2 revision rounds at no extra cost. When a preview appears in your portal, you can mark exact areas for adjustment or approve the artwork. The studio then packages and quality-checks the master files before downloads are unlocked.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      {/* STICKY HEADER */}
      <Navbar />

      <main>
        {/* 1. HERO SECTION (EDITORIAL GALLERY CENTERPIECE) */}
        <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Editorial Headline & Meta Area */}
            <div className="mx-auto max-w-4xl text-center">
              {/* Quiet Single-Line Meta Strip */}
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#737373]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#18794E]" />
                <span>{tHero('eyebrow')}</span>
              </div>

              {/* Large Display Title - Dynamic from CMS with localized fallback */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#141414] sm:text-6xl lg:text-[68px] leading-[1.08]">
                {locale === 'en' && settings.hero_title !== DEFAULT_SITE_SETTINGS.hero_title ? (
                  settings.hero_title
                ) : (
                  <>
                    {tHero('titlePrefix')}{' '}
                    <span className="text-[#18794E]">{tHero('titleAccent')}</span>{' '}
                    {tHero('titleSuffix')}
                  </>
                )}
              </h1>

              {/* Short, Punchy Editorial Paragraph */}
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#737373] sm:text-lg">
                {locale === 'en' && settings.hero_subtitle !== DEFAULT_SITE_SETTINGS.hero_subtitle
                  ? settings.hero_subtitle
                  : tHero('subtitle')}
              </p>

              {/* Discrete High-Confidence Deliverable Strip */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-[#737373]">
                <span className="font-medium text-[#141414]">{tHero('includedText')}</span>
                <div className="inline-flex items-center gap-1.5">
                  <DeliverableBadge format="ai" variant="pill" />
                  <DeliverableBadge format="eps" variant="pill" />
                  <DeliverableBadge format="svg" variant="pill" />
                  <DeliverableBadge format="pdf" variant="pill" />
                  <DeliverableBadge format="png" variant="pill" />
                </div>
                <span className="text-[#CCCCCC]">·</span>
                <span className="font-mono text-[11px] font-semibold text-[#141414]">
                  {tHero('vectorCurves')}
                </span>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={quoteHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#18794E] px-7 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-[#115C3B] transition-colors"
                >
                  <span>{tHero('getQuoteCta')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#showcase"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#EAE8E3] bg-white px-7 py-3.5 text-sm font-bold text-[#141414] hover:bg-[#F5F4F0] hover:border-[#141414] transition-colors"
                >
                  <span>{tHero('inspectCta')}</span>
                </a>
              </div>
            </div>

            {/* Cinematic Centerpiece: Before & After Showcase */}
            <div id="showcase" className="mt-16 sm:mt-20">
              <BeforeAfterSlider
                title={heroShowcaseItem ? heroShowcaseItem.title : "Midjourney Falcon Crest Reconstructed to Closed Tangent Vectors"}
                category={heroShowcaseItem ? heroShowcaseItem.category : "Interactive Curvature Inspection"}
              />
            </div>
          </div>
        </section>

        {/* 2. REFINED TRUST & CRAFTSMANSHIP META STRIP */}
        <section className="border-y border-[#EAE8E3] bg-[#F5F4F0] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-4 text-left">
              <div className="border-l-2 border-[#141414] pl-4">
                <div className="font-mono text-xs uppercase tracking-wider text-[#737373]">Method</div>
                <div className="mt-1 text-base font-bold text-[#141414]">{tMetrics('methodTitle')}</div>
                <div className="mt-1 text-sm leading-relaxed text-[#737373]">{tMetrics('methodDesc')}</div>
              </div>

              <div className="border-l-2 border-[#18794E] pl-4">
                <div className="font-mono text-xs uppercase tracking-wider text-[#737373]">Quality Assurance</div>
                <div className="mt-1 text-base font-bold text-[#141414]">{tMetrics('qaTitle')}</div>
                <div className="mt-1 text-sm leading-relaxed text-[#737373]">{tMetrics('qaDesc')}</div>
              </div>

              <div className="border-l-2 border-[#141414] pl-4">
                <div className="font-mono text-xs uppercase tracking-wider text-[#737373]">Turnaround</div>
                <div className="mt-1 text-base font-bold text-[#141414]">{tMetrics('turnaroundTitle')}</div>
                <div className="mt-1 text-sm leading-relaxed text-[#737373]">{tMetrics('turnaroundDesc')}</div>
              </div>

              <div className="border-l-2 border-[#141414] pl-4">
                <div className="font-mono text-xs uppercase tracking-wider text-[#737373]">Archive</div>
                <div className="mt-1 text-base font-bold text-[#141414]">{tMetrics('archiveTitle')}</div>
                <div className="mt-1 text-sm leading-relaxed text-[#737373]">{tMetrics('archiveDesc')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BEFORE & AFTER GALLERY (DYNAMIC CMS DRIVEN) */}
        <section id="before-after" className="py-24 sm:py-32 bg-[#F9F8F6]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAE8E3] pb-8">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                  {tShowcase('proofTitle')}
                </span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                  {tShowcase('headline')}
                </h2>
                <p className="mt-2 text-sm text-[#737373] max-w-xl">
                  {tShowcase('subheadline')}
                </p>
                {demoMode && (
                  <p className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900">
                    {tShowcase('demoNotice')}
                  </p>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1 rounded-full border border-[#EAE8E3] bg-white p-1 shadow-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#141414] text-white shadow-xs'
                        : 'text-[#737373] hover:text-[#141414]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Cards Grid */}
            {filteredShowcases.length === 0 && (
              <div className="mt-12 rounded-2xl border border-dashed border-[#D9D6CE] bg-white p-10 text-center text-sm text-[#737373]">
                {tShowcase('empty')}
              </div>
            )}
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredShowcases.map((card) => {
                const currentMode = galleryViewMode[card.id] || 'after';

                return (
                  <div
                    key={card.id}
                    className="flex flex-col rounded-2xl border border-[#EAE8E3] bg-white overflow-hidden shadow-xs hover:border-[#141414] transition-all duration-200"
                  >
                    {/* Visual Preview Box */}
                    <div className="relative h-64 w-full border-b border-[#EAE8E3] bg-[#F5F4F0] p-6 flex items-center justify-center">
                      {/* Mode Toggle Pills */}
                      <div className="absolute top-3.5 left-3.5 z-10 flex rounded-full border border-[#EAE8E3] bg-white/95 p-0.5 shadow-xs backdrop-blur-sm">
                        <button
                          onClick={() => toggleCardView(card.id, 'before')}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                            currentMode === 'before'
                              ? 'bg-[#141414] text-white'
                              : 'text-[#737373] hover:text-[#141414]'
                          }`}
                        >
                          {tShowcase('original')}
                        </button>
                        <button
                          onClick={() => toggleCardView(card.id, 'after')}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                            currentMode === 'after'
                              ? 'bg-[#18794E] text-white'
                              : 'text-[#737373] hover:text-[#141414]'
                          }`}
                        >
                          {tShowcase('vectorMaster')}
                        </button>
                      </div>

                      {card.badge && (
                        <div className="absolute top-3.5 right-3.5">
                          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#737373] border border-[#EAE8E3]">
                            {card.badge}
                          </span>
                        </div>
                      )}

                      {/* Graphic Depiction */}
                      {currentMode === 'after' ? (
                        <div className="flex h-full w-full items-center justify-center animate-in fade-in duration-200">
                          {card.vectorUrl ? (
                            <Image
                              className="h-44 w-44 object-contain drop-shadow-xs"
                              src={card.vectorUrl}
                              alt={`${card.title} vector artwork`}
                              width={176}
                              height={176}
                              loading="lazy"
                              unoptimized
                            />
                          ) : card.vectorSvgContent ? (
                            <Image
                              className="h-44 w-44 object-contain drop-shadow-xs"
                              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.vectorSvgContent)}`}
                              alt={`${card.title} vector artwork`}
                              width={176}
                              height={176}
                              loading="lazy"
                              decoding="async"
                              unoptimized
                            />
                          ) : (
                            <svg viewBox="0 0 200 200" className="h-40 w-40 drop-shadow-xs">
                              <circle cx="100" cy="100" r="75" fill="#F9F8F6" stroke="#141414" strokeWidth="4" />
                              <circle cx="100" cy="100" r="62" fill="none" stroke="#18794E" strokeWidth="2" strokeDasharray="4 3" />
                              <path d="M 100 45 L 120 85 L 165 85 L 130 112 L 142 155 L 100 130 L 58 155 L 70 112 L 35 85 L 80 85 Z" fill="#141414" />
                              <circle cx="100" cy="100" r="12" fill="#18794E" />
                            </svg>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center filter blur-[1.5px] opacity-75 animate-in fade-in duration-200">
                          {card.rasterUrl ? (
                            <Image
                              src={card.rasterUrl}
                              width={160}
                              height={160}
                              loading="lazy"
                              decoding="async"
                              unoptimized
                              alt={card.title}
                              className="h-40 w-40 object-contain"
                            />
                          ) : (
                            <svg viewBox="0 0 200 200" className="h-40 w-40">
                              <circle cx="100" cy="100" r="75" fill="#DDD8CE" stroke="#555" strokeWidth="7" strokeLinecap="round" />
                              <path d="M 100 45 L 120 85 L 165 85 L 130 112 L 142 155 L 100 130 L 58 155 L 70 112 L 35 85 L 80 85 Z" fill="#444" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Spec */}
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#737373]">
                        <span>{card.clientType || 'Studio Reconstruction'}</span>
                        <span className="font-semibold text-[#141414]">{card.category}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#141414]">{card.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#737373] flex-1">
                        {card.description}
                      </p>

                      <div className="mt-5 border-t border-[#EAE8E3] pt-3.5 space-y-1.5 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#737373]">{tShowcase('pointsLabel')}</span>
                          <span className="font-semibold text-emerald-700">
                            {card.stats?.pointsReduced || 'Engineered Bezier Paths'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#737373]">{tShowcase('toleranceLabel')}</span>
                          <span className="font-semibold text-[#141414]">
                            {card.stats?.tolerance || 'Production Approved'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={quoteHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[#141414] px-6 py-3 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                <span>{tShowcase('uploadCta')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. PRODUCTION CAPABILITIES & DISCIPLINES */}
        <section id="services" className="py-24 sm:py-32 border-t border-[#EAE8E3] bg-[#F5F4F0]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                {tServices('eyebrow')}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                {tServices('headline')}
              </h2>
              <p className="mt-3 text-base text-[#737373] leading-relaxed">
                {tServices('subheadline')}
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Capability 1 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <Sparkles className="h-5 w-5 text-[#18794E]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c01Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c01Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c01Best')}
                </div>
              </div>

              {/* Capability 2 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <Layers className="h-5 w-5 text-[#141414]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c02Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c02Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c02Best')}
                </div>
              </div>

              {/* Capability 3 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <FileCode className="h-5 w-5 text-[#18794E]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c03Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c03Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c03Best')}
                </div>
              </div>

              {/* Capability 4 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <Printer className="h-5 w-5 text-[#141414]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c04Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c04Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c04Best')}
                </div>
              </div>

              {/* Capability 5 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <Scissors className="h-5 w-5 text-[#18794E]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c05Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c05Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c05Best')}
                </div>
              </div>

              {/* Capability 6 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs hover:border-[#141414] transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F4F0] text-[#141414]">
                  <Cpu className="h-5 w-5 text-[#141414]" />
                </div>
                <h3 className="mt-5 text-base font-bold text-[#141414]">
                  {tServices('c06Title')}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                  {tServices('c06Desc')}
                </p>
                <div className="mt-4 font-mono text-[10px] font-semibold text-[#141414] bg-[#F5F4F0] rounded-md px-2.5 py-1 inline-block">
                  {tServices('c06Best')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PROCESS: 4 STEPS */}
        <section id="how-it-works" className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                {tHow('eyebrow')}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                {tHow('headline')}
              </h2>
              <p className="mt-3 text-base text-[#737373] leading-relaxed">
                {tHow('subheadline')}
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-[#F9F8F6] p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#18794E]">STEP 01</span>
                  <h3 className="mt-3 text-base font-bold text-[#141414]">{tHow('step1Title')}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                    {tHow('step1Desc')}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-[#F9F8F6] p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#18794E]">STEP 02</span>
                  <h3 className="mt-3 text-base font-bold text-[#141414]">{tHow('step2Title')}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                    {tHow('step2Desc')}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-[#F9F8F6] p-6 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-[#18794E]">STEP 03</span>
                  <h3 className="mt-3 text-base font-bold text-[#141414]">{tHow('step3Title')}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#737373]">
                    {tHow('step3Desc')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <DeliverableBadge format="ai" variant="pill" />
                    <DeliverableBadge format="eps" variant="pill" />
                    <DeliverableBadge format="svg" variant="pill" />
                    <DeliverableBadge format="pdf" variant="pill" />
                    <DeliverableBadge format="png" variant="pill" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. WHY MANUAL BEATS AUTO-TRACE */}
        <section id="moat" className="py-24 sm:py-32 border-t border-[#EAE8E3] bg-[#F5F4F0]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                {tMoat('eyebrow')}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                {tMoat('headline')}
              </h2>
              <p className="mt-3 text-base text-[#737373] leading-relaxed">
                {tMoat('subheadline')}
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Box 1: Automated Trace Flaws */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 sm:p-10 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-4">
                  <h3 className="text-base font-bold text-[#141414]">{tMoat('autoTitle')}</h3>
                  <span className="font-mono text-xs text-[#737373]">{tMoat('autoSub')}</span>
                </div>

                <div className="mt-6 space-y-5 text-xs text-[#737373]">
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-sm">✕</span>
                    <div>{tMoat('autoPoints')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-sm">✕</span>
                    <div>{tMoat('autoCurves')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-sm">✕</span>
                    <div>{tMoat('autoMuddy')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-500 font-bold text-sm">✕</span>
                    <div>{tMoat('autoText')}</div>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-[#F5F4F0] p-4 text-[11px] text-[#737373] border border-[#EAE8E3]">
                  {tMoat('autoResult')}
                </div>
              </div>

              {/* Box 2: Artlantix Human Engineering */}
              <div className="rounded-2xl border-2 border-[#141414] bg-white p-8 sm:p-10 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#141414] pb-4">
                  <h3 className="text-base font-bold text-[#141414]">{tMoat('humanTitle')}</h3>
                  <span className="font-mono text-xs font-semibold text-[#18794E]">
                    {tMoat('humanSub')}
                  </span>
                </div>

                <div className="mt-6 space-y-5 text-xs text-[#737373]">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <div>{tMoat('humanPoints')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <div>{tMoat('humanCurves')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <div>{tMoat('humanTrapping')}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-600 font-bold text-sm">✓</span>
                    <div>{tMoat('humanText')}</div>
                  </div>
                </div>

                <div className="mt-8 rounded-xl bg-[#E9F9EE] p-4 text-[11px] text-[#18794E] font-semibold border border-[#B4DFC4]">
                  {tMoat('humanResult')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. TRANSPARENT PRICING OVERVIEW (DYNAMIC CMS RATES) */}
        <section id="pricing" className="py-24 sm:py-32 border-t border-[#EAE8E3] bg-[#F5F4F0]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                {tPricing('eyebrow')}
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                {tPricing('headline')}
              </h2>
              <p className="mt-3 text-base text-[#737373] leading-relaxed">
                {tPricing('subheadline')}
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tier 1 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="font-mono text-xs font-bold text-[#737373] uppercase tracking-wider">Tier 1</div>
                  <h3 className="mt-1 text-xl font-bold text-[#141414]">{tPricing('tier1Title')}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#141414]">
                      From ${settings.simple_tier_price}
                    </span>
                    <span className="text-xs text-[#737373]">{tPricing('perProject')}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#737373]">{tPricing('tier1Desc')}</p>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#141414]">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Single icon or flat wordmark
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> 24–48h Standard Turnaround
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> AI, EPS, SVG, PDF, PNG
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> 2 Revision Rounds Included
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`${quoteHref}?tier=simple`}
                    className="flex w-full items-center justify-center rounded-lg border border-[#141414] py-2.5 text-xs font-bold text-[#141414] hover:bg-[#F5F4F0] transition-colors"
                  >
                    {tPricing('tier1Btn')}
                  </Link>
                </div>
              </div>

              {/* Tier 2 (Featured) */}
              <div className="rounded-2xl border-2 border-[#18794E] bg-white p-8 flex flex-col justify-between relative shadow-sm">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#18794E] px-3.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                    {tPricing('tier2Badge')}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-xs font-bold text-[#18794E] uppercase tracking-wider">Tier 2</div>
                  <h3 className="mt-1 text-xl font-bold text-[#141414]">{tPricing('tier2Title')}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#141414]">
                      From ${settings.standard_tier_price}
                    </span>
                    <span className="text-xs text-[#737373]">{tPricing('perProject')}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#737373]">{tPricing('tier2Desc')}</p>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#141414]">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Multi-color logo or detailed badge
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Typography &amp; font restoration
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> 24–48h Standard Turnaround
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Full Master Deliverable Suite
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`${quoteHref}?tier=standard`}
                    className="flex w-full items-center justify-center rounded-lg bg-[#18794E] py-2.5 text-xs font-bold text-white hover:bg-[#115C3B] transition-colors"
                  >
                    {tPricing('tier2Btn')}
                  </Link>
                </div>
              </div>

              {/* Tier 3 */}
              <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="font-mono text-xs font-bold text-[#737373] uppercase tracking-wider">Tier 3</div>
                  <h3 className="mt-1 text-xl font-bold text-[#141414]">{tPricing('tier3Title')}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#141414]">
                      From ${settings.complex_tier_price}
                    </span>
                    <span className="text-xs text-[#737373]">{tPricing('perProject')}</span>
                  </div>
                  <p className="mt-3 text-xs text-[#737373]">{tPricing('tier3Desc')}</p>

                  <ul className="mt-6 space-y-2.5 text-xs text-[#141414]">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Intricate mascot or engraving
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Heavy missing geometry rebuild
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Print &amp; embroidery separation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span> Direct QA Lead consultation
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`${quoteHref}?tier=complex`}
                    className="flex w-full items-center justify-center rounded-lg border border-[#141414] py-2.5 text-xs font-bold text-[#141414] hover:bg-[#F5F4F0] transition-colors"
                  >
                    {tPricing('tier3Btn')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FAQ ACCORDION */}
        <section id="faq" className="py-24 sm:py-32 border-t border-[#EAE8E3] bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
                Studio Answers
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
                Frequently Asked Technical Questions
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={openFaq === idx}
                    aria-controls={`faq-answer-${idx}`}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-bold text-[#141414]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#737373] transition-transform ${
                        openFaq === idx ? 'rotate-180 text-[#18794E]' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div id={`faq-answer-${idx}`} className="border-t border-[#EAE8E3] px-5 pb-5 pt-3 text-sm leading-relaxed text-[#737373]">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. BOTTOM CALL TO ACTION */}
        <section className="py-20 bg-[#141414] text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="font-mono text-xs uppercase tracking-widest text-[#18794E]">
              {tCta('eyebrow')}
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {tCta('headline')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-[#A3A3A3] leading-relaxed">
              {tCta('subheadline')}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={quoteHref}
                className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-7 py-3 text-xs font-bold text-white hover:bg-[#115C3B] transition-colors"
              >
                <span>{tCta('primaryBtn')}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/business"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors"
              >
                <span>{tCta('secondaryBtn')}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* STUDIO FOOTER */}
      <Footer />
    </div>
  );
}
