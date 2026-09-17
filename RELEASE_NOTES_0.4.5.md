# Artlantix 0.4.5 Sürüm Notları

Tarih: 18 Eylül 2026

## Teklif ekranı

- Dosya yükleme sonrası seçenek ekranı sadeleştirildi: görsel sınıflandırması, AI aracı, istenen teslim tarihi, yazı tipi yenileme, hasar onarımı ve renk ayrımı seçenekleri kaldırıldı.
- Kaldırılan ek ücretler eski taslaklardan yeni tekliflere taşınmıyor.
- Bölüm başlıkları, açıklama boyutları, kart köşeleri ve boşluklar tutarlı hale getirildi. Bölüm kutuları beyaz; yalnızca seçilen kartların zemini ve çerçevesi yeşil.
- Tıklamada oluşan çift çerçeve kaldırıldı; klavye odağı kart içinde gösteriliyor.
- Üretim hızı daha belirgin Standart/Ekspres kartlarıyla sunuluyor ve ek hizmetlerin üzerinde yer alıyor.
- Masaüstünde inceleme ve siparişe devam düğmesi sağdaki fiyat özetine taşındı; mobil sabit işlem çubuğu korunuyor.
- Fiyat özetindeki eksik detay seviyesi çeviri anahtarı düzeltildi.
- Teslimata dahil formatlar küçük PNG, PDF, SVG, EPS ve AI görselleriyle gösteriliyor.

## Opsiyonel ajans hizmetleri

- Marka kimliği, alternatif logo tasarımı ve sosyal medya tasarım seti çoklu seçim olarak eklendi.
- Her ek hizmet 50 USD; seçilen hizmetler toplam tahmine ayrı kalemler olarak ekleniyor.
- Her hizmetin stüdyo onayından sonra ayrı 3–5 iş günü teslim tahmini bulunuyor. Vektör hizmetinin ekspres çarpanı ve teslim süresi bu hizmetleri etkilemiyor.
- Seçimler taslakta saklanıyor, fiyat özetinde gösteriliyor ve sipariş notlarına aktarılıyor. Tekrar sipariş ve veritabanı kaydı için yapılandırılmış hizmet alanı eklendi.
- Türkçe, İngilizce ve Almanca metinler güncellendi.

## Veritabanı geçişi

`supabase/migrations/20260917_agency_services.sql` mevcut projeler için hazırlandı. İzin verilen hizmetleri doğrular, tekrarları tekilleştirir, hizmet başına 50 USD bedeli vektör ekspres hesabından sonra ekler ve sipariş oluşturma RPC'sinde seçimleri kaydeder.

**Migration bu oturumda canlı veritabanına uygulanmadı.** Canlı kullanım öncesinde uygulanmalı ve doğrulanmalıdır. Eski veritabanı tetikleyicisi yalnızca vektör hizmetini fiyatlandırır; arayüzdeki birleşik tahmin tek başına canlı sipariş fiyatının güncellendiği anlamına gelmez. Ayrı teslim süreleri şu anda hizmet bazında tahmin ve sipariş notu olarak tutulur; ayrı üretim takvimi entegrasyonu değildir.

## Doğrulama

- ESLint ve production build/TypeScript.
- 16 otomatik test; ajans fiyatları, tekrar seçimleri ve ekspres ayrımı dahil.
- `git diff --check`.
- Canlı veritabanı migration ve RLS testleri bu sürüm hazırlığında çalıştırılmadı.
