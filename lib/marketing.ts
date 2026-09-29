export type MarketingLocale = 'en' | 'de' | 'tr';

type LocalizedText = Record<MarketingLocale, string>;
type LocalizedList = Record<MarketingLocale, string[]>;

export interface MarketingService {
  slug: string;
  artworkType: 'ai_logo' | 'lowres_logo' | 'sketch_scan' | 'lettering_typography' | 'mascot_badge' | 'apparel_signage';
  startingPrice: number;
  turnaround: LocalizedText;
  title: LocalizedText;
  short: LocalizedText;
  description: LocalizedText;
  idealFor: LocalizedList;
  includes: LocalizedList;
  useCases: LocalizedList;
}

export interface MarketingCaseStudy {
  slug: string;
  serviceSlug: string;
  visual: 'crest' | 'mascot' | 'lettering';
  title: LocalizedText;
  category: LocalizedText;
  summary: LocalizedText;
  challenge: LocalizedText;
  approach: LocalizedText;
  outcome: LocalizedText;
  deliverables: LocalizedList;
}

export interface MarketingGuide {
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  readTime: LocalizedText;
  sections: Record<MarketingLocale, Array<{ title: string; body: string }>>;
}

export const services: MarketingService[] = [
  {
    slug: 'ai-logo-vectorization',
    artworkType: 'ai_logo',
    startingPrice: 45,
    turnaround: { tr: '24–48 saat', en: '24–48 hours', de: '24–48 Stunden' },
    title: { tr: 'Yapay Zekâ Logo Vektörleştirme', en: 'AI Logo Vectorization', de: 'KI-Logo-Vektorisierung' },
    short: {
      tr: 'Midjourney, DALL·E ve Ideogram taslaklarını temiz üretim vektörlerine dönüştürür.',
      en: 'Turn Midjourney, DALL·E and Ideogram concepts into clean production vectors.',
      de: 'Midjourney-, DALL·E- und Ideogram-Entwürfe werden zu sauberen Produktionsvektoren.',
    },
    description: {
      tr: 'Yapay zekâ çıktısındaki bozuk harfleri, asimetrik eğrileri ve piksel kalıntılarını otomatik izleme kullanmadan yeniden çizeriz. Sonuç; web, baskı, tabela ve tekstilde kullanılabilen düzenli bir master dosya setidir.',
      en: 'We rebuild broken lettering, asymmetric curves and raster artifacts by hand, never with auto-trace. The result is an organized set of master files ready for web, print, signage and apparel.',
      de: 'Wir rekonstruieren fehlerhafte Schrift, asymmetrische Kurven und Rasterartefakte ohne Auto-Trace. Das Ergebnis ist ein geordneter Satz Master-Dateien für Web, Druck, Beschilderung und Textilien.',
    },
    idealFor: {
      tr: ['Yeni girişim kurucuları', 'Ajans konseptleri', 'Logosunu yapay zekâyla üretenler'],
      en: ['Startup founders', 'Agency concepts', 'Owners of AI-generated logos'],
      de: ['Startup-Gründer', 'Agenturkonzepte', 'Besitzer KI-generierter Logos'],
    },
    includes: {
      tr: ['Manuel eğri rekonstrüksiyonu', 'Tipografi düzeltmesi', 'AI, EPS, SVG, PDF ve PNG'],
      en: ['Manual path reconstruction', 'Typography repair', 'AI, EPS, SVG, PDF and PNG'],
      de: ['Manuelle Pfadrekonstruktion', 'Typografie-Korrektur', 'AI, EPS, SVG, PDF und PNG'],
    },
    useCases: {
      tr: ['Web sitesi ve uygulama', 'Yatırımcı sunumu', 'Baskı ve promosyon ürünleri'],
      en: ['Website and app', 'Investor presentation', 'Print and merchandise'],
      de: ['Website und App', 'Investorenpräsentation', 'Druck und Merchandise'],
    },
  },
  {
    slug: 'low-resolution-logo-rebuild',
    artworkType: 'lowres_logo',
    startingPrice: 25,
    turnaround: { tr: '24–48 saat', en: '24–48 hours', de: '24–48 Stunden' },
    title: { tr: 'Düşük Çözünürlüklü Logo Yeniden Çizimi', en: 'Low-Resolution Logo Rebuild', de: 'Neuaufbau niedrig aufgelöster Logos' },
    short: {
      tr: 'Bulanık JPG’leri, eski web grafiklerini ve küçük taramaları keskin vektör masterlara dönüştürür.',
      en: 'Rebuild blurry JPGs, old web graphics and tiny scans as crisp vector masters.',
      de: 'Unscharfe JPGs, alte Webgrafiken und kleine Scans werden zu scharfen Vektor-Mastern.',
    },
    description: {
      tr: 'Elinizde yalnızca küçük veya bulanık bir logo varsa dış hatları, simetriyi, renkleri ve yazıyı yeniden kurarız. Yeni dosya kartvizitten tabelaya kadar kalite kaybetmeden ölçeklenir.',
      en: 'When the only source is a small or blurry logo, we rebuild the outlines, symmetry, colors and type. The new file scales from a business card to signage without quality loss.',
      de: 'Wenn nur ein kleines oder unscharfes Logo vorhanden ist, rekonstruieren wir Konturen, Symmetrie, Farben und Schrift. Die neue Datei skaliert verlustfrei von der Visitenkarte bis zum Schild.',
    },
    idealFor: {
      tr: ['Eski marka arşivleri', 'Matbaa müşterileri', 'Yeniden tabela yaptıran işletmeler'],
      en: ['Legacy brand archives', 'Print customers', 'Businesses replacing signage'],
      de: ['Alte Markenarchive', 'Druckkunden', 'Unternehmen mit neuer Beschilderung'],
    },
    includes: {
      tr: ['Temiz kapalı eğriler', 'Renk eşleştirme', 'Baskı ve web masterları'],
      en: ['Clean closed paths', 'Color matching', 'Print and web masters'],
      de: ['Saubere geschlossene Pfade', 'Farbabgleich', 'Druck- und Web-Master'],
    },
    useCases: {
      tr: ['Tabela', 'Kartvizit ve ambalaj', 'Marka arşivi'],
      en: ['Signage', 'Business cards and packaging', 'Brand archive'],
      de: ['Beschilderung', 'Visitenkarten und Verpackung', 'Markenarchiv'],
    },
  },
  {
    slug: 'typography-reconstruction',
    artworkType: 'lettering_typography',
    startingPrice: 40,
    turnaround: { tr: '24–48 saat', en: '24–48 hours', de: '24–48 Stunden' },
    title: { tr: 'Tipografi ve Harf Rekonstrüksiyonu', en: 'Typography Reconstruction', de: 'Typografie-Rekonstruktion' },
    short: {
      tr: 'Yapay zekânın bozduğu yazıları, eski logotipleri ve özel harfleri yeniden kurar.',
      en: 'Rebuild broken AI lettering, legacy wordmarks and custom letterforms.',
      de: 'Fehlerhafte KI-Schrift, alte Wortmarken und individuelle Buchstaben werden neu aufgebaut.',
    },
    description: {
      tr: 'En yakın gerçek yazı tipini bulur, kelimeyi doğru aralıklarla yeniden dizer veya her harfi sıfırdan çizeriz. Üretimde sorun çıkaran fazla ince çizgiler ve dengesiz boşluklar düzeltilir.',
      en: 'We identify the closest real typeface, reset the word with correct spacing or redraw every letter from scratch. Strokes too thin to reproduce and uneven spacing are corrected.',
      de: 'Wir ermitteln die am besten passende echte Schrift, setzen das Wort mit korrekten Abständen neu oder zeichnen jeden Buchstaben von Grund auf. Zu dünne Linien und ungleichmäßige Abstände werden korrigiert.',
    },
    idealFor: {
      tr: ['Özel logotipler', 'Vintage rozetler', 'Yapay zekânın bozduğu marka adları'],
      en: ['Custom wordmarks', 'Vintage badges', 'AI-distorted brand names'],
      de: ['Individuelle Wortmarken', 'Vintage-Abzeichen', 'KI-verzerrte Markennamen'],
    },
    includes: {
      tr: ['Yazı tipi araştırması', 'Optik kerning', 'Üretime hazır, dış hatta çevrilmiş yazı'],
      en: ['Typeface research', 'Optical kerning', 'Production-ready outlined type'],
      de: ['Schriftrecherche', 'Optisches Kerning', 'Produktionsfertige Schriftkonturen'],
    },
    useCases: {
      tr: ['Logo ve monogram', 'Folyo ve sıcak baskı', 'Nakış ve tabela'],
      en: ['Logo and monogram', 'Foil and hot stamping', 'Embroidery and signage'],
      de: ['Logo und Monogramm', 'Folien- und Heißprägung', 'Stickerei und Beschilderung'],
    },
  },
  {
    slug: 'mascot-vectorization',
    artworkType: 'mascot_badge',
    startingPrice: 75,
    turnaround: { tr: '2–4 gün', en: '2–4 days', de: '2–4 Tage' },
    title: { tr: 'Maskot ve Karmaşık Rozet Çizimi', en: 'Mascot & Complex Badge Vectorization', de: 'Vektorisierung von Maskottchen und komplexen Abzeichen' },
    short: {
      tr: 'Maskot, arma ve ayrıntılı illüstrasyonları düzenlenebilir renk katmanlarıyla yeniden çizer.',
      en: 'Rebuild mascots, crests and detailed illustrations with editable color layers.',
      de: 'Maskottchen, Wappen und detaillierte Illustrationen werden mit editierbaren Farbebenen neu aufgebaut.',
    },
    description: {
      tr: 'Karmaşık çizimleri sade, düzenlenebilir ve üretim dostu katmanlara ayırırız. Küçük ayrıntılar hedef üretim yöntemine göre korunur veya kontrollü biçimde sadeleştirilir.',
      en: 'We separate complex artwork into clean, editable and production-friendly layers. Fine detail is preserved or deliberately simplified for the target production method.',
      de: 'Komplexe Motive werden in saubere, editierbare und produktionsfreundliche Ebenen getrennt. Feine Details werden je nach Fertigungsverfahren erhalten oder kontrolliert vereinfacht.',
    },
    idealFor: {
      tr: ['E-spor ekipleri', 'Spor kulüpleri', 'Tekstil ve promosyon markaları'],
      en: ['Esports teams', 'Sports clubs', 'Apparel and merchandise brands'],
      de: ['E-Sport-Teams', 'Sportvereine', 'Textil- und Merchandise-Marken'],
    },
    includes: {
      tr: ['Katmanlı master', 'Renk sadeleştirme', 'Küçük boyut varyantı'],
      en: ['Layered master', 'Color reduction', 'Small-size variant'],
      de: ['Master mit Ebenen', 'Farbreduktion', 'Variante für kleine Größen'],
    },
    useCases: {
      tr: ['Forma ve ürün baskısı', 'Takım kimliği', 'Dijital avatar ve sosyal medya'],
      en: ['Jerseys and merchandise', 'Team identity', 'Digital avatars and social media'],
      de: ['Trikots und Merchandise', 'Teamidentität', 'Digitale Avatare und Social Media'],
    },
  },
  {
    slug: 'screen-print-separation',
    artworkType: 'apparel_signage',
    startingPrice: 55,
    turnaround: { tr: '24–72 saat', en: '24–72 hours', de: '24–72 Stunden' },
    title: { tr: 'Serigrafi ve DTF Renk Ayrımı', en: 'Screen Print & DTF Separation', de: 'Siebdruck- und DTF-Farbseparation' },
    short: {
      tr: 'Görseli, baskı toleranslarına uygun temiz spot renk katmanları halinde hazırlar.',
      en: 'Prepare artwork as clean spot-color layers built to production tolerances.',
      de: 'Motive werden als saubere Volltonfarbebenen mit Produktionstoleranzen vorbereitet.',
    },
    description: {
      tr: 'Spot renkleri ayırır; alt baskıyı, trapping payını ve minimum çizgi kalınlıklarını kontrol ederiz. Dosya, üretim ekibinin yeniden temizlemek zorunda kalmayacağı şekilde düzenlenir.',
      en: 'We separate spot colors, check underbase, trapping and minimum line widths, and organize the file so the production team does not need to clean it again.',
      de: 'Wir trennen Volltonfarben, prüfen Weißunterdruck, Überfüllung und Mindestlinienstärken und organisieren die Datei so, dass die Produktion sie nicht erneut bereinigen muss.',
    },
    idealFor: {
      tr: ['Serigrafi atölyeleri', 'DTF üreticileri', 'Giyim markaları'],
      en: ['Screen printers', 'DTF producers', 'Apparel brands'],
      de: ['Siebdruckereien', 'DTF-Produzenten', 'Bekleidungsmarken'],
    },
    includes: {
      tr: ['Spot renk katmanları', 'Pantone notları', 'Alt baskı/trapping kontrolü'],
      en: ['Spot-color layers', 'Pantone notes', 'Underbase/trapping checks'],
      de: ['Volltonfarbebenen', 'Pantone-Angaben', 'Prüfung von Unterdruck und Überfüllung'],
    },
    useCases: {
      tr: ['Tişört ve kapüşonlu sweatshirt', 'Bez çanta', 'Promosyon tekstili'],
      en: ['T-shirts and hoodies', 'Tote bags', 'Promotional apparel'],
      de: ['T-Shirts und Hoodies', 'Stoffbeutel', 'Werbetextilien'],
    },
  },
  {
    slug: 'cnc-laser-cut-vector',
    artworkType: 'apparel_signage',
    startingPrice: 45,
    turnaround: { tr: '24–48 saat', en: '24–48 hours', de: '24–48 Stunden' },
    title: { tr: 'CNC, Lazer ve Folyo Kesim Vektörü', en: 'CNC, Laser & Vinyl Cut Vector', de: 'CNC-, Laser- und Folienplot-Vektor' },
    short: {
      tr: 'Kapalı, birleştirilmiş ve makine hareketine uygun kesim yolları hazırlar.',
      en: 'Create closed, welded cutting paths built for smooth machine movement.',
      de: 'Geschlossene, verschweißte Schneidpfade werden für saubere Maschinenbewegungen aufgebaut.',
    },
    description: {
      tr: 'Üst üste binen yolları, açık konturları ve gereksiz düğümleri temizleriz. Kesim sırası ve minimum detaylar malzeme ve makine tipine göre düzenlenir.',
      en: 'We remove overlapping paths, open contours and redundant nodes. Cutting order and minimum detail are adapted to the material and machine type.',
      de: 'Überlappende Pfade, offene Konturen und unnötige Knoten werden entfernt. Schneidreihenfolge und Mindestdetails werden an Material und Maschine angepasst.',
    },
    idealFor: {
      tr: ['Tabelacılar', 'Araç giydirme atölyeleri', 'Lazer ve CNC üreticileri'],
      en: ['Sign shops', 'Vehicle-wrap studios', 'Laser and CNC producers'],
      de: ['Schilderhersteller', 'Fahrzeugfolierer', 'Laser- und CNC-Betriebe'],
    },
    includes: {
      tr: ['Kapalı konturlar', 'Birleştirilmiş kesişimler', 'Azaltılmış düğüm sayısı'],
      en: ['Closed contours', 'Welded intersections', 'Reduced node count'],
      de: ['Geschlossene Konturen', 'Verschweißte Schnittpunkte', 'Reduzierte Knotenanzahl'],
    },
    useCases: {
      tr: ['Folyo kesim', 'Pleksi ve ahşap lazer kesim', 'CNC frezeleme'],
      en: ['Vinyl cutting', 'Acrylic and wood laser work', 'CNC routing'],
      de: ['Folienplot', 'Lasern von Acryl und Holz', 'CNC-Fräsen'],
    },
  },
  {
    slug: 'embroidery-ready-vector',
    artworkType: 'apparel_signage',
    startingPrice: 50,
    turnaround: { tr: '24–48 saat', en: '24–48 hours', de: '24–48 Stunden' },
    title: { tr: 'Nakışa Hazır Vektör Sadeleştirme', en: 'Embroidery-Ready Vector Simplification', de: 'Vektorvereinfachung für Stickerei' },
    short: {
      tr: 'Logoyu küçük ölçekte okunabilir, temiz renk bölgelerine dönüştürür.',
      en: 'Turn logos into clean, readable color areas that hold up at small sizes.',
      de: 'Logos werden in lesbare, saubere Farbflächen für kleine Stickgrößen umgesetzt.',
    },
    description: {
      tr: 'İnce çizgileri, küçük boşlukları ve gereksiz ayrıntıları nakış sınırlarına göre düzenleriz. Teslim edilen dosya, nakış programcısının sağlıklı bir dikiş dosyası hazırlayabileceği temiz bir vektör kaynağıdır.',
      en: 'We adapt thin strokes, tight gaps and unnecessary detail to embroidery limits. The deliverable is a clean vector source from which an embroidery digitizer can build a reliable stitch file.',
      de: 'Dünne Linien, enge Zwischenräume und unnötige Details werden an die Grenzen der Stickerei angepasst. Geliefert wird eine saubere Vektorquelle, aus der ein Stickprogrammierer eine zuverlässige Stichdatei erstellen kann.',
    },
    idealFor: {
      tr: ['Nakış atölyeleri', 'Üniforma üreticileri', 'Şapka ve patch markaları'],
      en: ['Embroidery shops', 'Uniform suppliers', 'Cap and patch brands'],
      de: ['Stickereien', 'Uniformhersteller', 'Cap- und Patch-Marken'],
    },
    includes: {
      tr: ['Küçük boyut varyantı', 'Minimum çizgi kontrolü', 'Temiz renk bölgeleri'],
      en: ['Small-size variant', 'Minimum stroke-width check', 'Clean color areas'],
      de: ['Kleinformat-Variante', 'Mindestlinienprüfung', 'Saubere Farbflächen'],
    },
    useCases: {
      tr: ['Şapka', 'Göğüs logosu', 'Dokuma veya nakışlı arma (patch)'],
      en: ['Caps', 'Chest logos', 'Woven or embroidered patches'],
      de: ['Caps', 'Brustlogos', 'Gewebte oder gestickte Patches'],
    },
  },
];

