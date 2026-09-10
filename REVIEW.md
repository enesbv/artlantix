# Artlantix incelemesi — 10 Eylül 2026

## Genel değerlendirme

Ana sayfa → fiyat hesaplama → müşteri sipariş ekranı → operatör kuyruğu → teslim arşivi mantıklı bir ürün akışı oluşturuyor. Fiyat hesaplamasının ayrı bir modülde olması, üç dil için mesaj dosyaları ve sipariş durumlarının tanımlanmış olması iyi temeller.

Ancak mevcut ürün çalışan bir demo/prototip. Supabase anahtarlarını eklemek tek başına gerçek satışa hazır hale getirmiyor. Ödeme, depolama, yönetim ve profil servisleri farklı düzeylerde tamamlanmış; bazı başarı mesajlarının arkasında yalnızca tarayıcı belleği değişiyor.

## Bu incelemede yapılan düzeltmeler

- Production öncesi güvenlik denetiminde OAuth open redirect, kullanıcı keşfi ve ham servis hata sızıntıları kapatıldı; parola alt sınırı 12 karaktere çıkarıldı.
- RLS/trigger katmanında profil rol yükseltme, sipariş sahipliği/fiyat/durum mass assignment, çapraz kiracı kopyalama, mesaj ve dosya sahipliği sertleştirildi.
- Dosyalarda uzantı, MIME, magic-byte, boyut ve güvenli rastgele depolama yolu doğrulaması eklendi; public portföy SVG yüklemesi kaldırıldı ve imzalı URL üretimi başarısızken sistem kapalı kalıyor.
- CSP, HSTS, clickjacking, MIME sniffing, referrer, permissions ve hassas sayfalarda no-store başlıkları eklendi; framework sürüm başlığı kapatıldı.
- Tek paket yöneticisi pnpm olarak sabitlendi, ikinci kilit dosyası kaldırıldı. Ayrıntılı bulgular `SECURITY_AUDIT.md` içindedir.

- Turuncu marka vurguları erişilebilir koyu yeşil, hover, açık yüzey ve kenarlık tonlarından oluşan tutarlı bir palete taşındı; bekleme/uyarı anlamındaki amber renkler semantik amaçla korundu.
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
- Supabase OAuth dönüş adresi, şifre sıfırlama isteği ve veritabanına profil kaydı tamamlandı; canlı proje üzerinde doğrulama hâlâ gerekli.
- Teklif seçeneklerini anlatan görsel karmaşıklık kartları ve “çizer değerlendirsin” akışı eklendi. Bu seçim ödeme almadan manuel inceleme kaydı açıyor.
- Teklif taslağı tarayıcıya otomatik kaydediliyor; önceki sipariş ayarları yeni teklife kopyalanabiliyor.
- Tahmini teslim tarihi, sonraki adım açıklaması, durum geçmişi ve dakikada bir yenilenen portal bildirimleri eklendi. Sabit SLA yüzdesi gerçek tamamlanma verisinden hesaplanıyor.
- Önizleme üzerinde yüzde tabanlı revizyon işaretleri ve her işaret için not ekleme eklendi.
- Müşteri onayı artık işi doğrudan tamamlamıyor; `approved` durumunda master hazırlanmasını bekliyor. İndirmeler yalnızca operatör teslimi tamamladığında açılıyor.
- Liste sorguları ayrıntı dosyalarını/mesajlarını gereksiz yere çekmiyor; sipariş listesine sayfalama ve mobil kart görünümü eklendi.
- Görseller `next/image` ile boyutlandırıldı; önceki dört lint uyarısı giderildi.
- Demo ödeme, B2B parti kaydı ve sözde ZIP çıktısı gerçekte yapmadıkları işlemleri açıkça belirtiyor. Demo portföyü doğrulanmış müşteri işi olarak sunulmuyor.
- Supabase modunda müşteri, önizleme ve master dosyaları kullanıcı/sipariş klasörüne yükleniyor; önizleme kovası özel hale getirildi ve indirmeler süreli bağlantı kullanıyor.
- CMS tabloları, portföy kovası ve yönetici politikaları şemaya eklendi. Gerçek servis yazma hataları artık yerel başarıya çevrilmiyor.
- Türkçe/Almanca teklif, menü, alt bilgi, panel kabuğu ve sipariş listesi tamamlandı; dil seçimi panelden çıkmadan uygulanıyor ve HTML dili tercihi izliyor.
- Teklif akışında fiyat kırılımı, teslim süresi, dosya gizliliği ve teslim formatları adımlar boyunca görünür hale getirildi; mobilde tek bir sabit fiyat/ilerleme eylemi kullanılıyor.
- Yönetici kuyruğuna inceleme, üretim, müşteri onayı, revizyon ve teslim riski kartları; mobil iş kartları; yükleme ve boş sonuç durumları eklendi.
- Müşteri sipariş detayındaki sonraki adım kartı ilgili önizleme, mesaj veya indirme bölümüne doğrudan götürüyor. Durum geçmişi görsel zaman çizgisine dönüştürüldü, mobil taşmalar azaltıldı ve işlem hataları görünür hale getirildi.
- İmzalı dosya bağlantısı üretilemediğinde sipariş detayının sonsuz yüklemede kalması önlendi. Liste ve detay sayfalarında içerik iskeletleri kullanılıyor.
- Revizyon işaretleyicide kullanılan/toplam işaret sayısı, son işareti geri alma, limite ulaşma açıklaması ve daha okunaklı giriş kontrolleri eklendi.
- Ana sayfadaki birincil eylemler, güven açıklamaları ve SSS metinleri daha okunaklı hale getirildi; SSS aç/kapat durumu ekran okuyuculara aktarıldı ve revizyon sonrası anında indirme vaadi gerçek teslim akışıyla düzeltildi.

