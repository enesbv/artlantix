# Artlantix: context for AI assistants

Last reviewed: 2026-10-05, against `main` at `362154a` (v0.7.0) plus open draft PRs #2 to #5. Read this before changing anything. It describes what the code does today, not what production services have been set up. Verify against the source before relying on a statement, and update this file when behavior changes.

Where something is not known, this file says **Unknown**. Do not fill those gaps with guesses.

## 1. Rules from the owner (read first)

The owner is Enes (GitHub `enesbv`). He writes in Turkish and works on the business with his father.

1. **Do not touch the UI.** On 2026-09-29 the owner rejected three AI-made homepage redesigns and said he will do all UI and visual design himself. Agents must not change layout, styling, components' look, fonts, colors or illustrations. PR #1 (homepage redesign) was closed for this reason. Copy fixes that leave every `className` unchanged were accepted as a separate PR (#5). When unsure whether something counts as UI, ask.
2. **No monospace type.** `tests/regressions.mjs` fails if any `.ts/.tsx/.css` file contains `font-mono`, `Geist_Mono` or `font-geist-mono`. The interface uses Geist Sans only.
3. **Never present demos as real.** Case studies, the before/after slider and seeded orders are labelled studio demonstrations. Do not invent testimonials, customer names, performance numbers or production claims.
4. **No fake payment.** The product is quote-first: no checkout, no card charge, no invoice. Do not add payment success states.
5. **Live services are the owner's job.** Do not create, configure or write to a live Supabase project, ClamAV deployment, Resend account, domain or hosting. Prepare code and give the owner short steps instead.
6. **Work on branches.** Branch from `main` and open draft PRs. Do not push to `main`.

## 2. Product

Artlantix is a manual vectorization and artwork reconstruction studio. People redraw artwork by hand; nothing is auto-traced. Customers upload raster artwork (AI-generated logos, blurry logos, old scans), choose a detail level and options, see a provisional estimate, and send a quote request. The studio reviews it, confirms price and scope, draws, shares a preview, takes approval or revision requests, and delivers master files to the customer's private archive.

Services listed in `lib/marketing.ts`: AI/blurry logo vectorization, lettering and logotype reconstruction, mascots and badges, screen print / DTF colour separation, CNC/laser/vinyl-ready closed paths, embroidery-ready simplification. Optional agency add-ons: brand identity, alternative logo and social media kit (USD 50 each).

Users:
- **Customer:** quote wizard, order tracker at `/dashboard`, order detail with preview approval, revision markers, chat and downloads.
- **Business customer:** batch quote hub at `/dashboard/business` (up to 20 files, one quote per file). No volume discounts or invoicing.
- **Operator (admin):** order workspace at `/admin/orders`, CMS at `/admin/content`.

## 3. Market and languages

- **Target market: United States and the European Union** (owner, 2026-09-29). Turkey is not a launch market.
- **Languages: English (default), German, Turkish.** English and German are for customers. Turkish exists so the owner and his father can read and run the site.
- Copy standard: natural **US English**, **formal German (Sie)**, **formal Turkish (siz)**. A native speaker must not find anything awkward. PR #5 applies this across the site.
- Legal: GDPR applies for EU customers, plus a US privacy notice. KVKK is not the target. **There is no privacy policy, terms or imprint page yet**; the footer only shows a short text. This is a launch blocker the owner must decide on.
- Prices are in USD.

## 4. Stack

- Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind CSS 4. This Next.js version has breaking changes; read `AGENTS.md` and the docs in `node_modules/next/dist/docs/` before writing framework code. Do not delete the Next-generated block in `AGENTS.md`.
- next-intl 4 (`i18n/routing.ts`: locales `en`, `de`, `tr`, default `en`, `localePrefix: 'as-needed'`).
- Supabase (Auth, Postgres with RLS, private Storage) via `@supabase/ssr` and `@supabase/supabase-js`.
- react-hook-form + zod, lucide-react icons, clsx/tailwind-merge.
- pnpm 11.19.0 (pinned in `package.json`). `pnpm-lock.yaml` is the only lockfile; CI uses `--frozen-lockfile`. **pnpm 11 needs Node 22+** (it uses `node:sqlite`); on Node 20 it does not start.
- Malware scanning: a private ClamAV HTTP adapter in `infra/malware-scanner/`.
- Order emails: Resend (server only, not configured).
- Hosting: **Unknown / not chosen.** Vercel was suggested in an earlier thread but nothing is set up.

## 5. Commands

```sh
pnpm install --frozen-lockfile
pnpm dev            # local site, demo mode on by default in development
pnpm test           # node --test: tests/regressions.mjs + infra/malware-scanner/scanner.test.mjs
pnpm lint
pnpm build          # production build incl. TypeScript
git diff --check

# Local database (needs Docker; in a cloud container start dockerd in the background first)
pnpm db:start       # supabase start
pnpm db:reset       # rebuild DB from supabase/migrations
pnpm db:test        # pgTAP tests in supabase/tests/database
pnpm db:lint
pnpm scanner:up / pnpm scanner:down   # local ClamAV adapter via docker compose
```

