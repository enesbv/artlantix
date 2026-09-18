'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowRight, Check, SearchCheck, Plus, Clock3 } from 'lucide-react';
import { getOrders } from '@/lib/services/orders';
import { getCurrentUser } from '@/lib/services/auth';
import { getTrackingStep, trackingCopy } from '@/lib/customer-tracking';
import type { Order } from '@/lib/types';
import TrackingStageArtwork from '@/components/TrackingStageArtwork';



export default function OrderTrackingPage() {
  const locale = useLocale();
  const lang = locale === 'tr' || locale === 'de' ? locale : 'en';
  const copy = trackingCopy[lang];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Authentication required');
        const list = await getOrders(user.id, false, false, true);
        if (active) { setOrders(list); setFailed(false); }
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 60_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [attempt]);

  const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.status))
    .sort((a, b) => Number(b.status === 'preview_ready') - Number(a.status === 'preview_ready'));
  const pastOrders = orders.filter((order) => ['completed', 'cancelled'].includes(order.status));

  const card = (order: Order) => {
    const step = getTrackingStep(order.status);
    const needsApproval = order.status === 'preview_ready';
    const completed = order.status === 'completed';
    const target = completed ? '#master-files' : needsApproval ? '#artwork-review' : '';
    return (
      <article key={order.id} className={`overflow-hidden rounded-2xl border bg-white sm:rounded-3xl ${needsApproval ? 'border-[#8FC9A6] shadow-[0_8px_32px_-20px_rgba(24,121,78,0.3)]' : 'border-[#E0E6DD]'}`}>
        <div className="px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0"><p className="break-all text-[11px] text-[#8A9583]">{order.order_number}</p><h3 className="mt-1.5 break-words text-lg font-semibold tracking-tight text-[#102A20] sm:text-xl">{order.project_name}</h3></div>
            {needsApproval && <span className="rounded-full bg-[#E9F9EE] px-3 py-1.5 text-xs font-medium text-[#18794E]">{copy.action}</span>}
            {step < 0 && <span className="rounded-full bg-[#F2F3F0] px-3 py-1.5 text-xs text-[#7B8276]">{copy.cancelled}</span>}
          </div>

          <div className="flex flex-col items-center py-6 text-center sm:py-8">
            {step >= 0 && <TrackingStageArtwork step={step} />}
            <h4 className="mt-3 text-xl font-semibold tracking-tight text-[#102A20]">{step >= 0 ? copy.steps[step] : copy.cancelled}</h4>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6D7965]">{copy.details[order.status]}</p>
          </div>
          {step >= 0 && <ol aria-label={copy.tracking} className="mb-5 grid grid-cols-3 gap-2 border-t border-[#EDF0E8] pt-5">
            {copy.steps.map((label, index) => {
              const done = completed || index < step;
              const current = index === step && !completed;
              return <li key={label} aria-current={current ? 'step' : undefined} className="flex flex-col items-center gap-2 text-center">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${done ? 'bg-[#18794E] text-white' : current ? 'bg-[#E9F9EE] text-[#18794E]' : 'bg-[#F3F5F0] text-[#A0AA98]'}`}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                <span className={`text-[10px] leading-4 sm:text-xs ${done || current ? 'font-medium text-[#36502E]' : 'text-[#939D89]'}`}>{index === 0 && done && lang === 'tr' ? 'Grafiker inceledi' : label}</span>
              </li>;
            })}
          </ol>}
        </div>
        <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[#EDF0E8] bg-[#FCFDFB] px-5 py-4 sm:flex-row sm:items-center sm:px-8">
          <span className="flex items-center gap-1.5 text-[11px] text-[#89947E]"><Clock3 className="h-3.5 w-3.5" />{copy.updated}: {new Date(order.updated_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US')}</span>
          <Link href={`/dashboard/orders/${order.id}${target}`} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${needsApproval || completed ? 'bg-[#18794E] text-white hover:bg-[#115C3B]' : 'border border-[#DDE5D6] bg-white text-[#36502E] hover:bg-[#E9F9EE]'}`}>{needsApproval ? copy.review : completed ? copy.download : copy.view}<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#102A20] sm:text-4xl">{copy.title}</h1><p className="mt-3 text-sm leading-6 text-[#77846C]">{copy.description}</p></div>
        <Link href="/quote" className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#CBDCC7] bg-white px-4 py-3 text-xs font-semibold text-[#18794E] hover:bg-[#E9F9EE]"><Plus className="h-4 w-4" />{copy.newOrder}</Link>
      </div>
      {failed && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{copy.error} <button type="button" onClick={() => { setLoading(true); setAttempt((value) => value + 1); }} className="ml-2 underline">{copy.retry}</button></div>}
      {loading ? <div role="status" aria-label={copy.loading} className="space-y-4">{[1,2].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-[#E0E6DD] bg-white" />)}</div> :
        orders.length === 0 && !failed ? <div className="rounded-3xl border border-dashed border-[#CCD9C3] bg-white px-6 py-16 text-center"><SearchCheck className="mx-auto h-10 w-10 text-[#18794E]" /><h2 className="mt-5 text-lg font-semibold text-[#102A20]">{copy.empty}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#77846C]">{copy.emptyBody}</p><Link href="/quote" className="mt-6 inline-flex rounded-xl bg-[#18794E] px-5 py-3 text-sm font-medium text-white">{copy.newOrder}</Link></div> :
        <div className="space-y-8">
          {activeOrders.length > 0 && <section className="space-y-4" aria-label={copy.active}>{activeOrders.slice(0,limit).map(card)}</section>}
          {pastOrders.length > 0 && limit > activeOrders.length && <section className="space-y-4"><h2 className="pt-2 text-sm font-medium text-[#7A866F]">{copy.past}</h2>{pastOrders.slice(0,Math.max(0,limit-activeOrders.length)).map(card)}</section>}
          {orders.length > limit && <button type="button" onClick={() => setLimit((value) => value + 6)} className="w-full rounded-xl border border-[#DDE5D6] bg-white py-3 text-xs font-medium text-[#18794E]">{copy.more}</button>}
        </div>}
    </div>
  );
}