## Veritabanı güvenlik düzeltmesi

`supabase/migrations/20260907_access_hardening.sql`, mevcut `schema.sql` sonrasında uygulanmak üzere hazırlandı. Canlı veritabanına uygulanmadı ve PostgreSQL üzerinde çalıştırılarak doğrulanmadı.

Bu dosya kayıt metadata'sından yönetici olmayı, profil güncellemesinden rol/kimlik değiştirmeyi, başka kullanıcının siparişine mesaj/dosya eklemeyi, müşterinin master dosya kaydı oluşturmasını ve sipariş güncellemesinde fiyat/sahiplik değiştirmesini sınırlar. Müşteri onay/revizyon geçişini önizleme durumuyla sınırlar. Mevcut veritabanındaki yönetici hesapları ayrıca gözden geçirilmelidir; düzeltme geçmişte verilmiş yetkileri kaldırmaz.

Migration uygulandığında ilk sipariş fiyatı veritabanında CMS taban fiyatları ve seçeneklerden yeniden hesaplanır; istemcinin gönderdiği fiyat/durum üzerine yazılır. Doğrulanmış ödeme webhook'u bulunmadığı için tüm gerçek servis siparişleri güvenli biçimde `quote_requested` başlar. Bu yine tam ödeme yetkilendirmesi değildir ve SQL dosyasını uygulamak tek başına sistemi üretime hazır yapmaz.

## Öncelikli kalan işler

