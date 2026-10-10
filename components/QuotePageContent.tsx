'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ComplexityPicker from '@/components/ComplexityPicker';
import { customQuoteCopy } from '@/lib/custom-quote-copy';
import AgencyServicesPicker from '@/components/AgencyServicesPicker';
import DeliveryTimeline from '@/components/DeliveryTimeline';
import { AGENCY_SERVICES, AgencyService, getAgencyServices, getAgencyServicesTotal } from '@/lib/agency-services';
import Footer from '@/components/Footer';
import { calculatePricing, PricingInput } from '@/lib/pricing';
import { createOrder, getOrderById } from '@/lib/services/orders';
import { getCurrentUser, createDemoGuestSession } from '@/lib/services/auth';
import Link from 'next/link';
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
  Check,
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
    <aside className={`border border-ink bg-paper-2 p-6 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)] ${className}`} aria-label={labels.summary}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-ink-3">{labels.summary}</span>
          <h3 className="mt-1 truncate font-display text-lg font-bold tracking-[-0.02em] text-ink">{projectName}</h3>
        </div>
        {!customQuote && <span className="rounded-full bg-signal-tint px-2.5 py-1 text-xs font-bold text-signal-ink">USD</span>}
      </div>

      {!customQuote && <div className="mt-5 space-y-2.5 border-y border-rule py-4">
        {pricing.breakdown.map((item, index) => (
          <div key={`${item.label}-${index}`} className="flex justify-between gap-4 text-sm text-ink-2">
            <span>{breakdownLabel(item.label)}</span>
            <span className="shrink-0 font-sans font-bold text-ink">${item.amount}</span>
          </div>
        ))}
      </div>}

      {agencyServices.length > 0 && (
        <div className="mt-4 rounded-xl border border-signal-line bg-signal-tint p-4">
          <p className="text-sm font-bold text-signal-ink">{agencyTitle}</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">{agencyServices.map((service) => <li key={service}>{service}</li>)}</ul>
          <p className="mt-2 text-xs leading-5 text-ink-2">{agencyNote}</p>
        </div>
      )}

      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-ink">{customQuote ? contact.title : labels.total}</p>
          <p className="mt-1 text-xs leading-5 text-ink-3">{customQuote ? contact.note : labels.note}</p>
        </div>
        {!customQuote && <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.04em] text-ink">${pricing.total}</span>}
      </div>

      <div className="mt-5 grid gap-2 rounded-xl bg-paper p-3 text-sm text-ink-2">
        <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 shrink-0 text-signal-ink" /><span>{labels.delivery}: <strong>{customQuote ? contact.pending : turnaround === 'express' ? labels.express : labels.standard}</strong></span></div>
        <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-signal-ink" /><span>{labels.privacy}</span></div>
      </div>

      {pricing.needsManualReview && !customQuote && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
          <div className="mb-1 flex items-center gap-1.5 font-bold"><AlertTriangle className="h-4 w-4" />{labels.reviewTitle}</div>
          {labels.reviewDescription}
        </div>
      )}

      <div className="mt-5 border-t border-rule pt-4">
        <span className="text-xs font-semibold text-ink-3">{labels.deliverables}</span>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(['AI', 'EPS', 'SVG', 'PDF', 'PNG'] as const).map((format) => (
            <li key={format} className="border border-rule-strong px-2 py-0.5 text-[11px] font-semibold tracking-[0.06em] text-ink-2">{format}</li>
          ))}
        </ul>
      </div>
      {onContinue && (
        <button type="button" onClick={onContinue} className="group mt-6 hidden w-full items-center justify-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-signal hover:text-ink lg:flex">
          <span>{continueLabel}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
        </button>
      )}
    </aside>
  );
}