export const caseStudies: MarketingCaseStudy[] = [
  {
    slug: 'ai-crest-production-rebuild',
    serviceSlug: 'ai-logo-vectorization',
    visual: 'crest',
    title: { tr: 'Yapay Zekâ Arma Taslağından Üretim Masterına', en: 'AI Crest Concept to Production Master', de: 'Vom KI-Wappen zum Produktionsmaster' },
    category: { tr: 'Stüdyo demonstrasyonu · Yapay zekâ logosu', en: 'Studio demonstration · AI logo', de: 'Studio-Demonstration · KI-Logo' },
    summary: {
      tr: 'Bozuk harfleri ve asimetrik eğrileri olan bir yapay zekâ taslağını baskı ve folyo kesime uygun şekilde yeniden çizme yöntemimiz.',
      en: 'How we rebuild an AI concept with broken lettering and asymmetric curves for print and vinyl cutting.',
      de: 'So bauen wir ein KI-Konzept mit fehlerhafter Schrift und asymmetrischen Kurven für Druck und Folienplot neu auf.',
    },
    challenge: {
      tr: 'Raster taslakta harfler okunamıyor, dış hat kalınlıkları değişiyor ve simetri merkezi kayıyordu. Otomatik izleme bu hataları vektörde de kalıcı hale getirirdi.',
      en: 'The raster concept had unreadable letters, inconsistent outline weights and an off-center axis. Auto-trace would simply preserve those defects as vectors.',
      de: 'Der Rasterentwurf hatte unleserliche Buchstaben, wechselnde Konturstärken und eine verschobene Mittelachse. Auto-Trace hätte diese Fehler lediglich als Vektoren konserviert.',
    },
    approach: {
      tr: 'Ana geometri ızgara üzerinde yeniden kuruldu, sahte yazı gerçek tipografiyle değiştirildi ve tüm kesişimler temiz kapalı yollara dönüştürüldü.',
      en: 'The primary geometry was rebuilt on a grid, the pseudo-lettering was replaced with real type and every intersection became a clean closed path.',
      de: 'Die Hauptgeometrie wurde auf einem Raster neu aufgebaut, die Pseudo-Schrift durch echte Schrift ersetzt und alle Schnittpunkte in saubere geschlossene Pfade überführt.',
    },
    outcome: {
      tr: 'Ortaya büyük tabela, küçük etiket ve folyo kesim için ayrı ayrı test edilebilen düzenli bir master dosya seti çıktı.',
      en: 'The result is an organized set of master files that can be proofed separately for large signage, small labels and vinyl cutting.',
      de: 'Das Ergebnis ist ein geordneter Satz Master-Dateien, der sich für große Schilder, kleine Etiketten und Folienplot separat prüfen lässt.',
    },
    deliverables: {
      tr: ['Katmanlı AI master', 'SVG ve EPS üretim dosyası', 'PDF kontrol provası', 'Şeffaf PNG seti'],
      en: ['Layered AI master', 'SVG and EPS production files', 'PDF proof', 'Transparent PNG set'],
      de: ['AI-Master mit Ebenen', 'SVG- und EPS-Produktionsdateien', 'PDF-Proof', 'Transparenter PNG-Satz'],
    },
  },
  {
    slug: 'mascot-color-separation',
    serviceSlug: 'mascot-vectorization',
    visual: 'mascot',
    title: { tr: 'Maskot Çiziminde Temiz Renk Katmanları', en: 'Clean Color Layers for a Mascot Logo', de: 'Saubere Farbebenen für ein Maskottchen' },
    category: { tr: 'Stüdyo demonstrasyonu · Tekstil', en: 'Studio demonstration · Apparel', de: 'Studio-Demonstration · Textil' },
    summary: {
      tr: 'Karmaşık bir maskotu beş düzenlenebilir renk katmanına ve küçük boyut varyantına dönüştüren üretim yaklaşımı.',
      en: 'A production approach that turns a complex mascot into five editable color layers and a small-size variant.',
      de: 'Ein Produktionsansatz, der ein komplexes Maskottchen in fünf editierbare Farbebenen und eine Kleinformat-Variante überführt.',
    },
    challenge: {
      tr: 'Gölgeler yüzlerce küçük renk lekesinden oluşuyor, ince çizgiler baskıda kayboluyor ve silüet küçük boyutlarda okunmuyordu.',
      en: 'Shading consisted of hundreds of tiny color fragments, thin lines would disappear in print and the silhouette fell apart at small sizes.',
      de: 'Die Schattierung bestand aus Hunderten winziger Farbflächen, dünne Linien wären im Druck verschwunden und die Silhouette war in kleinen Größen nicht lesbar.',
    },
    approach: {
      tr: 'Ana silüet güçlendirildi, gölgeler kontrollü spot renklere indirildi ve küçük boyutlar için ikinci, sade bir varyant hazırlandı.',
      en: 'We strengthened the silhouette, reduced the shading to controlled spot colors and created a simplified secondary version for small sizes.',
      de: 'Die Silhouette wurde verstärkt, Schattierungen auf kontrollierte Volltonfarben reduziert und eine vereinfachte Zweitversion für kleine Größen erstellt.',
    },
    outcome: {
      tr: 'Renkleri değiştirilebilen, serigrafi ve DTF süreçlerine aktarılabilen temiz bir katman yapısı elde edildi.',
      en: 'The outcome is a clean, recolorable layer structure ready for screen printing and DTF workflows.',
      de: 'Entstanden ist eine saubere, umfärbbare Ebenenstruktur für Siebdruck und DTF.',
    },
    deliverables: {
      tr: ['Beş spot renk katmanı', 'Ana ve sade varyant', 'Koyu/açık zemin versiyonları', 'Üretim notları'],
      en: ['Five spot-color layers', 'Primary and simplified variants', 'Dark/light background versions', 'Production notes'],
      de: ['Fünf Volltonfarbebenen', 'Haupt- und vereinfachte Variante', 'Versionen für helle/dunkle Flächen', 'Produktionshinweise'],
    },
  },
  {
    slug: 'heritage-lettering-restoration',
    serviceSlug: 'typography-reconstruction',
    visual: 'lettering',
    title: { tr: 'Eski Logotipin Optik Yeniden Çizimi', en: 'Optical Restoration of a Legacy Wordmark', de: 'Optische Restaurierung einer alten Wortmarke' },
    category: { tr: 'Stüdyo demonstrasyonu · Tipografi', en: 'Studio demonstration · Typography', de: 'Studio-Demonstration · Typografie' },
    summary: {
      tr: 'Düşük kaliteli bir fotoğraftaki özel harf yapısını koruyarak modern üretim için yeniden kuran tipografi çalışması.',
      en: 'A typography study that preserves the character of a wordmark from a low-quality photo while rebuilding it for modern production.',
      de: 'Eine Typografiestudie, die den Charakter einer Wortmarke aus einem schlechten Foto bewahrt und sie für die moderne Produktion neu aufbaut.',
    },
    challenge: {
      tr: 'Fotoğraf açısı, yüzey dokusu ve kabartma ışığı harflerin gerçek oranlarını bozuyordu; kaynak yazı tipi dosyası da yoktu.',
      en: 'Perspective, surface texture and embossed lighting distorted the true letter proportions, and no source font existed.',
      de: 'Perspektive, Oberflächenstruktur und Prägungslicht verzerrten die Buchstabenproportionen; eine Schriftdatei lag nicht vor.',
    },
    approach: {
      tr: 'Temel çizgi ve x-yüksekliği belirlendi; harfler optik ritim, serif kalınlığı ve boşluk dengesi korunarak tek tek çizildi.',
      en: 'We set the baseline and x-height, then redrew every letter to preserve its optical rhythm, serif weight and balanced spacing.',
      de: 'Grundlinie und x-Höhe wurden definiert; jeder Buchstabe wurde unter Wahrung von optischem Rhythmus, Serifenstärke und ausgewogenen Abständen neu gezeichnet.',
    },
    outcome: {
      tr: 'Kabartma, sıcak folyo ve dijital kullanım için ayrı kalınlıkları bulunan düzenlenebilir bir logotip ailesi oluştu.',
      en: 'The result is an editable wordmark family with separate weights for embossing, hot foil and digital use.',
      de: 'Das Ergebnis ist eine editierbare Wortmarkenfamilie mit eigenen Strichstärken für Prägung, Heißfolie und digitale Anwendungen.',
    },
    deliverables: {
      tr: ['Ana logotip', 'Küçük boyut varyantı', 'Folyo/kabartma versiyonu', 'SVG, EPS, PDF ve PNG'],
      en: ['Primary wordmark', 'Small-size variant', 'Foil/emboss version', 'SVG, EPS, PDF and PNG'],
      de: ['Primäre Wortmarke', 'Kleinformat-Variante', 'Folien-/Prägeversion', 'SVG, EPS, PDF und PNG'],
    },
  },
];