| Öncelik | Bulgu / kanıt | Önerilen sonuç |
| --- | --- | --- |
| P0 | Ödeme seçenekleri hâlâ simülasyon. Migration fiyatı veritabanında yeniden hesaplayıp başlangıç durumunu kilitliyor ve ödeme doğrulanana kadar işi teklif kuyruğunda tutuyor; fakat gerçek tahsilat yok. | Gerçek ödeme oturumu, doğrulanmış webhook, kalıcı ödeme durumu ve idempotency. |
| P0 | Dosyalar özel depoya gidebiliyor fakat yükleme + sipariş + dosya satırı tek işlem değil; gerçek ZIP üretimi yok. | Atomik sunucu işlemi, başarısızlık temizliği, arşiv üretimi ve canlı RLS/depolama entegrasyon testi. |
| P0 | SQL şeması ve migration hazırlandı fakat canlı Supabase projesine uygulanmadı. | Migration'ı kontrollü ortamda uygulama; sahiplik, rol, OAuth ve dosya erişimi için entegrasyon testleri. |
| P1 | B2B bölümü yalnızca dürüstçe etiketlenmiş yerel parti taslağıdır. | Gerçek toplu yükleme, dosya başına teklif, işlem kuyruğu, şirket onayı ve faturalama. |
| P1 | Teklif/menü/alt bilgi/panel kabuğu/sipariş listesi çevrildi; sipariş detayı, hesap, B2B ve yönetici içeriklerinin bir bölümü İngilizce. | Kalan metinleri mesaj dosyalarına taşıma ve yerelleştirilmiş metadata. |
| P2 | Liste ayrıntı yükleri ayrıldı ve istemci sayfalaması eklendi; uzak sorgu yine tüm özet siparişleri tek seferde alıyor. | Veritabanı düzeyinde sayfalama, arama ve filtreleme. |
| P2 | Ana sayfa geniş bir client component; içerik yüklemesi tarayıcı effect'lerine bağlı. | Statik pazarlama bölümlerini sunucuda oluşturma, etkileşimli parçaları ayırma, CMS içeriklerinin kontrollü önbelleği. |
| P2 | Görsellerde henüz gerçek boyutlandırılmış küçük resim/CDN akışı yok. | Yüklemede küçük resim üretimi, uygun boyutlar ve WebP/AVIF varyantları; ardından gerçek LCP/INP ölçümü. |

## Ürün için öneriler

Önerilerin uygulanma durumu:

1. **Güvenilir sipariş çekirdeği — kısmi:** özel depolama, gerçek dosya yükleme, onay/teslim ayrımı ve hata görünürlüğü eklendi; gerçek ödeme ve atomik sunucu işlemi dış servis olmadan tamamlanamaz.
2. **Teklif taslağı — tamamlandı:** form seçenekleri ve küçük demo dosyası korunuyor; üretim depolamasında tarayıcı yenilenirse güvenlik nedeniyle dosya yeniden seçilebilir.
3. **Ölçülebilir üretim takibi — büyük ölçüde tamamlandı:** teslim tahmini, atanmış çizer, geçmiş, sonraki adım, gecikme/eylem bildirimi ve gerçek veriden SLA oranı var. Harici e-posta/SMS otomasyonu yok.
4. **Görsel üstüne revizyon notu — tamamlandı:** konum ve açıklama siparişle kaydediliyor; gerçek önizleme varsa onun üzerinde gösteriliyor.
5. **B2B tekrar sipariş — kısmi:** önceki ayarları kopyalama tamam; toplu bölüm artık yalnızca yerel taslak olduğunu söylüyor. Şirket üyeleri ve gerçek kuyruk yok.
6. **Gerçek örneklerle güven — güvenli sunum tamamlandı:** demo örnekleri açıkça yer tutucu olarak etiketlendi. Gerçek müşteri örnekleri ancak izinli içerik sağlandığında eklenebilir.
7. **Teklif ve sipariş arayüzü — tamamlandı:** sürekli fiyat özeti, mobil ilerleme eylemi, müşteri odaklı sonraki adımlar, görünür hata/yükleme durumları ve operatör öncelik kuyruğu eklendi.

## Doğrulama ve sınırlar

- Üretim derlemesi ve TypeScript kontrolü geçti.
- `tests/regressions.mjs`: kimlik, fiyat, dosya/MIME/imza doğrulama, güvenli OAuth yönlendirmesi, genel auth hataları, sanatçı değerlendirmesi, teslim tarihi ve dallanan durum geçmişi için 11 test geçti.
- Tarayıcıda Türkçe teklif adımları, çevrilmiş alt bilgi/menü, panelde yerinde dil değiştirme ve dar ekranda sipariş kartları kontrol edildi.
- Lint: hata ve uyarı yok. Üretim derlemesi ve TypeScript kontrolü geçti.
- Gerçek Supabase hesabı, ödeme sağlayıcısı ve canlı dosya altyapısıyla uçtan uca test yapılmadı. Veritabanı migration'ı uygulanmadı.
- Lighthouse veya gerçek kullanıcı ölçümü yapılmadı; sayısal hız artışı iddia edilmiyor. Tam mobil/erişilebilirlik denetimi yapılmadı.
- Bu rapor inceleme düzeltmeleriyle birlikte sürümlenir; commit ve uzak depo durumunun kaynağı Git geçmişidir.
