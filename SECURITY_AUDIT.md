# Artlantix Production Security Audit

**Son güncelleme:** 16 Eylül 2026
**Kapsam:** Next.js uygulaması, Supabase Auth/Data API/RLS/Storage tasarımı, müşteri ve yönetici iş akışları, dosya yükleme, environment sınırı ve production build.

## Yönetici özeti

Uygulama artık çevrim içi ödeme yaptığını iddia etmeyen, güvenli biçimde teklif talebi toplayan bir MVP'dir. Production ortamında backend eksikse localStorage demo verisine düşmez. Müşteri upload'ı sonrasında sipariş ve dosya metadata'sı tek PostgreSQL transaction'ında yazılır; transaction başarısızsa bağlanmamış Storage nesnesi telafi olarak silinir.

Kod kontrolleri temizdir: 13 test, ESLint, TypeScript ve production build geçmiştir. ClamAV adapter'ının kimlik doğrulama, temiz ve EICAR-benzeri zararlı cevapları otomatik test edilmiştir. Canlı Supabase projesine temel şema ve tetikleyici erişim sertleştirmesi uygulanmış, altı `public` tablosunda RLS açık olduğu doğrulanmış ve yerel uygulama publishable key ile bağlanmıştır. Bununla birlikte iki müşteri + bir admin JWT'siyle canlı RLS/Storage matrisi ve gerçek ClamAV signature engine henüz çalıştırılmamıştır.

## Güvenlik modeli

18 Eylül ek notu: Misafir siparişi yalnız izole localStorage demosunda hazırdır; production guest ownership/eposta doğrulama ve cihazlar arası takip henüz uygulanmadı. Sipariş numarası tek başına erişim anahtarı değildir. Yeni receipt endpoint'i doğrulanmış Supabase kullanıcısı ve sipariş sahipliği ister, alıcıyı authenticated email'den türetir, aynı-origin kontrolü yapar. Resend yapılandırması mevcut değildir; demo ortamında e-posta göndermez. Kalıcı outbox ve teslim webhook'u da yoktur.

- Kimlik ve rol kaynağı Supabase Auth + `profiles` tablosudur. `is_admin` istemci metadata'sından alınmaz.
- Veri yetkilendirme sınırı PostgreSQL RLS ve Storage policy'leridir; istemci `AccessGate` yalnız kullanıcı deneyimidir.
- Müşteri, yalnız kendi siparişini, mesajını ve dosya metadata'sını okuyabilir/yazabilir.
- Yeni siparişin numarası, fiyatı, ilk durumu ve sahipliği veritabanında yeniden belirlenir.
- Customer upload, preview ve master bucket'ları private'dır; indirme için süreli signed URL üretilir.
- Production'da `NEXT_PUBLIC_DEMO_MODE=false` kullanılmalı; `/api/health` backend eksik veya demo açıkken 503 döndürür.
- Uygulama kart tahsilatı veya fatura üretmez. Tahsilat dışarıda yürütüldüğü için bu sürümde payment trust boundary yoktur.

## Açık yüksek riskler

### H-01 — Canlı migration uygulandı, tenant izolasyonu uçtan uca kanıtlanmadı

**Durum:** AÇIK / DEPLOYMENT ENGELİ
**Konum:** `supabase/schema.sql`, `supabase/migrations/20260907_access_hardening.sql`, `supabase/migrations/20260916_production_workflows.sql`

Temel şema ve `security_advisor_hardening_20260916` canlı projeye MCP ile transaction olarak uygulandı; `profiles`, `orders`, `order_files`, `order_messages`, `site_settings` ve `portfolio_items` tablolarında RLS açık olduğu doğrulandı. Trigger-only `handle_new_user` ve Supabase'in otomatik RLS event fonksiyonunun Data API çalıştırma yetkileri kaldırıldı. Kimliği yalnız `auth.uid()` üzerinden türeten, veri değiştirmeyen policy helper fonksiyonları doğrudan RPC çağrısında da yalnız boolean döndürdüğü için bilinçli advisor uyarıları olarak kaldı. Buna rağmen iki ayrı müşteri ve bir admin JWT'siyle pozitif/negatif tenant testi henüz yapılmadı.

**Kapatma ölçütü:** Farklı tenant'larla profil, order, message, order_files ve üç private bucket için izin/red matrisini otomatik test et; kalan bilinçli advisor uyarılarını dokümante et veya helper'ları exposed olmayan bir şemaya taşı.

### H-02 — Malware karantinası hazır, production engine aktivasyonu bekliyor

**Durum:** KODDA DÜZELTİLDİ / DEPLOYMENT DOĞRULAMASI BEKLİYOR
**Konum:** `app/api/uploads/scan/route.ts`, `infra/malware-scanner/`, `customer-assets`, `order_files.scan_status`

Müşteri dosyaları `pending` durumuyla mantıksal karantinaya alınır. Server-only servis rolü dosyayı bearer-token korumalı özel ClamAV adapter'ına gönderir. Storage RLS operatöre yalnız `clean` dosyayı açar; `infected` nesne silinir, scanner hatasında dosya kapalı kalır. Ancak gerçek ClamAV engine bu makinede Docker olmadığı için EICAR signature database'iyle çalıştırılmadı.

**Kapatma ölçütü:** Container'ları production private network'ünde çalıştır; EICAR ve temiz PDF/JPG ile uçtan uca testi geçir; signature güncelleme/health alarmını izle; scanner secret rotasyonunu ve failure retry'ı doğrula. Daha yüksek riskli PDF müşterileri için ayrıca CDR değerlendir.

