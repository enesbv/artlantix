'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  getSiteSettings,
  updateSiteSettings,
  resetSiteSettings,
  getPortfolioItems,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  uploadShowcaseMedia,
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/lib/services/content';
import { getCurrentUser } from '@/lib/services/auth';
import { BeforeAfterShowcase, UserProfile } from '@/lib/types';
import {
  ShieldCheck,
  FileText,
  Plus,
  Trash2,
  Check,
  UploadCloud,
  Sparkles,
  ArrowRight,
  Layers,
  RotateCcw,
} from 'lucide-react';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'showcases' | 'copy_pricing'>('showcases');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Site Settings state
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);

  // Portfolio showcases state
  const [showcases, setShowcases] = useState<BeforeAfterShowcase[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // New showcase form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('AI-Generated Logo');
  const [newClientType, setNewClientType] = useState('Agency Partner');
  const [newBadge, setNewBadge] = useState('Mathematical Precision');
  const [newDesc, setNewDesc] = useState('');
  const [newRasterUrl, setNewRasterUrl] = useState('');
  const [newVectorUrl, setNewVectorUrl] = useState('');
  const [newActive, setNewActive] = useState(true);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isCreatingShowcase, setIsCreatingShowcase] = useState(false);
  const [showcaseNotice, setShowcaseNotice] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  const rasterInputRef = useRef<HTMLInputElement>(null);
  const vectorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const u = await getCurrentUser();
      setCurrentUser(u);

      try {
        const [s, items] = await Promise.all([getSiteSettings(), getPortfolioItems(false)]);
        setSettings(s);
        setShowcases(items);
      } catch (error: unknown) {
        setOperationError(error instanceof Error ? error.message : 'Content could not be loaded.');
      }
    }
    loadData();
  }, []);

  // Save site settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setOperationError(null);
    try {
      const saved = await updateSiteSettings(settings);
      setSettings(saved);
      setSettingsNotice('Homepage copy and baseline rates published successfully.');
      setTimeout(() => setSettingsNotice(null), 3500);
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'Settings could not be saved.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Reset site settings
  const handleResetSettings = async () => {
    if (!confirm('Reset all copy and rates to studio defaults?')) return;
    try {
      const reset = await resetSiteSettings();
      setSettings(reset);
      setSettingsNotice('Restored studio default settings.');
      setTimeout(() => setSettingsNotice(null), 3000);
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'Settings could not be reset.');
    }
  };

  // Handle Raster file selection
  const handleRasterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingMedia(true);
      try {
        const url = await uploadShowcaseMedia(e.target.files[0], 'raster');
        setNewRasterUrl(url);
      } catch (error: unknown) {
        setOperationError(error instanceof Error ? error.message : 'Original image upload failed.');
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  // Handle Vector file selection
  const handleVectorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingMedia(true);
      try {
        const url = await uploadShowcaseMedia(e.target.files[0], 'vector');
        setNewVectorUrl(url);
      } catch (error: unknown) {
        setOperationError(error instanceof Error ? error.message : 'Vector preview upload failed.');
      } finally {
        setIsUploadingMedia(false);
      }
    }
  };

  // Create new showcase item
  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRasterUrl) {
      alert('Please enter a title and upload at least an original raster image.');
      return;
    }
    setIsCreatingShowcase(true);

    try {
      const created = await createPortfolioItem({
        title: newTitle.trim(),
        category: newCategory,
        clientType: newClientType.trim(),
        badge: newBadge.trim(),
        description: newDesc.trim() || 'Precision manual reconstruction from degraded concept into press-ready curves.',
        rasterUrl: newRasterUrl,
        vectorUrl: newVectorUrl || undefined,
        active: newActive,
      });

      setShowcases([created, ...showcases]);
      setModalOpen(false);
      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewRasterUrl('');
      setNewVectorUrl('');
      setShowcaseNotice('New Before/After showcase added to homepage catalog.');
      setTimeout(() => setShowcaseNotice(null), 3500);
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'Showcase could not be created.');
    } finally {
      setIsCreatingShowcase(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const updated = await updatePortfolioItem(id, { active: !currentActive });
      if (updated) setShowcases(showcases.map((s) => (s.id === id ? { ...s, active: !currentActive } : s)));
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'Showcase could not be updated.');
    }
  };

  // Delete showcase
  const handleDeleteShowcase = async (id: string) => {
    if (!confirm('Are you sure you want to remove this showcase from the catalog?')) return;
    try {
      await deletePortfolioItem(id);
      setShowcases(showcases.filter((s) => s.id !== id));
    } catch (error: unknown) {
      setOperationError(error instanceof Error ? error.message : 'Showcase could not be deleted.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      <Navbar />

      {/* Admin Header & Sub-Navigation */}
      <div className="border-b border-[#EAE8E3] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#18794E]" />
                <h1 className="text-xl font-bold tracking-tight text-[#141414]">
                  Production Studio Admin Desk
                </h1>
                <span className="rounded-full bg-[#141414] px-2.5 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  Lead Operator
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Operator account: <strong className="text-[#141414]">{currentUser?.full_name || 'Elena Vance'}</strong> ({currentUser?.email || 'admin@artlantix.com'})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs font-semibold text-[#141414] hover:border-[#141414] transition-colors"
              >
                <span>Preview Live Site</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <nav className="flex space-x-6 border-t border-[#EAE8E3]/60 pt-1 pb-2 font-mono text-xs">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1.5 border-b-2 border-transparent py-2 font-medium text-[#737373] hover:border-[#CCCCCC] hover:text-[#141414] transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Production Queue</span>
            </Link>

            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1.5 border-b-2 border-[#18794E] py-2 font-bold text-[#18794E] transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Visual Content CMS</span>
            </Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Module Switcher Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE8E3] pb-6">
          <div>
            <h2 className="text-lg font-bold text-[#141414]">In-App Visual Content Management</h2>
            <p className="text-xs text-[#737373]">
              Update live portfolio showcases, before/after comparisons, hero headlines, and baseline rates without writing code.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-[#EAE8E3] bg-white p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('showcases')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'showcases'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              Portfolio &amp; Before/After
            </button>
            <button
              onClick={() => setActiveTab('copy_pricing')}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'copy_pricing'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              Micro-Copy &amp; Rates
            </button>
          </div>
        </div>

        {/* NOTICES */}
        {showcaseNotice && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            ✓ {showcaseNotice}
          </div>
        )}
        {settingsNotice && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
            ✓ {settingsNotice}
          </div>
        )}
        {operationError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {operationError}
          </div>
        )}

        {/* TAB 1: PORTFOLIO & BEFORE/AFTER MANAGER */}
        {activeTab === 'showcases' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#141414]">Before/After Showcase Catalog</h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Items marked active appear in the homepage interactive slider and proof gallery.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-4 py-2 text-xs font-bold text-white hover:bg-[#115C3B] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Showcase Pair</span>
              </button>
            </div>

            {/* Showcase Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcases.map((item) => {
                const isActive = item.active !== false;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs transition-all ${
                      isActive ? 'border-[#EAE8E3]' : 'border-dashed border-[#CCCCCC] opacity-60'
                    }`}
                  >
                    <div>
                      {/* Thumbnail & Active status bar */}
                      <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-3">
                        <span className="rounded-full bg-[#F5F4F0] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase text-[#141414]">
                          {item.category}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(item.id, isActive)}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-semibold transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                            <span>{isActive ? 'Active on Home' : 'Hidden'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteShowcase(item.id)}
                            className="text-[#737373] hover:text-red-600 transition-colors p-1"
                            title="Delete Showcase"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Image Preview Box */}
                      <div className="relative mt-4 h-40 w-full rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] overflow-hidden flex items-center justify-center p-2">
                        {item.rasterUrl && item.rasterUrl.startsWith('data:') ? (
                          <Image
                            src={item.rasterUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized
                            className="object-contain p-2"
                          />
                        ) : (
                          <svg viewBox="0 0 200 200" className="h-28 w-28">
                            <circle cx="100" cy="100" r="65" fill="#FFFFFF" stroke="#141414" strokeWidth="3" />
                            <circle cx="100" cy="100" r="50" fill="none" stroke="#18794E" strokeWidth="2" strokeDasharray="4 3" />
                            <path d="M 100 50 L 115 80 L 150 80 L 122 102 L 132 135 L 100 115 L 68 135 L 78 102 L 50 80 L 85 80 Z" fill="#141414" />
                          </svg>
                        )}
                      </div>

                      <h4 className="mt-4 text-sm font-bold text-[#141414]">{item.title}</h4>
                      <p className="mt-1 text-xs text-[#737373] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#EAE8E3] flex items-center justify-between font-mono text-[10px] text-[#737373]">
                      <span>Badge: {item.badge || 'Standard'}</span>
                      <span>Client: {item.clientType || 'Commercial'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: HOMEPAGE MICRO-COPY & PRICING EDITOR */}
        {activeTab === 'copy_pricing' && (
          <form onSubmit={handleSaveSettings} className="space-y-8 max-w-3xl">
            {/* Hero Copy Card */}
            <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs space-y-6">
              <div className="border-b border-[#EAE8E3] pb-4">
                <h3 className="text-base font-bold text-[#141414]">Hero Headline &amp; Subtitle</h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Update the primary headline and supporting editorial message seen by every visitor.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                  Display Headline
                </label>
                <input
                  type="text"
                  required
                  value={settings.hero_title}
                  onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-2.5 text-sm text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                  Supporting Subtitle (Max 2 punchy sentences)
                </label>
                <textarea
                  rows={3}
                  required
                  value={settings.hero_subtitle}
                  onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] p-4 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>

            {/* Baseline Pricing Card */}
            <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs space-y-6">
              <div className="border-b border-[#EAE8E3] pb-4">
                <h3 className="text-base font-bold text-[#141414]">Baseline Geometry Tier Rates</h3>
                <p className="text-xs text-[#737373] mt-0.5">
                  Adjust standard pricing. These values propagate dynamically to the pricing grid and instant quote engine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] p-5">
                  <span className="font-mono text-xs font-bold uppercase text-[#737373]">Tier 1: Simple</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#141414]">$</span>
                    <input
                      type="number"
                      required
                      min={10}
                      max={500}
                      value={settings.simple_tier_price}
                      onChange={(e) => setSettings({ ...settings, simple_tier_price: Number(e.target.value) })}
                      className="w-full rounded border border-[#EAE8E3] bg-white px-3 py-1.5 font-mono text-sm font-bold text-[#141414] focus:border-[#141414]"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#737373]">Single-color, basic shapes</p>
                </div>

                <div className="rounded-xl border-2 border-[#18794E] bg-[#E9F9EE] p-5">
                  <span className="font-mono text-xs font-bold uppercase text-[#18794E]">Tier 2: Standard</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#18794E]">$</span>
                    <input
                      type="number"
                      required
                      min={10}
                      max={500}
                      value={settings.standard_tier_price}
                      onChange={(e) => setSettings({ ...settings, standard_tier_price: Number(e.target.value) })}
                      className="w-full rounded border border-[#B4DFC4] bg-white px-3 py-1.5 font-mono text-sm font-bold text-[#141414] focus:border-[#18794E]"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#737373]">Multi-color badges &amp; logos</p>
                </div>

                <div className="rounded-xl border border-[#EAE8E3] bg-[#F9F8F6] p-5">
                  <span className="font-mono text-xs font-bold uppercase text-[#737373]">Tier 3: Complex</span>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-[#141414]">$</span>
                    <input
                      type="number"
                      required
                      min={10}
                      max={1000}
                      value={settings.complex_tier_price}
                      onChange={(e) => setSettings({ ...settings, complex_tier_price: Number(e.target.value) })}
                      className="w-full rounded border border-[#EAE8E3] bg-white px-3 py-1.5 font-mono text-sm font-bold text-[#141414] focus:border-[#141414]"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-[#737373]">Mascots &amp; fine engravings</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleResetSettings}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#EAE8E3] bg-white px-4 py-2.5 text-xs font-semibold text-[#737373] hover:bg-[#F5F4F0] hover:text-[#141414] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset to Studio Defaults</span>
              </button>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#115C3B] transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>{isSavingSettings ? 'Publishing...' : 'Publish Changes to Homepage'}</span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL: ADD NEW BEFORE/AFTER SHOWCASE PAIR */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-xl rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#EAE8E3] pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#18794E]" />
                  <h3 className="text-base font-bold text-[#141414]">Add New Before/After Showcase Pair</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-xs text-[#737373] hover:text-[#141414]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateShowcase} className="mt-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#141414]">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Apex Falcon Crest Reconstruction"
                    className="mt-1.5 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#141414]">Category Tag</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3 py-2 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                    >
                      <option value="AI-Generated Logo">AI-Generated Logo</option>
                      <option value="Blurry Low-Res Scan">Blurry Low-Res Scan</option>
                      <option value="Complex Mascot">Complex Mascot</option>
                      <option value="Distorted Typography">Distorted Typography</option>
                      <option value="Vintage Badge">Vintage Badge</option>
                      <option value="Apparel & Signage">Apparel &amp; Signage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414]">Client Industry</label>
                    <input
                      type="text"
                      value={newClientType}
                      onChange={(e) => setNewClientType(e.target.value)}
                      placeholder="e.g., FinTech Startup"
                      className="mt-1.5 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#141414]">Badge / Tag</label>
                    <input
                      type="text"
                      value={newBadge}
                      onChange={(e) => setNewBadge(e.target.value)}
                      placeholder="e.g., Precision Rebuild"
                      className="mt-1.5 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-3.5 py-2 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Upload Before Raster */}
                <div>
                  <label className="block text-xs font-bold text-[#141414]">
                    1. Original Raster Upload (Before)
                  </label>
                  <div
                    onClick={() => rasterInputRef.current?.click()}
                    className="mt-1.5 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EAE8E3] bg-[#F9F8F6] p-4 text-center hover:border-[#141414] transition-colors"
                  >
                    <input
                      ref={rasterInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleRasterUpload}
                    />
                    <UploadCloud className="h-5 w-5 text-[#18794E]" />
                    <span className="mt-1 text-xs font-medium text-[#141414]">
                      {newRasterUrl ? 'File selected (Click to change)' : 'Upload blurry or AI raster image'}
                    </span>
                  </div>
                  {newRasterUrl && (
                    <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
                      ✓ Original raster image loaded
                    </div>
                  )}
                </div>

                {/* Upload After Vector Preview */}
                <div>
                  <label className="block text-xs font-bold text-[#141414]">
                    2. Reconstructed Vector Upload (After Preview)
                  </label>
                  <div
                    onClick={() => vectorInputRef.current?.click()}
                    className="mt-1.5 flex h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EAE8E3] bg-[#F9F8F6] p-4 text-center hover:border-[#141414] transition-colors"
                  >
                    <input
                      ref={vectorInputRef}
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={handleVectorUpload}
                    />
                    <UploadCloud className="h-5 w-5 text-[#141414]" />
                    <span className="mt-1 text-xs font-medium text-[#141414]">
                      {newVectorUrl ? 'Vector preview selected' : 'Upload SVG / clean master preview'}
                    </span>
                  </div>
                  {newVectorUrl && (
                    <div className="mt-2 text-[11px] text-emerald-700 font-semibold">
                      ✓ Vector preview loaded
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141414]">Brief Transformation Description</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g., Rebuilt 12,000 AI raster artifacts into 42 clean tangent bezier nodes for screen print separation."
                    className="mt-1.5 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] p-3 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-[#EAE8E3] pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newActive}
                      onChange={(e) => setNewActive(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#18794E]"
                    />
                    <span className="text-xs font-semibold text-[#141414]">Publish immediately to live homepage</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="rounded-lg border border-[#EAE8E3] bg-white px-4 py-2 text-xs font-semibold text-[#737373] hover:bg-[#F5F4F0]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingShowcase || isUploadingMedia}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#18794E] px-5 py-2 text-xs font-bold text-white hover:bg-[#115C3B] disabled:opacity-50"
                    >
                      <span>{isCreatingShowcase ? 'Adding...' : 'Add Showcase'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