CI (`.github/workflows/ci.yml`) has two jobs: `verify` (test, lint, build) and `database-security` (db start/reset/test/lint). **On `main` CI is red**: it still uses Node 20, and `db reset` fails because the base schema is not a migration. PR #2 fixes both. PR #5 also carries that fix.

Tests transpile real TypeScript sources in memory with mocked auth/storage. Add regressions for behavior you change, not tests that only match source text. pgTAP storage deletes need `SET LOCAL storage.allow_delete_query = 'true'`.

## 6. Demo mode vs Supabase

`lib/runtime-mode.ts` decides the mode:
- **Development:** demo mode is on unless `NEXT_PUBLIC_DEMO_MODE=false`. Data lives in the browser's localStorage.
- **Production:** demo mode is off unless `NEXT_PUBLIC_DEMO_MODE=true`. Without Supabase, auth and mutations fail closed, and `/api/health` returns 503.

`isSupabaseConfigured()` (`lib/supabase/client.ts`) checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, ignoring placeholders. See `.env.example` for all variables. Never put a service-role key or other secret in a `NEXT_PUBLIC_` variable or client code.

Demo specifics: login as `artlantix@admin.com` opens the admin panel, `artlantix@customer.com` the customer panel. One seeded order (`ord_atx_9480`). Signed-out visitors can place a browser-local guest order with name and email; this exists **only in demo** and is not a production guest flow.

**Current real state:** the owner runs the site locally in demo mode only. He has **not** created or configured a Supabase project (owner, 2026-09-29). Older docs (`SECURITY_AUDIT.md`, `REVIEW.md`, earlier versions of this file) say a live project `lsgrbyyatcssrrkvmxmg` received the schema on 2026-09-16. The owner says he never set one up, so treat that claim as unverified and do not rely on any live database existing. Supabase is needed only before real customers arrive.

In Supabase mode: role comes from the `profiles` table, never from user metadata; auth never falls back to a demo identity; remote failures are shown, not hidden.

## 7. Repository map

