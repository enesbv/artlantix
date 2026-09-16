'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, UploadCloud } from 'lucide-react';
import { getCurrentUser } from '@/lib/services/auth';
import { createOrder } from '@/lib/services/orders';
import { processClientFileUpload } from '@/lib/services/storage';
import { calculatePricing } from '@/lib/pricing';
import { Order, UserProfile } from '@/lib/types';

const MAX_BATCH_FILES = 20;

export default function BusinessHubPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [whiteLabel, setWhiteLabel] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [createdOrders, setCreatedOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { getCurrentUser().then(setUser); }, []);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []).slice(0, MAX_BATCH_FILES);
    setFiles(selected);
    setCreatedOrders([]);
    setError(event.target.files && event.target.files.length > MAX_BATCH_FILES
      ? `You can submit up to ${MAX_BATCH_FILES} files in one batch.`
      : null);
  };

  const submitBatch = async () => {
    if (!user || files.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    setProgress(0);
    const completed: Order[] = [];

    try {
      const estimate = calculatePricing({
        complexity: 'standard', turnaround: 'standard', colorCount: '3-5',
        hasText: true, reconstructionNeeded: true, artistReviewRequested: true,
      });

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const processed = await processClientFileUpload(file);
        const projectName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || `Batch artwork ${index + 1}`;
        const order = await createOrder({
          user_id: user.id,
          customer_name: user.full_name,
          customer_email: user.email,
          project_name: projectName,
          artwork_type: 'lowres_logo',
          complexity: 'standard',
          colors: '3-5 colors',
          has_text: true,
          reconstruction_needed: true,
          reconstruction_level: 'moderate',
          turnaround: 'standard',
          estimated_price: estimate.total,
          final_price: estimate.total,
          status: 'quote_requested',
          notes: `[Batch quote request ${index + 1}/${files.length}] White-label delivery preference: ${whiteLabel ? 'yes' : 'no'}.`,
          needs_manual_review: true,
          payment_method: 'pay_after_quote_review',
        }, {
          name: processed.name,
          size: processed.size,
          format: processed.format,
          url: processed.url,
          rawFile: processed.file,
        });
        completed.push(order);
        setCreatedOrders([...completed]);
        setProgress(index + 1);
      }
      setFiles([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The batch could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-[#E6E4DF] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#18794E]" />
            <h1 className="text-xl font-bold tracking-tight text-[#111111]">Business batch quotes</h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#666666]">
            Upload several customer artworks at once. Each file becomes a private, trackable quote request in your order portal.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Secure batch intake</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
          <ShieldCheck className="h-7 w-7 text-[#18794E]" />
          <h2 className="mt-3 text-base font-bold text-[#111111]">What happens next</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#666666]">
            The studio reviews every file, confirms scope and price, and then updates each order independently. No payment is collected during submission.
          </p>
        </div>
        <div className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-[#111111]">Business profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-[#777777]">Company</dt><dd className="font-semibold text-[#111111]">{user?.company_name || 'Not provided'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#777777]">Tax ID</dt><dd className="font-semibold text-[#111111]">{user?.vat_tax_id || 'Not provided'}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-[#777777]">Account</dt><dd className="font-semibold capitalize text-[#111111]">{user?.account_type || '—'}</dd></div>
          </dl>
          <Link href="/dashboard/profile" className="mt-4 inline-flex text-xs font-bold text-[#18794E] hover:underline">Update business details</Link>
        </div>
      </div>

      <section className="rounded-xl border border-[#E6E4DF] bg-white p-6 shadow-xs sm:p-8">
        <h2 className="text-base font-bold text-[#111111]">Upload a batch</h2>
        <p className="mt-1 text-sm text-[#666666]">JPG, PNG, WebP or PDF · maximum 2 MB per file · up to {MAX_BATCH_FILES} files</p>

        {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9D6CE] bg-[#FAFAF8] p-8 text-center hover:border-[#18794E]">
          <UploadCloud className="h-10 w-10 text-[#18794E]" />
          <span className="mt-3 text-sm font-bold text-[#111111]">Select artwork files</span>
          <span className="mt-1 text-xs text-[#777777]">Files are uploaded only when you submit the batch.</span>
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFiles} />
        </label>

        {files.length > 0 && (
          <div className="mt-6 rounded-lg border border-[#E6E4DF] bg-[#FAFAF8] p-4">
            <p className="text-sm font-bold text-[#111111]">Selected files ({files.length})</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {files.map((file) => <li key={`${file.name}-${file.lastModified}`} className="truncate rounded border border-[#E6E4DF] bg-white px-3 py-2 text-xs text-[#555555]">{file.name}</li>)}
            </ul>
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-[#111111]">
              <input type="checkbox" checked={whiteLabel} onChange={(event) => setWhiteLabel(event.target.checked)} className="accent-[#18794E]" />
              Prefer white-label delivery packaging
            </label>
            <div className="mt-5 flex items-center justify-between gap-4">
              <span className="text-xs text-[#666666]">{submitting ? `Submitting ${Math.min(progress + 1, files.length)} of ${files.length}…` : 'A separate quote will be created for every file.'}</span>
              <button onClick={submitBatch} disabled={!user || submitting} className="inline-flex items-center gap-2 rounded-lg bg-[#18794E] px-5 py-3 text-sm font-bold text-white hover:bg-[#115C3B] disabled:cursor-not-allowed disabled:opacity-50">
                <span>{submitting ? 'Submitting…' : 'Submit batch for review'}</span><ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {createdOrders.length > 0 && (
          <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 font-bold text-emerald-900"><CheckCircle2 className="h-5 w-5" />Submitted quote requests</div>
            <ul className="mt-3 space-y-2">
              {createdOrders.map((order) => <li key={order.id}><Link href={`/dashboard/orders/${order.id}`} className="text-sm font-semibold text-emerald-900 underline">{order.project_name} · {order.order_number}</Link></li>)}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
