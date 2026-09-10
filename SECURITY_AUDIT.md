# Artlantix Production Security Audit

**Denetim tarihi:** 10 Eylül 2026  
**Kapsam:** Kaynak kod, Next.js yapılandırması, Supabase erişim zinciri, kimlik doğrulama, RLS ve Storage SQL'i, dosya yükleme, environment kullanımı, Git geçmişinde secret taraması, dependency ve production build kontrolleri.  
**Sınır:** Canlı Supabase projesi, CDN/hosting ayarları, OAuth sağlayıcısı ve ödeme sağlayıcısı bağlı olmadığı için DAST, canlı RLS testi, e-posta akışı ve gerçek ödeme testi yapılamadı.

## 1. Executive Security Summary

Uygulamanın tek özel Next.js HTTP endpoint'i `GET /auth/callback` yoludur. Sipariş, profil, mesaj, CMS ve dosya işlemleri tarayıcı Supabase istemcisinden Data API/Storage'a gider; bu nedenle gerçek güvenlik sınırı arayüz değil Supabase RLS, trigger ve bucket politikalarıdır. Toplam 17 uygulama rotası incelendi. `/dashboard` ve `/admin` arayüz kapıları yalnızca kullanıcı deneyimi sağlar; veri yetkisi SQL'de ayrıca uygulanmalıdır.

Denetimde açık yönlendirme, ham servis hata sızıntısı, şifre sıfırlamada kullanıcı keşfi, profil/sipariş mass assignment, çapraz kullanıcı sipariş ilişkisi, dosya metadata ve yol manipülasyonu, zayıf dosya doğrulaması, public SVG riski, imzalı URL'de güvenli olmayan fallback, eksik güvenlik başlıkları ve çift lockfile düzeltildi. Düzeltmeler henüz commit edilmedi, uzak depoya gönderilmedi ve canlı veritabanına uygulanmadı.

Kod düzeyi kontroller temizdir: 11 test, ESLint, TypeScript ve production build geçti. `pnpm audit --prod` 160 production/optional dependency içinde bilinen açık bildirmedi. Secret taramasında takip edilen dosyalarda veya Git geçmişinde gerçek anahtar/token bulunmadı; görülen Supabase değerleri yalnızca placeholder'dır.

Buna rağmen ürün production'a hazır değildir. Gerçek ödeme yetkilendirmesi/webhook'u yoktur, güvenlik migration'ı canlı ortamda uygulanıp iki müşteri ve bir admin ile test edilmemiştir, yükleme + sipariş + dosya kaydı atomik değildir ve müşteri dosyalarında malware/CDR taraması yoktur.

### Saldırı yüzeyi ve erişim matrisi

| İşlem / endpoint | Auth | Tenant/rol kontrolü | Manipülasyona karşı kontrol | Abuse koruması |
| --- | --- | --- | --- | --- |
| `GET /auth/callback` | Giriş öncesi public; PKCE kodu gerekir | Yalnız `/dashboard` ve `/admin` altına aynı-origin dönüş | URL parser + allowlist; hata detayı gizli | Uygulama limiti yok; Supabase Auth limitlerine bağlı |
| `profiles` SELECT/UPDATE | `authenticated` | Kendi satırı veya admin; trigger rol/kimlik alanlarını kilitler | Güncellenebilir alanlar allowlist ve uzunluk kısıtlı | Özel uygulama limiti yok |
| `orders` SELECT/INSERT/UPDATE | `authenticated` | Kendi siparişi veya admin | Trigger `user_id`, numara, fiyat, durum, sanatçı ve kaynak siparişi doğrular | Özel uygulama limiti/idempotency yok |
| `order_files` SELECT/INSERT | `authenticated` | Sahip olunan sipariş; kategori ve kullanıcı/sipariş yolu bağlı | Format, ad, boyut ve storage path constraint'i | Bucket boyut/MIME limiti var; kullanıcı kotası yok |
| `order_messages` SELECT/INSERT | `authenticated` | Sahip olunan sipariş veya admin | `sender_id`, tip ve 1–5000 karakter doğrulaması | Mesaj hız limiti yok |
| `site_settings` | Okuma public, yazma admin | RLS `is_admin()` | Alan allowlist'i, fiyat/metin constraint'i | Yazma hız limiti yok |
| `portfolio_items` / `portfolio` | Aktif içerik public, yazma admin | RLS ve bucket policy | HTTPS/iç yol, MIME, uzantı, imza ve boyut kontrolü | Bucket limiti var |
| Customer/previews/master Storage | `authenticated` | UID klasörü, admin rolü ve tamamlanmış sipariş bağı | Rastgele nesne adı, private bucket, signed URL | Boyut/MIME var; malware/kullanıcı kotası yok |

