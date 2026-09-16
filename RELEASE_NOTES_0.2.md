# Artlantix 0.2.0 Sürüm Notları

Yayın tarihi: 16 Eylül 2026

Commit: `40b0aa2` — `release: Artlantix 0.2.0 production foundation`

## Genel bakış

Artlantix 0.2.0, projeyi tarayıcıda çalışan bir demodan gerçek servislerle çalışabilecek güvenli bir teklif ve üretim platformuna taşıyan altyapı sürümüdür. Bu sürümde Supabase bağlantısı, veritabanı yetkilendirmesi, özel dosya akışları, zararlı dosya tarama altyapısı, production güvenlik kontrolleri ve otomatik kalite kontrolleri ele alındı.

Site artık gerçek bir ödeme yapılmış gibi davranmıyor. İlk yayın modeli, müşterinin dosyasını gönderip teklif talep ettiği; stüdyonun kapsamı ve nihai fiyatı kontrol ettiği gerçek bir teklif akışıdır.

## Değişen başlıca sistemler

### Supabase ve veritabanı

- Canlı Supabase projesi uygulamaya bağlandı.
- Profil, sipariş, dosya, mesaj, site ayarı ve portfolyo tabloları oluşturuldu.
- Altı public tabloda Row Level Security etkinleştirildi.
- Müşterilerin yalnızca kendi sipariş ve dosyalarına erişebilmesi için sahiplik kuralları eklendi.
- Yönetici yetkisinin kullanıcı tarafından değiştirilememesi güvence altına alındı.
- Fiyat ve ilk sipariş durumu veritabanında yeniden doğrulanıyor.
- Sipariş ile ilk dosya kaydı tek işlemde oluşturuluyor; başarısız işlemlerde sahipsiz yüklemeler temizleniyor.
- Security Advisor bulgularına göre tetikleyici fonksiyonların doğrudan çalıştırma yetkileri sınırlandırıldı.
- Yerel RLS ve dosya yetkilendirme testleri için Supabase yapılandırması ile pgTAP testleri eklendi.

### Dosya güvenliği

- Müşteri dosyaları tarama tamamlanana kadar `pending` durumunda karantinada tutuluyor.
- ClamAV için özel HTTP tarama servisi ve Docker Compose altyapısı eklendi.
- Tarama servisi gizli token ile korunuyor.
- Temiz dosyalar operatör erişimine açılıyor; zararlı dosyalar siliniyor; tarama hataları karantinada kalıyor.
- Tarama protokolünün temiz ve zararlı sonuçları ayırt ettiğini doğrulayan otomatik test eklendi.
- Yönetici sipariş ekranına başarısız taramayı yeniden deneme akışı eklendi.

### Ürün ve sipariş akışı

- Simüle edilmiş ödeme servisi ve sahte ödeme başarı akışı kaldırıldı.
- Tüm yeni müşteri gönderimleri güvenli biçimde `quote_requested` durumunda başlıyor.
- Teklif ekranındaki fiyatın geçici tahmin olduğu netleştirildi.
- B2B ekranı artık seçilen her dosya için ayrı ve takip edilebilir teklif talebi oluşturuyor.
- Dosya arşivi yalnızca gerçekten yüklenmiş final master dosyalarını gösteriyor.
- Supabase yapılandırılmamış production ortamında sistem demo veriye düşmek yerine güvenli biçimde işlemi durduruyor.

### Kullanıcı hesabı ve içerik

- Supabase kimlik doğrulama akışı güçlendirildi.
- Google OAuth dönüşü, şifre sıfırlama ve profil oluşturma davranışları gerçek servis düzenine uyarlandı.
- Uzaktaki servis hatalarında sahte başarı veya demo yönetici hesabına geri dönüş engellendi.
- İçerik ve portfolyo servislerinin production hata davranışları iyileştirildi.

### Production ve görünürlük

- `/api/health` sağlık kontrolü eklendi.
- `robots.txt` ve `sitemap.xml` üretimi eklendi.
- Global hata ve 404 sayfaları eklendi.
- Güvenlik başlıkları ve özel veriler için cache kısıtlamaları güçlendirildi.
- GitHub Actions üzerinde kurulum, test, lint ve production build çalıştıran CI akışı eklendi.
- `.env.example` ile gerekli public ve server-only yapılandırmalar belgelendi.

### Dokümantasyon

- Ana README Türkçe ve İngilizce olarak gerçek ürün akışını anlatacak şekilde yenilendi.
- `llm.md`, AI asistanlarının mimariyi ve güvenlik sınırlarını doğru anlaması için güncellendi.
- `SECURITY_AUDIT.md` ve `REVIEW.md`, yapılan düzeltmeler ve kalan yayın koşullarıyla güncellendi.
- Sürüm numarası `0.2.0` olarak kaydedildi.

## Doğrulama sonuçları

- 13/13 otomatik test geçti.
- ESLint kontrolü hatasız geçti.
- Next.js production derlemesi başarıyla tamamlandı.
- 24 rota başarıyla üretildi.
- Production bağımlılık taramasında bilinen güvenlik açığı bulunmadı.
- Canlı Supabase şeması uygulandı ve altı public tabloda RLS etkinliği doğrulandı.

## Henüz tamamlanması gereken production adımları

0.2.0 önemli bir altyapı kilometre taşıdır ancak aşağıdaki operasyonel kontroller tamamlanmadan gerçek müşteri dosyalarıyla tam yayın yapılmamalıdır:

- Docker ve gerçek ClamAV motorunu çalıştırıp temiz dosya ile EICAR senaryosunu uçtan uca doğrulamak.
- İki ayrı müşteri ve bir yönetici hesabıyla canlı RLS ve özel Storage erişim testlerini tamamlamak.
- Supabase Auth rate limit, CAPTCHA, redirect allowlist, sızmış parola koruması ve yönetici MFA ayarlarını doğrulamak.
- Hosting ortamına server-only anahtarları güvenli secret store üzerinden eklemek.
- Yayın alan adında sağlık kontrolü, OAuth, şifre sıfırlama, yükleme, revizyon ve teslim senaryolarını test etmek.

## Bir sonraki kilometre taşı

Artlantix 0.3 çalışmasının ana odağı UI/UX olacaktır:

- Ana sayfa ve teklif akışının görsel hiyerarşisini geliştirmek.
- Mobil deneyimi ve erişilebilirliği iyileştirmek.
- Müşteri panelini daha anlaşılır ve hızlı hale getirmek.
- Yönetici üretim kuyruğunu daha verimli hale getirmek.
- Tüm panel metinlerini Türkçe, İngilizce ve Almanca tamamlamak.
- Gerçek kullanım verileriyle LCP, INP ve genel performansı ölçmek.

---

## English summary

Artlantix 0.2.0 is the production-foundation release. It connects the application to Supabase, adds database and private-storage authorization, replaces simulated checkout behavior with a real quote-request workflow, introduces quarantined uploads and a private ClamAV scanning service, adds CI and production health checks, and updates the project documentation.

All 13 automated tests, ESLint, the 24-route production build and the production dependency audit passed. Before accepting real customer files, the live ClamAV engine, multi-tenant RLS/Storage scenarios, Supabase Auth protections and full staging workflow still need operational verification. The next milestone will focus on UI/UX improvements.
