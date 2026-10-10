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
      <article key={order.id} className={`border bg-paper-2 ${needsApproval ? 'border-ink shadow-[6px_6px_0_0_var(--color-signal)]' : 'border-ink'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] sm:px-6">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 bg-signal" />{order.order_number}</span>
          {needsApproval && <span className="bg-signal px-2 py-0.5 text-ink">{copy.action}</span>}
          {step < 0 && <span className="text-ink-3">{copy.cancelled}</span>}
        </div>
        <div className="px-5 pt-6 sm:px-8">
          <h3 className="break-words font-display text-[1.45rem] font-bold leading-tight tracking-[-0.025em] text-ink sm:text-[1.7rem]">{order.project_name}</h3>

          <div className="flex flex-col items-center py-6 text-center sm:py-8">
            {step >= 0 && <TrackingStageArtwork step={step} />}
            <h4 className="mt-3 font-display text-xl font-bold tracking-[-0.02em] text-ink">{step >= 0 ? copy.steps[step] : copy.cancelled}</h4>
            <p className="mt-3 max-w-md text-sm leading-6 text-ink-3">{copy.details[order.status]}</p>
          </div>
          {step >= 0 && <ol aria-label={copy.tracking} className="mb-6 grid grid-cols-3 gap-2 border-t border-rule pt-5">
            {copy.steps.map((label, index) => {
              const done = completed || index < step;
              const current = index === step && !completed;
              return <li key={label} aria-current={current ? 'step' : undefined} className="flex flex-col items-center gap-2 text-center">
                <span className={`grid h-6 w-6 place-items-center border text-[10px] font-bold tabular-nums ${done ? 'border-ink bg-ink text-paper' : current ? 'border-ink bg-signal text-ink' : 'border-rule-strong text-ink-3'}`}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                <span className={`text-[10px] leading-4 sm:text-xs ${done || current ? 'font-medium text-ink-2' : 'text-ink-3'}`}>{index === 0 && done && lang === 'tr' ? 'Grafiker inceledi' : label}</span>
              </li>;
            })}
          </ol>}
        </div>
        <div className="flex flex-col justify-between gap-4 border-t border-ink px-5 py-3.5 sm:flex-row sm:items-center sm:px-8">
          <span className="flex items-center gap-1.5 text-[11px] text-ink-3"><Clock3 className="h-3.5 w-3.5" />{copy.updated}: {new Date(order.updated_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : 'en-US')}</span>
          <Link href={`/dashboard/orders/${order.id}${target}`} className={`group inline-flex items-center justify-center gap-3 rounded-full py-2 pl-5 pr-2 text-[14px] font-semibold transition-colors ${needsApproval || completed ? 'bg-ink text-paper hover:bg-signal hover:text-ink' : 'border border-ink text-ink hover:bg-paper-3'}`}>{needsApproval ? copy.review : completed ? copy.download : copy.view}<span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 ${needsApproval || completed ? 'bg-paper text-ink' : 'bg-ink text-paper'}`}><ArrowRight className="h-3.5 w-3.5" /></span></Link>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div><h1 className="font-display text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">{copy.title}</h1><p className="mt-3 text-[15px] leading-7 text-ink-2">{copy.description}</p></div>
        <Link href="/quote" className="inline-flex shrink-0 items-center justify-center gap-2 self-start border border-ink bg-paper-2 px-4 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:bg-signal-tint"><Plus className="h-4 w-4" />{copy.newOrder}</Link>
      </div>
      {failed && <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">{copy.error} <button type="button" onClick={() => { setLoading(true); setAttempt((value) => value + 1); }} className="ml-2 underline">{copy.retry}</button></div>}
      {loading ? <div role="status" aria-label={copy.loading} className="space-y-4">{[1,2].map((item) => <div key={item} className="h-72 animate-pulse border border-rule bg-paper-2" />)}</div> :
        orders.length === 0 && !failed ? <div className="border-2 border-dashed border-signal bg-signal-tint/40 px-6 py-16 text-center"><SearchCheck className="mx-auto h-10 w-10 text-signal-ink" /><h2 className="mt-5 text-lg font-semibold text-ink">{copy.empty}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-3">{copy.emptyBody}</p><Link href="/quote" className="mt-6 inline-flex rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white">{copy.newOrder}</Link></div> :
        <div className="space-y-8">
          {activeOrders.length > 0 && <section className="space-y-4" aria-label={copy.active}>{activeOrders.slice(0,limit).map(card)}</section>}
          {pastOrders.length > 0 && limit > activeOrders.length && <section className="space-y-4"><h2 className="pt-2 text-sm font-medium text-ink-3">{copy.past}</h2>{pastOrders.slice(0,Math.max(0,limit-activeOrders.length)).map(card)}</section>}
          {orders.length > limit && <button type="button" onClick={() => setLimit((value) => value + 6)} className="w-full border border-ink bg-paper-2 py-3 text-[14px] font-semibold text-ink transition-colors hover:bg-paper-3">{copy.more}</button>}
        </div>}
    </div>
  );
}
