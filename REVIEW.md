# Artlantix incelemesi — 7 Eylül 2026

## Genel değerlendirme

Ana sayfa → fiyat hesaplama → müşteri sipariş ekranı → operatör kuyruğu → teslim arşivi mantıklı bir ürün akışı oluşturuyor. Fiyat hesaplamasının ayrı bir modülde olması, üç dil için mesaj dosyaları ve sipariş durumlarının tanımlanmış olması iyi temeller.

Ancak mevcut ürün çalışan bir demo/prototip. Supabase anahtarlarını eklemek tek başına gerçek satışa hazır hale getirmiyor. Ödeme, depolama, yönetim ve profil servisleri farklı düzeylerde tamamlanmış; bazı başarı mesajlarının arkasında yalnızca tarayıcı belleği değişiyor.

## Bu incelemede yapılan düzeltmeler

- `/login`, `/signup` ve `/auth` yolları dil yönlendirmesinden çıkarıldı. Bu sayfaların `/tr/login` gibi bulunmayan adreslere gitmesi engellendi.
- Türkçe/Almanca teklif tamamlanınca bulunmayan dil önekli sipariş adresi yerine mevcut `/dashboard/orders/[id]` adresine gidiliyor.
- Çıkıştan sonra varsayılan demo müşterisinin yeniden otomatik açılması düzeltildi.
- Gerçek oturum bulunmadığında veya kontrol hata verdiğinde kayıtlı demo hesabına dönülmesi engellendi. Gerçek servis bağlıyken demo hesap seçicileri gizlendi ve demo değiştirme fonksiyonu engellendi.
- Yönetici yetkisi kullanıcı tarafından düzenlenebilir auth metadata alanından okunmuyor.
- E-posta doğrulaması bekleyen kayıtta kullanıcı yanlışlıkla panele gönderilmiyor; doğrulama mesajı gösteriliyor.
- Müşteri/admin sayfalarına arayüz erişim kontrolü eklendi. Bu bir kullanıcı deneyimi kontrolüdür; sunucu/RLS güvenliğinin yerine geçmez.
- Demo sipariş detayı mevcut kullanıcıya göre kontrol ediliyor; kullanıcı kimliği olmadan liste istenince bütün demo siparişleri dönmüyor.
- Gerçek sipariş oluşturma hatası sessizce yerel bir başarı kaydına çevrilmiyor; gerçek sipariş durumu güncellemesi artık yerel demo kaydı aramadan veritabanına gidiyor.
- Sipariş kimlikleri UUID oldu; 9.000 olasılıklı eski rastgele kimliklerin çakışma riski kaldırıldı ve veritabanının UUID tipiyle uyum sağlandı.
- Teklif formuna görünür hata mesajları, dosyasız gönderim kontrolü, aynı anda çift gönderim kilidi ve geçersiz `tier` parametresi kontrolü eklendi. Manuel teklif seçimi doğru başlangıç durumuna kaydediliyor.
- Dosya okuma hatası ve iptalinde sonsuza kadar bekleyen yükleme düzeltildi. Boş, desteklenmeyen veya 2 MB üzerindeki dosyalar reddediliyor. Eski 25 MB/HEIC vaadi mevcut tarayıcı depolamasıyla karşılanamadığı için üç dilde açıklama düzeltildi. Toplam tarayıcı kotası yine dolabilir; artık kayıt başarısızlığı açıklanıyor.
- SVG portföy içeriği doğrudan HTML olarak eklenmek yerine görsel olarak gösteriliyor; yüklenen SVG'nin sayfanın DOM'unda çalışması engellendi. Portföy görsellerine boyut, tembel yükleme ve asenkron çözme eklendi.
- Dil seçimi göstergesi, dil tercihinin hatırlanması ve sorgu parametrelerinin korunması düzeltildi.
- Olmayan `#b2b` bağlantısı gerçek B2B sayfasına bağlandı. Sipariş detayı açıldığında siparişler sekmesi aktif kalıyor.
- Önce/sonra kaydırıcısına klavye ve ekran okuyucu desteği eklendi.
- Ekspres ücret kırılımı toplam fiyatla aynı hesaplamayı kullanıyor; sıfır özel fiyat yanlışlıkla varsayılana dönmüyor.
- Şifre sıfırlama düğmesinin e-posta göndermeden “gönderildi” demesi kaldırıldı. Gerçek şifre kurtarma hâlâ yapılmalı.

