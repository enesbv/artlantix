# Artlantix — project context for AI assistants

Last reviewed: 2026-09-07. Read this document before changing the project. It describes the current implementation, not a promise of completed production features. Verify relevant source before relying on a statement; update this document when architecture or behavior changes.

## Purpose and product workflow

Artlantix is a manual vectorization and artwork reconstruction studio platform. Customers upload raster artwork, select reconstruction specifications, get a calculated estimate, and track orders. Operators review jobs, change production status, and prepare previews and final deliverables. Customers can request revisions, approve previews, and access an artwork archive. A B2B portal demonstrates batch ordering and invoicing concepts.

The site markets human redrawing, not automatic vector generation. Do not present generated demo artwork as a real production deliverable.

## Stack and entry points

- Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind CSS 4.
- next-intl for English, German, and Turkish; lucide-react icons.
- Optional Supabase browser client from `@supabase/ssr`; localStorage demo data when Supabase is unconfigured.
- `package.json` contains dev, build, and lint commands. Both npm and pnpm lockfiles currently exist: select the intended package manager before changing dependencies and avoid incidental lockfile churn.
- Next.js instructions live in `AGENTS.md`. Read applicable bundled documentation in `node_modules/next/dist/docs/` before writing framework code. Do not delete the Next-generated AGENTS block.

## Repository map

| Location | Responsibility |
| --- | --- |
| `app/[locale]/` | Localized public home and quote pages; next-intl provider |
| `app/page.tsx`, `app/quote/page.tsx` | English entry pages |
| `app/login`, `app/signup` | Authentication UI, currently not localized routes |
| `app/dashboard/` | Overview, orders and detail, artwork vault, business hub, profile |
| `app/admin/` | Operator orders and content management |
| `components/HomePageContent.tsx` | Public marketing, portfolio and pricing UI |
| `components/QuotePageContent.tsx` | Upload/specification/order wizard |
| `components/AccessGate.tsx` | Client-side account/role navigation gate, not a security boundary |
| `components/BeforeAfterSlider.tsx` | Artwork comparison and keyboard-accessible slider |
| `lib/types.ts` | Shared user, order, file, message, and pricing contracts |
| `lib/pricing.ts` | Base prices, add-ons, express multiplier, manual review rule |
| `lib/services/` | Authentication, orders, CMS, storage, simulated payments |
| `lib/mock-data.ts` | Demo personas, example orders and portfolio items |
| `lib/supabase/client.ts` | Optional browser client and configuration detection |
| `i18n/`, `messages/`, `lib/locale.ts` | Locale routing, dictionaries and preference persistence |
| `proxy.ts` | Public-page locale middleware |
| `supabase/schema.sql` | Initial tables and RLS/storage setup |
| `supabase/migrations/20260907_access_hardening.sql` | Follow-up role/ownership/status restrictions; apply after base schema |
| `tests/regressions.mjs` | Isolated regression tests using Node test runner and in-memory TypeScript transpilation |
| `REVIEW.md` | Detailed Turkish audit, implemented fixes and prioritized remaining work |

## Routing invariants

Public pages support `en`, `de`, `tr`, with the default English prefix optional. Dashboard and admin routes do **not** exist below a locale prefix. Login, signup, and auth routes are excluded from locale middleware. After a quote, navigate to `/dashboard/orders/<id>`, never `/tr/dashboard/...` or `/de/dashboard/...`.

The language selector preserves query parameters and hash, persists `NEXT_LOCALE`, and switches to the localized homepage from routes that are not localized. Panel and authentication translations remain unfinished; root HTML language is currently fixed to English.

## Demo versus real services

`isSupabaseConfigured()` checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, excluding recognized placeholders. No secret/service-role key may be placed in a NEXT_PUBLIC variable or client code.

Without Supabase, a first visit initializes the demo customer. Explicit sign-out stores JSON `null` so another read does not silently sign the user back in. Demo operator/customer switching is intentional in unconfigured mode. Demo data is browser-local and does not sync between devices.

With Supabase, auth must not fall back to a local demo identity. Role authority comes from the database profile, never editable auth user metadata. Demo account controls are disabled in this mode. Email signup without a session displays a confirmation notice.