export const guides: MarketingGuide[] = [
  {
    slug: 'why-auto-trace-fails-in-production',
    title: { tr: 'Otomatik İzleme Üretimde Neden Sorun Çıkarır?', en: 'Why Auto-Trace Fails in Production', de: 'Warum Auto-Trace in der Produktion scheitert' },
    excerpt: {
      tr: 'Fazla düğüm, açık kontur ve üst üste binen yüzeylerin baskı ve kesim makinelerine etkisi.',
      en: 'How excessive nodes, open contours and overlapping shapes affect print and cutting machines.',
      de: 'Wie zu viele Knoten, offene Konturen und überlappende Flächen Druck- und Schneidemaschinen beeinflussen.',
    },
    readTime: { tr: '5 dk okuma', en: '5 min read', de: '5 Min. Lesezeit' },
    sections: {
      tr: [
        { title: 'Pikseli takip etmek geometri kurmak değildir', body: 'Otomatik izleme her piksel basamağını takip ederek gereksiz düğümler ve dalgalı kenarlar üretir. Üretim dosyasında amaç görüntüyü kopyalamak değil, temel şekli temiz matematiksel eğrilerle yeniden kurmaktır.' },
        { title: 'Açık ve üst üste binen yollar', body: 'Kesim makineleri kapalı ve öngörülebilir yollar ister. Üst üste binen yüzeyler bıçağın aynı bölgeyi tekrar kesmesine, açık konturlar ise üretim yazılımında hataya neden olabilir.' },
        { title: 'Doğru kontrol listesi', body: 'Mümkün olduğunca az düğüm, kapalı kontur, birleştirilmiş kesişim, uygun çizgi kalınlığı ve hedef üretim yöntemi için ayrı test görünümü kullanılmalıdır.' },
      ],
      en: [
        { title: 'Following pixels is not building geometry', body: 'Auto-trace follows every pixel step, creating redundant nodes and wobbly edges. Production artwork should reconstruct the underlying form with clean mathematical curves.' },
        { title: 'Open and overlapping paths', body: 'Cutting machines need closed, predictable paths. Overlaps can make a blade cut the same area twice, while open contours can fail in production software.' },
        { title: 'The right checklist', body: 'Aim for a minimal node count, closed contours, welded intersections, appropriate stroke widths and a dedicated proof view for the target production method.' },
      ],
      de: [
        { title: 'Pixel nachzeichnen ist kein Geometrieaufbau', body: 'Auto-Trace folgt jeder Pixelstufe und erzeugt unnötige Knoten sowie unruhige Kanten. Produktionsfähige Grafik baut die Grundform mit sauberen mathematischen Kurven neu auf.' },
        { title: 'Offene und überlappende Pfade', body: 'Schneidemaschinen benötigen geschlossene, vorhersehbare Pfade. Überlappungen können doppelte Schnitte verursachen, offene Konturen können Fehler in der Produktionssoftware.' },
        { title: 'Die richtige Prüfliste', body: 'Entscheidend sind möglichst wenige Knoten, geschlossene Konturen, verschweißte Schnittpunkte, passende Linienstärken und eine eigene Prüfansicht für das Zielverfahren.' },
      ],
    },
  },
  {
    slug: 'choose-the-right-vector-file-format',
    title: { tr: 'Hangi Vektör Dosya Formatını Kullanmalısınız?', en: 'Which Vector File Format Should You Use?', de: 'Welches Vektorformat sollten Sie verwenden?' },
    excerpt: {
      tr: 'AI, EPS, SVG, PDF ve PNG dosyalarının doğru kullanım alanları.',
      en: 'When to use AI, EPS, SVG, PDF and PNG files.',
      de: 'Die passenden Einsatzbereiche für AI, EPS, SVG, PDF und PNG.',
    },
    readTime: { tr: '4 dk okuma', en: '4 min read', de: '4 Min. Lesezeit' },
    sections: {
      tr: [
        { title: 'AI ve EPS: üretim masterları', body: 'AI (Adobe Illustrator) düzenlenebilir katmanları korur; EPS ise birçok eski baskı ve kesim iş akışıyla uyumludur. İkisi de üretim ekipleri için güvenli kaynak dosyalardır.' },
        { title: 'SVG: web ve arayüz', body: 'SVG tarayıcıda keskin kalır, CSS ile renklendirilebilir ve küçük dosya boyutları sağlar. Web sitesi, uygulama ve dijital ürünlerde idealdir.' },
        { title: 'PDF ve PNG: paylaşım ve önizleme', body: 'PDF matbaa ve onay süreçlerinde kolay paylaşılır. PNG vektör değildir ancak şeffaf arka planlı hızlı önizleme ve günlük kullanım için pratiktir.' },
      ],
      en: [
        { title: 'AI and EPS: production masters', body: 'AI preserves editable layers, while EPS remains compatible with many established print and cutting workflows. Both are dependable production sources.' },
        { title: 'SVG: web and interfaces', body: 'SVG stays sharp in browsers, can be styled with CSS and keeps file sizes low. It is ideal for websites, apps and digital products.' },
        { title: 'PDF and PNG: sharing and preview', body: 'PDF is convenient for printers and approvals. PNG is not a vector format, but it is practical for transparent previews and everyday use.' },
      ],
      de: [
        { title: 'AI und EPS: Produktionsmaster', body: 'AI bewahrt editierbare Ebenen; EPS ist mit vielen etablierten Druck- und Schneideabläufen kompatibel. Beide sind zuverlässige Produktionsquellen.' },
        { title: 'SVG: Web und Interfaces', body: 'SVG bleibt im Browser scharf, lässt sich per CSS gestalten und hält Dateien klein. Ideal für Websites, Apps und digitale Produkte.' },
        { title: 'PDF und PNG: Freigabe und Vorschau', body: 'PDF eignet sich für Druckereien und Freigaben. PNG ist kein Vektorformat, aber praktisch für transparente Vorschauen und den täglichen Gebrauch.' },
      ],
    },
  },
  {
    slug: 'prepare-a-logo-for-embroidery',
    title: { tr: 'Logonuzu Nakışa Nasıl Hazırlarsınız?', en: 'How to Prepare a Logo for Embroidery', de: 'So bereiten Sie ein Logo für Stickerei vor' },
    excerpt: {
      tr: 'Küçük detay, çizgi kalınlığı, renk sayısı ve sade varyant hazırlama rehberi.',
      en: 'A guide to fine detail, stroke width, color count and simplified variants.',
      de: 'Ein Leitfaden zu Details, Linienstärke, Farbanzahl und vereinfachten Varianten.',
    },
    readTime: { tr: '6 dk okuma', en: '6 min read', de: '6 Min. Lesezeit' },
    sections: {
      tr: [
        { title: 'Önce gerçek kullanım boyutunu belirleyin', body: 'Göğüs logosu ile büyük sırt nakışı aynı ayrıntı seviyesini taşımaz. Vektör sadeleştirme, hedeflenen gerçek ölçüye (santimetre) göre yapılmalıdır.' },
        { title: 'İnce çizgi ve küçük boşlukları güçlendirin', body: 'İplik, ekrandaki piksel kadar ince davranmaz. Çok ince çizgiler kalınlaştırılmalı; birbirine yakın boşluklar dikiş sırasında kapanmayacak kadar açılmalıdır.' },
        { title: 'Nakış dosyası ayrı bir uzmanlık alanıdır', body: 'Temiz vektör doğru başlangıçtır ancak DST/PES gibi dikiş dosyaları ayrıca dijitalleştirilmelidir. Artlantix vektörü bu sürece güvenli kaynak olarak hazırlar.' },
      ],
      en: [
        { title: 'Start with the actual size', body: 'A chest logo and a large back embroidery cannot carry the same level of detail. Simplification must be based on the final physical size.' },
        { title: 'Strengthen fine strokes and tight gaps', body: 'Thread does not behave like a screen pixel. Thin strokes need to be thickened, and tight gaps need enough room to stay open after stitching.' },
        { title: 'Stitch files are a separate discipline', body: 'A clean vector is the right starting point, but DST/PES files still have to be digitized by an embroidery specialist. Artlantix prepares a dependable vector source for that process.' },
      ],
      de: [
        { title: 'Zuerst die tatsächliche Größe festlegen', body: 'Ein Brustlogo und eine große Rückenstickerei vertragen nicht denselben Detailgrad. Die Vereinfachung richtet sich nach der tatsächlichen Stickgröße.' },
        { title: 'Feine Linien und enge Abstände verstärken', body: 'Garn verhält sich nicht wie ein Bildschirmpixel. Dünne Linien müssen verstärkt und enge Zwischenräume so weit geöffnet werden, dass sie beim Sticken nicht zulaufen.' },
        { title: 'Stickdateien sind ein eigener Fachbereich', body: 'Ein sauberer Vektor ist die richtige Basis, doch DST/PES-Dateien müssen zusätzlich von Stickprogrammierern digitalisiert werden. Artlantix liefert dafür eine zuverlässige Vektorquelle.' },
      ],
    },
  },
];