### H-03 — Operatör teslim adımı tam atomik değil

**Durum:** AÇIK / OPERASYONEL RİSK
**Konum:** `lib/services/orders.ts` → `addOperatorDeliverable()`, admin status update

Müşteri order/file metadata yazımı atomiktir; ancak operatör preview/master upload, metadata insert ve status değişimi ayrı adımlardır. Ağ hatası yetim teslim dosyası bırakabilir.

**Kapatma ölçütü:** Operatör metadata + status geçişini yetkili RPC'de birleştir; Storage upload için telafi temizliği, idempotency key ve periyodik orphan reconciliation ekle.

## Açık orta riskler

- **Rate limit ve bot koruması:** Supabase Auth limitleri, CAPTCHA ve edge/WAF IP-kullanıcı kotaları canlı ortamda yapılandırılmalı.
- **Admin MFA:** Admin hesaplarında AAL2/MFA zorunluluğu policy veya trusted server sınırında doğrulanmalı.
- **Client-side route gate:** Admin/dashboard shell'i tarayıcıda korunur; veri güvenliği RLS'ye bağlıdır. Server layout/session redirect savunma derinliği sağlar.
- **CSP:** Güçlü temel direktifler vardır fakat framework uyumluluğu için `unsafe-inline` kullanılır. Nonce/SRI yaklaşımı staging'de değerlendirilmelidir.
- **Audit ve alarm:** Admin CMS/order değişiklikleri, RLS reddi, upload/scan ve auth olayları için merkezi append-only audit trail yoktur.
- **İdempotency/kota:** Teklif ve toplu upload için kullanıcı bazlı cooldown, idempotency key ve toplam depolama kotası eklenmelidir.

## Kodda kapatılan önemli bulgular

- OAuth dönüşü aynı-origin ve `/dashboard`, `/admin`, `/quote` allowlist'iyle sınırlandı; backslash, protocol-relative ve double-encoded bypass'lar reddediliyor.
- Auth/reset mesajları hesap varlığını ve provider iç hatasını sızdırmıyor.
- Profil ve order alanları allowlist/trigger ile sınırlandı; kullanıcı rol, fiyat, sahiplik veya keyfi durum yazamıyor.
- Upload'da dosya boyutu, uzantı, MIME ve magic-byte eşleştirmesi; rastgele Storage path'i ve `upsert:false` kullanılıyor.
- Signed URL üretimi başarısızsa private Storage path'i fallback olarak açılmıyor.
- Public portföy upload'ında aktif SVG kabul edilmiyor.
- Müşteri order + order_files metadata'sı `create_order_with_file` RPC'sinde atomik; başarısız upload temizliği yalnız bağlanmamış kendi nesnesine izin veriyor.
- Sahte ödeme, sahte fatura ve sahte ZIP manifesti kaldırıldı.
- CSP, HSTS, no-sniff, referrer, permissions, COOP, frame koruması ve private no-store başlıkları bulunuyor; `X-Powered-By` kapalı.
- Production demo fallback'i kapalı ve sağlık endpoint'i yanlış yapılandırmayı 503 ile görünür yapıyor.

## Doğrulama sonucu

```text
pnpm test   13/13 geçti
pnpm lint   0 hata, 0 uyarı
pnpm build  başarılı (TypeScript dahil)
```

Bu kontroller canlı RLS, malware scanning, WAF, e-posta teslimi, OAuth sağlayıcısı, yedek/geri dönüş veya final CDN davranışını kanıtlamaz.

## Production çıkış kapısı

Yayın öncesinde en az şu kanıtlar gerekir:

1. Uygulanmış canlı şema üzerinde iki müşteri + bir admin RLS/Storage izin-red testlerinin geçirilmesi.
2. İki müşteri + bir admin ile otomatik RLS/Storage izin-red testleri.
3. Quarantine + malware scan/CDR + clean promotion akışının başarılı ve başarısız senaryoları.
4. Email doğrulama, exact OAuth redirect, rate limit, CAPTCHA, leaked-password protection, session revocation ve admin MFA.
5. Final alan adında TLS, CSP/header, upload, quote, revision, preview ve master delivery smoke testi.
6. Secret scan, dependency audit, merkezi hata izleme, audit log, backup ve restore provası.

## Production güvenlik kararı

**CONDITIONAL NO-GO**

Kod tabanı quote-first yayın modeline hazırlanmıştır; ancak H-01 ve H-02 dış sistem kontrolleri kanıtlanmadan gerçek müşteri dosyasıyla production'a çıkılmamalıdır. Bu kontroller tamamlandığında ödeme entegrasyonu olmadan da teklif talebi ürünü olarak yayınlanabilir; çevrim içi ödeme sonradan eklenirse ayrı bir ödeme güvenlik incelemesi gerekir.

## 17 Eylül 2026 — Ek hizmet fiyatları

`20260917_agency_services.sql` yerelde hazırlandı; canlı veritabanına uygulanmadı. Üç ajans hizmeti ayrı ayrı 50 USD; veritabanı yalnız izin verilen hizmet kimliklerini kabul eder, tekrarları tekilleştirir ve ek hizmet bedelini vektör ekspres çarpanından sonra ekler. Canlı kullanım öncesinde migration ve veritabanı doğrulaması gerekir. Ayrı teslim tahmini her hizmet için stüdyo onayından sonra 3–5 iş günüdür.
