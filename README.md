# Artlantix

[Türkçe](#turkce) · [English](#english)

<a id="turkce"></a>

## Türkçe

### Artlantix nedir?

Artlantix, logo ve görsellerin uzman çizerler tarafından yeniden çizilmesi için geliştirilen bir sipariş ve müşteri takip platformudur. Bulanık logoların, taranmış çizimlerin ve yapay zekâ taslaklarının baskı, tekstil ve tabela üretimine uygun dosyalara dönüştürülme sürecini yönetmeyi amaçlar.

Vektör, büyütüldüğünde görüntü kalitesi bozulmayan bir çizim türüdür. Artlantix'in temeli insan eliyle yeniden çizimdir; site kendi başına otomatik vektör üretmez.

### Şu anda ne durumda?

Proje **geliştirme aşamasındaki bir demodur**. Müşteri ve yönetici ekranları denenebilir; gerçek ödeme, dosya teslimi ve bazı hesap işlemleri henüz tamamlanmamıştır.

| Bölüm | Şu anda yapılabilenler | Eksik olanlar |
| --- | --- | --- |
| Ana sayfa | Hizmetler, örnek çalışmalar ve önce/sonra karşılaştırması. | Gerçek müşteri örnekleri ve tam çeviri. |
| Fiyat teklifi | Görselli karmaşıklık seçimi, çizer değerlendirmesi, otomatik taslak kaydı, yeniden sipariş ve tahmini ücret. | Sunucuda fiyat doğrulama ve gerçek ödeme. |
| Müşteri paneli | Sipariş takibi, teslim tahmini, bildirim, mesaj, görsel revizyon işaretleri ve onay akışı. | Canlı servis üzerinde uçtan uca entegrasyon testi ve kalan panel çevirileri. |
| Yönetici paneli | Üretim kuyruğu, gerçek servis bağlıyken özel önizleme/master yükleme ve içerik düzenleme ekranları. | İşlemleri atomik hale getirme ve canlı veritabanı testi. |
| Dosya arşivi | Demo dosyaları ve açıkça etiketlenmiş paket manifesti; Supabase modunda süreli özel indirme bağlantıları. | Gerçek ZIP üretimi ve canlı depolama testi. |
| Kurumsal bölüm | Toplu dosya seçip tarayıcıya bir parti taslağı kaydetme. | Gerçek toplu yükleme, şirket onayı ve fatura akışı. |
| Üyelik | Demo hesap geçişi; Supabase için Google dönüşü, şifre sıfırlama ve profil kaydı. | Canlı Supabase projesinde uçtan uca doğrulama. |

Ödeme ekranındaki başarı, gerçek kart tahsilatı yapıldığı anlamına gelmez. Demo verileri tarayıcıda tutulur; başka cihazlara taşınmaz ve tarayıcı verileri temizlenince kaybolabilir. Türkçe, İngilizce ve Almanca desteği başlamıştır; panel ve bazı sayfa metinleri hâlâ İngilizcedir.

### Site nasıl denenir?

1. Aşağıdaki kurulum adımlarıyla siteyi açın. Demo için Supabase hesabı veya API anahtarı gerekmez.
2. Üst menüden veya giriş sayfasından **Demo Customer** hesabını seçerek müşteri ekranlarını inceleyin.
3. Fiyat teklifi bölümünde dosya seçip çizim seçeneklerini deneyin. Bu sürüm JPG/JPEG, PNG, WebP ve PDF kabul eder; dosya sınırı **2 MB**'tır.
4. Sipariş detayında teslim tarihini, durum geçmişini, mesajları ve görsel üzerine revizyon işaretlerini inceleyin.
5. **Demo Operator** hesabına geçerek aynı sürecin yönetici tarafını görün.

Gerçek Supabase bağlantısında demo hesap seçimi kapatılır. Tek dosya sınıra uysa bile biriken dosyalar toplam tarayıcı depolama alanını doldurabilir.

### Bilgisayarda çalıştırma

Gerekenler: Git, Node.js ve pnpm. Bu proje için **Node.js 24** ve `package.json` içinde sabitlenen **pnpm 11.19.0** kullanabilirsiniz. Kurulu Next.js paketinin belirttiği asgari Node.js sürümü 20.9.0'dır.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
pnpm install --frozen-lockfile
pnpm dev
```

Tarayıcıda [localhost:3000](http://localhost:3000) adresini açın. Proje zaten bilgisayarınızdaysa ilk iki adım yerine mevcut proje klasörünü açın.

Bağımlılıkların tekrarlanabilir kurulumu için tek kaynak `pnpm-lock.yaml` dosyasıdır. Farklı bir paket yöneticisiyle ikinci bir kilit dosyası üretmeyin.

### Gerçek servis bağlantısı

Supabase, kullanıcı hesapları, veritabanı ve dosya depolama için planlanan servistir. Bağlantıyı geliştirmek isteyenler proje kökünde `.env.local` dosyası oluşturup şu alanları kendi proje bilgileriyle doldurabilir:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Bu dosyayı GitHub'a yüklemeyin. Gizli yönetici anahtarlarını tarayıcı koduna veya `NEXT_PUBLIC_` alanlarına koymayın.

**Bu bilgileri eklemek siteyi gerçek satışa hazır hale getirmez.** Temel şema `supabase/schema.sql` dosyasındadır. Ardından uygulanmak üzere `supabase/migrations/20260907_access_hardening.sql` hazırlanmıştır; bu düzeltme canlı veritabanında henüz uygulanıp test edilmemiştir. Eksik servisler ve güvenlik kontrolleri tamamlanmalıdır. Mevcut veritabanında SQL dosyalarını incelemeden tekrar çalıştırmayın.

### Geliştiriciler için kısa rehber

Proje Next.js, React, TypeScript ve Tailwind CSS kullanır.

| Dosya / klasör | İçerik |
| --- | --- |
| `app/` | Sayfalar, müşteri ve yönetici panelleri |
| `components/` | Menü, teklif formu ve karşılaştırma gibi ortak parçalar |
| `lib/pricing.ts` | Fiyat hesaplama kuralları |
| `lib/services/` | Hesap, sipariş, içerik, dosya ve ödeme işlemleri |
| `messages/` | Türkçe, İngilizce ve Almanca metinler |
| `supabase/` | Veritabanı şeması ve güvenlik düzeltmeleri |
| `tests/` | Belirli hataların tekrar oluşmasını kontrol eden testler |

```sh
pnpm lint
pnpm build
pnpm test
```

10 Eylül 2026 güvenlik incelemesinde production derlemesi ve 11 test geçti. Kod kontrolünde hata veya uyarı, dependency taramasında bilinen güvenlik açığı bulunmadı. Bunlar canlı ödeme veya veritabanı testlerinin yerine geçmez.

Ayrıntılar: [siber güvenlik denetimi](SECURITY_AUDIT.md), [inceleme ve geliştirme raporu](REVIEW.md), [AI'lar için proje rehberi — İngilizce](llm.md), [geliştirme talimatları](AGENTS.md). AI asistanları değişiklik yapmadan önce son iki dosyayı okumalıdır.

---

<a id="english"></a>

## English

### What is Artlantix?

Artlantix is an ordering and customer management platform for a studio that redraws logos and artwork by hand. It is designed to manage the process of turning blurry logos, scanned drawings and AI-generated concepts into files for printing, apparel and signage.

A vector is a drawing that can be enlarged without losing image quality. Artlantix is built around work by human artists; the website does not automatically generate production vectors.

### Current status

This project is **a demo under development**. You can explore customer and operator screens, but real payments, file delivery and some account operations are not yet complete.

| Area | Available now | Still needed |
| --- | --- | --- |
| Homepage | Service information, example work and before/after comparisons. | Real client examples and complete translations. |
| Quote builder | Illustrated complexity choices, artist assessment, autosaved drafts, reorder prefills and estimated pricing. | Server-validated pricing and real checkout. |
| Customer portal | Order tracking, delivery estimates, notifications, messages, visual revision markers and approval flow. | End-to-end testing on live services and remaining portal translations. |
| Operator portal | Production queue, private preview/master upload in Supabase mode and content management. | Atomic operations and live database testing. |
| File archive | Demo files and a clearly labelled package manifest; signed private downloads in Supabase mode. | Real ZIP generation and live storage testing. |
| Business hub | Select multiple files and save a browser-local batch draft. | Actual batch upload, company approval and invoicing. |
| Accounts | Demo switching plus Supabase OAuth callback, password reset request and profile persistence. | End-to-end validation against a live Supabase project. |

A successful payment message does not mean a card was charged. Demo data stays in the browser, does not sync to other devices and may disappear when browser data is cleared. English, German and Turkish support is partial; the portal and some page content are still in English.

### Try the demo

1. Start the site using the instructions below. No Supabase account or API key is required for the demo.
2. Select **Demo Customer** from the top menu or login page to explore the customer experience.
3. Select a file in the quote builder and try the artwork options. This version accepts JPG/JPEG, PNG, WebP and PDF files up to **2 MB**.
4. Open an order to explore delivery dates, status history, messages and visual revision markers.
5. Switch to **Demo Operator** to see the production side of the workflow.

Demo account switching is disabled when a real Supabase connection is configured. Accumulated files may fill total browser storage even when individual files meet the upload limit.

### Run locally

Requirements: Git, Node.js and pnpm. This project can use **Node.js 24** and the **pnpm 11.19.0** version pinned in `package.json`. The installed Next.js package specifies a minimum Node.js version of 20.9.0.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
pnpm install --frozen-lockfile
pnpm dev
```

Open [localhost:3000](http://localhost:3000) in your browser. If you already have the project locally, open its existing folder instead of running the first two commands.

`pnpm-lock.yaml` is the single source for reproducible dependency installation. Do not generate a second lockfile with another package manager.

### Connecting real services

Supabase is the intended service for accounts, database and file storage. To develop the integration, create `.env.local` in the project root and enter your project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Do not upload this file to GitHub. Never place secret administrative keys in browser code or `NEXT_PUBLIC_` variables.

**Adding these values does not make the site ready for real sales.** The base schema is in `supabase/schema.sql`. The follow-up `supabase/migrations/20260907_access_hardening.sql` is intended to run afterward; it has not yet been applied and tested against a live database. Incomplete services and permission checks still need work. Review the SQL before rerunning it on an existing database.

### Quick developer guide

The project uses Next.js, React, TypeScript and Tailwind CSS.

| File / folder | Purpose |
| --- | --- |
| `app/` | Pages, customer portal and operator screens |
| `components/` | Shared navigation, quote forms and comparison elements |
| `lib/pricing.ts` | Pricing rules |
| `lib/services/` | Accounts, orders, content, files and payments |
| `messages/` | Turkish, English and German text |
| `supabase/` | Database schema and security updates |
| `tests/` | Regression tests for specific behavior |

```sh
pnpm lint
pnpm build
pnpm test
```

The September 10, 2026 security audit passed the production build and 11 tests. Lint reported no errors or warnings, and the dependency audit found no known vulnerabilities. These checks do not replace live payment or database integration tests.

Further reading: [security audit — Turkish](SECURITY_AUDIT.md), [audit and improvement report — Turkish](REVIEW.md), [project guide for AI assistants](llm.md), and [development instructions](AGENTS.md). AI assistants should read the last two documents before making changes.
