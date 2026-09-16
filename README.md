# Artlantix

[Türkçe](#türkçe) · [English](#english)

**Güncel sürüm:** 0.2.0 — Güvenli Supabase altyapısı ve production hazırlığı. Bir sonraki odak: UI/UX geliştirmeleri.

## Türkçe

Artlantix; düşük çözünürlüklü logo, taranmış çizim ve yapay zekâ taslaklarının uzman çizerler tarafından baskı, tekstil, tabela ve CNC üretimine uygun vektör dosyalarına dönüştürülme sürecini yöneten bir stüdyo platformudur. Otomatik vektör üretmez; insan eliyle yeniden çizim iş akışını yönetir.

### Ürün akışı

1. Müşteri hesap oluşturur veya giriş yapar.
2. JPG, PNG, WebP ya da PDF dosyasını yükler; karmaşıklık, renk, restorasyon ve teslim süresini seçer.
3. Sistem bir ön tahmin gösterir ve özel dosyayla birlikte teklif talebi oluşturur.
4. Stüdyo kapsamı ve nihai fiyatı inceler; üretim durumunu panelden günceller.
5. Müşteri filigranlı önizlemeyi onaylar veya görsel üzerinde revizyon noktaları bırakır.
6. Stüdyo gerçek master dosyaları yüklediğinde müşteri bunları süreli özel bağlantılarla indirir.

Site çevrim içi ödeme almaz. Kart çekilmiş veya fatura kesilmiş gibi davranan demo adımları kaldırılmıştır. Yayınlanabilir ilk sürüm, ödeme/tahsilatın stüdyo tarafından teklif onayından sonra haricen yönetildiği gerçek bir **teklif talebi** modelidir.

### Çalışan özellikler

- Supabase kimlik doğrulama, Google OAuth dönüşü, şifre sıfırlama ve profil yönetimi
- Özel müşteri yüklemeleri, özel önizlemeler ve özel master teslimleri
- Veritabanında yeniden doğrulanan fiyat ve güvenli ilk sipariş durumu
- Atomik sipariş + dosya metadata kaydı ve başarısız yükleme temizliği
- Sipariş durumu, teslim tahmini, mesajlar, onay ve görsel revizyon işaretleri
- Yönetici üretim kuyruğu, teslim dosyası yükleme ve içerik yönetimi
- Gerçek çoklu B2B dosya gönderimi; her dosya için ayrı takip edilebilir teklif
- Türkçe, İngilizce ve Almanca public sayfalar
- Güvenlik başlıkları, sağlık endpoint'i, sitemap, robots ve CI kalite kontrolleri

Demo verisi yalnız geliştirme ortamında veya `NEXT_PUBLIC_DEMO_MODE=true` açıkça verildiğinde kullanılır. Production ortamında Supabase eksikse uygulama sahte veriye düşmez. `/api/health` bu durumda `503` döndürür.

### Yerelde çalıştırma

Gerekenler: Node.js 20.9+ ve pnpm 11.19.0.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
pnpm install --frozen-lockfile
pnpm dev
```

Ardından [localhost:3000](http://localhost:3000) adresini açın. Geliştirme demosunu kapatmak için `.env.local` içine `NEXT_PUBLIC_DEMO_MODE=false` yazın.

### Production kurulumu

1. Bir Supabase projesi oluşturun.
2. SQL Editor veya güvenilir migration aracınızla sırayla çalıştırın:
   - `supabase/schema.sql`
   - `supabase/migrations/20260907_access_hardening.sql`
   - `supabase/migrations/20260916_production_workflows.sql`
3. Auth sağlayıcılarını, e-posta doğrulamayı, kesin redirect URL listesini, rate limit/CAPTCHA ve admin MFA'yı yapılandırın.
4. Hosting secret store'a aşağıdaki public ayarları ekleyin:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

5. Docker/Podman bulunan özel bir sunucuda tarama servisini başlatın:

```sh
MALWARE_SCANNER_TOKEN="uzun-rastgele-bir-deger" docker compose -f infra/malware-scanner/compose.yml up -d --build
```

ClamAV signature engine için sunucuda en az 3 GiB, tercihen 4 GiB kullanılabilir RAM ayırın.

Uygulama sunucusundaki `MALWARE_SCANNER_URL`, `MALWARE_SCANNER_TOKEN` ve server-only `SUPABASE_SERVICE_ROLE_KEY` değerlerini ayarlayın. Müşteri dosyası `pending` olarak karantinada kalır; yalnız ClamAV `clean` sonucu verirse operatör okuyabilir. Zararlı sonuçta Storage nesnesi silinir. Admin panelinde başarısız taramayı yeniden deneme düğmesi bulunur.
6. İki müşteri ve bir yönetici hesabıyla RLS, Storage, OAuth, reset, yükleme, revizyon ve teslim senaryolarını staging'de test edin.
7. `/api/health` yanıtının `200` ve `status: ok` olduğunu doğrulayın.

Yerel Supabase için Docker-compatible runtime kurulduktan sonra:

```sh
pnpm db:start
pnpm db:reset
pnpm db:test
pnpm db:lint
```

`SUPABASE_SERVICE_ROLE_KEY` gibi gizli anahtarları `NEXT_PUBLIC_` değişkenine veya tarayıcı koduna koymayın. Canlı SQL migration ve zararlı dosya taraması yapılmadan gerçek müşteri dosyası kabul etmeyin.

### Kalite kontrolleri

```sh
pnpm test
pnpm lint
pnpm build
pnpm audit --prod
```

Mimari ve güvenlik ayrıntıları için [llm.md](llm.md), [SECURITY_AUDIT.md](SECURITY_AUDIT.md), [REVIEW.md](REVIEW.md) ve [AGENTS.md](AGENTS.md) dosyalarını okuyun.

---

## English

**Current version:** 0.2.0 — Secure Supabase foundation and production preparation. Next focus: UI/UX improvements.

Artlantix is a studio workflow platform for turning low-resolution logos, scanned drawings and AI concepts into production-ready vector files for print, apparel, signage and CNC work. It does not generate vectors automatically; it manages a human redrawing workflow.

### Product workflow

1. The customer creates an account or signs in.
2. They upload a JPG, PNG, WebP or PDF and choose complexity, color, restoration and turnaround options.
3. The system displays a provisional estimate and creates a private quote request with the source file.
4. The studio reviews scope and final price, then updates production status in the operator portal.
5. The customer approves the watermarked preview or places visual revision markers.
6. After the studio uploads real master files, the customer downloads them through expiring private links.

The site does not collect online payments. Demo steps that pretended to charge a card or issue an invoice have been removed. The first deployable model is a real **quote-request workflow**, with collection handled externally by the studio after quote approval.

### Implemented features

- Supabase authentication, Google OAuth callback, password recovery and profiles
- Private customer uploads, private previews and private master deliveries
- Database-recalculated pricing and a server-enforced initial order status
- Atomic order/file metadata creation with failed-upload cleanup
- Order status, delivery estimates, messages, approvals and visual revision markers
- Operator production queue, deliverable upload and content management
- Real multi-file business submissions with one trackable quote per file
- Turkish, English and German public pages
- Security headers, health endpoint, sitemap, robots and CI quality checks

Demo data is available only in development or when `NEXT_PUBLIC_DEMO_MODE=true` is explicitly set. Production never falls back to fake data when Supabase is missing. `/api/health` returns `503` for that configuration.

### Run locally

Requirements: Node.js 20.9+ and pnpm 11.19.0.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Add `NEXT_PUBLIC_DEMO_MODE=false` to `.env.local` to test fail-closed behavior.

### Production setup

1. Create a Supabase project.
2. Apply these files in order with the SQL Editor or your trusted migration tool:
   - `supabase/schema.sql`
   - `supabase/migrations/20260907_access_hardening.sql`
   - `supabase/migrations/20260916_production_workflows.sql`
3. Configure auth providers, email verification, exact redirect URLs, rate limits/CAPTCHA and admin MFA.
4. Add these public settings to the hosting secret store:

```env
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

5. Start the included private scanner on a Docker/Podman host:

```sh
MALWARE_SCANNER_TOKEN="a-long-random-value" docker compose -f infra/malware-scanner/compose.yml up -d --build
```

Reserve at least 3 GiB, preferably 4 GiB, of available RAM for the ClamAV signature engine.

Set `MALWARE_SCANNER_URL`, `MALWARE_SCANNER_TOKEN` and the server-only `SUPABASE_SERVICE_ROLE_KEY` on the application server. Customer files remain quarantined as `pending`; operators can read them only after a clean ClamAV result. Infected objects are removed, and the admin portal can retry failed scans.
6. Test RLS, Storage, OAuth, recovery, upload, revision and delivery with two customer accounts and one admin in staging.
7. Confirm `/api/health` returns `200` with `status: ok`.

After installing a Docker-compatible runtime, verify the local database with:

```sh
pnpm db:start
pnpm db:reset
pnpm db:test
pnpm db:lint
```

Never put secrets such as `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable or browser code. Do not accept real customer files until the live SQL migrations and malware-scanning workflow are verified.

### Quality checks

```sh
pnpm test
pnpm lint
pnpm build
pnpm audit --prod
```

For architecture and security details, read [llm.md](llm.md), [SECURITY_AUDIT.md](SECURITY_AUDIT.md), [REVIEW.md](REVIEW.md) and [AGENTS.md](AGENTS.md).