## Veritabanı güvenlik düzeltmesi

`supabase/migrations/20260907_access_hardening.sql`, mevcut `schema.sql` sonrasında uygulanmak üzere hazırlandı. Canlı veritabanına uygulanmadı ve PostgreSQL üzerinde çalıştırılarak doğrulanmadı.

Bu dosya kayıt metadata'sından yönetici olmayı, profil güncellemesinden rol/kimlik değiştirmeyi, başka kullanıcının siparişine mesaj/dosya eklemeyi, müşterinin master dosya kaydı oluşturmasını ve sipariş güncellemesinde fiyat/sahiplik değiştirmesini sınırlar. Müşteri onay/revizyon geçişini önizleme durumuyla sınırlar. Mevcut veritabanındaki yönetici hesapları ayrıca gözden geçirilmelidir; düzeltme geçmişte verilmiş yetkileri kaldırmaz.

Bu tam bir ödeme yetkilendirmesi değildir: müşteri tarafından ilk sipariş oluşturulurken gönderilen fiyat ve durum hâlâ sunucuda hesaplanmalı/doğrulanmalıdır. SQL dosyasını uygulamak tek başına sistemi üretime hazır yapmaz.

## Öncelikli kalan işler

| Öncelik | Bulgu / kanıt | Önerilen sonuç |
| --- | --- | --- |
| P0 | `lib/services/payments.ts`: tüm ödeme seçenekleri simülasyon; gerçek tahsilat yapılmadan `paid` dönebiliyor. Fiyat tarayıcıda hesaplanıp gönderiliyor. | Sunucuda fiyat hesaplama, gerçek ödeme oturumu, doğrulanmış webhook, kalıcı ödeme durumu ve tekrar isteklerinde tek sipariş/tek tahsilat garantisi. |
| P0 | `lib/services/storage.ts`: AI/PDF/PNG indirme bazı durumlarda gerçek dosya yerine metin üretiyor; ZIP düğmesi `.txt` manifest indiriyor. Teklif dosyaları base64 olarak yerel depoya veya metin alanına gidiyor. | Gerçek özel dosya depolaması, önizleme/final dosyaların ayrı tutulması, ödeme ve sahiplik kontrolüyle süreli indirme; gerçek ZIP paketi. |
| P0 | `supabase/schema.sql`: önizleme kovası herkese açık. Sipariş INSERT politikası fiyat/durum doğrulamıyor. CMS tabloları ve portföy kovası bu şemada yok. | Müşteri görsellerini özel tutma, sunucu sipariş işlemi, CMS şeması ve eksiksiz RLS entegrasyon testleri. |
| P1 | Auth servisinde `/auth/callback` hedefi var ama bu route yok. Şifre kurtarma tamamlanmamış. | OAuth kod değişimi, oturum yenileme ve uçtan uca e-posta doğrulama/kurtarma akışı. |
| P1 | Profil sayfası `setCurrentUserMock` ile kaydediyor; CMS ve mesaj/dosya servislerinde bazı hatalar hâlâ yutuluyor. Sipariş ve ek dosya kaydı tek işlem değil. | Gerçek profil kaydı, demo ve gerçek veri katmanlarının açık ayrımı, tutarlı hata durumları ve atomik sipariş oluşturma. |
| P1 | B2B kuyruğu sadece başarı mesajı gösteriyor; dosya adları tutuluyor. SLA ve Net-30 durumu sabit gösteriliyor. | Gerçek toplu yükleme, dosya başına teklif, işlem kuyruğu, şirket onayı ve ölçülmüş SLA. |
| P1 | Türkçe/Almanca sayfalarda birçok metin İngilizce; panel İngilizce. Kök HTML dili sabit `en`. | Tüm metinleri mesaj dosyalarına taşıma, sayfa diline uygun HTML lang ve metadata, panelde dil değiştirme. |
| P2 | `getOrders` bütün dosyaları ve mesajları liste ekranları için de çekiyor; tüm sonuçlar tek seferde alınıyor. | Özet alanlar + sayfalama; dosyaları/mesajları sadece detay ekranında yükleme. |
| P2 | Ana sayfa geniş bir client component; içerik yüklemesi tarayıcı effect'lerine bağlı. | Statik pazarlama bölümlerini sunucuda oluşturma, etkileşimli parçaları ayırma, CMS içeriklerinin kontrollü önbelleği. |
| P2 | Görsellerde henüz gerçek boyutlandırılmış küçük resim/CDN akışı yok. | Yüklemede küçük resim üretimi, uygun boyutlar ve WebP/AVIF varyantları; ardından gerçek LCP/INP ölçümü. |