### OWASP ve istenen kategorilerin sonucu

- SQL/NoSQL injection, command injection, unsafe deserialization ve SSRF için ulaşılabilir sink bulunmadı. Uygulama ham SQL veya kullanıcı URL'sine server-side istek çalıştırmıyor.
- Stored/reflected/DOM XSS için `dangerouslySetInnerHTML`, `innerHTML`, `eval` veya benzeri sink bulunmadı. React metinleri encode ediyor; SVG metni yalnız encode edilmiş image data URL bağlamında gösteriliyor. Public SVG yükleme kaldırıldı.
- Özel state-changing Next.js API olmadığı için klasik uygulama CSRF endpoint'i yok. Supabase oturumu/PKCE yönetimi kütüphaneye ait; Data API'deki yetki RLS'ye bağlı. Canlı cookie bayrakları ve OAuth redirect allowlist ayrıca doğrulanmalıdır.
- JWT üretimi, parola hash'i veya plaintext parola saklama kodu projede yok; bunları Supabase Auth yönetiyor. Service-role key kullanılmıyor.
- IDOR, tenant isolation ve privilege escalation için kod/SQL düzeltmeleri hazırlandı; canlı güvence migration'ın uygulanmasına bağlıdır.
- Path traversal riski storage nesne adlarının UUID ile üretilmesi ve RLS'de UID/order prefix kontrolüyle azaltıldı.
- Prototype pollution sağlayacak dinamik prototype yazımı bulunmadı; CMS payload'ları çalışma zamanında allowlist'e çevrildi.
- CORS uygulama içinde özel olarak açılmıyor. Supabase/hosting origin ve redirect allowlist'i canlı panelde sınırlandırılmalıdır.

Referans yaklaşım: [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html), [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api).

## 2. Critical Issues

### C-01 — Production ödeme trust boundary'si yok — AÇIK

**SEVERITY:** Critical  
**LOCATION:** `lib/services/payment.ts`, teklif/checkout akışı, `supabase/schema.sql` → `enforce_order_insert_pricing()`  
**ISSUE:** Kart ve fatura adımları simülasyondur. Doğrulanmış ödeme oturumu, server-side fiyat hesabı, kalıcı payment kaydı, webhook imza doğrulaması ve idempotency bulunmuyor. SQL düzeltmesi yeni siparişi güvenli biçimde `quote_requested` durumuna zorluyor fakat tahsilat sistemi oluşturmuyor.  
**ATTACK SCENARIO:** Uygulama mevcut haliyle gerçek satış gibi yayınlanırsa kullanıcı istemci akışını veya Data API isteğini değiştirerek ödeme yapılmış izlenimi üretmeye çalışabilir; operatör de gerçek ödeme kaydı olmadığı için sahte durumu ayırt edemez.  
**IMPACT:** Ücretsiz üretim/teslim, gelir kaybı, yanlış muhasebe ve müşteri uyuşmazlığı.  
**FIX:** Ödeme oturumunu trusted server endpoint'inde oluştur; fiyatı server/database tarafında yeniden hesapla; sağlayıcı webhook imzasını doğrula; event/payment ID için unique constraint ve idempotent durum makinesi kur; yalnız doğrulanmış ödeme olayı üretimi ilerletsin. Bu tamamlanana kadar gerçek ödeme ve otomatik teslimi kapalı tut.

## 3. High Risk Issues

### H-01 — RLS düzeltmeleri canlı ortamda uygulanmadı — AÇIK

