import { TurnaroundSpeed, OrderStatus } from './types';

export interface DeliverySchedule {
  targetDate: Date;
  targetIso: string;
  totalWorkingHours: number;
  formattedTarget: string;
  isExpress: boolean;
  phases: DeliveryPhase[];
}

export interface DeliveryPhase {
  id: string;
  stepNumber: number;
  title: string;
  shortDesc: string;
  estimatedWindow: string;
  isCurrent: boolean;
  isDone: boolean;
}

/**
 * Calculates a realistic studio delivery projection.
 * - Standard turnaround: 48 hours (studio working shifts)
 * - Express turnaround: 16 hours (priority lane)
 * Takes into account studio working hours (Mon-Fri 09:00-19:00, Sat 10:00-16:00).
 */
export function calculateDeliveryProjection(
  startDate: Date = new Date(),
  turnaround: TurnaroundSpeed = 'standard'
): DeliverySchedule {
  const isExpress = turnaround === 'express';
  const hoursNeeded = isExpress ? 16 : 48;

  // Clone date to project forward
  const current = new Date(startDate.getTime());
  let remainingHours = hoursNeeded;

  // Project working hours
  while (remainingHours > 0) {
    const day = current.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const hour = current.getHours();

    // Sunday: studio is closed, advance to Monday 09:00
    if (day === 0) {
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
      continue;
    }

    // Saturday: studio hours are 10:00 - 16:00
    if (day === 6) {
      if (hour < 10) {
        current.setHours(10, 0, 0, 0);
      } else if (hour >= 16) {
        current.setDate(current.getDate() + 2); // Jump to Monday
        current.setHours(9, 0, 0, 0);
        continue;
      } else {
        const availableInShift = 16 - hour;
        const consume = Math.min(availableInShift, remainingHours);
        remainingHours -= consume;
        current.setHours(hour + consume);
      }
      continue;
    }

    // Weekdays (Mon-Fri): 09:00 - 19:00
    if (hour < 9) {
      current.setHours(9, 0, 0, 0);
    } else if (hour >= 19) {
      current.setDate(current.getDate() + 1);
      current.setHours(9, 0, 0, 0);
    } else {
      const availableInShift = 19 - hour;
      const consume = Math.min(availableInShift, remainingHours);
      remainingHours -= consume;
      current.setHours(hour + consume);
    }
  }

  const targetIso = current.toISOString();
  const formattedTarget = formatStudioDate(current);

  return {
    targetDate: current,
    targetIso,
    totalWorkingHours: hoursNeeded,
    isExpress,
    formattedTarget,
    phases: getDeliveryPhases('quote_requested', turnaround),
  };
}

export function formatStudioDate(date: Date, locale: string = 'tr-TR'): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function getDeliveryPhases(
  status: OrderStatus = 'quote_requested',
  turnaround: TurnaroundSpeed = 'standard'
): DeliveryPhase[] {
  const isExpress = turnaround === 'express';

  const phasesDef = [
    {
      id: 'intake',
      stepNumber: 1,
      title: 'Kabul & Geometri İncelemesi',
      shortDesc: 'Stüdyo görsel toleranslarını ve vektör detayını inceler.',
      estimatedWindow: isExpress ? '1 saat' : '1–2 saat',
      activeStatuses: ['quote_requested', 'in_review'],
      doneStatuses: ['in_progress', 'preview_ready', 'approved', 'revision_requested', 'completed'],
    },
    {
      id: 'redrawing',
      stepNumber: 2,
      title: 'Manuel Çizim (Senior Vector Artist)',
      shortDesc: 'Bezier eğrileri pürüzsüzleştirilir, düğüm noktaları optimize edilir.',
      estimatedWindow: isExpress ? '8–10 saat' : '24–36 saat',
      activeStatuses: ['in_progress', 'revision_requested'],
      doneStatuses: ['preview_ready', 'approved', 'completed'],
    },
    {
      id: 'preview',
      stepNumber: 3,
      title: 'Önizleme Onayı & Kalite Kontrol',
      shortDesc: 'Su damgalı taslak müşteriye sunulur; revizyonlar uygulanır.',
      estimatedWindow: isExpress ? '2–4 saat' : '6–12 saat',
      activeStatuses: ['preview_ready'],
      doneStatuses: ['approved', 'completed'],
    },
    {
      id: 'delivery',
      stepNumber: 4,
      title: 'Master Paket & Arşiv Teslimi',
      shortDesc: 'AI, EPS, SVG, PDF ve yüksek çözünürlüklü PNG kilitleri açılır.',
      estimatedWindow: 'Anında',
      activeStatuses: ['approved'],
      doneStatuses: ['completed'],
    },
  ];

  return phasesDef.map((phase) => {
    const isDone = phase.doneStatuses.includes(status);
    const isCurrent = phase.activeStatuses.includes(status);

    return {
      id: phase.id,
      stepNumber: phase.stepNumber,
      title: phase.title,
      shortDesc: phase.shortDesc,
      estimatedWindow: phase.estimatedWindow,
      isCurrent,
      isDone,
    };
  });
}

export function calculateRemainingHours(targetDateIso: string): {
  hoursLeft: number;
  minutesLeft: number;
  isOverdue: boolean;
  label: string;
} {
  const target = new Date(targetDateIso).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      hoursLeft: 0,
      minutesLeft: 0,
      isOverdue: true,
      label: 'Teslimat penceresi içinde (Son kontroller)',
    };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let label = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    label = `${days} gün ${remHours} saat kaldı`;
  } else if (hours > 0) {
    label = `${hours} saat ${minutes} dk kaldı`;
  } else {
    label = `${minutes} dakika kaldı`;
  }

  return {
    hoursLeft: hours,
    minutesLeft: minutes,
    isOverdue: false,
    label,
  };
}
