import type { OrderStatus } from './types';

export function getTrackingStep(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  if (status === 'completed') return 2;
  if (status === 'quote_requested' || status === 'in_review') return 0;
  return 1;
}

export const trackingCopy = {
  tr: {
    title: 'Siparişinizi takip edin', description: 'Çiziminizin hangi aşamada olduğunu buradan görebilirsiniz.',
    newOrder: 'Yeni çizim gönder', account: 'Hesabım', archive: 'Dosyalarım', business: 'Toplu gönderim', logout: 'Çıkış yap',
    steps: ['Grafiker incelemesi', 'Çizim sürüyor', 'Dosyalar hazır'],
    details: {
      quote_requested: 'Dosyanızı aldık. Grafikerimiz inceleyip kapsamı ve fiyatı onaylayacak.',
      in_review: 'Grafikerimiz dosyanızı inceliyor. İnceleme tamamlandığında sizi bilgilendireceğiz.',
      in_progress: 'Çiziminiz üzerinde çalışıyoruz. Önizleme hazır olduğunda burada görebilirsiniz.',
      preview_ready: 'Önizlemeniz hazır. İnceleyip onaylayabilir veya değişiklik isteyebilirsiniz.',
      revision_requested: 'Değişiklik talebinizi aldık. Çiziminizi notlarınıza göre güncelliyoruz.',
      approved: 'Onayınızı aldık. Son kontrolleri yapıp teslim dosyalarını hazırlıyoruz.',
      completed: 'Çiziminiz tamamlandı. Teslim dosyalarını indirebilirsiniz.',
      cancelled: 'Bu sipariş iptal edildi. Sorularınız için bize mesaj gönderebilirsiniz.',
    },
    review: 'Önizlemeyi incele', download: 'Dosyaları indir', view: 'Siparişi görüntüle',
    active: 'Devam eden', past: 'Geçmiş siparişler', empty: 'Henüz siparişiniz yok',
    emptyBody: 'Dosyanızı gönderin, incelemeden teslimata kadar buradan takip edin.',
    loading: 'Siparişleriniz yükleniyor', error: 'Siparişleriniz yüklenemedi.', retry: 'Tekrar dene', more: 'Daha fazla göster',
    updated: 'Son güncelleme', action: 'Onayınız bekleniyor', cancelled: 'İptal edildi', tracking: 'Sipariş takibi',
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
      revision_requested: 'We received your change request and are updating the artwork.',
      approved: 'Approval received. We are running final checks and preparing your files.',
      completed: 'Your artwork is complete. You can now download your files.',
      cancelled: 'This order was cancelled. Message us if you have any questions.',
    },
    review: 'Review preview', download: 'Download files', view: 'View order',
    active: 'In progress', past: 'Past orders', empty: 'No orders yet',
    emptyBody: 'Send us your file and track it here from review to delivery.',
    loading: 'Loading your orders', error: 'Your orders could not be loaded.', retry: 'Try again', more: 'Show more',
    updated: 'Last updated', action: 'Your approval is needed', cancelled: 'Cancelled', tracking: 'Order tracking',
  },
  de: {
    title: 'Ihren Auftrag verfolgen', description: 'Sehen Sie, in welcher Phase sich Ihre Grafik befindet.',
    newOrder: 'Neue Grafik senden', account: 'Mein Konto', archive: 'Meine Dateien', business: 'Sammelupload', logout: 'Abmelden',
    steps: ['Prüfung durch Grafiker', 'Zeichnung in Arbeit', 'Dateien bereit'],
    details: {
      quote_requested: 'Ihre Datei ist eingegangen. Ein Grafiker prüft sie und bestätigt Umfang und Preis.',
      in_review: 'Ein Grafiker prüft Ihre Datei. Danach informieren wir Sie.',
      in_progress: 'Wir arbeiten an Ihrer Grafik. Die Vorschau erscheint hier, sobald sie bereit ist.',
      preview_ready: 'Ihre Vorschau ist bereit. Prüfen Sie sie, geben Sie sie frei oder fordern Sie Änderungen an.',
      revision_requested: 'Ihre Änderungswünsche sind eingegangen. Wir überarbeiten die Grafik.',
      approved: 'Freigabe erhalten. Wir führen die Endkontrolle durch und bereiten Ihre Dateien vor.',
      completed: 'Ihre Grafik ist fertig. Sie können die Dateien jetzt herunterladen.',
      cancelled: 'Dieser Auftrag wurde storniert. Bei Fragen schreiben Sie uns gern.',
    },
    review: 'Vorschau prüfen', download: 'Dateien herunterladen', view: 'Auftrag ansehen',
    active: 'In Arbeit', past: 'Vergangene Aufträge', empty: 'Noch keine Aufträge',
    emptyBody: 'Senden Sie uns Ihre Datei und verfolgen Sie sie hier von der Prüfung bis zur Lieferung.',
    loading: 'Aufträge werden geladen', error: 'Ihre Aufträge konnten nicht geladen werden.', retry: 'Erneut versuchen', more: 'Mehr anzeigen',
    updated: 'Zuletzt aktualisiert', action: 'Ihre Freigabe ist erforderlich', cancelled: 'Storniert', tracking: 'Auftragsverfolgung',
  },
};
