# Artlantix

## Türkçe

Artlantix, düşük kaliteli görselleri ve yapay zekâ ile oluşturulmuş taslakları üretimde kullanılabilir temiz vektör dosyalarına dönüştüren bir çizim stüdyosudur.

Müşteri dosyasını yükler, hangi amaçla kullanacağını belirtir ve teklif ister. Stüdyo dosyayı inceler, çizimi yeniden kurar, önizleme paylaşır ve onaydan sonra teslim dosyalarını müşterinin özel arşivine koyar.

### Neler yapılabilir?

- AI logo ve bulanık logo vektörleştirme
- Yazı ve logotip rekonstrüksiyonu
- Maskot ve rozet çizimi
- Serigrafi ve DTF renk ayrımı
- CNC, lazer ve folyo kesim için kapalı çizgiler
- Nakışa uygun sadeleştirilmiş vektör hazırlığı
- Teklif alma, sipariş takibi, revizyon işaretleme ve dosya arşivi

### Nasıl çalışır?

1. Görsel dosyanı yükle.
2. Kullanım amacını ve ihtiyaçlarını belirt.
3. Tahmini fiyatı gör ve teklif gönder.
4. Stüdyo incelemesini bekle.
5. Önizlemeyi onayla veya revizyon iste.
6. Son dosyaları özel arşivinden indir.

### Projenin mevcut durumu

Artlantix 0.4; çok dilli tanıtım sayfaları, hizmet detayları, örnek çalışma sayfaları, fiyatlandırma, rehberler, SSS ve daha kapsamlı teklif formu içeren çalışan bir sürümdür.

Örnek çalışmalar gerçek müşteri işi olarak değil, stüdyonun çalışma yöntemini anlatan demonstrasyonlar olarak gösterilir. Gerçek müşteri çalışmaları yalnızca yayın izni alındığında eklenir.

Dosya yüklemeleri, kullanıcı hesapları, siparişler, revizyonlar ve teslim dosyaları yetkilendirme kurallarıyla korunacak şekilde tasarlanmıştır. Mevcut model teklif odaklıdır; teklif gönderirken otomatik ödeme alınmaz.

### Sitemap

Sitenin arama motorlarına açık sayfalarını görmek için [sitemap.xml](http://localhost:3000/sitemap.xml) adresini açabilirsin. Canlı ortamda bu adres, sitenin alan adıyla birlikte `/sitemap.xml` şeklinde kullanılır.

### Yönetici paneline giriş

1. [Giriş sayfasını](http://localhost:3000/login) aç.
2. Yönetici hesabınla giriş yap.
3. Başarılı girişten sonra yönetici sipariş paneline yönlendirilirsin.

Yönetici panelinin doğrudan adresi: `/admin/orders`. İçerik yönetimi için `/admin/content` adresini kullanabilirsin. Normal müşteri hesapları bu bölümlere erişemez.

Yerel demo açıkken giriş sayfasındaki **Demo Operator** düğmesiyle yönetici görünümünü açabilirsin. Gerçek Supabase ortamında ise hesabın yönetici yetkisine sahip olmalıdır; bu yetki yalnızca sunucu/veritabanı tarafından verilmelidir.

### Kısa sözlük

- **Raster:** JPG, PNG veya PDF gibi piksel tabanlı görsel.
- **Vektör:** Kalite kaybetmeden büyütülebilen eğri ve çizgilerden oluşan dosya.
- **Master dosya:** Baskı, web, tabela veya üretim için kullanılacak ana teslim dosyası.
- **Revizyon:** Önizleme üzerinde düzeltilmesi istenen değişiklik.
