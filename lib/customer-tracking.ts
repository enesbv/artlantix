import type { OrderStatus } from './types';

export function getTrackingStep(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  if (status === 'completed') return 2;
  if (status === 'quote_requested' || status === 'in_review') return 0;
  return 1;
}

export const trackingCopy = {
  tr: {
    title: 'Siparişini takip et', description: 'Çiziminin hangi aşamada olduğunu buradan görebilirsin.',
    newOrder: 'Yeni çizim gönder', account: 'Hesabım', archive: 'Dosyalarım', business: 'Toplu gönderim', logout: 'Çıkış yap',
    steps: ['Grafiker incelemesi', 'Çizim aşaması', 'Dosyalar hazır'],
    details: {
      quote_requested: 'Dosyanı aldık. Grafikerimiz inceleyip kapsam ve fiyat hakkında bilgi verecek.',
      in_review: 'Grafikerimiz dosyanı inceliyor. İnceleme tamamlandığında seni bilgilendireceğiz.',
      in_progress: 'Çizimin üzerinde çalışıyoruz. Önizleme hazır olduğunda burada görebilirsin.',
      preview_ready: 'Önizlemen hazır. İnceleyip onaylayabilir veya değişiklik isteyebilirsin.',
      revision_requested: 'Değişiklik isteğini aldık. Çizimini notlarına göre güncelliyoruz.',
      approved: 'Onayını aldık. Son kontrolleri yapıp teslim dosyalarını hazırlıyoruz.',
      completed: 'Çizimin tamamlandı. Teslim dosyalarını indirebilirsin.',
      cancelled: 'Bu sipariş iptal edildi. Soruların için bize mesaj gönderebilirsin.',
    },
    review: 'Önizlemeyi incele', download: 'Dosyaları indir', view: 'Siparişi görüntüle',
    active: 'Devam eden', past: 'Geçmiş siparişler', empty: 'Henüz bir siparişin yok',
    emptyBody: 'Dosyanı gönder, incelemeden teslimata kadar buradan takip et.',
    loading: 'Siparişlerin yükleniyor', error: 'Siparişlerin yüklenemedi.', retry: 'Tekrar dene', more: 'Daha fazla göster',
    updated: 'Son güncelleme', action: 'Onayın bekleniyor', cancelled: 'İptal edildi', tracking: 'Sipariş takibi',
  },
  en: {
    title: 'Track your order', description: 'See where your artwork is in the process.',
    newOrder: 'Send new artwork', account: 'My account', archive: 'My files', business: 'Batch upload', logout: 'Sign out',
    steps: ['Artist review', 'Drawing in progress', 'Files ready'],
    details: {
      quote_requested: 'We received your file. An artist will review it and confirm the scope and price.',
      in_review: 'An artist is reviewing your file. We will let you know when the review is complete.',
      in_progress: 'We are working on your artwork. Your preview will appear here when it is ready.',
      preview_ready: 'Your preview is ready. Review it, approve it or request changes.',
      revision_requested: 'We received your changes and are updating the artwork.',
      approved: 'Approval received. We are checking and preparing your final files.',
      completed: 'Your artwork is complete. You can download your delivery files.',
      cancelled: 'This order was cancelled. Message us if you have any questions.',
    },
    review: 'Review preview', download: 'Download files', view: 'View order',
    active: 'In progress', past: 'Past orders', empty: 'No orders yet',
    emptyBody: 'Send your file and follow it from review to delivery here.',
    loading: 'Loading your orders', error: 'Your orders could not be loaded.', retry: 'Try again', more: 'Show more',
    updated: 'Last updated', action: 'Your approval is needed', cancelled: 'Cancelled', tracking: 'Order tracking',
  },
  de: {
    title: 'Auftrag verfolgen', description: 'Sieh, in welcher Phase sich deine Zeichnung befindet.',
    newOrder: 'Neue Zeichnung senden', account: 'Mein Konto', archive: 'Meine Dateien', business: 'Sammelupload', logout: 'Abmelden',
    steps: ['Prüfung durch Grafiker', 'Zeichnung in Arbeit', 'Dateien bereit'],
    details: {
      quote_requested: 'Deine Datei ist eingegangen. Wir prüfen sie und bestätigen Umfang und Preis.',
      in_review: 'Ein Grafiker prüft deine Datei. Danach informieren wir dich.',
      in_progress: 'Wir arbeiten an deiner Zeichnung. Die Vorschau erscheint hier, sobald sie bereit ist.',
      preview_ready: 'Deine Vorschau ist bereit. Prüfe sie, gib sie frei oder fordere Änderungen an.',
      revision_requested: 'Deine Änderungswünsche sind eingegangen. Wir aktualisieren die Zeichnung.',
      approved: 'Freigabe erhalten. Wir prüfen und bereiten die finalen Dateien vor.',
      completed: 'Deine Zeichnung ist fertig. Du kannst die Dateien herunterladen.',
      cancelled: 'Dieser Auftrag wurde storniert. Bei Fragen kannst du uns schreiben.',
    },
    review: 'Vorschau prüfen', download: 'Dateien herunterladen', view: 'Auftrag ansehen',
    active: 'In Arbeit', past: 'Vergangene Aufträge', empty: 'Noch keine Aufträge',
    emptyBody: 'Sende deine Datei und verfolge sie hier von der Prüfung bis zur Lieferung.',
    loading: 'Aufträge werden geladen', error: 'Deine Aufträge konnten nicht geladen werden.', retry: 'Erneut versuchen', more: 'Mehr anzeigen',
    updated: 'Zuletzt aktualisiert', action: 'Deine Freigabe ist erforderlich', cancelled: 'Storniert', tracking: 'Auftragsverfolgung',
  },
};
