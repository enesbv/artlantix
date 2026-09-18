# Artlantix 0.6.0 Sürüm Notları

Tarih: 18 Eylül 2026

## 1. Büyüteçli Derin Yakınlaştırma (Precision Studio Loupe)

- `BeforeAfterSlider.tsx` bileşenine interaktif stüdyo büyüteci entegre edildi.
- 2x, 4x ve 8x büyütme çarpanları arasında anında geçiş desteği eklendi.
- Fare ve dokunmatik ekran imleç hareketini milimetrik takip eden optik lens, merkez artı işareti (crosshair) ve koordinat göstergeleri oluşturuldu.
- İmlecin bulunduğu konuma göre dinamik olarak raster gürültüsü (`RASTER NOISE`) veya sıfır kayıplı bezier eğrilerini (`ZERO-LOSS BEZIER`) algılayıp bildiren HUD eklendi.

## 2. Dinamik Teslimat Zaman Çizelgesi (Live Delivery Timeline)

- Stüdyo mesai saatlerini (Hafta içi 09:00–19:00, Cumartesi 10:00–16:00, Pazar kapalı) dikkate alan `delivery-calculator.ts` motoru yazıldı.
- 16 saatlik Express ve 48 saatlik Standart hız seçenekleri için net teslimat tarihi ve kalan süre projeksiyonu oluşturuldu.
- Dört aşamalı görsel ilerleme takibi:
  1. Kabul & Geometri İncelemesi
  2. Manuel Çizim (Senior Vector Artist)
  3. Önizleme Onayı & Kalite Kontrol
  4. Master Paket & Arşiv Teslimi
- Teklif sayfasında teslimat kartları altına ve sipariş detay ekranına entegre edildi.

## 3. Vektör Katman ve Renk İnceleyici (Color & Layer Inspector)

- Sipariş detay sayfasındaki vektör önizlemesi için `VectorInspector.tsx` aracı geliştirildi.
- **3 Katman Görünüm Modu**:
  - `Full Color`: Orijinal nihai vektörel çizim.
  - `Wireframe / Nodes`: Bezier eğrileri, çizgi iskeleti ve düğüm noktaları vurgusu.
  - `Cut Silhouette`: Lazer kesim, serigrafi ve folyo kesici için monokrom siluet modu.
- **3 Arka Plan Modu**: Açık, Koyu ve Şeffaf Izgara (Checkerboard).
- **Renk Paleti**: Çizim renklerini listeleme ve HEX/RGB/CMYK değerlerini tek tıkla panoya kopyalama özelliği eklendi.

## 4. Sipariş Bazlı Canlı Mesajlaşma (Order Chat Hub)

- `OrderChatHub.tsx` ile müşteri ve stüdyo operatörü (Elena Vance) arasında siparişe özel canlı mesajlaşma hub'ı kuruldu.
- Rol rozetleri, hazır hızlı yanıt şablon çipleri, 2.000 karakterlik güvenlik sayacı ve boş mesaj engeli eklendi.
- Supabase Realtime websocket kanalı ve 5 saniyelik otomatik polling yedek mekanizması sağlandı.
- Müşteri sipariş detayında ve admin sipariş masasında tek tıkla açılan sohbet modalı bağlandı.

## 5. Modern ve Minimalist Admin Paneli (SaaS Dashboard)

- Admin paneli, modern SaaS arayüz standartlarına uygun olarak baştan aşağı yenilendi:
  - **Sol Kenar Menüsü (`AdminSidebar`)**: Yuvarlatılmış hap (pill) seçimleri, stüdyo mesai durumu ve operatör profil rozeti.
  - **Üst Karşılama Çubuğu (`AdminHeader`)**: *"İyi Çalışmalar Elena!"* karşılama başlığı, canlı arama çubuğu ve bildirim zili.
  - **3 Büyük KPI Kartı**: Aktif Üretim Havuzu, İnceleme & Teklif Bekleyenler, Zamanında Teslimat Oranı (trend rozetleri ve SVG sparkline dalga grafikleriyle).
  - **3 Kolonlu Dashboard Alanı**:
    - Dairesel Üretim Dağılımı (Ring / Donut Chart)
    - Üretim Pipeline Funnel Akışı
    - Son müşteri talepleri ve mesajlarını gösteren Canlı Notice Board
  - **Ferah Sipariş Masası**: `max-w-7xl` kısıtı kaldırılarak ekranın tamamını dolduran (`w-full px-6 sm:px-8`), göz yormayan, sadeleştirilmiş tablo düzenine geçildi.

## 6. Geliştirici ve Demo Deneyimi

- Üst menüye (Navbar) ve giriş sayfasına tek tıkla Müşteri (`Alex Morgan`) / Operatör (`Elena Vance`) rol geçişi sağlayan butonlar eklendi.
- Yerel geliştirme için `.env.local` demo desteği optimize edildi.

## 7. Doğrulama

- 18 birim ve regresyon testi (`node --test tests/regressions.mjs infra/malware-scanner/scanner.test.mjs`).
- ESLint: 0 hata, 0 uyarı.
- Next.js Turbopack derlemesi: 82 rota hatasız derlendi.
