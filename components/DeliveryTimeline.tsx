'use client';

import React, { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { TurnaroundSpeed, OrderStatus } from '@/lib/types';
import {
  calculateDeliveryProjection,
  getDeliveryPhases,
  calculateRemainingHours,
  formatStudioDate,
  type DeliveryLocale,
} from '@/lib/delivery-calculator';
import { Check, Clock, Zap } from 'lucide-react';

const COPY = {
  en: {
    quoteTitle: 'Estimated delivery plan', orderTitle: 'Production schedule',
    express: 'Priority express (16 h)', standard: 'Standard studio (48 h)',
    window: 'Window', hours: 'Calculated from studio hours, Monday to Saturday, 09:00–19:00.',
    note: 'Every step is carried out by a person, never by automatic tracing.',
  },
  de: {
    quoteTitle: 'Voraussichtlicher Lieferplan', orderTitle: 'Produktionsplan',
    express: 'Prioritäts-Express (16 Std.)', standard: 'Standard-Studio (48 Std.)',
    window: 'Dauer', hours: 'Berechnet nach Studiozeiten, Montag bis Samstag, 09:00–19:00 Uhr.',
    note: 'Jeder Schritt wird von einem Menschen ausgeführt, nie durch Auto-Trace.',
  },
  tr: {
    quoteTitle: 'Tahmini teslimat planı', orderTitle: 'Üretim takvimi',
    express: 'Öncelikli ekspres (16 saat)', standard: 'Standart stüdyo (48 saat)',
    window: 'Süre', hours: 'Pazartesi – Cumartesi 09:00 – 19:00 stüdyo mesai saatlerine göre hesaplanır.',
    note: 'Her adım otomatik izleme ile değil, bir kişi tarafından yapılır.',
  },
} as const;

const DATE_LOCALES: Record<DeliveryLocale, string> = { en: 'en-US', de: 'de-DE', tr: 'tr-TR' };

interface DeliveryTimelineProps {
  turnaround: TurnaroundSpeed;
  status?: OrderStatus;
  createdAt?: string;
  expectedDeliveryAt?: string;
  variant?: 'quote' | 'order-detail';
}

export default function DeliveryTimeline({
  turnaround,
  status = 'quote_requested',
  createdAt,
  expectedDeliveryAt,
  variant = 'quote',
}: DeliveryTimelineProps) {
  const locale = useLocale();
  const lang: DeliveryLocale = locale === 'tr' || locale === 'de' ? locale : 'en';
  const copy = COPY[lang];

  const startDate = useMemo(() => (createdAt ? new Date(createdAt) : new Date()), [createdAt]);

  const projection = useMemo(() => calculateDeliveryProjection(startDate, turnaround, lang), [startDate, turnaround, lang]);

  const targetDateDisplay = useMemo(() => (
    expectedDeliveryAt ? formatStudioDate(new Date(expectedDeliveryAt), DATE_LOCALES[lang]) : projection.formattedTarget
  ), [expectedDeliveryAt, projection, lang]);

  const remaining = useMemo(() => calculateRemainingHours(expectedDeliveryAt || projection.targetIso, lang), [expectedDeliveryAt, projection, lang]);

  const phases = useMemo(() => getDeliveryPhases(status, turnaround, lang), [status, turnaround, lang]);

  const isExpress = turnaround === 'express';

  return (
    <section className="border border-ink bg-paper-2">
      <header className="flex flex-col justify-between gap-3 border-b border-ink px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            <span aria-hidden="true" className="h-2 w-2 bg-signal" />
            {variant === 'quote' ? copy.quoteTitle : copy.orderTitle}
          </p>
          <p className="mt-1 font-display text-lg font-bold tracking-[-0.02em] text-ink">{targetDateDisplay}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 border border-ink px-2.5 py-1 text-[11px] font-semibold">
            {isExpress ? <Zap className="h-3 w-3 text-signal-ink" aria-hidden="true" /> : <Clock className="h-3 w-3 text-ink-3" aria-hidden="true" />}
            {isExpress ? copy.express : copy.standard}
          </span>
          {variant === 'order-detail' && status !== 'completed' && (
            <span className={`border px-2.5 py-1 text-[11px] font-semibold ${remaining.isOverdue ? 'border-red-300 bg-red-50 text-red-800' : 'border-signal-line bg-signal-tint text-signal-ink'}`}>
              {remaining.label}
            </span>
          )}
        </div>
      </header>

      <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase, index) => (
          <li
            key={phase.id}
            className={`relative px-4 py-5 sm:px-5 ${index > 0 ? 'border-t border-rule sm:border-t-0' : ''} ${index % 2 === 1 ? 'sm:border-l sm:border-ink' : ''} ${index >= 2 ? 'sm:border-t sm:border-ink lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l lg:border-ink' : ''} ${phase.isCurrent ? 'bg-signal-tint/60' : ''}`}
          >
            <span
              aria-hidden="true"
              className={`grid h-7 w-7 place-items-center border text-[11px] font-bold tabular-nums ${
                phase.isDone ? 'border-ink bg-ink text-paper' : phase.isCurrent ? 'border-ink bg-signal text-ink' : 'border-rule-strong text-ink-3'
              }`}
            >
              {phase.isDone ? <Check className="h-3.5 w-3.5" /> : phase.stepNumber}
            </span>
            <p className="mt-3 text-[13px] font-semibold leading-snug text-ink">{phase.title}</p>
            <p className="mt-1.5 text-[12px] leading-5 text-ink-3">{phase.shortDesc}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-signal-ink">{copy.window}: {phase.estimatedWindow}</p>
          </li>
        ))}
      </ol>

      <footer className="flex flex-col gap-1 border-t border-ink px-4 py-3 text-[11px] leading-5 text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <span>{copy.hours}</span>
        <span className="font-semibold text-ink-2">{copy.note}</span>
      </footer>
    </section>
  );
}