export const marketingCopy = {
  tr: {
    home: {
      eyebrow: 'Manuel vektör üretim stüdyosu',
      titleLines: ['Pikselden', 'Vektöre'],
      description: 'Yapay zekâ taslaklarını, bulanık logoları ve eski taramaları baskı, nakış, tabela ve CNC için temiz vektör masterlara dönüştürüyoruz.',
      primary: 'Dosyanızı yükleyin', secondary: 'Öncesi / sonrası',
      proofEyebrow: 'Doğrulanabilir stüdyo standardı', proofTitle: 'Söz değil, görülebilir üretim disiplini.',
      servicesEyebrow: 'Hizmetler', servicesTitle: 'Dosyanızın gideceği üretime göre çalışırız.', servicesBody: 'Her hizmetin kapsamı, başlangıç fiyatı, süresi ve teslimatları ayrı ayrı açıklanır.', allServices: 'Tüm hizmetleri görün',
      processEyebrow: 'Süreç', processTitle: 'Dört net adım. Tek özel çalışma alanı.',
      workEyebrow: 'Çalışma sistemi', workTitle: 'Sorunu, yaklaşımı ve üretim sonucunu birlikte gösteriyoruz.', workBody: 'Müşterilerimizden yayın izni alınana kadar aşağıdaki örnekler açıkça stüdyo demonstrasyonu olarak işaretlenir.', allWork: 'Tüm çalışmaları görün',
      pricingEyebrow: 'Şeffaf fiyat yapısı', pricingTitle: 'Başlangıç fiyatını bilin, üretimden önce nihai teklifi onaylayın.', pricingBody: 'Kartınızdan çekim yapılmaz. Dosyanız incelenir, nihai kapsam ve fiyat onayınıza sunulur.', fullPricing: 'Fiyatlandırmayı inceleyin',
      guidesEyebrow: 'Stüdyo rehberleri', guidesTitle: 'Üretim dosyasını doğru anlamak için kısa rehberler.', allGuides: 'Tüm rehberler',
      faqEyebrow: 'Sık sorulanlar', faqTitle: 'Başlamadan önce bilmeniz gerekenler.',
      finalTitle: 'Dosyanızın üretime hazır olup olmadığını birlikte inceleyelim.', finalBody: 'Dosyanızı güvenli biçimde yükleyin. Uzman değerlendirmesini seçerseniz zorluk seviyesini ve fiyatı stüdyo belirler.',
    },
    common: { from: 'Başlangıç', turnaround: 'Süre', learnMore: 'Detayları görün', startService: 'Bu hizmetle başlayın', included: 'Dahil olanlar', idealFor: 'Kimler için?', useCases: 'Kullanım alanları', viewCase: 'Çalışmayı inceleyin', demo: 'Stüdyo demonstrasyonu', read: 'Rehberi okuyun', back: 'Geri dön', simple: 'Basit', standard: 'Standart', complex: 'Karmaşık' },
    pages: {
      servicesEyebrow: '', servicesTitle: 'Tek bir görselden üretim sistemine.', servicesBody: 'Logo temizliğinden CNC kesim konturuna kadar her hizmet net kapsam, süre ve teslimatlarla sunulur.',
      workEyebrow: '', workTitle: 'Yalnızca önce / sonra değil: problem / çözüm / üretim sonucu.', workBody: 'Bu demonstrasyonlar vaka çalışmalarını nasıl sunduğumuzu gösterir. Gerçek müşteri işleri yalnızca yayın izniyle eklenecektir.',
      pricingEyebrow: '', pricingTitle: 'Şeffaf başlangıç fiyatları. Sürpriz fatura yok.', pricingBody: 'Gösterilen fiyat bir başlangıç tahminidir. Üretim yalnızca dosya incelemesi ve nihai fiyat onayından sonra başlar.',
      guidesEyebrow: '', guidesTitle: 'Daha iyi dosya, daha sorunsuz üretim.', guidesBody: 'Vektör, baskı, kesim ve nakış kararlarını sade biçimde anlatan özgün stüdyo rehberleri.',
      faqEyebrow: '', faqTitle: 'Teklif, üretim ve teslim hakkında net cevaplar.', faqBody: 'Cevabınızı bulamazsanız uzman değerlendirmesi seçerek dosyanızı doğrudan stüdyoya gönderin.',
    },
  },
  en: {
    home: {
      eyebrow: 'Manual vector production studio', titleLines: ['From pixel', 'To vector'], description: 'We turn AI concepts, blurry logos and legacy scans into clean vector masters for print, embroidery, signage and CNC.', primary: 'Upload your file', secondary: 'See before / after', proofEyebrow: 'Verifiable studio standard', proofTitle: 'Visible production discipline, not empty promises.', servicesEyebrow: 'Services', servicesTitle: 'Built around where your file goes next.', servicesBody: 'Every service clearly explains scope, starting price, turnaround and deliverables.', allServices: 'View all services', processEyebrow: 'Process', processTitle: 'Four clear steps. One private workspace.', workEyebrow: 'Working method', workTitle: 'See the problem, approach and production outcome together.', workBody: 'Until clients give us permission to publish their work, examples are clearly labeled as studio demonstrations.', allWork: 'View all work', pricingEyebrow: 'Transparent pricing', pricingTitle: 'Know the starting price and approve the final quote before production.', pricingBody: 'We don’t charge your card. We review your file and present the final scope and price for approval.', fullPricing: 'Explore pricing', guidesEyebrow: 'Studio guides', guidesTitle: 'Short guides for understanding production artwork.', allGuides: 'All guides', faqEyebrow: 'Common questions', faqTitle: 'What to know before you begin.', finalTitle: 'Let’s find out whether your file is production-ready.', finalBody: 'Upload your file privately. Choose expert assessment and the studio will set the complexity level and price.',
    },
    common: { from: 'Starting at', turnaround: 'Turnaround', learnMore: 'View details', startService: 'Start this service', included: 'What’s included', idealFor: 'Who is it for?', useCases: 'Use cases', viewCase: 'View case study', demo: 'Studio demonstration', read: 'Read guide', back: 'Back', simple: 'Simple', standard: 'Standard', complex: 'Complex' },
    pages: { servicesEyebrow: '', servicesTitle: 'From one image to a production system.', servicesBody: 'From logo cleanup to CNC cutting contours, every service has clear scope, timing and deliverables.', workEyebrow: '', workTitle: 'Not just before / after: problem / solution / production result.', workBody: 'These demonstrations show how we present case studies. Real client work will be added only with permission to publish.', pricingEyebrow: '', pricingTitle: 'Transparent starting prices. No surprise invoices.', pricingBody: 'The displayed price is a starting estimate. Production begins only after file review and final quote approval.', guidesEyebrow: '', guidesTitle: 'Better files, smoother production.', guidesBody: 'Original studio guides that explain vector, print, cutting and embroidery decisions in plain language.', faqEyebrow: '', faqTitle: 'Clear answers about quotes, production and delivery.', faqBody: 'If you cannot find an answer, choose expert assessment and send your file directly to the studio.' },
  },
  de: {
    home: {
      eyebrow: 'Studio für manuelle Vektorproduktion', titleLines: ['Vom Pixel', 'Zum Vektor'], description: 'Wir verwandeln KI-Entwürfe, unscharfe Logos und alte Scans in saubere Vektor-Master für Druck, Stickerei, Beschilderung und CNC.', primary: 'Datei hochladen', secondary: 'Vorher / Nachher ansehen', proofEyebrow: 'Prüfbarer Studio-Standard', proofTitle: 'Sichtbare Produktionsdisziplin statt leerer Versprechen.', servicesEyebrow: 'Leistungen', servicesTitle: 'Ausgerichtet auf den nächsten Produktionsschritt.', servicesBody: 'Für jede Leistung nennen wir klar Umfang, Einstiegspreis, Lieferzeit und Lieferdateien.', allServices: 'Alle Leistungen', processEyebrow: 'Ablauf', processTitle: 'Vier klare Schritte. Ein privater Arbeitsbereich.', workEyebrow: 'Arbeitsweise', workTitle: 'Problem, Vorgehen und Produktionsergebnis auf einen Blick.', workBody: 'Solange keine Veröffentlichungsfreigabe von Kunden vorliegt, sind Beispiele klar als Studio-Demonstration gekennzeichnet.', allWork: 'Alle Arbeiten', pricingEyebrow: 'Transparente Preise', pricingTitle: 'Einstiegspreis kennen, endgültiges Angebot vor Produktionsbeginn freigeben.', pricingBody: 'Ihre Karte wird nicht belastet. Wir prüfen Ihre Datei und legen Ihnen Umfang und Endpreis zur Freigabe vor.', fullPricing: 'Preise ansehen', guidesEyebrow: 'Studio-Ratgeber', guidesTitle: 'Kurze Ratgeber zum Verständnis von Produktionsdateien.', allGuides: 'Alle Ratgeber', faqEyebrow: 'Häufige Fragen', faqTitle: 'Was Sie vor dem Start wissen sollten.', finalTitle: 'Prüfen wir gemeinsam, ob Ihre Datei produktionsbereit ist.', finalBody: 'Laden Sie Ihre Datei privat hoch. Wählen Sie die Expertenprüfung, legt das Studio Komplexität und Preis fest.',
    },
    common: { from: 'Ab', turnaround: 'Lieferzeit', learnMore: 'Details ansehen', startService: 'Mit dieser Leistung starten', included: 'Enthalten', idealFor: 'Für wen?', useCases: 'Einsatzbereiche', viewCase: 'Fallstudie ansehen', demo: 'Studio-Demonstration', read: 'Ratgeber lesen', back: 'Zurück', simple: 'Einfach', standard: 'Standard', complex: 'Komplex' },
    pages: { servicesEyebrow: '', servicesTitle: 'Von einem Bild zum Produktionssystem.', servicesBody: 'Von der Logo-Bereinigung bis zur CNC-Schneidkontur: jede Leistung mit klarem Umfang, Zeitrahmen und Lieferdateien.', workEyebrow: '', workTitle: 'Nicht nur vorher / nachher: Problem / Lösung / Produktionsergebnis.', workBody: 'Diese Demonstrationen zeigen, wie wir Fallstudien aufbereiten. Echte Kundenarbeiten erscheinen nur mit Freigabe zur Veröffentlichung.', pricingEyebrow: '', pricingTitle: 'Transparente Einstiegspreise. Keine überraschenden Rechnungen.', pricingBody: 'Der angezeigte Preis ist eine erste Schätzung. Die Produktion beginnt erst nach Dateiprüfung und Freigabe des endgültigen Angebots.', guidesEyebrow: '', guidesTitle: 'Bessere Dateien, reibungslosere Produktion.', guidesBody: 'Eigene Studio-Ratgeber erklären Entscheidungen zu Vektor, Druck, Schnitt und Stickerei verständlich.', faqEyebrow: '', faqTitle: 'Klare Antworten zu Angebot, Produktion und Lieferung.', faqBody: 'Wenn Ihre Frage offen bleibt, wählen Sie die Expertenprüfung und senden Sie Ihre Datei direkt ans Studio.' },
  },
} as const;

