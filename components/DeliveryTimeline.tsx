'use client';

import React, { useMemo } from 'react';
import { TurnaroundSpeed, OrderStatus } from '@/lib/types';
import {
  calculateDeliveryProjection,
  getDeliveryPhases,
  calculateRemainingHours,
  formatStudioDate,
} from '@/lib/delivery-calculator';
import {
  Clock,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

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
  const startDate = useMemo(() => {
    if (createdAt) return new Date(createdAt);
    return new Date();
  }, [createdAt]);

  const projection = useMemo(() => {
    return calculateDeliveryProjection(startDate, turnaround);
  }, [startDate, turnaround]);

  const targetDateDisplay = useMemo(() => {
    if (expectedDeliveryAt) {
      return formatStudioDate(new Date(expectedDeliveryAt));
    }
    return projection.formattedTarget;
  }, [expectedDeliveryAt, projection]);

  const remaining = useMemo(() => {
    const targetIso = expectedDeliveryAt || projection.targetIso;
    return calculateRemainingHours(targetIso);
  }, [expectedDeliveryAt, projection]);

  const phases = useMemo(() => {
    return getDeliveryPhases(status, turnaround);
  }, [status, turnaround]);

  const isExpress = turnaround === 'express';

  return (
    <div className="w-full rounded-2xl border border-[#EAE8E3] bg-white p-5 shadow-xs sm:p-6">
      {/* Header Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE8E3]/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E9F9EE] text-[#18794E]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
              {variant === 'quote' ? 'Tahmini Teslimat Planı' : 'Sipariş Üretim Takvimi'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#141414]">
                {targetDateDisplay}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Priority Pill */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
              isExpress
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-[#F5F4F0] text-[#141414] border border-[#EAE8E3]'
            }`}
          >
            {isExpress ? <Zap className="h-3 w-3 text-amber-700" /> : <Clock className="h-3 w-3 text-[#737373]" />}
            <span>{isExpress ? 'Ekspres Öncelik (16 Saat)' : 'Standart Stüdyo (48 Saat)'}</span>
          </span>

          {/* Remaining Time Badge in order-detail */}
          {variant === 'order-detail' && status !== 'completed' && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                remaining.isOverdue
                  ? 'bg-red-100 text-red-800'
                  : 'bg-[#E9F9EE] text-[#18794E]'
              }`}
            >
              {remaining.label}
            </span>
          )}
        </div>
      </div>

      {/* Progressive Step Line */}
      <div className="mt-6">
        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-4">
          {phases.map((phase, idx) => {
            const isLast = idx === phases.length - 1;

            return (
              <div key={phase.id} className="relative flex flex-col items-start">
                {/* Connector Line (visible on desktop) */}
                {!isLast && (
                  <div
                    aria-hidden="true"
                    className={`hidden sm:block absolute top-4 left-7 right-0 h-0.5 -z-0 ${
                      phase.isDone ? 'bg-[#18794E]' : 'bg-[#EAE8E3]'
                    }`}
                  />
                )}

                {/* Node Icon & Step */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      phase.isDone
                        ? 'border-[#18794E] bg-[#18794E] text-white shadow-xs'
                        : phase.isCurrent
                        ? 'border-[#18794E] bg-[#E9F9EE] text-[#18794E] ring-4 ring-[#18794E]/15'
                        : 'border-[#EAE8E3] bg-white text-[#737373]'
                    }`}
                  >
                    {phase.isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : phase.isCurrent ? (
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <span>{phase.stepNumber}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 sm:mt-2">
                      <span className="text-xs font-bold text-[#141414]">
                        {phase.title}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-[#737373] line-clamp-2">
                      {phase.shortDesc}
                    </p>

                    <span className="mt-1 inline-block text-[10px] font-semibold text-[#18794E]">
                      Süre: {phase.estimatedWindow}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Assurance Banner */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F9F8F6] p-3 text-[11px] text-[#737373]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#18794E]" />
          <span>
            Pazartesi – Cumartesi 09:00 – 19:00 stüdyo mesai saatlerine göre hesaplanmıştır.
          </span>
        </div>
        <span className="hidden sm:inline font-semibold text-[#141414]">
          100% İnsan Eliyle Vektörizasyon Garantisi
        </span>
      </div>
    </div>
  );
}
