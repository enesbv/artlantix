# Artlantix 0.5.0 Sürüm Notları

Tarih: 18 Eylül 2026

## Sabit fiyatı olmayan işler

- Ana sayfa, karşılaştırma ana sayfası, fiyatlandırma ve işletme fiyatlandırmasına dördüncü seçenek olarak **İletişime geçin** eklendi.
- Çok karmaşık görseller, özel üretim ihtiyaçları ve işletme projeleri bu seçenekle dosya incelemesine yönlendiriliyor.
- Teklif ekranındaki detay seviyesi seçiminde de tüm kullanıcıların seçebileceği aynı seçenek sunuluyor.
- Bu akışta otomatik vektör fiyatı ve sabit teslim süresi gösterilmiyor; stüdyo incelemesinden sonra fiyat ve teslim planı onaya sunuluyor.
- Seçim `review=1` işaretiyle teklif akışına taşınıyor ve sipariş notlarında operatör incelemesi gerektiği belirtiliyor.

## Doğrulama

- ESLint.
- Production build ve TypeScript kontrolü.
- Tüm fiyatlandırma rotalarında iletişim seçeneği ve teklif akışı HTTP doğrulaması.