export const trustFacts = {
  tr: [
    { title: 'Manuel yeniden çizim', text: 'Otomatik izleme yok; her eğri, üretileceği yönteme göre yeniden kurulur.' },
    { title: 'Özel dosya alanı', text: 'Müşteri yüklemeleri ve teslim dosyaları herkese açık değildir.' },
    { title: 'Virüs taraması karantinası', text: 'Dosyalar güvenlik taramasından temiz çıkmadan ekibimize açılmaz.' },
    { title: 'Onaydan sonra üretim', text: 'Kapsam ve fiyat, teklifi onaylamanızdan önce kesinleşmiş sayılmaz.' },
  ],
  en: [
    { title: 'Manual reconstruction', text: 'No auto-trace; every path is rebuilt for the way it will be produced.' },
    { title: 'Private file workspace', text: 'Customer uploads and deliverables are not public assets.' },
    { title: 'Malware-scan quarantine', text: 'Files stay locked to our team until they pass a security scan.' },
    { title: 'Production after approval', text: 'Scope and price are not final until the customer approves the quote.' },
  ],
  de: [
    { title: 'Manuelle Rekonstruktion', text: 'Kein Auto-Trace; jeder Pfad wird für das spätere Fertigungsverfahren neu aufgebaut.' },
    { title: 'Privater Dateibereich', text: 'Kunden-Uploads und Lieferdateien sind nicht öffentlich.' },
    { title: 'Malware-Quarantäne', text: 'Dateien bleiben für unser Team gesperrt, bis sie den Sicherheitsscan bestanden haben.' },
    { title: 'Produktion nach Freigabe', text: 'Umfang und Preis sind erst nach Ihrer Freigabe des Angebots verbindlich.' },
  ],
};