**SEVERITY:** High  
**LOCATION:** `supabase/schema.sql`, `supabase/migrations/20260907_access_hardening.sql`, canlı Supabase deployment  
**ISSUE:** Kod deposundaki RLS, trigger, constraint ve bucket sertleştirmeleri canlı bir veritabanında uygulanıp doğrulanmadı. Tarayıcı doğrudan Data API kullandığı için bu katman zorunlu güvenlik sınırıdır.  
**ATTACK SCENARIO:** Eski/eksik politikalarla çalışan bir projede normal kullanıcı REST isteğinde `user_id`, `is_admin`, fiyat, durum, `source_order_id`, dosya yolu veya sender alanlarını değiştirerek başka tenant verisine erişebilir ya da yetki yükseltebilir.  
**IMPACT:** Hesap ele geçirme etkisi, çapraz müşteri veri sızıntısı, sipariş/fiyat manipülasyonu ve özel dosya erişimi.  
**FIX:** Migration'ı staging yedeği üzerinde uygula; eski veriyi temizle; `NOT VALID` constraint'leri ayrıca `VALIDATE CONSTRAINT` ile doğrula; iki müşteri + bir admin JWT'siyle pozitif/negatif RLS ve Storage testleri çalıştır; sonra kontrollü production migration yap. Düzeltme kodu hazırdır ama deployment tamamlanmamıştır.

### H-02 — Dosya ve sipariş yazımları atomik değil — AÇIK

**SEVERITY:** High  
**LOCATION:** `lib/services/orders.ts` → `createOrder()`, `addOperatorDeliverable()`  
**ISSUE:** Storage upload, order insert, `order_files` insert ve durum güncellemesi ayrı işlemlerdir. Sonraki adım başarısız olduğunda önceki nesne/satır geri alınmıyor.  
**ATTACK SCENARIO:** Bağlantı kesintisi, tekrar gönderim veya bilinçli istek yarışında aynı dosya birden çok kez yüklenebilir; dosya kaydı olmayan nesne veya teslim dosyası olmayan/yanlış durumlu sipariş oluşabilir.  
**IMPACT:** Yetim özel dosyalar, kota tüketimi, tutarsız teslim, operasyon hatası ve tekrar ücretlendirme riski.  
**FIX:** Trusted server workflow kullan; order/payment idempotency key ekle; veritabanı işlemlerini transaction/RPC ile birleştir; storage için compensating cleanup ve periyodik orphan temizliği uygula; status geçişini dosya kaydıyla aynı yetkili operasyonun parçası yap.

### H-03 — Untrusted müşteri dosyalarında malware/CDR taraması yok — AÇIK