| Path | What it is |
| --- | --- |
| `app/[locale]/` | Public localized pages: home, quote, services(+slug), work(+slug), pricing, guides(+slug), faq, business |
| `app/page.tsx`, `app/quote/page.tsx` | Unprefixed English entry pages |
| `app/login`, `app/signup`, `app/reset-password`, `app/auth/callback` | Auth (not under a locale prefix) |
| `app/dashboard/` | Customer tracker, order detail, artwork vault, business hub, account |
| `app/admin/` | Operator orders and CMS |
| `app/api/health`, `app/api/orders/receipt`, `app/api/uploads/scan` | Health check, Resend receipt email, server-only malware scan |
| `app/tr1/` | Temporary noindex copy of the previous Turkish homepage (`PreviousHomePageContent.tsx`); candidate for removal |
| `components/` | All UI. Off limits for agents (see rule 1) |
| `lib/pricing.ts` | Tiers, add-ons, express multiplier, manual-review rule |
| `lib/marketing.ts` | Localized service, case study, guide and FAQ catalogue |
| `lib/services/` | auth, orders, content (CMS), storage, quote drafts |
| `lib/order-status.ts`, `lib/customer-tracking.ts`, `lib/delivery-calculator.ts` | Status labels, milestones, delivery estimates |
| `lib/admin-orders.ts` | Operator alert derivation |
| `lib/security.ts` | Input validation and safe redirects |
| `lib/mock-data.ts` | Demo personas and orders |
| `lib/types.ts` | Shared types |
| `i18n/`, `messages/{en,de,tr}.json`, `lib/locale.ts`, `proxy.ts` | Locale routing, dictionaries, locale middleware |
| `supabase/schema.sql` | Declarative schema: tables, RLS, storage policies |
| `supabase/migrations/` | Timestamped migrations (renamed and extended by PR #2) |
| `supabase/tests/database/` | pgTAP tests |
| `infra/malware-scanner/` | ClamAV adapter, Dockerfile, compose file, protocol test |
| `tests/regressions.mjs` | Node regression tests |
| `SECURITY_AUDIT.md`, `REVIEW.md` | Security findings and release review (Turkish) |
| `RELEASE_NOTES_*.md` | Release notes (Turkish) |

## 8. Routing invariants

- Public pages exist under `en` (no prefix), `/de` and `/tr`.
- `/dashboard`, `/admin`, `/login`, `/signup` and auth routes are **never** under a locale prefix. After a quote, go to `/dashboard/orders/<id>`, never `/tr/dashboard/...`.
- The language switcher keeps query and hash and stores `NEXT_LOCALE`. On dashboard/auth routes it refreshes instead of navigating.
- `/admin/orders` is the only order list (operators only). `/dashboard/orders` redirects there. Customers track orders at `/dashboard`.
- Account, B2B and admin screens still have some English-only strings.

## 9. Orders, pricing and files

- Statuses: `quote_requested`, `in_review`, `in_progress`, `preview_ready`, `approved`, `revision_requested`, `completed`, `cancelled`. Customer approval sets `approved`; only an operator delivery sets `completed`, which unlocks downloads.
- Every submission starts as `quote_requested` with `pay_after_quote_review`. The shown price is provisional. The database insert trigger recalculates the price from CMS rates and overwrites the client's status.
- Tiers (`lib/pricing.ts`): simple 25, standard 45, complex 75 USD. CMS can override them. Express is ×1.35 on the vector part only; agency add-ons are added after it.
- Manual review: complex + reconstruction + text, or the customer picks "artist assessment". The public "Contact us" card opens the quote with `review=1` and hides the estimate.
- Customer uploads: JPG/JPEG, PNG, WebP, PDF, up to 2 MB, checked by extension, MIME and magic bytes. Uploads start with `scan_status=pending`; operators can only open `clean` files.
- Supabase uploads go to a private user/order path, then `create_order_with_file` writes order and file rows in one transaction. If it fails, the client deletes the unattached object.
- Operator delivery on `main` is three separate steps (upload, file row, status). PR #4 makes it one RPC (`record_operator_delivery`) with cleanup on failure.
- Resend receipt email (`/api/orders/receipt`): verified authenticated owner only, same-origin check, recipient from auth. `RESEND_API_KEY` and `ORDER_EMAIL_FROM` are not configured; no outbox or delivery webhook.
- Uploaded SVG is shown in an image context only. Never use raw `dangerouslySetInnerHTML` for uploaded content.

## 10. Security model

- Client gates (`AccessGate`) are navigation only. Real permissions are Postgres RLS and Storage policies plus server routes.
- Customers see only their own profile, orders, messages and files. They cannot change role, price, ownership or set arbitrary status.
- Buckets are private; downloads use short-lived signed URLs.
- `next.config.ts` sets CSP (with `unsafe-inline`), HSTS, frame, nosniff, referrer and permissions headers.
- `SECURITY_AUDIT.md` verdict: **CONDITIONAL NO-GO** for real customer files until the launch blockers below are done.

## 11. Open PRs (as of 2026-10-05)

All are drafts with green CI and none is merged. Merge order: **#2 → #3 → #4**. #5 is independent but already contains #2's changes.

- **#2 `fix/db-migrations`**: base schema added as migration `20260901000000_base_schema.sql`, migrations renamed to full timestamps (two shared `20260916`), CI on Node 22. Live databases built by hand need `supabase migration repair --status applied <version>` before any `db push`.
- **#3 `test/tenant-matrix`**: 26-check pgTAP allow/deny matrix for two customers and one operator across tables and buckets (audit H-01, local only).
- **#4 `fix/atomic-operator-delivery`**: `record_operator_delivery` RPC and an admin delete policy for unattached preview/master objects (audit H-03).
- **#5 `fix/copy-review`**: EN/DE/TR proofreading for the US/EU launch, softened claims the product can't back. Copy only.

Several of these PRs also edit this file. When they merge, keep the facts in this version and update section 11.

## 12. Open decisions (owner has not answered)

Do not resolve these yourself; ask the owner.

1. **Prices:** service pages in `lib/marketing.ts` show starting prices of $40, $50 and $55 for some services, while the tiers are $25/$45/$75. Which is right?
2. **Turnaround:** services promise fixed times (24–48 hours, 2–4 days, 24–72 hours) and `lib/pricing.ts` labels standard 24–48h and express <12–16h. Can the studio commit to these?
3. **Order page claims:** every order shows a fixed "0.01 mm tolerance", "5 formats" and "Round 1 of 2" revisions. Are two revision rounds actually offered?
4. **Legal pages:** privacy policy (GDPR + US), terms, and an imprint for Germany.
5. **Hosting and domain:** not chosen.
6. **`/tr1` route:** temporary; remove when the owner no longer needs it.

## 13. Launch blockers (owner's steps, not code)

1. Create the Supabase project, apply migrations, set env vars.
2. Run the tenant matrix against that project (H-01).
3. Deploy ClamAV and test with a clean file and EICAR; set `MALWARE_SCANNER_URL` and `MALWARE_SCANNER_TOKEN` (H-02).
4. Resend: API key and verified sender domain.
5. Supabase Auth: email confirmation, exact redirect URLs, rate limits, CAPTCHA, leaked-password check, admin MFA.
6. Hosting, domain, legal pages, then an end-to-end smoke test (signup, upload, quote, preview, revision, delivery).

Code work still open after the PRs: idempotency keys for quotes and deliveries, periodic orphan-object cleanup, server-side order pagination, audit log, finishing account/B2B/admin translations, a production guest-order flow with email verification (never expose an order by number or email alone).

## 14. Keeping this file honest

Distinguish clearly between local changes, committed, pushed, merged, deployed and applied-to-database. Do not report tests, deployments or integrations you have not run. Use Git history for revision status instead of hardcoding commit hashes beyond the review line at the top.