export const processSteps = {
  tr: [
    { title: 'Gönder', text: 'Dosyanızı ve kullanım amacını özel teklif alanından paylaşın.' },
    { title: 'İncele', text: 'Stüdyo geometriyi, hasarı ve üretim gereksinimini değerlendirir.' },
    { title: 'Yeniden çiz', text: 'Eğriler, yazılar ve renk katmanları elle yeniden kurulur.' },
    { title: 'Onayla ve teslim al', text: 'Önizlemeyi onaylayın; master dosyaları özel arşivinizden indirin.' },
  ],
  en: [
    { title: 'Submit', text: 'Share your file and intended use through the private quote workspace.' },
    { title: 'Review', text: 'The studio reviews geometry, damage and production requirements.' },
    { title: 'Rebuild', text: 'Paths, lettering and color layers are rebuilt by hand.' },
    { title: 'Approve and receive', text: 'Approve the preview, then download your master files from your private vault.' },
  ],
  de: [
    { title: 'Senden', text: 'Datei und Verwendungszweck im privaten Angebotsbereich teilen.' },
    { title: 'Prüfen', text: 'Das Studio bewertet Geometrie, Schäden und Produktionsanforderungen.' },
    { title: 'Neu aufbauen', text: 'Pfade, Schrift und Farbebenen werden manuell rekonstruiert.' },
    { title: 'Freigeben und erhalten', text: 'Vorschau freigeben und Master-Dateien im privaten Archiv herunterladen.' },
  ],
};