Other services are not fully production-ready. Some CMS, messaging, profile and file operations still rely on local state or swallow remote errors. Do not claim that supplying environment variables completes the integration.

## Orders, pricing and files

- Order states: `quote_requested`, `in_review`, `in_progress`, `preview_ready`, `revision_requested`, `completed`, `cancelled`.
- New order IDs use UUIDs; existing demo order IDs retain their original strings.
- Base tiers: simple 25, standard 45, complex 75 USD. CMS can override base rates. Add-ons and express pricing are defined in `lib/pricing.ts`.
- Complex artwork plus reconstruction plus text triggers manual review. Customer choice to pay after review also starts at quote_requested.
- Pricing is currently calculated in the browser. A real payment flow must independently calculate and validate prices on the server.
- Quote submission validates file presence, rejects invalid tiers, reports errors and blocks simultaneous submissions. This is not durable server-side idempotency.
- Current upload helper accepts nonempty JPG/JPEG, PNG, WebP and PDF up to 2 MB, reading them as base64. It handles reader errors and cancellation. This small limit reflects current local storage, not the planned production storage capacity. Browser quota may still fill across multiple orders.
- Production uploads must use private object storage and persist paths rather than base64. Upload type/size validation must also be enforced server-side.
- `processCheckout` is simulated. It does not charge a card. Download helpers can generate placeholder content; the bundle helper produces a text manifest, not a real ZIP. Never mark these as complete payment or delivery integrations.
- Portfolio SVG content is displayed in an image context. Do not restore raw `dangerouslySetInnerHTML` insertion for uploaded SVG/HTML.

## Security and migration boundaries

Client-side gates improve navigation only. Enforce real ownership and permissions through database RLS and/or trusted server operations, including every mutation and file download.

The follow-up SQL migration prevents user metadata and profile updates from granting admin rights, constrains customer file/message inserts to owned orders, and limits customer order updates to preview approval/revision rather than arbitrary price/ownership edits. It has **not** been applied to or integration-tested against a live database. Do not assume deployed systems have these policies. Applying it needs a configured target and appropriate migration workflow.

Remaining critical gaps include client-controlled order INSERT pricing/status, public preview storage, missing CMS schema/bucket definitions, incomplete payment/approval coupling, and non-atomic order-plus-file creation. Review existing admin grants separately; the migration does not revoke previously granted roles.

## Verification

Use a compatible installed Node runtime; this project was verified with the bundled Node runtime available on the development machine. Do not hardcode a contributor's machine-specific runtime path in repository commands.

```sh
npm run dev
npm run lint
npm run build
node --test tests/regressions.mjs
git diff --check
```

Latest audit: production build/TypeScript passed; all five regression tests passed; ESLint had zero errors and four native-image optimization warnings. Browser checks covered login routing, customer redirect away from admin, and the Turkish quote page with an invalid tier. No Lighthouse score, complete mobile audit, live payment test, or live SQL migration test was performed.

Tests isolate auth/storage and exercise the real pricing source. They are not substitutes for database RLS and payment integration tests. Add meaningful regressions for changed behavior, not tests that merely match source text.

## Priorities for future work

1. Real server-validated checkout, durable order/payment records and verified webhook processing.
2. Private uploads, real previews/master files and actual downloadable ZIP bundles.
3. Complete OAuth callback (`/auth/callback` is referenced but absent), password recovery, session lifecycle and profile persistence.
4. Complete and test database/CMS policies; remove misleading fallback success in remote mode.
5. Finish translations and language metadata; persist quote drafts through authentication.
6. Paginate order lists, fetch message/file detail only when needed, reduce homepage client work, and measure actual loading performance.
7. Real B2B batch processing, delivery deadlines, visual revision annotations and reorder templates.

## Keeping this context useful

Update this document and the audit when fixing a listed limitation. Clearly distinguish local changes, committed code, pushed code, deployed code and applied database migrations. Use Git history for current revision status instead of maintaining a hardcoded commit hash here. Do not report tests, deployments, integrations or performance improvements that have not been verified.
