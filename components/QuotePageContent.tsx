'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeliverableBadge from '@/components/DeliverableBadge';
import { calculatePricing, PricingInput } from '@/lib/pricing';
import { createOrder } from '@/lib/services/orders';
import { getCurrentUser, signUpWithEmail } from '@/lib/services/auth';
import { processClientFileUpload, UploadedFileData } from '@/lib/services/storage';
import { processCheckout } from '@/lib/services/payments';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/services/content';
import { useTranslations } from 'next-intl';
import {
  ComplexityTier,
  TurnaroundSpeed,
  ArtworkType,
  UserProfile,
  OrderStatus,
  ColorCount,
} from '@/lib/types';
import {
  UploadCloud,
  FileImage,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Lock,
  CreditCard,
  Building,
} from 'lucide-react';

export default function QuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tQuote = useTranslations('quote');

  // Wizard Step: 1 = Upload, 2 = Specification, 3 = Review & Order
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Dynamic CMS Settings (for tier pricing)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // File Upload State
  const [uploadedFile, setUploadedFile] = useState<UploadedFileData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const submitLock = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Configuration State
  const [projectName, setProjectName] = useState('My Vector Project');
  const [artworkType, setArtworkType] = useState<ArtworkType>('ai_logo');
  const [complexity, setComplexity] = useState<ComplexityTier>(
    ['simple', 'standard', 'complex'].includes(searchParams?.get('tier') || '')
      ? searchParams.get('tier') as ComplexityTier : 'standard'
  );
  const [hasText, setHasText] = useState(true);
  const [reconstructionOption, setReconstructionOption] = useState<'clean' | 'moderate' | 'heavy'>('moderate');
  const [colorCount, setColorCount] = useState<'1-2' | '3-5' | '6+' | 'gradient'>('3-5');
  const [turnaround, setTurnaround] = useState<TurnaroundSpeed>('standard');
  const [notes, setNotes] = useState('');

  // Step 3 Checkout / Submission Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentOption, setPaymentOption] = useState<'card_simulated' | 'pay_after_quote_review' | 'invoice_b2b'>('card_simulated');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        setCustomerName(user.full_name || '');
        setCustomerEmail(user.email || '');
      }
    });

    getSiteSettings().then(setSettings);
  }, []);

  // Compute pricing with CMS dynamic base tier rates
  const pricingInput: PricingInput = {
    complexity,
    hasText,
    reconstructionNeeded: reconstructionOption === 'moderate' || reconstructionOption === 'heavy',
    heavyReconstruction: reconstructionOption === 'heavy',
    colorCount,
    turnaround,
    artworkType,
  };

  const customBasePrices = {
    simple: settings.simple_tier_price,
    standard: settings.standard_tier_price,
    complex: settings.complex_tier_price,
  };

  const pricing = calculatePricing(pricingInput, customBasePrices);

  // File drop / select handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setFormError(null);
      try {
        const processed = await processClientFileUpload(file);
        setUploadedFile(processed);
        if (!projectName || projectName === 'My Vector Project') {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Upload failed.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsUploading(true);
      setFormError(null);
      try {
        const processed = await processClientFileUpload(file);
        setUploadedFile(processed);
        if (!projectName || projectName === 'My Vector Project') {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setProjectName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Upload failed.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Submit Order & Convert Quote
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLock.current) return;
    if (!uploadedFile || isUploading) {
      setFormError('Please upload your artwork before submitting.');
      setCurrentStep(1);
      return;
    }
    submitLock.current = true;
    setFormError(null);
    setIsSubmitting(true);

    try {
      let activeUser = currentUser;
      if (!activeUser) {
        const emailToUse = customerEmail.trim() || 'client-order@artlantix.com';
        const nameToUse = customerName.trim() || 'Valued Client';
        const { user, error } = await signUpWithEmail(emailToUse, nameToUse);
        if (error || !user) throw new Error(error || 'Please sign in to continue.');
        activeUser = user;
        setCurrentUser(user);
      }

      const orderData = {
        user_id: activeUser?.id || 'usr_guest',
        customer_name: customerName || activeUser?.full_name || 'Client',
        customer_email: customerEmail || activeUser?.email || '',
        project_name: projectName || 'Vector Reconstruction',
        artwork_type: artworkType,
        complexity: complexity,
        colors: `${colorCount} colors`,
        has_text: hasText,
        reconstruction_needed: reconstructionOption !== 'clean',
        turnaround: turnaround,
        estimated_price: pricing.total,
        final_price: pricing.total,
        status: (pricing.needsManualReview || paymentOption === 'pay_after_quote_review' ? 'quote_requested' : 'in_progress') as OrderStatus,
        notes: notes,
        needs_manual_review: pricing.needsManualReview,
      };

      const filePayload = uploadedFile
        ? {
            name: uploadedFile.name,
            size: uploadedFile.size,
            format: uploadedFile.format,
            url: uploadedFile.url,
          }
        : undefined;

      const created = await createOrder(orderData, filePayload);

      await processCheckout({
        orderId: created.id,
        orderNumber: created.order_number,
        amount: pricing.total,
        customerEmail: customerEmail || activeUser?.email || '',
        projectName: projectName,
        paymentMethod: pricing.needsManualReview ? 'pay_after_quote_review' : paymentOption,
      });

      router.push(`/dashboard/orders/${created.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Order submission failed. Please try again.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#141414]">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {formError && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{formError}</p>}
        {/* Studio Questionnaire Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#E05328]">
            {tQuote('badge')}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
            {tQuote('headline')}
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            {tQuote('subheadline')}
          </p>

          {/* Stepper Progress Bar */}
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-6 font-mono text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 1 ? 'font-bold text-[#E05328]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 1
                    ? 'bg-[#E05328] text-white'
                    : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'border border-[#EAE8E3] bg-white text-[#737373]'
                }`}
              >
                1
              </span>
              <span>{tQuote('step1')}</span>
            </button>

            <span className="text-[#CCCCCC]">―</span>

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 2 ? 'font-bold text-[#E05328]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 2
                    ? 'bg-[#E05328] text-white'
                    : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'border border-[#EAE8E3] bg-white text-[#737373]'
                }`}
              >
                2
              </span>
              <span>{tQuote('step2')}</span>
            </button>

            <span className="text-[#CCCCCC]">―</span>

            <button
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 3 ? 'font-bold text-[#E05328]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 3
                    ? 'bg-[#E05328] text-white'
                    : 'border border-[#EAE8E3] bg-white text-[#737373]'
                }`}
              >
                3
              </span>
              <span>{tQuote('step3')}</span>
            </button>
          </div>
        </div>

        {/* STEP 1: UPLOAD ARTWORK */}
        {currentStep === 1 && (
          <div className="mt-12 rounded-2xl border border-[#EAE8E3] bg-white p-8 sm:p-12 shadow-xs">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-[#141414]">{tQuote('uploadTitle')}</h2>
              <p className="mt-1 text-xs text-[#737373]">{tQuote('uploadDesc')}</p>
            </div>

            {/* Drag & Drop Area */}
            {!uploadedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EAE8E3] bg-[#F9F8F6] p-12 text-center hover:border-[#E05328] cursor-pointer transition-colors"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-[#E05328]">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div className="mt-4 text-sm font-semibold text-[#141414]">
                  {isUploading ? 'Inspecting raster artwork...' : tQuote('dropzone')}
                </div>
                <p className="mt-1 text-xs text-[#737373]">{tQuote('dropzoneSub')}</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-[#EAE8E3] bg-[#F5F4F0] p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-[#EAE8E3] text-[#E05328]">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#141414]">{uploadedFile.name}</div>
                    <div className="text-xs text-[#737373]">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.format.toUpperCase()} · Hand-Rebuild Ready
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Uploaded</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (uploadedFile?.url && uploadedFile.url.startsWith('blob:')) {
                        URL.revokeObjectURL(uploadedFile.url);
                      }
                      setUploadedFile(null);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Change File
                  </button>
                </div>
              </div>
            )}

            {/* Project Title */}
            <div className="mt-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                {tQuote('projectName')}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Apex Falcon Crest Reconstruction"
                className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Next Button */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#E05328] px-7 py-3 text-xs font-bold text-white hover:bg-[#C8461D] transition-colors"
              >
                <span>{tQuote('continueBtn')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GEOMETRY & SPECIFICATIONS */}
        {currentStep === 2 && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Questionnaire Form */}
            <div className="lg:col-span-8 rounded-2xl border border-[#EAE8E3] bg-white p-8 sm:p-10 shadow-xs space-y-10">
              {/* Artwork Type Selection */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('geometryTitle')}
                </label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ai_logo', label: 'AI Concept Logo', desc: 'Midjourney / DALL-E' },
                    { id: 'lowres_logo', label: 'Low-Res Scan', desc: '72 DPI raster graphic' },
                    { id: 'sketch_scan', label: 'Hand Drawing', desc: 'Paper pencil sketch' },
                    { id: 'lettering_typography', label: 'Typography', desc: 'Custom wordmark' },
                    { id: 'mascot_badge', label: 'Mascot Crest', desc: 'Detailed character' },
                    { id: 'apparel_signage', label: 'Apparel / Sign', desc: 'Screen print / cut path' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArtworkType(item.id as ArtworkType)}
                      className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                        artworkType === item.id
                          ? 'border-[#141414] bg-[#F5F4F0] shadow-xs'
                          : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#141414]">{item.label}</span>
                      <span className="text-[10px] text-[#737373] mt-0.5">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Complexity Tier Selection with Dynamic CMS Prices */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                    {tQuote('complexityTitle')}
                  </label>
                  <span className="text-[11px] text-[#737373]">{tQuote('complexitySub')}</span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Simple Tier */}
                  <button
                    type="button"
                    onClick={() => setComplexity('simple')}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      complexity === 'simple'
                        ? 'border-2 border-[#141414] bg-[#F5F4F0] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex h-20 w-full items-center justify-center rounded-lg border border-[#EAE8E3] bg-white p-2">
                      <svg viewBox="0 0 80 60" className="h-full w-full" fill="none">
                        <circle cx="28" cy="30" r="16" stroke="#141414" strokeWidth="2" />
                        <rect x="44" y="16" width="24" height="24" stroke="#E05328" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-[#141414]">Simple</span>
                        <span className="font-mono text-xs font-bold text-[#141414]">
                          ${settings.simple_tier_price}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#737373] leading-relaxed">
                        Single color, geometric rules, clean silhouettes, minimal nodes.
                      </p>
                    </div>
                  </button>

                  {/* Standard Tier */}
                  <button
                    type="button"
                    onClick={() => setComplexity('standard')}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      complexity === 'standard'
                        ? 'border-2 border-[#E05328] bg-[#FDF3F0] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 rounded-full bg-[#E05328] px-2 py-0.5 font-mono text-[9px] font-bold text-white uppercase">
                      Popular
                    </span>

                    <div className="flex h-20 w-full items-center justify-center rounded-lg border border-[#EAE8E3] bg-white p-2">
                      <svg viewBox="0 0 80 60" className="h-full w-full" fill="none">
                        <path d="M 40 8 L 62 18 C 62 40 52 50 40 55 C 28 50 18 40 18 18 Z" stroke="#141414" strokeWidth="2" />
                        <path d="M 40 14 L 56 22 C 56 38 48 45 40 50 C 32 45 24 38 24 22 Z" stroke="#E05328" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="40" cy="30" r="6" fill="#E05328" />
                      </svg>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-[#141414]">Standard</span>
                        <span className="font-mono text-xs font-bold text-[#E05328]">
                          ${settings.standard_tier_price}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#737373] leading-relaxed">
                        Multi-color emblem, curved contours, standard logo or badge.
                      </p>
                    </div>
                  </button>

                  {/* Complex Tier */}
                  <button
                    type="button"
                    onClick={() => setComplexity('complex')}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      complexity === 'complex'
                        ? 'border-2 border-[#141414] bg-[#F5F4F0] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex h-20 w-full items-center justify-center rounded-lg border border-[#EAE8E3] bg-white p-2">
                      <svg viewBox="0 0 80 60" className="h-full w-full" fill="none">
                        <path d="M 40 10 L 52 24 L 68 28 L 56 40 L 60 52 L 40 44 L 20 52 L 24 40 L 12 28 L 28 24 Z" stroke="#141414" strokeWidth="1.5" />
                        <circle cx="40" cy="30" r="10" stroke="#E05328" strokeWidth="1.5" />
                        <line x1="28" y1="20" x2="52" y2="40" stroke="#E05328" strokeDasharray="2 2" />
                        <line x1="52" y1="20" x2="28" y2="40" stroke="#E05328" strokeDasharray="2 2" />
                      </svg>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-bold text-[#141414]">Complex</span>
                        <span className="font-mono text-xs font-bold text-[#141414]">
                          ${settings.complex_tier_price}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-[#737373] leading-relaxed">
                        Intricate hand-drawn art, detailed mascots, deep reconstruction.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Font / Lettering Reconstruction Toggle */}
              <div className="rounded-xl border border-[#EAE8E3] p-5 bg-[#F9F8F6]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#141414]">{tQuote('fontTitle')}</span>
                    <p className="mt-1 text-[11px] text-[#737373] max-w-md">{tQuote('fontDesc')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasText}
                      onChange={(e) => setHasText(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#CCCCCC] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E05328]"></div>
                  </label>
                </div>
              </div>

              {/* Reconstruction Intensity */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('repairTitle')}
                </label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'clean', title: 'Clean Original', desc: 'Sharp edges, redraw paths directly', addon: '+$0' },
                    { id: 'moderate', title: 'Moderate Repair', desc: 'Rebuild blurry edges & missing parts', addon: '+$20' },
                    { id: 'heavy', title: 'Deep Restoration', desc: 'Heavy pixelation, hand re-drafting', addon: '+$35' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setReconstructionOption(opt.id as 'clean' | 'moderate' | 'heavy')}
                      className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                        reconstructionOption === opt.id
                          ? 'border-[#141414] bg-[#F5F4F0] shadow-xs'
                          : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#141414]">{opt.title}</span>
                        <span className="font-mono text-[10px] font-bold text-[#737373]">{opt.addon}</span>
                      </div>
                      <span className="text-[10px] text-[#737373] mt-2">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Separation Count */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('colorsTitle')}
                </label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: '1-2', label: '1–2 Spot Colors', addon: 'Included' },
                    { id: '3-5', label: '3–5 Colors', addon: '+$5' },
                    { id: '6+', label: '6+ Colors', addon: '+$15' },
                    { id: 'gradient', label: 'Gradients / Mesh', addon: '+$15' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColorCount(c.id as ColorCount)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                        colorCount === c.id
                          ? 'border-[#141414] bg-[#F5F4F0] font-bold text-[#141414]'
                          : 'border-[#EAE8E3] bg-white text-[#737373] hover:border-[#CCCCCC]'
                      }`}
                    >
                      <span className="text-xs">{c.label}</span>
                      <span className="font-mono text-[10px] mt-1 text-[#737373]">{c.addon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Turnaround Speed */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('turnaroundTitle')}
                </label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTurnaround('standard')}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      turnaround === 'standard'
                        ? 'border-[#141414] bg-[#F5F4F0] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#141414]">Standard Studio SLA</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">24 to 48 Hours Turnaround</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#141414]">Included</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnaround('express')}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      turnaround === 'express'
                        ? 'border-2 border-[#E05328] bg-[#FDF3F0] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#141414]">Priority Express Rush</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">Under 12–16 Hours Dispatch</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#E05328]">+35%</span>
                  </button>
                </div>
              </div>

              {/* Production Notes / Tolerances */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('notesTitle')}
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify physical production equipment: e.g., DTF 6-color, Roland CNC vinyl cutter, minimum line width 0.5pt, spot PMS callouts..."
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] p-3 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Back / Next Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#EAE8E3]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-[#141414]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E05328] px-7 py-3 text-xs font-bold text-white hover:bg-[#C8461D] transition-colors"
                >
                  <span>Continue to Review &amp; Order</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Sticky Calculation Summary */}
            <div className="lg:col-span-4 sticky top-24 rounded-2xl border border-[#EAE8E3] bg-white p-6 shadow-xs space-y-6">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  {tQuote('summaryTitle')}
                </span>
                <h3 className="mt-1 text-base font-bold text-[#141414]">{projectName}</h3>
              </div>

              {/* Itemized Breakdown */}
              <div className="space-y-2 border-y border-[#EAE8E3] py-4 font-mono text-xs">
                {pricing.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[#737373]">
                    <span className="text-[11px] truncate max-w-[180px]">{item.label}</span>
                    <span className="font-bold text-[#141414]">${item.amount}</span>
                  </div>
                ))}
              </div>

              {/* Total & Guarantee */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#141414]">{tQuote('totalPrice')}</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-[#141414]">${pricing.total}</span>
                    <span className="block font-mono text-[10px] text-[#737373]">USD · Guaranteed</span>
                  </div>
                </div>

                {pricing.needsManualReview && (
                  <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                      <span>Senior QA Manual Review</span>
                    </div>
                    {pricing.manualReviewReason}
                  </div>
                )}
              </div>

              {/* Master Formats Guaranteed */}
              <div className="border-t border-[#EAE8E3] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#737373]">
                  Deliverables Included:
                </span>
                <div className="mt-2 flex flex-wrap gap-1">
                  <DeliverableBadge format="ai" variant="pill" />
                  <DeliverableBadge format="eps" variant="pill" />
                  <DeliverableBadge format="svg" variant="pill" />
                  <DeliverableBadge format="pdf" variant="pill" />
                  <DeliverableBadge format="png" variant="pill" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & ORDER */}
        {currentStep === 3 && (
          <div className="mt-12 rounded-2xl border border-[#EAE8E3] bg-white p-8 sm:p-12 shadow-xs">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-[#141414]">{tQuote('confirmTitle')}</h2>
              <p className="mt-1 text-xs text-[#737373]">{tQuote('confirmDesc')}</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="mt-10 max-w-xl mx-auto space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g., Alex Morgan"
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-2.5 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('workEmail')}
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g., alex@designstudio.com"
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-2.5 text-xs text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#141414]">
                  {tQuote('paymentTitle')}
                </label>
                <div className="mt-3 space-y-2">
                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentOption === 'card_simulated'
                        ? 'border-[#141414] bg-[#F5F4F0]'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'card_simulated'}
                        onChange={() => setPaymentOption('card_simulated')}
                        className="text-[#141414] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-[#E05328]" />
                          <span>Credit / Debit Card (Instant Production Start)</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">Priority SLA commences immediately</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#141414]">${pricing.total}</span>
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentOption === 'pay_after_quote_review'
                        ? 'border-[#141414] bg-[#F5F4F0]'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'pay_after_quote_review'}
                        onChange={() => setPaymentOption('pay_after_quote_review')}
                        className="text-[#141414] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                          <Lock className="h-3.5 w-3.5 text-[#737373]" />
                          <span>Pay After Senior QA Inspects Artwork</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">Zero charge now. Confirm price upon review.</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#737373]">$0 due now</span>
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                      paymentOption === 'invoice_b2b'
                        ? 'border-[#141414] bg-[#F5F4F0]'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentOption === 'invoice_b2b'}
                        onChange={() => setPaymentOption('invoice_b2b')}
                        className="text-[#141414] focus:ring-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#141414] flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-[#737373]" />
                          <span>B2B Commercial Account / Net-30 Terms</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">Bill to verified business entity</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#737373]">Net-30 Invoice</span>
                  </label>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-[#EAE8E3]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-[#141414]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Specs</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E05328] px-8 py-3.5 text-xs font-bold text-white shadow-xs hover:bg-[#C8461D] disabled:opacity-50 transition-colors"
                >
                  <span>{isSubmitting ? 'Dispatching to Production Desk...' : tQuote('submitBtn')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