export const publicFaqs = {
  tr: [
    { q: 'Hangi dosyaları yükleyebilirim?', a: 'JPG, JPEG, PNG, WebP ve PDF kabul edilir. Şu anda dosya başına sınır 2 MB’tır.' },
    { q: 'Gösterilen fiyat kesin mi?', a: 'Hayır. Gösterilen tutar seçeneklerinize göre hesaplanan başlangıç tahminidir. Dosya incelendikten sonra nihai kapsam ve fiyat onayınıza sunulur.' },
    { q: 'Sipariş verirken ödeme alınıyor mu?', a: 'Hayır. Gönderdiğiniz talep bir teklif isteğidir; bu adımda kartınızdan çekim yapılmaz ve fatura oluşturulmaz.' },
    { q: 'Dosyalarım herkese açık olur mu?', a: 'Hayır. Müşteri yüklemeleri, önizlemeler ve master teslimleri özel depolama alanlarında tutulur ve yetkilendirme kurallarıyla korunur.' },
    { q: 'Revizyon nasıl yapılır?', a: 'Önizleme hazır olduğunda müşteri portalında görselin üzerine doğrudan işaret koyarak revizyon isteyebilir veya çalışmayı onaylayabilirsiniz.' },
  ],
  en: [
    { q: 'Which files can I upload?', a: 'JPG, JPEG, PNG, WebP and PDF are accepted. The current per-file limit is 2 MB.' },
    { q: 'Is the displayed price final?', a: 'No. It is a starting estimate based on your selections. Final scope and price are presented for approval after file review.' },
    { q: 'Do you take payment when I submit?', a: 'No. Submitting creates a quote request; your card is not charged and no invoice is generated at this step.' },
    { q: 'Are my files public?', a: 'No. Customer uploads, previews and master files are kept in private storage protected by access controls.' },
    { q: 'How do revisions work?', a: 'When a preview is ready, you can mark revision points directly on the artwork in the customer portal, or approve it.' },
  ],
  de: [
    { q: 'Welche Dateien kann ich hochladen?', a: 'Akzeptiert werden JPG, JPEG, PNG, WebP und PDF. Das aktuelle Limit beträgt 2 MB pro Datei.' },
    { q: 'Ist der angezeigte Preis endgültig?', a: 'Nein. Es ist eine erste Schätzung auf Basis Ihrer Auswahl. Nach Dateiprüfung werden Umfang und Endpreis zur Freigabe vorgelegt.' },
    { q: 'Muss ich beim Absenden bezahlen?', a: 'Nein. Mit dem Absenden stellen Sie eine Angebotsanfrage; Ihre Karte wird nicht belastet und es wird keine Rechnung erstellt.' },
    { q: 'Sind meine Dateien öffentlich?', a: 'Nein. Uploads, Vorschauen und Master liegen in privatem Speicher und sind durch Zugriffsregeln geschützt.' },
    { q: 'Wie funktionieren Revisionen?', a: 'Sobald die Vorschau bereit ist, können Sie im Kundenportal Korrekturpunkte direkt auf dem Motiv markieren oder die Arbeit freigeben.' },
  ],
};

export function normalizeMarketingLocale(locale: string): MarketingLocale {
  return locale === 'tr' || locale === 'de' ? locale : 'en';
}

export function localizedPath(locale: MarketingLocale, path: string): string {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return locale === 'en' ? safePath : `/${locale}${safePath}`;
}

export function getService(slug: string): MarketingService | undefined {
  return services.find((service) => service.slug === slug);
}

export function getCaseStudy(slug: string): MarketingCaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getGuide(slug: string): MarketingGuide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