export default function QuotePageContent() {
  const searchParams = useSearchParams();
  const tQuote = useTranslations('quote');
  const locale = normalizeMarketingLocale(useLocale());
  const smartCopy = {
    tr: { brief: 'Üretim bilgileri', briefDesc: 'Dosyayı nerede kullanacağınızı bilirsek doğru eğri, renk ve sadeleştirme kararlarını veririz.', intended: 'Kullanım amacı', choose: 'Seçin', web: 'Web / dijital', print: 'Baskı / ambalaj', apparel: 'Tekstil / baskı', embroidery: 'Nakış', signage: 'Tabela / folyo', cnc: 'CNC / lazer kesim', unsure: 'Emin değilim · uzman yönlendirsin', company: 'Şirket / marka (isteğe bağlı)' },
    en: { brief: 'Production brief', briefDesc: 'Knowing the intended use helps us choose the right paths, colors and simplification.', intended: 'Intended use', choose: 'Choose', web: 'Web / digital', print: 'Print / packaging', apparel: 'Apparel / print', embroidery: 'Embroidery', signage: 'Signage / vinyl', cnc: 'CNC / laser cutting', unsure: 'Not sure · let the studio advise', company: 'Company / brand (optional)' },
    de: { brief: 'Produktionsbriefing', briefDesc: 'Der Verwendungszweck hilft uns bei Pfaden, Farben und Vereinfachung.', intended: 'Verwendungszweck', choose: 'Auswählen', web: 'Web / digital', print: 'Druck / Verpackung', apparel: 'Textil / Druck', embroidery: 'Stickerei', signage: 'Schild / Folie', cnc: 'CNC / Laserschnitt', unsure: 'Nicht sicher · Studio beraten lassen', company: 'Unternehmen / Marke (optional)' },
  }[locale];

  // Wizard Step: 1 = Upload, 2 = Specification, 3 = Review & Order
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedOrder, setSubmittedOrder] = useState<{ id: string; order_number: string } | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<'queued' | 'unavailable' | 'failed'>('unavailable');

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
    if (submitLock.current || submittedOrder) return;
    if (!uploadedFile || isUploading) {
      setFormError('Please upload your artwork before submitting.');
      setCurrentStep(1);
      return;
    }
    submitLock.current = true;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const activeUser = currentUser || await createDemoGuestSession(customerEmail, customerName);
      setCurrentUser(activeUser);

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
      setSubmittedOrder({ id: created.id, order_number: created.order_number });
      try {
        const response = await fetch('/api/orders/receipt', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: created.id }),
        });
        const result = await response.json();
        setReceiptStatus(result.status === 'queued' ? 'queued' : result.status === 'unavailable' ? 'unavailable' : 'failed');
      } catch { setReceiptStatus('failed'); }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Order submission failed. Please try again.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  if (submittedOrder) {
    const tr = locale === 'tr';
    const de = locale === 'de';
    return (
      <div className="min-h-screen bg-paper"><Navbar />
        <main className="mx-auto max-w-xl px-4 py-16">
          <div className="border border-ink bg-paper-2 p-7 text-center shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)] sm:p-10">
            <CheckCircle2 className="mx-auto h-14 w-14 text-signal-ink" />
            <h1 className="mt-6 font-display text-[1.9rem] font-bold tracking-[-0.03em] text-ink">{tr ? 'Sipariş talebini aldık' : de ? 'Dein Auftrag ist eingegangen' : 'Your order request is received'}</h1>
            <p className="mt-3 text-sm text-ink-3">{tr ? 'Sipariş numaranı sakla. Çizimini buradan takip edebilirsin.' : de ? 'Bewahre deine Auftragsnummer auf.' : 'Keep your order number to track your artwork.'}</p>
            <div className="mt-7 border border-signal-line bg-signal-tint p-5">
              <p className="text-xs text-ink-3">{tr ? 'Sipariş numarası' : de ? 'Auftragsnummer' : 'Order number'}</p>
              <p className="mt-2 break-all text-base font-semibold text-signal-ink">{submittedOrder.order_number}</p>
            </div>
            <p role="status" className="mt-5 text-xs leading-6 text-ink-3">
              {receiptStatus === 'queued' ? (tr ? 'Sipariş numaranı içeren e-posta gönderim için kabul edildi.' : de ? 'Die E-Mail wurde zum Versand angenommen.' : 'Your order-number email was accepted for sending.') :
                receiptStatus === 'unavailable' ? (tr ? 'E-posta gönderimi henüz etkin değil. Sipariş numaranı kaydet.' : de ? 'E-Mail-Versand ist nicht aktiv. Speichere deine Nummer.' : 'Email sending is not enabled. Save your order number.') :
                (tr ? 'Sipariş kaydedildi, ancak e-posta gönderilemedi. Numaranı kaydet; tekrar sipariş verme.' : de ? 'Auftrag gespeichert, E-Mail fehlgeschlagen. Bestelle nicht erneut.' : 'Your order is saved, but the email could not be sent. Do not submit another order.')}
            </p>
            <Link href="/dashboard" className="group mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors hover:bg-signal hover:text-ink">{tr ? 'Siparişimi takip et' : de ? 'Auftrag verfolgen' : 'Track my order'}<span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span></Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 sm:py-16 lg:px-8">
        {formError && <p role="alert" className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{formError}</p>}
        {draftNotice && (
          <div role="status" className="mb-6 flex items-center justify-between gap-4 rounded-lg border border-ok-line bg-ok-tint p-4 text-sm text-ok-ink">
            <span>{tQuote(`draft.${draftNotice}`)}</span>
            <button type="button" onClick={() => { clearQuoteDraft(); setDraftNotice(null); }} className="font-semibold underline">{tQuote('draft.clear')}</button>
          </div>
        )}
        {/* Quote request header, drawn like the title block of a drawing sheet. */}
        <div className="mx-auto max-w-3xl">
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-2">
            <span aria-hidden="true" className="h-2 w-2 bg-signal" />
            {tQuote('badge')}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.1rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            {tQuote('headline')}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-ink-2">
            {tQuote('subheadline')}
          </p>

          {/* Stepper */}
          <nav aria-label={tQuote('ui.progress')} className="mt-10 border border-ink">
            <ol className="grid grid-cols-3">
              {[tQuote('step1'), tQuote('step2'), tQuote('step3')].map((label, index) => {
                const step = index + 1;
                const state = currentStep === step ? 'current' : currentStep > step ? 'done' : 'todo';
                return (
                  <li key={label} className={index > 0 ? 'border-l border-ink' : ''}>
                    <button
                      type="button"
                      onClick={() => goToStep(step)}
                      aria-current={state === 'current' ? 'step' : undefined}
                      className={`flex w-full items-center gap-2 px-2.5 py-3 text-left text-[12px] font-semibold leading-tight transition-colors sm:gap-3 sm:px-4 sm:text-[13px] ${state === 'current' ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-paper-3'}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`grid h-6 w-6 shrink-0 place-items-center border text-[11px] font-bold tabular-nums ${
                          state === 'current' ? 'border-paper bg-paper text-ink' : state === 'done' ? 'border-ink bg-signal text-ink' : 'border-rule-strong text-ink-3'
                        }`}
                      >
                        {state === 'done' ? <Check className="h-3.5 w-3.5" /> : step}
                      </span>
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* STEP 1: UPLOAD ARTWORK */}
        {currentStep === 1 && (
          <div className="mx-auto mt-10 max-w-3xl border border-ink bg-paper-2 p-6 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)] sm:p-9">
            <div>
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{tQuote('uploadTitle')}</h2>
              <p className="mt-2 text-[15px] leading-6 text-ink-2">{tQuote('uploadDesc')}</p>
            </div>

            {/* Drag & Drop Area */}
            {!uploadedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-rule bg-paper p-12 text-center hover:border-ink cursor-pointer transition-colors"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-2 shadow-xs text-signal-ink">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <div className="mt-4 text-sm font-semibold text-ink">
                  {isUploading ? 'Inspecting raster artwork...' : tQuote('dropzone')}
                </div>
                <p className="mt-1 text-xs text-ink-3">{tQuote('dropzoneSub')}</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-rule bg-paper p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-paper-2 border border-rule text-signal-ink">
                    <FileImage className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink">{uploadedFile.name}</div>
                    <div className="text-xs text-ink-3">
                      {(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.format.toUpperCase()} · {tQuote('ui.ready')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-sans text-xs font-bold text-ok">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                {tQuote('projectName')}
              </label>
              <input
                type="text"
                value={projectName}
                maxLength={INPUT_LIMITS.project}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={tQuote('ui.projectPlaceholder')}
                className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:bg-paper-2 focus:outline-hidden"
              />
            </div>

            {/* Next Button */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={() => goToStep(2)}
                disabled={!uploadedFile || !projectName.trim() || isUploading}
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-signal hover:text-ink disabled:pointer-events-none disabled:opacity-40"
              >
                <span>{tQuote('continueBtn')}</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GEOMETRY & SPECIFICATIONS */}
        {currentStep === 2 && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Questionnaire Form */}
            <div className="space-y-6 lg:col-span-8">
              <section className="border border-ink bg-paper-2 p-5 sm:p-6">
                <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">{smartCopy.brief}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2">{smartCopy.briefDesc}</p>
                <div className="mt-5 grid gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink">{smartCopy.intended}</label>
                    <select value={intendedUse} onChange={(event) => { setIntendedUse(event.target.value); if (event.target.value === 'unsure') setArtistReviewRequested(true); }} className="mt-2 w-full rounded-lg border border-rule bg-paper-2 px-3 py-3 text-sm focus:border-ink focus:outline-hidden">
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
              <fieldset className="border border-ink bg-paper-2 p-5 sm:p-6">
                <legend className="sr-only">{tQuote('turnaroundTitle')}</legend>
                <h3 className="mb-5 font-display text-lg font-bold tracking-[-0.02em] text-ink">{tQuote('turnaroundTitle')}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(['standard', 'express'] as const).map((speed) => {
                    const selected = turnaround === speed;
                    const Icon = speed === 'express' ? Zap : Clock3;
                    return (
                      <label key={speed} className={`relative flex min-h-56 cursor-pointer flex-col rounded-xl border-2 p-4 transition-colors ${selected ? 'border-ink bg-signal-tint' : 'border-rule bg-paper-2 hover:border-signal-line'}`}>
                        <input type="radio" name="turnaround" value={speed} checked={selected} onChange={() => setTurnaround(speed)} className="peer sr-only" />
                        <span className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:shadow-[inset_0_0_0_2px_var(--color-guide)]" />
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-paper text-signal-ink"><Icon className="h-5 w-5" /></span>
                          <span aria-hidden="true" className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-ink bg-ink text-white' : 'border-rule'}`}>{selected && <CheckCircle2 className="h-5 w-5" />}</span>
                        </div>
                        <span className="mt-5 text-sm font-bold text-ink">{tQuote(`ui.${speed}`)}</span>
                        <span className="mt-1 text-2xl font-extrabold tracking-tight text-ink">{tQuote(`ui.${speed}Time`)}</span>
                        <span className={`mt-5 border-t border-rule pt-4 text-sm font-semibold ${speed === 'express' ? 'text-signal-ink' : 'text-ink-3'}`}>{speed === 'express' ? '+35%' : tQuote('ui.included')}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <DeliveryTimeline turnaround={turnaround} variant="quote" />

              <AgencyServicesPicker value={agencyServices} onChange={setAgencyServices} />

              {/* Production Notes / Tolerances */}
              <section className="border border-ink bg-paper-2 p-5 sm:p-6">
                <label htmlFor="production-notes" className="block font-display text-lg font-bold tracking-[-0.02em] text-ink">
                  {tQuote('notesTitle')}
                </label>
                <textarea
                  id="production-notes"
                  rows={3}
                  value={notes}
                  maxLength={INPUT_LIMITS.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={tQuote('ui.notesPlaceholder')}
                  className="mt-2 w-full rounded-lg border border-rule bg-paper-2 p-3 text-sm text-ink focus:border-ink focus:bg-paper-2 focus:outline-hidden"
                />
              </section>

              {/* Back / Next Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-rule">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-3 hover:text-ink"
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
          <div className="border border-ink bg-paper-2 p-6 shadow-[0_30px_60px_-36px_rgb(21_23_28/0.45)] sm:p-9 lg:col-span-8">
            <div>
              <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{tQuote('confirmTitle')}</h2>
              <p className="mt-2 text-[15px] leading-6 text-ink-2">{tQuote('confirmDesc')}</p>
            </div>

            <form onSubmit={handleSubmitOrder} className="mt-8 max-w-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-ink">{smartCopy.company}</label>
                <input type="text" maxLength={INPUT_LIMITS.company} value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:bg-paper-2 focus:outline-hidden focus:ring-2 focus:ring-signal-line" />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink">
                  {tQuote('fullName')}
                </label>
                <input
                  type="text"
                  required
                  maxLength={INPUT_LIMITS.name}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={tQuote('ui.namePlaceholder')}
                  className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:bg-paper-2 focus:outline-hidden focus:ring-2 focus:ring-signal-line"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink">
                  {tQuote('workEmail')}
                </label>
                <input
                  type="email"
                  required
                  maxLength={INPUT_LIMITS.email}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={tQuote('ui.emailPlaceholder')}
                  className="mt-2 w-full rounded-lg border border-rule bg-paper px-4 py-3 text-sm text-ink focus:border-ink focus:bg-paper-2 focus:outline-hidden focus:ring-2 focus:ring-signal-line"
                />
              </div>

              {/* Production quote workflow: no unverified payment claims. */}
              <div>
                <label className="block text-sm font-bold text-ink">
                  {tQuote('paymentTitle')}
                </label>
                <div role="status" className="mt-3 rounded-xl border border-ok-line bg-ok-tint p-4 text-sm text-ok-ink">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-signal-ink" />
                    <div>
                      <p className="font-bold">{tQuote('ui.payAfter')}</p>
                      <p className="mt-1 leading-relaxed">{tQuote('ui.payAfterDesc')}</p>
                      <p className="mt-2 font-sans text-xs font-bold text-signal-ink">{tQuote('complexityGuide.zeroDue')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-rule">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-3 hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{tQuote('ui.backSpecs')}</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-ink py-2.5 pl-6 pr-2.5 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-signal hover:text-ink disabled:pointer-events-none disabled:opacity-40"
                >
                  <span>{isSubmitting ? tQuote('ui.submitting') : tQuote(pricing.needsManualReview ? 'complexityGuide.submitReview' : 'submitBtn')}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-paper text-ink transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
                </button>
              </div>
            </form>
          </div>
          <QuoteSummary projectName={projectName} pricing={pricing} turnaround={turnaround} breakdownLabel={localizedBreakdownLabel} labels={summaryLabels} customQuote={artistReviewRequested} contact={customQuoteCopy[locale]} agencyServices={AGENCY_SERVICES.filter((service) => agencyServices.includes(service.id)).map((service) => `${tQuote(`agency.${service.key}Title`)} · ${tQuote('agency.delivery', { min: service.minBusinessDays, max: service.maxBusinessDays })}`)} agencyTitle={tQuote('agency.title')} agencyNote={tQuote('agency.note')} className="sticky top-24 lg:col-span-4" />
          </div>
        )}

        {currentStep === 2 && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper-2/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div><p className="text-xs text-ink-3">{artistReviewRequested ? customQuoteCopy[locale].title : summaryLabels.total}</p><p className={`font-extrabold text-ink ${artistReviewRequested ? 'text-sm' : 'text-xl'}`}>{artistReviewRequested ? customQuoteCopy[locale].pending : `$${pricing.total}`}</p></div>
              <button type="button" onClick={() => goToStep(3)} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">{tQuote('ui.continueReview')}<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