**SEVERITY:** High  
**LOCATION:** `lib/services/storage.ts`, `customer-assets` bucket, operatör dosya inceleme süreci  
**ISSUE:** Uzantı, MIME, magic-byte ve boyut kontrolü eklendi; ancak PDF ve görseller trusted bir tarama servisinde malware, polyglot veya aktif içerik açısından incelenmiyor.  
**ATTACK SCENARIO:** Saldırgan geçerli başlığa sahip zararlı/polyglot PDF ya da görüntü yükler; operatör dosyayı masaüstü uygulamasında açınca okuyucu/codec açığı veya sosyal mühendislik payload'ı tetiklenir.  
**IMPACT:** Operatör cihazı ve stüdyo dosyalarının ele geçirilmesi, kötü amaçlı dosyanın teslim zincirine girmesi.  
**FIX:** Yüklemeleri quarantine bucket'a al; server-side AV taraması ve PDF için CDR uygula; temiz sonucu ayrı private bucket'a promote et; tarama tamamlanmadan operatöre indirme verme. [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### H-04 — Profil/sipariş mass assignment ve tenant izolasyonu — KODDA DÜZELTİLDİ, MIGRATION BEKLİYOR

**SEVERITY:** High  
**LOCATION:** `lib/services/auth.ts`, `lib/services/orders.ts`, iki Supabase SQL dosyasındaki `protect_profile_update()` / `protect_order_update()` / RLS politikaları  
**ISSUE:** Önceki model istemcinin rol, kullanıcı, fiyat, order number, sanatçı, durum ve kaynak sipariş alanları göndermesine fazla güveniyordu; profil update payload'ı çalışma zamanında ek alan taşıyabiliyordu.  
**ATTACK SCENARIO:** Normal kullanıcı doğrudan Supabase REST isteğiyle `is_admin=true`, başka `user_id`, düşük fiyat veya tamamlanmış durum gönderebilir; başka müşterinin siparişini kaynak gösterebilir.  
**IMPACT:** Privilege escalation, IDOR, fiyat ve iş akışı manipülasyonu.  
**FIX:** İstemci payload'ları allowlist'e alındı; trigger kullanıcıyı `auth.uid()` yapıyor, fiyat/numara/durum/revizyonu yeniden kuruyor, profile/order değişebilir alanlarını sınırlandırıyor ve RLS `WITH CHECK` kullanıyor. Canlı güvence için H-01 tamamlanmalı.

### H-05 — Storage metadata/path ve imzalı URL güveni — KODDA DÜZELTİLDİ, MIGRATION BEKLİYOR

**SEVERITY:** High  
**LOCATION:** `lib/services/storage.ts`, `lib/services/orders.ts`, Storage ve `order_files` politikaları  
**ISSUE:** Önceki akış istemci dosya adına/path'ine ve MIME beyanına güveniyor, overwrite (`upsert`) yapıyor ve signed URL üretilemezse ham path döndürebiliyordu.  
**ATTACK SCENARIO:** Kullanıcı çakışan nesneyi ezmeye, başka siparişe dosya metadata'sı bağlamaya veya güvenli indirme başarısızlığında korumasız yolu kullanmaya çalışır.  
**IMPACT:** Dosya bütünlüğü kaybı, çapraz sipariş bağlantısı ve özel nesne adresinin yanlış işlenmesi.  
**FIX:** UUID nesne adı, `upsert:false`, kategori/format/MIME/signature/size doğrulaması, UID+order path RLS'i ve fail-closed signed URL davranışı eklendi; bucket kurallarının canlı uygulanması gerekiyor.

## 4. Medium Risk Issues

### M-01 — Uygulama düzeyinde rate limit ve kaynak kotası yok — AÇIK

**SEVERITY:** Medium  
**LOCATION:** Supabase Auth/Data API/Storage, login/signup/reset, order/message/upload işlemleri  
**ISSUE:** Kodda kullanıcı/IP bazlı login, kayıt, reset, sipariş, mesaj ve upload limiti yok. Supabase'in mevcut auth limitleri canlı projede doğrulanmadı; Data API için ürün bazlı limit bulunmuyor.  
**ATTACK SCENARIO:** Botlar parola denemesi, reset e-postası, hesap oluşturma, mesaj/order spam'i veya çok sayıda küçük dosyayla kota tüketimi yapar.  
**IMPACT:** Brute force, e-posta itibarı/kota kaybı, maliyet ve hizmet kesintisi.  
**FIX:** Supabase Auth rate limit/CAPTCHA ayarlarını etkinleştir; edge/WAF IP limiti uygula; kullanıcı başına order/message/storage kotası ve cooldown ekle; 429 ve güvenli gözlemleme kur. [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/rate-limits).

### M-02 — Admin/dashboard sayfa kapısı yalnız client-side — AÇIK (RLS İLE VERİ KORUNUYOR)

**SEVERITY:** Medium  
**LOCATION:** `components/AccessGate.tsx`, `app/admin/layout.tsx`, `app/dashboard/layout.tsx`  
**ISSUE:** Sayfa erişim kararı hydration sonrasında tarayıcıda veriliyor. Yetkisiz kişi route shell ve istemci paketini indirebilir; veri güvenliği tamamen RLS'ye bağlıdır.  
**ATTACK SCENARIO:** Saldırgan doğrudan `/admin/orders` açar, UI kodunu inceler ve eksik uygulanmış tek bir RLS politikasını hedefler.  
**IMPACT:** Yönetim yüzeyinin keşfi ve H-01 varsa veri/yetki ihlali.  
**FIX:** Supabase session yenileyen server proxy/middleware ve server layout redirect'i ekle; yine de tüm data authorization'ı RLS/server action içinde bırak. Mevcut CSP/no-store başlıkları sayfa cache riskini azaltır.

### M-03 — CSP statik ve `unsafe-inline` içeriyor — AÇIK / KISMİ SERTLEŞTİRME

**SEVERITY:** Medium  
**LOCATION:** `next.config.ts` → `contentSecurityPolicy`  
**ISSUE:** CSP eklendi fakat Next.js'in mevcut statik üretimi için script/style tarafında `unsafe-inline` kullanıyor. `script-src-attr 'none'`, `object-src 'none'` ve `frame-ancestors 'none'` koruma sağlasa da strict CSP düzeyinde değildir.  
**ATTACK SCENARIO:** Başka bir XSS sink ileride eklenirse inline script kısıtı beklenen kadar güçlü olmayabilir.  
**IMPACT:** Gelecekteki XSS açığının etkisi büyüyebilir.  
**FIX:** Nonce tabanlı dinamik CSP veya Next.js SRI yaklaşımını değerlendir; framework uyumluluk testiyle `unsafe-inline` kaldır. [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy).

### M-04 — Merkezi güvenlik audit log/alert yok — AÇIK

**SEVERITY:** Medium  
**LOCATION:** Auth, order status, admin CMS ve Storage operasyonları  
**ISSUE:** Başarısız giriş, RLS reddi, admin değişikliği, dosya yükleme/tarama ve payment olayları için değiştirilemez merkezi audit trail ve alarm bulunmuyor.  
**ATTACK SCENARIO:** Yetki denemeleri veya ele geçirilmiş admin hesabının değişiklikleri operasyon mesajları arasında fark edilmeden kalır.  
**IMPACT:** Geç tespit, zayıf olay müdahalesi ve hesap verebilirlik eksikliği.  
**FIX:** Actor, tenant, action, target, correlation ID, IP özeti ve sonuç alanlı append-only audit event'leri üret; secret, token, parola ve dosya içeriğini loglama; alarm eşikleri tanımla.

### M-05 — OAuth open redirect — DÜZELTİLDİ

**SEVERITY:** Medium  
**LOCATION:** `app/auth/callback/route.ts`, `lib/security.ts` → `getSafePostAuthRedirect()`  
**ISSUE:** Önceki string-prefix kontrolü backslash/URL normalizasyonu gibi bypass'lara açıktı.  
**ATTACK SCENARIO:** Saldırgan hazırlanmış `next` parametresiyle başarılı giriş sonrası kullanıcıyı phishing alanına göndermeye çalışır.  
**IMPACT:** Credential phishing ve güven kaybı.  
**FIX:** URL parser, aynı-origin kontrolü, kontrol karakteri/backslash reddi, iki kez decode kontrolü ve yalnız `/dashboard`/`/admin` allowlist'i eklendi. Regresyon testi var. [OWASP Unvalidated Redirects](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).

### M-06 — User enumeration ve internal hata sızıntısı — DÜZELTİLDİ

**SEVERITY:** Medium  
**LOCATION:** `lib/services/auth.ts`, `lib/services/orders.ts`, `lib/services/content.ts`, `lib/services/storage.ts`, auth sayfaları  
**ISSUE:** Servis/database hata mesajları kullanıcıya taşınabiliyor ve reset sonucu hesap varlığına göre ayrışabiliyordu.  
**ATTACK SCENARIO:** Saldırgan e-posta listesini reset cevaplarıyla doğrular veya provider/database mesajlarından şema ve tenant ayrıntısı toplar.  
**IMPACT:** Hesap keşfi, hedefli phishing ve sonraki saldırılar için bilgi sızıntısı.  
**FIX:** Reset her hesap için aynı başarılı cevabı döndürüyor; public auth ve veri operasyonları sabit genel hata mesajları kullanıyor. Email biçim hatası hesap varlığına bağlı olmadığı için görünür kalıyor. [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

### M-07 — Input/file doğrulaması ve public SVG — DÜZELTİLDİ

**SEVERITY:** Medium  
**LOCATION:** `lib/security.ts`, `lib/services/storage.ts`, `lib/services/content.ts`, form bileşenleri ve SQL constraint'leri  
**ISSUE:** Metin/JSON/fiyat alanlarında merkezi sınır yoktu; dosyada yalnız uzantı/boyut kontrolü bulunuyordu; public portföy SVG kabul edebiliyordu.  
**ATTACK SCENARIO:** Çok büyük mesaj/revizyon/CMS içeriğiyle depolama veya UI zorlanır; MIME spoofing ve aktif SVG public origin üzerinden servis edilir.  
**IMPACT:** Stored content abuse, kota/performans kaybı ve tarayıcı güvenlik riski.  
**FIX:** UI + servis + database katmanında uzunluk/domain kontrolleri, revizyon JSON şema/koordinat sınırı, fiyat finite/range kontrolü, MIME+uzantı+magic-byte doğrulaması ve PNG/WebP public portföy sınırı eklendi.

### M-08 — Auth politika ayarları ve admin MFA doğrulanmadı — AÇIK

**SEVERITY:** Medium  
**LOCATION:** Canlı Supabase Auth dashboard; login/signup/reset/OAuth akışları  
**ISSUE:** Kod minimum 12–128 karakter uyguluyor ancak leaked-password protection, email doğrulama, redirect allowlist, secure password change, oturum süresi/invalidation ve admin MFA canlı ayarları bilinmiyor.  
**ATTACK SCENARIO:** Credential stuffing veya ele geçirilen admin parolası ikinci faktör olmadan yönetim verisine erişir; geniş OAuth redirect listesi yanlış dönüşe izin verebilir.  
**IMPACT:** Hesap/admin ele geçirilmesi.  
**FIX:** Email verification ve leaked-password protection aç; adminlerde zorunlu MFA/AAL2 uygula; exact redirect URL allowlist tanımla; session sürelerini ve global logout/revocation'ı test et; reset ve email-change akışlarında yeniden doğrulama kullan.

## 5. Low Risk / Hardening Opportunities

### L-01 — HSTS preload/includeSubDomains kullanılmıyor — AÇIK, BİLİNÇLİ

**SEVERITY:** Low  
**LOCATION:** `next.config.ts` → `Strict-Transport-Security`  
**ISSUE:** Production'da bir yıllık HSTS var; `includeSubDomains` ve `preload` yok. Alt alanların tamamının HTTPS garantisi doğrulanmadan bunları eklemek kilitleme riski taşır.  
**ATTACK SCENARIO:** HTTPS zorlaması olmayan bir alt alan ilk bağlantıda downgrade riskine açık kalabilir.  
**IMPACT:** Sınırlı transport hardening eksikliği.  
**FIX:** Tüm alt alanları envanterleyip HTTPS garantisi verdikten sonra `includeSubDomains`; preload şartları karşılanırsa ayrıca `preload` değerlendir.

### L-02 — Dependency kurulumu iki lockfile'a bağlıydı — DÜZELTİLDİ

**SEVERITY:** Low  
**LOCATION:** `package.json`, kaldırılan `package-lock.json`, `pnpm-lock.yaml`, README  
**ISSUE:** npm ve pnpm lockfile'larının birlikte bulunması CI/geliştirici ortamlarında farklı dependency ağaçları oluşturabilirdi.  
**ATTACK SCENARIO:** Bir ortam farklı lockfile seçer ve incelenenden farklı transitive sürüm kurar.  
**IMPACT:** Tekrarlanabilirlik kaybı ve supply-chain incelemesinin zayıflaması.  
**FIX:** pnpm 11.19.0 `packageManager` alanında sabitlendi; yalnız `pnpm-lock.yaml` bırakıldı; doküman `--frozen-lockfile` kullanıyor. Major paketler rastgele yükseltilmedi.

### L-03 — Demo verisi localStorage'da tutuluyor — KABUL EDİLEN DEMO SINIRI

**SEVERITY:** Low  
**LOCATION:** `lib/services/auth.ts`, `orders.ts`, `content.ts`, `quote-draft.ts`  
**ISSUE:** Supabase yapılandırılmadığında demo profil, sipariş ve küçük data URL dosyaları tarayıcı depolamasında kalır.  
**ATTACK SCENARIO:** Aynı tarayıcı profilini kullanan başka kişi demo içeriğini görebilir veya değiştirebilir.  
**IMPACT:** Demo verisinin gizliliği/bütünlüğü; gerçek production verisi burada tutulmamalıdır.  
**FIX:** Demo modu açıkça etiketli tut; gerçek servis bağlıyken fallback'i kapalı tutmaya devam et; production build için isteğe bağlı `DEMO_MODE=false` kill switch ekle.

## 6. Yapılan düzeltmeler

- OAuth dönüş hedefi parser ve route allowlist ile güvenli hale getirildi.
- Login/signup/reset/profile hata cevapları genelleştirildi; reset hesap varlığını ayırt etmiyor.
- Parola istemci sınırı 12–128 karaktere çıkarıldı; email/ad/şirket/profil alanları normalize edildi.
- Profil güncellemesi runtime allowlist'e alındı; role/identity alanları database trigger'ında kilitlendi.
- Sipariş insert trigger'ı kullanıcıyı auth oturumundan alıyor, order number üretip fiyatı yeniden hesaplıyor, kaynak sipariş tenant'ını kontrol ediyor ve ilk durumu kilitliyor.
- Müşteri sipariş güncellemesi yalnız geçerli preview → approved/revision transition ve doğrulanmış revision JSON ile sınırlandı.
- Dosya ve mesaj insert politikaları order ownership, sender, category ve path ilişkisini doğruluyor.
- Müşteri, preview, master ve portföy bucket'larına size/MIME sınırı; metadata tablolarına CHECK constraint'leri eklendi.
- Upload servisinde extension/MIME/magic-byte/size eşleştirme, rastgele storage adı, overwrite yasağı ve fail-closed signed URL eklendi.
- Public portföy upload'ında SVG kaldırıldı; CMS payload ve URL'leri allowlist/normalize edildi.
- CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, `frame-ancestors`, X-Frame-Options ve private no-store başlıkları eklendi; `X-Powered-By` kaldırıldı. Production server'da başlıklar ölçüldü. [Next.js Headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers).
- Tek paket yöneticisi/lockfile standardı getirildi; secret ve dependency taraması yapıldı.

## 7. Eklenen güvenlik testleri

`tests/regressions.mjs` artık 11 test içeriyor. Yeni güvenlik regresyonları:

- Güvenli panel redirect'lerinin kabulü; protocol-relative, absolute, backslash, login ve double-encoded bypass denemelerinin reddi.
- Auth provider'ın internal hatasının kullanıcıya sızmaması.
- Password reset sonucunun hesap/provider hatasından bağımsız aynı görünmesi.
- Upload'da uzantı, MIME, boş/büyük dosya ve magic-byte uyuşmazlığının reddi.
- Aşırı uzun metin, geçersiz media protocol ve `NaN` fiyatın reddi.

Çalıştırılan doğrulamalar:

```text
pnpm test          11/11 geçti
pnpm lint          0 hata, 0 uyarı
pnpm build         başarılı (TypeScript dahil)
pnpm audit --prod  0 bilinen açık / 160 production+optional dependency
git diff --check   whitespace hatası yok
```

Production sunucusu üzerinden CSP, HSTS, DENY/frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy, `X-Powered-By` yokluğu ve `/dashboard/orders` için `private, no-store` doğrulandı.

## 8. Production'a çıkmadan önce yapılması gerekenler

1. **C-01:** Gerçek trusted payment endpoint'i, imzalı webhook, kalıcı payment tablosu, idempotency ve test/sandbox senaryolarını tamamla.
2. **H-01:** Migration'ı staging'de uygula; mevcut veriyi temizleyip tüm `NOT VALID` constraint'leri validate et; iki müşteri ve bir admin ile RLS/Storage entegrasyon testlerini geçir.
3. **H-02:** Upload + order + file + status akışını idempotent server workflow'a taşı ve orphan cleanup ekle.
4. **H-03:** Müşteri dosyaları için quarantine, malware scan/CDR ve clean promotion süreci kur.
5. Supabase Auth rate limit, CAPTCHA, email doğrulama, leaked-password protection, exact OAuth redirect allowlist, secure password change, session revocation ve admin MFA/AAL2 ayarlarını etkinleştirip test et.
6. CDN/WAF üzerinde IP limiti, request body sınırı, bot koruması ve yalnız gereken origin/redirect izinlerini yapılandır.
7. Append-only security audit log, alarm, backup/restore provası ve incident response runbook'u hazırla; loglarda token/secret/kişisel dosya içeriği tutma.
8. Final domain üzerinden TLS/header/CSP doğrulaması, bağımsız DAST, erişilebilirlik dışı güvenlik smoke testi ve yedekten dönüş testi yap.
9. Secret'ları yalnız hosting secret store'da tut; yalnız Supabase anon key `NEXT_PUBLIC_` olabilir. Service-role/payment webhook secret'ı hiçbir zaman istemci bundle'ına koyma; deployment öncesi secret scan'i CI'da zorunlu yap.
10. Dependency güncellemelerini uyumluluk testiyle planla; frozen lockfile, güvenilir registry ve CI'da `pnpm audit --prod` kullan.

## PRODUCTION SECURITY VERDICT

**DO NOT DEPLOY**

Gerekçe: Kod içindeki güvenli düzeltmeler ve testler başarılıdır; ancak gerçek ödeme yetkilendirmesi yoktur, uygulamanın temel authorization sınırı olan Supabase migration'ı canlı/staging ortamında uygulanıp kanıtlanmamıştır ve untrusted dosyalar operatöre açılmadan önce taranmamaktadır. En az C-01, H-01, H-02 ve H-03 tamamlanıp entegrasyon testleri geçmeden gerçek müşteri, ödeme veya üretim dosyasıyla yayın yapılmamalıdır.
