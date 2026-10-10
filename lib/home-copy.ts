import type { MarketingLocale } from '@/lib/marketing';

/**
 * Copy that belongs to the Atelier homepage and navigation only. Services, case studies, guides, pricing
 * and FAQ text stay in lib/marketing.ts so there is one source for them.
 * English is US English, German uses the formal "Sie", Turkish uses the formal "siz".
 */
const en = {
  nav: { quote: 'Request a quote', menu: 'Menu', close: 'Close', skip: 'Skip to content' },
  hero: {
    // The last line carries the hand-drawn orange swash.
    lines: ['Every curve,', 'drawn by', 'hand.'],
    howItWorks: 'How it works',
    deliveredAs: 'Delivered as',
    reassurance: 'No payment when you request a quote. We confirm the price after we have seen your file.',
  },
  sheet: {
    source: 'Source',
    redrawn: 'Redrawn',
    slider: 'Compare the source file with the hand-redrawn vector',
    sliderValue: 'redrawn',
    number: 'No. 001',
    artwork: 'Artwork',
    artworkValue: 'Compass emblem',
    scale: 'Scale',
    scaleValue: '1 : 1',
    status: 'Status',
    statusValue: 'Redrawn by hand',
    noteNodes: 'every node placed by hand',
    noteTrace: 'not auto-traced',
  },
  problem: {
    title: 'Four kinds of artwork a printer can’t use.',
    items: [
      { title: 'AI-generated logos', text: 'Fine on screen, but a blurry raster with no real shapes.' },
      { title: 'Tiny, pixelated logos', text: 'Pulled from an old website or an email signature.' },
      { title: 'Scans and photos of old prints', text: 'The original file is gone and only the print is left.' },
      { title: 'Auto-traced “vectors”', text: 'Lumpy curves, thousands of nodes and broken lettering.' },
    ],
    statement: 'Auto-trace copies pixels. A person redraws what the pixels were trying to be.',
  },
  services: { typical: 'Typically' },
  pricing: { rateCard: 'Rate card', hint: 'Starting prices · USD' },
  cta: { formats: 'JPG, PNG, WebP or PDF, up to 2 MB per file.' },
  footer: { tagline: 'Hand-redrawn vectors for print, embroidery, signage and CNC.' },
};

const de: typeof en = {
  nav: { quote: 'Angebot anfragen', menu: 'Menü', close: 'Schließen', skip: 'Zum Inhalt springen' },
  hero: {
    lines: ['Jede Kurve', 'von Hand', 'gezeichnet.'],
    howItWorks: 'So funktioniert’s',
    deliveredAs: 'Lieferformate',
    reassurance: 'Bei der Anfrage wird nichts bezahlt. Den Preis bestätigen wir, nachdem wir Ihre Datei gesehen haben.',
  },
  sheet: {
    source: 'Vorlage',
    redrawn: 'Neu gezeichnet',
    slider: 'Vorlage und von Hand neu gezeichneten Vektor vergleichen',
    sliderValue: 'neu gezeichnet',
    number: 'Nr. 001',
    artwork: 'Motiv',
    artworkValue: 'Kompass-Emblem',
    scale: 'Maßstab',
    scaleValue: '1 : 1',
    status: 'Status',
    statusValue: 'Von Hand gezeichnet',
    noteNodes: 'jeder Punkt von Hand gesetzt',
    noteTrace: 'nicht automatisch nachgezeichnet',
  },
  problem: {
    title: 'Vier Arten von Vorlagen, mit denen keine Druckerei arbeiten kann.',
    items: [
      { title: 'KI-generierte Logos', text: 'Am Bildschirm in Ordnung, in Wahrheit aber ein unscharfes Rasterbild ohne echte Formen.' },
      { title: 'Winzige, verpixelte Logos', text: 'Aus einer alten Website oder einer E-Mail-Signatur gezogen.' },
      { title: 'Scans und Fotos alter Drucke', text: 'Die Originaldatei ist verloren, nur der Druck ist geblieben.' },
      { title: 'Automatisch nachgezeichnete „Vektoren“', text: 'Wellige Kurven, Tausende Knoten und beschädigte Schrift.' },
    ],
    statement: 'Auto-Trace kopiert Pixel. Ein Mensch zeichnet nach, was die Pixel sein wollten.',
  },
  services: { typical: 'In der Regel' },
  pricing: { rateCard: 'Preisliste', hint: 'Startpreise · USD' },
  cta: { formats: 'JPG, PNG, WebP oder PDF, bis zu 2 MB pro Datei.' },
  footer: { tagline: 'Von Hand neu gezeichnete Vektoren für Druck, Stickerei, Beschilderung und CNC.' },
};

const tr: typeof en = {
  nav: { quote: 'Teklif iste', menu: 'Menü', close: 'Kapat', skip: 'İçeriğe geç' },
  hero: {
    lines: ['Her eğriyi', 'elle', 'çiziyoruz.'],
    howItWorks: 'Nasıl çalışır',
    deliveredAs: 'Teslim formatları',
    reassurance: 'Teklif isterken ödeme alınmaz. Fiyatı, dosyanızı gördükten sonra netleştiririz.',
  },
  sheet: {
    source: 'Kaynak',
    redrawn: 'Yeniden çizim',
    slider: 'Kaynak dosyayı elle yeniden çizilen vektörle karşılaştırın',
    sliderValue: 'yeniden çizildi',
    number: 'No. 001',
    artwork: 'Çalışma',
    artworkValue: 'Pusula amblemi',
    scale: 'Ölçek',
    scaleValue: '1 : 1',
    status: 'Durum',
    statusValue: 'Elle çizildi',
    noteNodes: 'her nokta elle yerleştirildi',
    noteTrace: 'otomatik izleme değil',
  },
  problem: {
    title: 'Matbaanın kullanamayacağı dört tür dosya.',
    items: [
      { title: 'Yapay zekâ logoları', text: 'Ekranda iyi görünür; aslında gerçek şekilleri olmayan bulanık bir görsel.' },
      { title: 'Küçük, pikselli logolar', text: 'Eski bir web sitesinden ya da e-posta imzasından alınmış.' },
      { title: 'Eski baskıların taraması veya fotoğrafı', text: 'Orijinal dosya kaybolmuş, elde yalnızca baskı kalmış.' },
      { title: 'Otomatik izlenmiş “vektörler”', text: 'Dalgalı eğriler, binlerce düğüm ve bozuk harfler.' },
    ],
    statement: 'Otomatik izleme pikselleri kopyalar. Bir insan, piksellerin olmak istediği şeyi yeniden çizer.',
  },
  services: { typical: 'Genellikle' },
  pricing: { rateCard: 'Fiyat listesi', hint: 'Başlangıç fiyatları · USD' },
  cta: { formats: 'JPG, PNG, WebP veya PDF, dosya başına en çok 2 MB.' },
  footer: { tagline: 'Baskı, nakış, tabela ve CNC için elle yeniden çizilmiş vektörler.' },
};

export type HomeCopy = typeof en;
export const homeCopy: Record<MarketingLocale, HomeCopy> = { en, de, tr };
