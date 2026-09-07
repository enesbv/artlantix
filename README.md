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
| Fiyat teklifi | Dosya seçimi; karmaşıklık, renk, yazı onarımı ve teslim hızına göre tahmini ücret. | Sunucuda fiyat doğrulama ve gerçek ödeme. |
| Müşteri paneli | Demo sipariş takibi, mesajlar, revizyon ve onay akışı. | Bütün işlemlerin kalıcı ve cihazlar arasında ortak veriye bağlanması. |
| Yönetici paneli | Demo üretim kuyruğu ve içerik düzenleme ekranları. | Veritabanı, dosya yükleme ve yetki kontrollerinin tamamlanması. |
| Dosya arşivi | Teslim dosyalarının nasıl listeleneceğini gösteren ekranlar. | Gerçek dosyalar ve gerçek ZIP indirme. Bazı indirmeler örnek içerik veya metin dosyasıdır. |
| Kurumsal bölüm | Toplu sipariş ve faturalandırma ekranları. | Gerçek toplu işlem kuyruğu, şirket onayı ve fatura akışı. |
| Üyelik | Demo hesap geçişi ve kısmi Supabase bağlantısı. | Google giriş dönüşü, şifre kurtarma ve profil kaydının tamamlanması. |

Ödeme ekranındaki başarı, gerçek kart tahsilatı yapıldığı anlamına gelmez. Demo verileri tarayıcıda tutulur; başka cihazlara taşınmaz ve tarayıcı verileri temizlenince kaybolabilir. Türkçe, İngilizce ve Almanca desteği başlamıştır; panel ve bazı sayfa metinleri hâlâ İngilizcedir.

### Site nasıl denenir?

1. Aşağıdaki kurulum adımlarıyla siteyi açın. Demo için Supabase hesabı veya API anahtarı gerekmez.
2. Üst menüden veya giriş sayfasından **Demo Customer** hesabını seçerek müşteri ekranlarını inceleyin.
3. Fiyat teklifi bölümünde dosya seçip çizim seçeneklerini deneyin. Bu sürüm JPG/JPEG, PNG, WebP ve PDF kabul eder; dosya sınırı **2 MB**'tır.
4. Sipariş detayında mesaj, revizyon ve onay ekranlarını inceleyin.
5. **Demo Operator** hesabına geçerek aynı sürecin yönetici tarafını görün.

Gerçek Supabase bağlantısında demo hesap seçimi kapatılır. Tek dosya sınıra uysa bile biriken dosyalar toplam tarayıcı depolama alanını doldurabilir.

### Bilgisayarda çalıştırma

Gerekenler: Git, Node.js ve npm. Bu proje için **Node.js 24** kullanabilirsiniz. Kurulu Next.js paketinin belirttiği asgari sürüm 20.9.0'dır.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
npm install
npm run dev
```

Tarayıcıda [localhost:3000](http://localhost:3000) adresini açın. Proje zaten bilgisayarınızdaysa ilk iki adım yerine mevcut proje klasörünü açın.

Depoda npm ve pnpm kilit dosyaları birlikte bulunuyor. Bu rehber npm kullanır; bağımlılıkları değiştirirken paket yöneticilerini gelişigüzel değiştirmeyin.

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
npm run lint
npm run build
node --test tests/regressions.mjs
```

7 Eylül 2026 incelemesinde derleme ve 5 test geçti. Kod kontrolünde hata yoktu; görsel optimizasyonu için 4 uyarı kaldı. Bunlar canlı ödeme veya veritabanı testlerinin yerine geçmez.

Ayrıntılar: [inceleme ve geliştirme raporu](REVIEW.md), [AI'lar için proje rehberi — İngilizce](llm.md), [geliştirme talimatları](AGENTS.md). AI asistanları değişiklik yapmadan önce son iki dosyayı okumalıdır.

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
| Quote builder | File selection and estimated pricing based on complexity, colors, text repair and turnaround. | Server-validated pricing and real checkout. |
| Customer portal | Demo orders, messages, revisions and approval flow. | Consistent, permanent data shared across devices. |
| Operator portal | Demo production queue and content editing screens. | Complete database, upload and permission integration. |
| File archive | A demonstration of how deliverables are listed. | Real files and ZIP downloads. Some current downloads contain sample content or plain text. |
| Business hub | Batch ordering and invoicing screens. | Actual batch processing, company approval and invoicing. |
| Accounts | Demo account switching and partial Supabase integration. | Google sign-in callback, password recovery and profile persistence. |

A successful payment message does not mean a card was charged. Demo data stays in the browser, does not sync to other devices and may disappear when browser data is cleared. English, German and Turkish support is partial; the portal and some page content are still in English.

### Try the demo

1. Start the site using the instructions below. No Supabase account or API key is required for the demo.
2. Select **Demo Customer** from the top menu or login page to explore the customer experience.
3. Select a file in the quote builder and try the artwork options. This version accepts JPG/JPEG, PNG, WebP and PDF files up to **2 MB**.
4. Open an order to explore messages, revisions and approval.
5. Switch to **Demo Operator** to see the production side of the workflow.

Demo account switching is disabled when a real Supabase connection is configured. Accumulated files may fill total browser storage even when individual files meet the upload limit.

### Run locally

Requirements: Git, Node.js and npm. **Node.js 24** can be used for this project. The installed Next.js package specifies a minimum of Node.js 20.9.0.

```sh
git clone https://github.com/enesbv/artlantix.git
cd artlantix
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000) in your browser. If you already have the project locally, open its existing folder instead of running the first two commands.

The repository currently contains both npm and pnpm lockfiles. This guide uses npm; avoid switching package managers casually when changing dependencies.

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
npm run lint
npm run build
node --test tests/regressions.mjs
```

The September 7, 2026 audit passed the production build and five tests. Lint reported no errors and four image optimization warnings. These checks do not replace live payment or database integration tests.

Further reading: [audit and improvement report — Turkish](REVIEW.md), [project guide for AI assistants](llm.md), and [development instructions](AGENTS.md). AI assistants should read the last two documents before making changes.
