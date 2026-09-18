# Artlantix 0.6.1 Sürüm Notları

Tarih: 18 Eylül 2026

## 1. Ana Sayfa Akışı ve Bölüm Sıralaması Optimizasyonu

- **İşlerimiz Vitrini (`#work`) Hero'nun Hemen Altına Taşındı:**
  - *"Sorunu, yaklaşımı ve üretim sonucunu birlikte gösteriyoruz."* başlığı, interaktif Öncesi/Sonrası karşılaştırma kaydırıcısı ve örnek vaka kartları doğrudan karşılama (Hero) bölümünün altına yerleştirildi.
  - Ziyaretçiler sayfaya giriş yaptıkları anda stüdyonun el çizimi vektör kalitesini canlı olarak test edebiliyor.
- **Üretim Disiplini Bölümü Konumlandırılması:**
  - *"Söz değil, görülebilir üretim disiplini."* başlığı altındaki 4 kart (*Manuel yeniden çizim, Özel dosya alanı, Tarama karantinası, Onaydan sonra üretim*) stüdyonun çalışma süreci (`#process`) sonrasına ve fiyatlandırma (`#pricing`) öncesine taşınarak mantıksal güvenilirlik akışı pekiştirildi.

## 2. Öncesi / Sonrası Karşılaştırma Kaydırıcısı Sadeleştirmesi

- `BeforeAfterSlider.tsx` bileşeninden görsel üzerinde dolaşan dairesel büyüteç lensi (`loupe`), 2x/4x/8x yakınlaştırma düğmeleri ve büyüteç durum banner'ı kaldırıldı.
- Arayüz dikkat dağıtmayan, akıcı ve saf bir **çift yönlü bölünmüş ekran (split slider)** deneyimine kavuşturuldu.
- `Artwork View` (orijinal renkli çizim) ve `Vector Nodes` (iskelet eğrileri ve düğüm noktaları) görünümleri optimize edildi.
- Gereksiz fare takip dinleyicileri kaldırılarak render ve kaydırma performansı artırıldı.

## 3. Sayfa ve Panel Entegrasyonları

- **Demonstrasyon Sayfası (`/work`):**
  - Sayfa tepesine *"Etkileşimli Karşılaştırma & Vektör Düğüm Analizi"* konsolu yerleştirildi.
- **Müşteri Sipariş Detay Ekranı (`/dashboard/orders/[id]`):**
  - Çizim inceleme alanında *"↔️ Karşılaştırma Kaydırıcısı (Slider)"* ile *"Yan Yana Görünüm"* arasında tek tıkla geçiş yapabilen sekme eklendi.

## 4. Test ve Kalite Güvencesi

- **18/18 Regresyon Testi:** Tüm testler başarıyla geçti (`tests/regressions.mjs`, `infra/malware-scanner/scanner.test.mjs`).
- **ESLint:** 0 hata, 0 uyarı ile temiz kod standartları doğrulandı.
