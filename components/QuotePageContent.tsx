'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ComplexityPicker from '@/components/ComplexityPicker';
import Footer from '@/components/Footer';
import DeliverableBadge from '@/components/DeliverableBadge';
import { calculatePricing, PricingInput } from '@/lib/pricing';
import { createOrder, getOrderById } from '@/lib/services/orders';
import { getCurrentUser, signUpWithEmail } from '@/lib/services/auth';
import { processClientFileUpload, UploadedFileData } from '@/lib/services/storage';
import { processCheckout } from '@/lib/services/payments';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/services/content';
import { clearQuoteDraft, loadQuoteDraft, saveQuoteDraft } from '@/lib/services/quote-draft';
import { INPUT_LIMITS } from '@/lib/security';
import { useTranslations } from 'next-intl';
import {
  ComplexityTier,
  TurnaroundSpeed,
  ArtworkType,
  UserProfile,
  OrderStatus,
  ColorCount,
  PricingCalculation,
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
  Clock3,
  ShieldCheck,
} from 'lucide-react';

function QuoteSummary({
  projectName,
  pricing,
  turnaround,
  breakdownLabel,
  labels,
  className = '',
}: {
  projectName: string;
  pricing: PricingCalculation;
  turnaround: TurnaroundSpeed;
  breakdownLabel: (label: string) => string;
  labels: {
    summary: string;
    total: string;
    note: string;
    reviewTitle: string;
    reviewDescription: string;
    delivery: string;
    standard: string;
    express: string;
    deliverables: string;
    privacy: string;
  };
  className?: string;
}) {
  return (
    <aside className={`rounded-2xl border border-[#DAD8D2] bg-white p-6 shadow-sm ${className}`} aria-label={labels.summary}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#737373]">{labels.summary}</span>
          <h3 className="mt-1 truncate text-lg font-bold text-[#141414]">{projectName}</h3>
        </div>
        <span className="rounded-full bg-[#E9F9EE] px-2.5 py-1 text-xs font-bold text-[#115C3B]">USD</span>
      </div>

      <div className="mt-5 space-y-2.5 border-y border-[#EAE8E3] py-4">
        {pricing.breakdown.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex justify-between gap-4 text-sm text-[#656565]">
            <span>{breakdownLabel(item.label)}</span>
            <span className="shrink-0 font-mono font-bold text-[#141414]">${item.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#141414]">{labels.total}</p>
          <p className="mt-1 text-xs text-[#737373]">{labels.note}</p>
        </div>
        <span className="text-3xl font-extrabold tracking-tight text-[#141414]">${pricing.total}</span>
      </div>

      <div className="mt-5 grid gap-2 rounded-xl bg-[#F7F7F4] p-3 text-sm text-[#555]">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#18794E]" /><span>{labels.delivery}: <strong>{turnaround === 'express' ? labels.express : labels.standard}</strong></span></div>
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#18794E]" /><span>{labels.privacy}</span></div>
      </div>

      {pricing.needsManualReview && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
          <div className="mb-1 flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" />{labels.reviewTitle}</div>
          {labels.reviewDescription}
        </div>
      )}

      <div className="mt-5 border-t border-[#EAE8E3] pt-4">
        <span className="text-xs font-semibold text-[#737373]">{labels.deliverables}</span>
        <div className="mt-2 flex flex-wrap gap-1">
          <DeliverableBadge format="ai" variant="pill" />
          <DeliverableBadge format="eps" variant="pill" />
          <DeliverableBadge format="svg" variant="pill" />
          <DeliverableBadge format="pdf" variant="pill" />
          <DeliverableBadge format="png" variant="pill" />
        </div>
      </div>
    </aside>
  );
}

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
  const [draftReady, setDraftReady] = useState(false);
  const [draftNotice, setDraftNotice] = useState<'restored' | 'reorder' | 'saved' | null>(null);
  const submitLock = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Configuration State
  const [projectName, setProjectName] = useState(() => tQuote('ui.defaultProject'));
  const [artworkType, setArtworkType] = useState<ArtworkType>('ai_logo');
  const [complexity, setComplexity] = useState<ComplexityTier>(
    ['simple', 'standard', 'complex'].includes(searchParams?.get('tier') || '')
      ? searchParams.get('tier') as ComplexityTier : 'standard'
  );
  const [hasText, setHasText] = useState(true);
  const [artistReviewRequested, setArtistReviewRequested] = useState(false);
  const [reconstructionOption, setReconstructionOption] = useState<'clean' | 'moderate' | 'heavy'>('moderate');
  const [colorCount, setColorCount] = useState<'1-2' | '3-5' | '6+' | 'gradient'>('3-5');
  const [turnaround, setTurnaround] = useState<TurnaroundSpeed>('standard');
  const [notes, setNotes] = useState('');
  const [sourceOrderId, setSourceOrderId] = useState<string | undefined>();

  // Step 3 Checkout / Submission Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentOption, setPaymentOption] = useState<'card_simulated' | 'pay_after_quote_review' | 'invoice_b2b'>('card_simulated');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function initialize() {
      const [user, siteSettings] = await Promise.all([getCurrentUser(), getSiteSettings()]);
      if (user) {
        setCurrentUser(user);
        setCustomerName(user.full_name || '');
        setCustomerEmail(user.email || '');
      }
      setSettings(siteSettings);

      const reorderId = searchParams?.get('reorder');
      const source = reorderId ? await getOrderById(reorderId) : null;
      const draft = !source ? loadQuoteDraft() : null;
      if (source) {
        setProjectName(`${source.project_name} Variation`);
        setArtworkType(source.artwork_type);
        setComplexity(source.complexity);
        setHasText(source.has_text);
        setReconstructionOption(source.reconstruction_needed ? 'moderate' : 'clean');
        const previousColors = source.colors.match(/1-2|3-5|6\+|gradient/)?.[0] as ColorCount | undefined;
        if (previousColors) setColorCount(previousColors);
        setTurnaround(source.turnaround);
        setNotes(`Based on ${source.order_number}. ${source.notes || ''}`.trim());
        setSourceOrderId(source.id);
        setCurrentStep(2);
        setDraftNotice('reorder');
      } else if (draft) {
        setProjectName(draft.projectName);
        setArtworkType(draft.artworkType);
        setComplexity(draft.complexity);
        setArtistReviewRequested(draft.artistReviewRequested);
        setHasText(draft.hasText);
        setReconstructionOption(draft.reconstructionOption);
        setColorCount(draft.colorCount);
        setTurnaround(draft.turnaround);
        setNotes(draft.notes);
        setCustomerName(draft.customerName || user?.full_name || '');
        setCustomerEmail(draft.customerEmail || user?.email || '');
        setUploadedFile(draft.uploadedFile);
        setSourceOrderId(draft.sourceOrderId);
        setDraftNotice('restored');
      }
      setDraftReady(true);
    }
    initialize().catch(() => setDraftReady(true));
  }, [searchParams]);

  useEffect(() => {
    if (!draftReady || isSubmitting) return;
    const timer = window.setTimeout(() => {
      const savedWithFile = saveQuoteDraft({
        projectName, artworkType, complexity, artistReviewRequested, hasText,
        reconstructionOption, colorCount, turnaround, notes, customerName,
        customerEmail, uploadedFile, sourceOrderId, savedAt: new Date().toISOString(),
      });
      setDraftNotice(savedWithFile ? 'saved' : null);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draftReady, isSubmitting, projectName, artworkType, complexity, artistReviewRequested, hasText, reconstructionOption, colorCount, turnaround, notes, customerName, customerEmail, uploadedFile, sourceOrderId]);

  // Compute pricing with CMS dynamic base tier rates
  const pricingInput: PricingInput = {
    complexity,
    hasText,
    reconstructionNeeded: reconstructionOption === 'moderate' || reconstructionOption === 'heavy',
    heavyReconstruction: reconstructionOption === 'heavy',
    colorCount,
    turnaround,
    artworkType,
    artistReviewRequested,
  };

  const customBasePrices = {
    simple: settings.simple_tier_price,
    standard: settings.standard_tier_price,
    complex: settings.complex_tier_price,
  };

  const pricing = calculatePricing(pricingInput, customBasePrices);
  const localizedBreakdownLabel = (label: string) => {
    if (label.endsWith('Geometry Base')) return `${tQuote(`complexityGuide.${complexity}.title`)} ${tQuote('ui.geometryBase')}`;
    if (label.startsWith('Font &')) return tQuote('ui.fontRebuild');
    if (label.startsWith('Heavy Missing')) return tQuote('ui.heavyRebuild');
    if (label.startsWith('Reconstruct Missing')) return tQuote('ui.missingRebuild');
    if (label.startsWith('Complex Gradients')) return tQuote('ui.gradientSeparation');
    if (label.includes('Spot Colors')) return tQuote('ui.colorSeparation', { count: colorCount });
    if (label.startsWith('Priority Express')) return tQuote('ui.expressDispatch');
    return label;
  };
  const summaryLabels = {
    summary: tQuote('summaryTitle'),
    total: tQuote(pricing.needsManualReview ? 'complexityGuide.estimate' : 'totalPrice'),
    note: tQuote('complexityGuide.priceNote'),
    reviewTitle: tQuote('complexityGuide.reviewTitle'),
    reviewDescription: tQuote('complexityGuide.reviewDescription'),
    delivery: tQuote('ui.estimatedDelivery'),
    standard: tQuote('ui.standardTime'),
    express: tQuote('ui.expressTime'),
    deliverables: tQuote('ui.deliverables'),
    privacy: tQuote('ui.privateFiles'),
  };

  const goToStep = (step: number) => {
    if (step > 1 && !uploadedFile) {
      setFormError(tQuote('ui.uploadFirst'));
      setCurrentStep(1);
      return;
    }
    if (step > 1 && !projectName.trim()) {
      setFormError(tQuote('ui.projectFirst'));
      setCurrentStep(1);
      return;
    }
    setFormError(null);
    setCurrentStep(step);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  // File drop / select handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setFormError(null);
      try {
        const processed = await processClientFileUpload(file);
        setUploadedFile(processed);
        if (!projectName || projectName === tQuote('ui.defaultProject')) {
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
        if (!projectName || projectName === tQuote('ui.defaultProject')) {
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
        reconstruction_level: reconstructionOption,
        turnaround: turnaround,
        estimated_price: pricing.total,
        final_price: pricing.total,
        status: (pricing.needsManualReview || paymentOption === 'pay_after_quote_review' ? 'quote_requested' : 'in_progress') as OrderStatus,
        notes: artistReviewRequested ? `[Artist assessment requested; complexity and price are provisional.]\n${notes}` : notes,
        needs_manual_review: pricing.needsManualReview,
        payment_method: pricing.needsManualReview ? 'pay_after_quote_review' : paymentOption,
        source_order_id: sourceOrderId,
      };

      const filePayload = uploadedFile
        ? {
            name: uploadedFile.name,
            size: uploadedFile.size,
            format: uploadedFile.format,
            url: uploadedFile.url,
            rawFile: uploadedFile.file,
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

      clearQuoteDraft();
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

      <main className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 sm:py-16 lg:px-8">
        {formError && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{formError}</p>}
        {draftNotice && (
          <div role="status" className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span>{tQuote(`draft.${draftNotice}`)}</span>
            <button type="button" onClick={() => { clearQuoteDraft(); setDraftNotice(null); }} className="font-semibold underline">{tQuote('draft.clear')}</button>
          </div>
        )}
        {/* Studio Questionnaire Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#18794E]">
            {tQuote('badge')}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#141414] sm:text-4xl">
            {tQuote('headline')}
          </h1>
          <p className="mt-2 text-sm text-[#737373]">
            {tQuote('subheadline')}
          </p>

          {/* Stepper Progress Bar */}
          <nav aria-label={tQuote('ui.progress')} className="mt-8">
          <div className="mx-auto mb-4 h-1.5 max-w-xl overflow-hidden rounded-full bg-[#EAE8E3]">
            <div className="h-full rounded-full bg-[#18794E] transition-all duration-300" style={{ width: `${(currentStep / 3) * 100}%` }} />
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-6 text-xs">
            <button
              type="button"
              onClick={() => goToStep(1)}
              aria-current={currentStep === 1 ? 'step' : undefined}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 1 ? 'font-bold text-[#18794E]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 1
                    ? 'bg-[#18794E] text-white'
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
              type="button"
              onClick={() => goToStep(2)}
              aria-current={currentStep === 2 ? 'step' : undefined}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 2 ? 'font-bold text-[#18794E]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 2
                    ? 'bg-[#18794E] text-white'
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
              type="button"
              onClick={() => goToStep(3)}
              aria-current={currentStep === 3 ? 'step' : undefined}
              className={`flex items-center gap-2 transition-colors ${
                currentStep === 3 ? 'font-bold text-[#18794E]' : 'text-[#737373] hover:text-[#141414]'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  currentStep === 3
                    ? 'bg-[#18794E] text-white'
                    : 'border border-[#EAE8E3] bg-white text-[#737373]'
                }`}
              >
                3
              </span>
              <span>{tQuote('step3')}</span>
            </button>
          </div>
          </nav>
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
                className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#EAE8E3] bg-[#F9F8F6] p-12 text-center hover:border-[#18794E] cursor-pointer transition-colors"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs text-[#18794E]">
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-[#EAE8E3] text-[#18794E]">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#141414]">{uploadedFile.name}</div>
                    <div className="text-xs text-[#737373]">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.format.toUpperCase()} · {tQuote('ui.ready')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{tQuote('ui.uploaded')}</span>
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
                    {tQuote('ui.changeFile')}
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
                maxLength={INPUT_LIMITS.project}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={tQuote('ui.projectPlaceholder')}
                className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#141414] focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Next Button */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => goToStep(2)}
                disabled={!uploadedFile || !projectName.trim() || isUploading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-7 py-3 text-sm font-bold text-white hover:bg-[#115C3B] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
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
                    { id: 'ai_logo', label: tQuote('ui.aiLogo'), desc: 'Midjourney / DALL-E' },
                    { id: 'lowres_logo', label: tQuote('ui.lowRes'), desc: tQuote('ui.lowResDesc') },
                    { id: 'sketch_scan', label: tQuote('ui.handDrawing'), desc: tQuote('ui.handDrawingDesc') },
                    { id: 'lettering_typography', label: tQuote('ui.typography'), desc: tQuote('ui.typographyDesc') },
                    { id: 'mascot_badge', label: tQuote('ui.mascot'), desc: tQuote('ui.mascotDesc') },
                    { id: 'apparel_signage', label: tQuote('ui.apparel'), desc: tQuote('ui.apparelDesc') },
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

              <ComplexityPicker
                value={artistReviewRequested ? 'review' : complexity}
                prices={customBasePrices}
                onChange={(value) => {
                  setArtistReviewRequested(value === 'review');
                  if (value !== 'review') setComplexity(value);
                }}
              />

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
                    <div className="w-9 h-5 bg-[#CCCCCC] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#18794E]"></div>
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
                    { id: 'clean', title: tQuote('ui.clean'), desc: tQuote('ui.cleanDesc'), addon: '+$0' },
                    { id: 'moderate', title: tQuote('ui.moderate'), desc: tQuote('ui.moderateDesc'), addon: '+$20' },
                    { id: 'heavy', title: tQuote('ui.heavy'), desc: tQuote('ui.heavyDesc'), addon: '+$35' },
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
                    { id: '1-2', label: tQuote('ui.oneTwoColors'), addon: tQuote('ui.included') },
                    { id: '3-5', label: tQuote('ui.threeFiveColors'), addon: '+$5' },
                    { id: '6+', label: tQuote('ui.sixPlusColors'), addon: '+$15' },
                    { id: 'gradient', label: tQuote('ui.gradients'), addon: '+$15' },
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
                      <div className="text-xs font-bold text-[#141414]">{tQuote('ui.standard')}</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">{tQuote('ui.standardDesc')}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#141414]">{tQuote('ui.included')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTurnaround('express')}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      turnaround === 'express'
                        ? 'border-2 border-[#18794E] bg-[#E9F9EE] shadow-xs'
                        : 'border-[#EAE8E3] bg-white hover:border-[#CCCCCC]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#141414]">{tQuote('ui.express')}</div>
                      <div className="text-[11px] text-[#737373] mt-0.5">{tQuote('ui.expressDesc')}</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#18794E]">+35%</span>
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
                  maxLength={INPUT_LIMITS.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tQuote('ui.notesPlaceholder')}
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
                  <span>{tQuote('ui.backUpload')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="hidden items-center gap-2 rounded-lg bg-[#18794E] px-7 py-3 text-sm font-bold text-white hover:bg-[#115C3B] transition-colors lg:inline-flex"
                >
                  <span>{tQuote('ui.continueReview')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <QuoteSummary projectName={projectName} pricing={pricing} turnaround={turnaround} breakdownLabel={localizedBreakdownLabel} labels={summaryLabels} className="sticky top-24 lg:col-span-4" />
          </div>
        )}

        {/* STEP 3: REVIEW & ORDER */}
        {currentStep === 3 && (
          <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="rounded-2xl border border-[#EAE8E3] bg-white p-8 shadow-xs sm:p-10 lg:col-span-8">
            <div className="text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-[#141414]">{tQuote('confirmTitle')}</h2>
              <p className="mt-2 text-sm text-[#737373]">{tQuote('confirmDesc')}</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="mx-auto mt-8 max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#141414]">
                  {tQuote('fullName')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={INPUT_LIMITS.name}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={tQuote('ui.namePlaceholder')}
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#18794E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B4DFC4]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#141414]">
                  {tQuote('workEmail')}
                </label>
                <input
                  type="email"
                  required
                  maxLength={INPUT_LIMITS.email}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={tQuote('ui.emailPlaceholder')}
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#18794E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B4DFC4]"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-sm font-bold text-[#141414]">
                  {tQuote('paymentTitle')}
                </label>
                {pricing.needsManualReview ? (
                  <div role="status" className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-bold">{tQuote('complexityGuide.zeroDue')}</p>
                    <p className="mt-2">{tQuote('complexityGuide.reviewDescription')}</p>
                  </div>
                ) : <div className="mt-3 space-y-2">
                  <div role="note" className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] leading-relaxed text-sky-900">
                    {tQuote('ui.demoCheckout')}
                  </div>
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
                          <CreditCard className="h-3.5 w-3.5 text-[#18794E]" />
                          <span>{tQuote('ui.card')}</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">{tQuote('ui.cardDesc')}</div>
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
                          <span>{tQuote('ui.payAfter')}</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">{tQuote('ui.payAfterDesc')}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#737373]">{tQuote('complexityGuide.zeroDue')}</span>
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
                          <span>{tQuote('ui.b2b')}</span>
                        </div>
                        <div className="text-[11px] text-[#737373]">{tQuote('ui.b2bDesc')}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#737373]">{tQuote('ui.net30')}</span>
                  </label>
                </div>}
              </div>

              {/* Submission CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-[#EAE8E3]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#737373] hover:text-[#141414]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{tQuote('ui.backSpecs')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-6 py-3.5 text-sm font-bold text-white shadow-xs hover:bg-[#115C3B] disabled:opacity-50 transition-colors"
                >
                  <span>{isSubmitting ? tQuote('ui.submitting') : tQuote(pricing.needsManualReview ? 'complexityGuide.submitReview' : 'submitBtn')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
          <QuoteSummary projectName={projectName} pricing={pricing} turnaround={turnaround} breakdownLabel={localizedBreakdownLabel} labels={summaryLabels} className="sticky top-24 lg:col-span-4" />
          </div>
        )}

        {currentStep === 2 && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DAD8D2] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div><p className="text-xs text-[#737373]">{summaryLabels.total}</p><p className="text-xl font-extrabold text-[#141414]">${pricing.total}</p></div>
              <button type="button" onClick={() => goToStep(3)} className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-5 py-3 text-sm font-bold text-white">{tQuote('ui.continueReview')}<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
