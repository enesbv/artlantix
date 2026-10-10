import { TurnaroundSpeed, OrderStatus } from './types';

export type DeliveryLocale = 'en' | 'de' | 'tr';

const DATE_LOCALES: Record<DeliveryLocale, string> = { en: 'en-US', de: 'de-DE', tr: 'tr-TR' };

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
  turnaround: TurnaroundSpeed = 'standard',
  lang: DeliveryLocale = 'en'
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
  const formattedTarget = formatStudioDate(current, DATE_LOCALES[lang]);

  return {
    targetDate: current,
    targetIso,
    totalWorkingHours: hoursNeeded,
    isExpress,
    formattedTarget,
    phases: getDeliveryPhases('quote_requested', turnaround, lang),
  };
}

export function formatStudioDate(date: Date, locale: string = 'en-US'): string {
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

const PHASE_TEXT: Record<DeliveryLocale, {
  titles: string[];
  descriptions: string[];
  intakeWindow: string; intakeFast: string;
  drawWindow: string; drawFast: string;
  previewWindow: string; previewFast: string;
  deliveryWindow: string;
}> = {
  en: {
    titles: ['Intake and geometry review', 'Redrawing by an artist', 'Preview approval and checks', 'Master files released'],
    descriptions: [
      'The studio reviews the file, its tolerances and the level of detail.',
      'Curves are redrawn by hand and the nodes are cleaned up.',
      'You see a watermarked preview and ask for any revisions.',
      'AI, EPS, SVG, PDF and high-resolution PNG files are unlocked.',
    ],
    intakeWindow: '1–2 hours', intakeFast: '1 hour',
    drawWindow: '24–36 hours', drawFast: '8–10 hours',
    previewWindow: '6–12 hours', previewFast: '2–4 hours',
    deliveryWindow: 'After your approval',
  },
  de: {
    titles: ['Annahme und Geometrieprüfung', 'Neuzeichnung durch den Artist', 'Vorschau-Freigabe und Kontrolle', 'Master-Dateien freigegeben'],
    descriptions: [
      'Das Studio prüft die Datei, ihre Toleranzen und den Detailgrad.',
      'Die Kurven werden von Hand neu gezeichnet und die Knoten bereinigt.',
      'Sie sehen eine Vorschau mit Wasserzeichen und können Korrekturen anfragen.',
      'AI-, EPS-, SVG-, PDF- und hochauflösende PNG-Dateien werden freigeschaltet.',
    ],
    intakeWindow: '1–2 Stunden', intakeFast: '1 Stunde',
    drawWindow: '24–36 Stunden', drawFast: '8–10 Stunden',
    previewWindow: '6–12 Stunden', previewFast: '2–4 Stunden',
    deliveryWindow: 'Nach Ihrer Freigabe',
  },
  tr: {
    titles: ['Kabul ve geometri incelemesi', 'Çizerin yeniden çizimi', 'Önizleme onayı ve kontrol', 'Master dosyaların teslimi'],
    descriptions: [
      'Stüdyo dosyayı, toleransları ve detay seviyesini inceler.',
      'Eğriler elle yeniden çizilir, düğüm noktaları temizlenir.',
      'Filigranlı önizlemeyi görür, isterseniz revizyon istersiniz.',
      'AI, EPS, SVG, PDF ve yüksek çözünürlüklü PNG dosyaları açılır.',
    ],
    intakeWindow: '1–2 saat', intakeFast: '1 saat',
    drawWindow: '24–36 saat', drawFast: '8–10 saat',
    previewWindow: '6–12 saat', previewFast: '2–4 saat',
    deliveryWindow: 'Onayınızdan sonra',
  },
};

export function getDeliveryPhases(
  status: OrderStatus = 'quote_requested',
  turnaround: TurnaroundSpeed = 'standard',
  lang: DeliveryLocale = 'en'
): DeliveryPhase[] {
  const isExpress = turnaround === 'express';
  const text = PHASE_TEXT[lang];

  const phasesDef = [
    {
      id: 'intake',
      stepNumber: 1,
      estimatedWindow: isExpress ? text.intakeFast : text.intakeWindow,
      activeStatuses: ['quote_requested', 'in_review'],
      doneStatuses: ['in_progress', 'preview_ready', 'approved', 'revision_requested', 'completed'],
    },
    {
      id: 'redrawing',
      stepNumber: 2,
      estimatedWindow: isExpress ? text.drawFast : text.drawWindow,
      activeStatuses: ['in_progress', 'revision_requested'],
      doneStatuses: ['preview_ready', 'approved', 'completed'],
    },
    {
      id: 'preview',
      stepNumber: 3,
      estimatedWindow: isExpress ? text.previewFast : text.previewWindow,
      activeStatuses: ['preview_ready'],
      doneStatuses: ['approved', 'completed'],
    },
    {
      id: 'delivery',
      stepNumber: 4,
      estimatedWindow: text.deliveryWindow,
      activeStatuses: ['approved'],
      doneStatuses: ['completed'],
    },
  ] as const;

  return phasesDef.map((phase) => ({
    id: phase.id,
    stepNumber: phase.stepNumber,
    title: text.titles[phase.stepNumber - 1],
    shortDesc: text.descriptions[phase.stepNumber - 1],
    estimatedWindow: phase.estimatedWindow,
    isCurrent: (phase.activeStatuses as readonly string[]).includes(status),
    isDone: (phase.doneStatuses as readonly string[]).includes(status),
  }));
}

const REMAINING_TEXT: Record<DeliveryLocale, {
  due: string;
  days: (days: number, hours: number) => string;
  hours: (hours: number, minutes: number) => string;
  minutes: (minutes: number) => string;
}> = {
  en: {
    due: 'In the delivery window (final checks)',
    days: (days, hours) => `${days} d ${hours} h left`,
    hours: (hours, minutes) => `${hours} h ${minutes} min left`,
    minutes: (minutes) => `${minutes} min left`,
  },
  de: {
    due: 'Im Lieferfenster (letzte Kontrollen)',
    days: (days, hours) => `noch ${days} T ${hours} Std.`,
    hours: (hours, minutes) => `noch ${hours} Std. ${minutes} Min.`,
    minutes: (minutes) => `noch ${minutes} Min.`,
  },
  tr: {
    due: 'Teslimat penceresi içinde (son kontroller)',
    days: (days, hours) => `${days} gün ${hours} saat kaldı`,
    hours: (hours, minutes) => `${hours} saat ${minutes} dk kaldı`,
    minutes: (minutes) => `${minutes} dakika kaldı`,
  },
};

export function calculateRemainingHours(
  targetDateIso: string,
  lang: DeliveryLocale = 'en'
): {
  hoursLeft: number;
  minutesLeft: number;
  isOverdue: boolean;
  label: string;
} {
  const text = REMAINING_TEXT[lang];
  const target = new Date(targetDateIso).getTime();
  const diffMs = target - Date.now();

  if (diffMs <= 0) {
    return { hoursLeft: 0, minutesLeft: 0, isOverdue: true, label: text.due };
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let label: string;
  if (hours > 24) {
    label = text.days(Math.floor(hours / 24), hours % 24);
  } else if (hours > 0) {
    label = text.hours(hours, minutes);
  } else {
    label = text.minutes(minutes);
  }

  return { hoursLeft: hours, minutesLeft: minutes, isOverdue: false, label };
}
