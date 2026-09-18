'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ComplexityPicker from '@/components/ComplexityPicker';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import AgencyServicesPicker from '@/components/AgencyServicesPicker';
import DeliveryTimeline from '@/components/DeliveryTimeline';
import { AGENCY_SERVICES, AgencyService, getAgencyServices, getAgencyServicesTotal } from '@/lib/agency-services';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { calculatePricing, PricingInput } from '@/lib/pricing';
import { createOrder, getOrderById } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { processClientFileUpload, UploadedFileData } from '@/lib/services/storage';
import { getSiteSettings, SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/services/content';
import { clearQuoteDraft, loadQuoteDraft, saveQuoteDraft } from '@/lib/services/quote-draft';
import { INPUT_LIMITS } from '@/lib/security';
import { useLocale, useTranslations } from 'next-intl';
import { getService, normalizeMarketingLocale } from '@/lib/marketing';
import {
  ComplexityTier,
  TurnaroundSpeed,
  ArtworkType,
  UserProfile,
  OrderStatus,
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
  Clock3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

function QuoteSummary({
  projectName,
  pricing,
  turnaround,
  breakdownLabel,
  labels,
  className = '',
  agencyServices = [],
  agencyTitle = '',
  agencyNote = '',
  onContinue,
  continueLabel,
  customQuote = false,
  contact,
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
  agencyServices?: string[];
  agencyTitle?: string;
  agencyNote?: string;
  onContinue?: () => void;
  continueLabel?: string;
  customQuote?: boolean;
  contact: { title: string; pending: string; note: string };
}) {
  return (
    <aside className={`rounded-2xl border border-[#DAD8D2] bg-white p-6 shadow-sm ${className}`} aria-label={labels.summary}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#737373]">{labels.summary}</span>
          <h3 className="mt-1 truncate text-lg font-bold text-[#141414]">{projectName}</h3>
        </div>
        {!customQuote && <span className="rounded-full bg-[#E9F9EE] px-2.5 py-1 text-xs font-bold text-[#115C3B]">USD</span>}
      </div>

      {!customQuote && <div className="mt-5 space-y-2.5 border-y border-[#EAE8E3] py-4">
        {pricing.breakdown.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex justify-between gap-4 text-sm text-[#656565]">
            <span>{breakdownLabel(item.label)}</span>
            <span className="shrink-0 font-sans font-bold text-[#141414]">${item.amount}</span>
          </div>
        ))}
      </div>}

      {agencyServices.length > 0 && (
        <div className="mt-4 rounded-xl border border-[#B4DFC4] bg-[#E9F9EE] p-4">
          <p className="text-sm font-bold text-[#115C3B]">{agencyTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-[#102A20]">{agencyServices.map((service) => <li key={service}>{service}</li>)}</ul>
          <p className="mt-2 text-xs leading-5 text-[#555]">{agencyNote}</p>
        </div>
      )}

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#141414]">{customQuote ? contact.title : labels.total}</p>
          <p className="mt-1 text-xs leading-5 text-[#737373]">{customQuote ? contact.note : labels.note}</p>
        </div>
        {!customQuote && <span className="text-3xl font-extrabold tracking-tight text-[#141414]">${pricing.total}</span>}
      </div>

      <div className="mt-5 grid gap-2 rounded-xl bg-[#F7F7F4] p-3 text-sm text-[#555]">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 shrink-0 text-[#18794E]" /><span>{labels.delivery}: <strong>{customQuote ? contact.pending : turnaround === 'express' ? labels.express : labels.standard}</strong></span></div>
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#18794E]" /><span>{labels.privacy}</span></div>
      </div>

      {pricing.needsManualReview && !customQuote && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
          <div className="mb-1 flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" />{labels.reviewTitle}</div>
          {labels.reviewDescription}
        </div>
      )}

      <div className="mt-5 border-t border-[#EAE8E3] pt-4">
        <span className="text-xs font-semibold text-[#737373]">{labels.deliverables}</span>
        <div className="mt-3 flex items-center gap-3">
          {(['png', 'pdf', 'svg', 'eps', 'ai'] as const).map((format) => (
            <div key={format} className="flex justify-center" title={format.toUpperCase()}>
              <Image src={`/${format}.svg`} alt={format.toUpperCase()} width={24} height={30} className="h-[30px] w-6 object-contain" />
            </div>
          ))}
        </div>
      </div>
      {onContinue && (
        <button type="button" onClick={onContinue} className="mt-6 hidden w-full items-center justify-center gap-2 rounded-xl bg-[#18794E] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#115C3B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18794E] lg:flex">
          <span>{continueLabel}</span><ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      )}
    </aside>
  );
}

export default function QuotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tQuote = useTranslations('quote');
  const locale = normalizeMarketingLocale(useLocale());
  const smartCopy = {
    tr: { brief: 'Üretim bilgileri', briefDesc: 'Dosyayı nerede kullanacağınızı bilirsek doğru eğri, renk ve sadeleştirme kararlarını veririz.', intended: 'Kullanım amacı', choose: 'Seçin', web: 'Web / dijital', print: 'Baskı / ambalaj', apparel: 'Tekstil / baskı', embroidery: 'Nakış', signage: 'Tabela / folyo', cnc: 'CNC / lazer kesim', unsure: 'Emin değilim · uzman yönlendirsin', company: 'Şirket / marka (isteğe bağlı)' },
    en: { brief: 'Production brief', briefDesc: 'Knowing the intended use helps us choose the right paths, colours and simplification.', intended: 'Intended use', choose: 'Choose', web: 'Web / digital', print: 'Print / packaging', apparel: 'Apparel / print', embroidery: 'Embroidery', signage: 'Signage / vinyl', cnc: 'CNC / laser cutting', unsure: 'Not sure · let the studio advise', company: 'Company / brand (optional)' },
    de: { brief: 'Produktionsbriefing', briefDesc: 'Der Verwendungszweck hilft uns bei Pfaden, Farben und Vereinfachung.', intended: 'Verwendungszweck', choose: 'Auswählen', web: 'Web / digital', print: 'Druck / Verpackung', apparel: 'Textil / Druck', embroidery: 'Stickerei', signage: 'Schild / Folie', cnc: 'CNC / Laserschnitt', unsure: 'Nicht sicher · Studio beraten lassen', company: 'Unternehmen / Marke (optional)' },
  }[locale];

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
  const hasText = false;
  const [artistReviewRequested, setArtistReviewRequested] = useState(false);
  const reconstructionOption = 'clean' as const;
  const colorCount = '1-2' as const;
  const [turnaround, setTurnaround] = useState<TurnaroundSpeed>('standard');
  const [notes, setNotes] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [agencyServices, setAgencyServices] = useState<AgencyService[]>([]);
  const [serviceSlug, setServiceSlug] = useState<string | undefined>();
  const [sourceOrderId, setSourceOrderId] = useState<string | undefined>();

  // Step 3 Checkout / Submission Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
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
      const requestedService = getService(searchParams?.get('service') || '');
      const source = reorderId ? await getOrderById(reorderId) : null;
      const draft = !source ? loadQuoteDraft() : null;
      if (source) {
        setProjectName(`${source.project_name} Variation`);
        setArtworkType(source.artwork_type);
        setAgencyServices(source.agency_services || []);
        setComplexity(source.complexity);
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
        setTurnaround(draft.turnaround);
        setNotes(draft.notes);
        setCompanyName(draft.companyName || '');
        setIntendedUse(draft.intendedUse || '');
        setAgencyServices((draft.agencyServices || []).filter((id) => AGENCY_SERVICES.some((service) => service.id === id)));
        setServiceSlug(draft.serviceSlug);
        setCustomerName(draft.customerName || user?.full_name || '');
        setCustomerEmail(draft.customerEmail || user?.email || '');
        setUploadedFile(draft.uploadedFile);
        setSourceOrderId(draft.sourceOrderId);
        setDraftNotice('restored');
      }
      if (!source && requestedService) {
        setServiceSlug(requestedService.slug);
        setArtworkType(requestedService.artworkType);
        setProjectName(requestedService.title[locale]);
      }
      if (searchParams?.get('review') === '1') setArtistReviewRequested(true);
      setDraftReady(true);
    }
    initialize().catch(() => setDraftReady(true));
  }, [searchParams, locale]);

  useEffect(() => {
    if (!draftReady || isSubmitting) return;
    const timer = window.setTimeout(() => {
      const savedWithFile = saveQuoteDraft({
        projectName, artworkType, complexity, artistReviewRequested, hasText,
        reconstructionOption, colorCount, turnaround, notes, companyName, intendedUse, agencyServices,
        serviceSlug, customerName,
        customerEmail, uploadedFile, sourceOrderId, savedAt: new Date().toISOString(),
      });
      setDraftNotice(savedWithFile ? 'saved' : null);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draftReady, isSubmitting, projectName, artworkType, complexity, artistReviewRequested, hasText, reconstructionOption, colorCount, turnaround, notes, companyName, intendedUse, agencyServices, serviceSlug, customerName, customerEmail, uploadedFile, sourceOrderId]);

  // Compute pricing with CMS dynamic base tier rates
  const pricingInput: PricingInput = {
    complexity,
    hasText,
    reconstructionNeeded: false,
    heavyReconstruction: false,
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

  const vectorPricing = calculatePricing(pricingInput, customBasePrices);
  const selectedAgencyServices = getAgencyServices(agencyServices);
  const agencyTotal = getAgencyServicesTotal(agencyServices);
  const pricing = {
    ...vectorPricing,
    subtotal: vectorPricing.subtotal + agencyTotal,
    total: vectorPricing.total + agencyTotal,
    breakdown: [...vectorPricing.breakdown, ...selectedAgencyServices.map((service) => ({ label: `agency:${service.key}`, amount: service.price }))],
  };
  const localizedBreakdownLabel = (label: string) => {
    if (label.startsWith('agency:')) return tQuote(`agency.${label.slice(7)}Title`);
    if (label.endsWith('Geometry Base')) return `${tQuote(`complexityGuide.${complexity}Title`)} ${tQuote('ui.geometryBase')}`;
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
      const activeUser = currentUser;
      if (!activeUser) {
        saveQuoteDraft({
          projectName, artworkType, complexity, artistReviewRequested, hasText,
          reconstructionOption, colorCount, turnaround, notes, companyName, intendedUse, agencyServices,
          serviceSlug, customerName,
          customerEmail, uploadedFile, sourceOrderId, savedAt: new Date().toISOString(),
        });
        router.push('/login?next=/quote');
        return;
      }

      const intakeDetails = [
        serviceSlug && `[Service: ${serviceSlug}]`,
        companyName.trim() && `[Company / brand: ${companyName.trim()}]`,
        intendedUse && `[Intended use: ${intendedUse}]`,
        artistReviewRequested && '[Custom quote requested; no fixed price. Studio review required to confirm scope, price and delivery.]',
        ...selectedAgencyServices.map((service) => `[Agency service: ${service.id}; USD ${service.price}; separate delivery: ${service.minBusinessDays}-${service.maxBusinessDays} business days after studio approval; vector express does not apply.]`),
        notes.trim(),
      ].filter(Boolean).join('\n').slice(0, INPUT_LIMITS.notes);

      const orderData = {
        user_id: activeUser?.id || 'usr_guest',
        customer_name: customerName || activeUser?.full_name || 'Client',
        customer_email: customerEmail || activeUser?.email || '',
        project_name: projectName || 'Vector Reconstruction',
        artwork_type: artworkType,
        agency_services: selectedAgencyServices.map((service) => service.id),
        complexity: complexity,
        colors: `${colorCount} colors`,
        has_text: hasText,
        reconstruction_needed: false,
        reconstruction_level: reconstructionOption,
        turnaround: turnaround,
        estimated_price: pricing.total,
        final_price: pricing.total,
        status: 'quote_requested' as OrderStatus,
        notes: intakeDetails,
        needs_manual_review: pricing.needsManualReview,
        payment_method: 'pay_after_quote_review' as const,
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
          <span className="font-sans text-xs font-semibold uppercase tracking-widest text-[#18794E]">
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
                  <span className="flex items-center gap-1 font-sans text-xs font-bold text-emerald-700">
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
                className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#18794E] focus:bg-white focus:outline-hidden"
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
            <div className="lg:col-span-8 rounded-2xl border border-[#EAE8E3] bg-white p-8 sm:p-10 shadow-xs space-y-8">
              <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 sm:p-6">
                <h3 className="text-lg font-bold tracking-tight text-[#102A20]">{smartCopy.brief}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5E625F]">{smartCopy.briefDesc}</p>
                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#141414]">{smartCopy.intended}</label>
                    <select value={intendedUse} onChange={(event) => { setIntendedUse(event.target.value); if (event.target.value === 'unsure') setArtistReviewRequested(true); }} className="mt-2 w-full rounded-lg border border-[#DAD8D2] bg-white px-3 py-3 text-sm focus:border-[#18794E] focus:outline-hidden">
                      <option value="">{smartCopy.choose}</option>
                      <option value="web-digital">{smartCopy.web}</option><option value="print-packaging">{smartCopy.print}</option><option value="apparel-print">{smartCopy.apparel}</option><option value="embroidery">{smartCopy.embroidery}</option><option value="signage-vinyl">{smartCopy.signage}</option><option value="cnc-laser">{smartCopy.cnc}</option><option value="unsure">{smartCopy.unsure}</option>
                    </select>
                  </div>
                </div>
              </section>

              <ComplexityPicker
                value={artistReviewRequested ? 'review' : complexity}
                prices={customBasePrices}
                onChange={(value) => {
                  setArtistReviewRequested(value === 'review');
                  if (value !== 'review') setComplexity(value);
                }}
              />

              {/* Turnaround Speed */}
              <fieldset className="rounded-2xl border border-[#EAE8E3] bg-white p-5 sm:p-6">
                <legend className="sr-only">{tQuote('turnaroundTitle')}</legend>
                <h3 className="mb-5 text-lg font-bold tracking-tight text-[#102A20]">{tQuote('turnaroundTitle')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['standard', 'express'] as const).map((speed) => {
                    const selected = turnaround === speed;
                    const Icon = speed === 'express' ? Zap : Clock3;
                    return (
                      <label key={speed} className={`relative flex min-h-56 cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors ${selected ? 'border-[#18794E] bg-[#E9F9EE]' : 'border-[#DAD8D2] bg-white hover:border-[#B4DFC4]'}`}>
                        <input type="radio" name="turnaround" value={speed} checked={selected} onChange={() => setTurnaround(speed)} className="peer sr-only" />
                        <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:shadow-[inset_0_0_0_2px_#115C3B]" />
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F7F4] text-[#18794E]"><Icon className="h-5 w-5" /></span>
                          <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-[#18794E] bg-[#18794E] text-white' : 'border-[#CCC]'}`}>{selected && <CheckCircle2 className="h-5 w-5" />}</span>
                        </div>
                        <span className="mt-5 text-sm font-bold text-[#102A20]">{tQuote(`ui.${speed}`)}</span>
                        <span className="mt-1 text-2xl font-extrabold tracking-tight text-[#102A20]">{tQuote(`ui.${speed}Time`)}</span>
                        <span className={`mt-5 border-t border-[#EAE8E3] pt-4 text-sm font-semibold ${speed === 'express' ? 'text-[#18794E]' : 'text-[#737373]'}`}>{speed === 'express' ? '+35%' : tQuote('ui.included')}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <DeliveryTimeline turnaround={turnaround} variant="quote" />

              <AgencyServicesPicker value={agencyServices} onChange={setAgencyServices} />

              {/* Production Notes / Tolerances */}
              <section className="rounded-2xl border border-[#EAE8E3] bg-white p-5 sm:p-6">
                <label htmlFor="production-notes" className="block text-lg font-bold tracking-tight text-[#102A20]">
                  {tQuote('notesTitle')}
                </label>
                <textarea
                  id="production-notes"
                  rows={3}
                  value={notes}
                  maxLength={INPUT_LIMITS.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tQuote('ui.notesPlaceholder')}
                  className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-white p-3 text-sm text-[#141414] focus:border-[#18794E] focus:bg-white focus:outline-hidden"
                />
              </section>

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

              </div>
            </div>

            <QuoteSummary projectName={projectName} pricing={pricing} turnaround={turnaround} breakdownLabel={localizedBreakdownLabel} labels={summaryLabels} customQuote={artistReviewRequested} contact={customQuoteCopy[locale]} agencyServices={AGENCY_SERVICES.filter((service) => agencyServices.includes(service.id)).map((service) => `${tQuote(`agency.${service.key}Title`)} · ${tQuote('agency.delivery', { min: service.minBusinessDays, max: service.maxBusinessDays })}`)} agencyTitle={tQuote('agency.title')} agencyNote={tQuote('agency.note')} onContinue={() => goToStep(3)} continueLabel={tQuote('ui.continueReview')} className="sticky top-24 lg:col-span-4" />
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
                <label className="block text-sm font-bold text-[#141414]">{smartCopy.company}</label>
                <input type="text" maxLength={INPUT_LIMITS.company} value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-lg border border-[#EAE8E3] bg-[#F9F8F6] px-4 py-3 text-sm text-[#141414] focus:border-[#18794E] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#B4DFC4]" />
              </div>
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

              {/* Production quote workflow: no unverified payment claims. */}
              <div>
                <label className="block text-sm font-bold text-[#141414]">
                  {tQuote('paymentTitle')}
                </label>
                <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#18794E]" />
                    <div>
                      <p className="font-bold">{tQuote('ui.payAfter')}</p>
                      <p className="mt-1 leading-relaxed">{tQuote('ui.payAfterDesc')}</p>
                      <p className="mt-2 font-sans text-xs font-bold text-[#18794E]">{tQuote('complexityGuide.zeroDue')}</p>
                    </div>
                  </div>
                </div>
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
          <QuoteSummary projectName={projectName} pricing={pricing} turnaround={turnaround} breakdownLabel={localizedBreakdownLabel} labels={summaryLabels} customQuote={artistReviewRequested} contact={customQuoteCopy[locale]} agencyServices={AGENCY_SERVICES.filter((service) => agencyServices.includes(service.id)).map((service) => `${tQuote(`agency.${service.key}Title`)} · ${tQuote('agency.delivery', { min: service.minBusinessDays, max: service.maxBusinessDays })}`)} agencyTitle={tQuote('agency.title')} agencyNote={tQuote('agency.note')} className="sticky top-24 lg:col-span-4" />
          </div>
        )}

        {currentStep === 2 && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#DAD8D2] bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div><p className="text-xs text-[#737373]">{artistReviewRequested ? customQuoteCopy[locale].title : summaryLabels.total}</p><p className={`font-extrabold text-[#141414] ${artistReviewRequested ? 'text-sm' : 'text-xl'}`}>{artistReviewRequested ? customQuoteCopy[locale].pending : `$${pricing.total}`}</p></div>
              <button type="button" onClick={() => goToStep(3)} className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-5 py-3 text-sm font-bold text-white">{tQuote('ui.continueReview')}<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
