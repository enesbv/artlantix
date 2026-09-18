# Artlantix 0.7.0 Sürüm Notları

Tarih: 18 Eylül 2026

Bu sürüm, Artlantix ana sayfasını ve müşteri deneyimini daha sade, anlaşılır ve üretim odaklı bir akışa taşıyan kapsamlı bir görsel ve ürün düzenlemesidir.

## Ana sayfa ve görsel dil

- Pikselden vektöre hero alanına mouse ile etkileşen, çizgi ve Bézier eğrileri temalı SVG animasyon eklendi.
- Hero alanı daha minimal bir arka plan ve daha net bir içerik hiyerarşisiyle yeniden düzenlendi.
- Ana sayfadaki büyük karşılaştırma/slider alanı kaldırılarak içerik yoğunluğu azaltıldı.
- Çalışma örneği kartları sadeleştirildi; “Piksel referans” etiketleri kaldırıldı ve görsel köşeleri tutarlı hale getirildi.
- Ana sayfa navigasyonu içerik akışına göre sıralandı: Örnekler, Kabiliyetler, Süreç, Fiyatlar, Rehberler, SSS ve İşletmeler.
- Gereksiz tanıtım, kanıt ve tekrar eden açıklama alanları ana sayfadan çıkarıldı.

## Müşteri ve admin akışı

- Müşteri portalı sipariş takip mantığına göre sadeleştirildi.
- Sipariş aşamaları daha anlaşılır adımlara ayrıldı ve müşteri görünümü basitleştirildi.
- Demo girişinde `artlantix@admin.com` admin paneline, `artlantix@customer.com` müşteri paneline yönlenir.
- Admin panelindeki Artlantix logosu normal ana sayfaya döner.
- Üst bardaki gereksiz müşteri/operatör rol seçicileri kaldırıldı.

## İçerik ve fiyatlandırma

- FAQ alanı ana sayfadan ayrılarak ayrı FAQ sayfasında tutuldu.
- Fiyat kartları daha sade bir düzene taşındı ve gereksiz ikonlar kaldırıldı.
- Süreç alanı dört net adımlı, daha okunabilir kart yapısına dönüştürüldü.
- Karşılaştırma bileşenindeki yardımcı metinler ve gereksiz başlık katmanları temizlendi.

## Doğrulama

- ESLint kontrolü başarılı.
- Üretim build kontrolü başarılı.

## Commit özeti (17–18 Eylül 2026)

Bu bölüm yalnızca dünkü ve bugünkü commitleri içerir. 17 Eylül için kayıtlı commit bulunmamaktadır.

- `f8c9a7b` — 0.7.0 release; ana sayfa, müşteri akışı ve görsel sadeleştirmeler bir araya getirildi.
- `ab20ac5` — Arma görseli eklemesini geri aldı.
- `fb0f8fe` — Hero alanının sağına yeşil arma görselini ekledi.
- `b5c2cd2` — Minimal Bézier animasyonunu hero alanının tamamına yaydı.
- `0e70d3d` — Mouse etkileşimli SVG hero artwork ekledi.
- `95455a5` — Ana menü sırasını sayfanın yukarıdan aşağı akışına göre düzenledi.
- `edf7189` — Hizmetler anchor konumunu sticky header ile uyumlu hale getirdi.
- `baef452` — Karşılaştırma showcase tasarımını iyileştirdi.
- `89b4a11` — Ana sayfa çalışma alanı başlığını sadeleştirdi.
- `ddc8f41` — Ana sayfa fiyat kartlarındaki ikonları kaldırdı.
- `2606dda` — Fiyat kartlarını yeniledi ve tekrar eden etiketleri kaldırdı.
- `4d59cd1` — 0.6.6 release; ana sayfa ve auth iyileştirmelerini yayınladı.
- `639ec27` — FAQ alanını ana sayfadan ayırdı.
- `ae41b8f` — FAQ sayfası düzenini iyileştirdi.
- `5820215` — Üretim kanıtı bölümünü ana sayfadan kaldırdı.
- `03c9eb7` — Ana sayfa süreç kartlarını yeniledi.
- `414814e` — Demo girişini hesap e-postasına göre yönlendirdi.
- `a91908d` — Admin logosunu ana sayfaya bağladı.
- `bf3e6e4` — Karşılaştırma etiketlerini sadeleştirdi.
- `6375ccb` — Karşılaştırma yardımcı metinlerini kaldırdı.
- `1b91d65` — Artwork karşılaştırma başlığını sadeleştirdi.
- `5027977` — “Temiz eğriler” görsel etiketini kaldırdı.
- `59e708c` — 0.6.5 release; müşteri takip ve operatör çalışma alanını sadeleştirdi.
- `4781731` — 0.6.1 release; ana sayfa akışını ve split slider’ı optimize etti.
- `5055bab` — Büyüteç alanını kaldırıp çalışma showcase’ini proof bölümüne taşıdı.
- `5b2aa20` — Hassasiyet büyüteci ve karşılaştırma slider’ını ekledi.
- `ea46612` — 0.6.0 release; admin redesign ve interaktif vektör araçlarını yayınladı.
- `48ad38d` — Studio büyüteci, teslimat zaman çizelgesi, vektör inspector ve sipariş sohbetini ekledi.
- `4349405` — 0.5.0 release; özel teklif seçeneğini ekledi.
- `74db990` — 0.4.5 release; teklif arayüzü ve ajans hizmetlerini yayınladı.