## Ürün için öneriler

1. **Önce güvenilir sipariş çekirdeği:** Gerçek ödeme, dosya saklama, müşteri sahipliği ve operatör teslim akışı. Kullanıcı bir siparişi başka cihazdan açtığında aynı dosyaları ve durumu görmeli.
2. **Teklif taslağını kaydetme:** Kullanıcı sayfayı kapatıp geri geldiğinde çizim seçenekleri ve dosyası kaybolmasın. Girişe yönlendirilirken teklif korunsun.
3. **Ölçülebilir üretim takibi:** Tahmini teslim tarihi, atanmış çizer, durum geçmişi ve gecikme bildirimi. Sabit yüzde göstergesi yerine gerçek veriden hesaplama.
4. **Görsel üstüne revizyon notu:** Dosyanın sürümünü ve işaretlenen konumu notla bağlamak, “şurayı değiştir” mesajlarını anlaşılır yapar.
5. **B2B tekrar sipariş:** Önceki işten üretim ayarlarını kopyalama, toplu yükleme, şirket üyeleri ve satın alma referansı.
6. **Gerçek örneklerle güven:** Aynı örnek SVG yerine gerçek önce/sonra işleri; teslim edilen format ve izin verilen kullanım konusunda doğrulanabilir açıklamalar.

## Doğrulama ve sınırlar

- Üretim derlemesi ve TypeScript kontrolü geçti.
- `tests/regressions.mjs`: çıkış, gerçek oturumun demo admin'e düşmemesi, fiyat seçeneklerinin tutarlılığı, dosya doğrulama ve okuma hatası için 5 test.
- Tarayıcıda `/login` açılması, müşteriyle `/admin/orders` ziyaretinin `/dashboard` yönlendirmesi ve Türkçe teklif sayfasının geçersiz tier ile açılması kontrol edildi.
- Lint: hata yok; native `<img>` için 4 performans uyarısı var. SVG'yi görsel olarak yalıtma bilinçli; otomatik görsel optimizasyonu ayrıca ele alınmalı.
- Gerçek Supabase hesabı, ödeme sağlayıcısı ve canlı dosya altyapısıyla uçtan uca test yapılmadı. Veritabanı migration'ı uygulanmadı.
- Lighthouse veya gerçek kullanıcı ölçümü yapılmadı; sayısal hız artışı iddia edilmiyor. Tam mobil/erişilebilirlik denetimi yapılmadı.
- Bu rapor inceleme düzeltmeleriyle birlikte sürümlenir; commit ve uzak depo durumunun kaynağı Git geçmişidir.
