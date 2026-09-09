# Artlantix — project context for AI assistants

Last reviewed: 2026-09-10. Read this document before changing the project. It describes the current implementation, not a promise of completed production features. Verify relevant source before relying on a statement; update this document when architecture or behavior changes.

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
| `components/ComplexityPicker.tsx` | Illustrated detail-level and artist-assessment selector |
| `components/OrderNotifications.tsx` | Portal notification polling and dismissal |
| `components/RevisionAnnotator.tsx` | Percentage-based artwork revision markers |
| `components/AccessGate.tsx` | Client-side account/role navigation gate, not a security boundary |
| `components/BeforeAfterSlider.tsx` | Artwork comparison and keyboard-accessible slider |
| `lib/types.ts` | Shared user, order, file, message, and pricing contracts |
| `lib/pricing.ts` | Base prices, add-ons, express multiplier, manual review rule |
| `lib/order-status.ts` | Delivery estimates, next actions, labels and history fallbacks |
| `lib/services/` | Authentication, orders, CMS, storage, simulated payments |
| `lib/mock-data.ts` | Demo personas, example orders and portfolio items |
| `lib/supabase/client.ts` | Optional browser client and configuration detection |
| `i18n/`, `messages/`, `lib/locale.ts` | Locale routing, dictionaries and preference persistence |
| `proxy.ts` | Public-page locale middleware |
| `app/auth/callback/route.ts` | Supabase OAuth code exchange and safe redirect |
| `supabase/schema.sql` | Initial tables and RLS/storage setup |
| `supabase/migrations/20260907_access_hardening.sql` | Follow-up role/ownership/status restrictions; apply after base schema |
| `tests/regressions.mjs` | Isolated regression tests using Node test runner and in-memory TypeScript transpilation |
| `REVIEW.md` | Detailed Turkish audit, implemented fixes and prioritized remaining work |

## Routing invariants

Public pages support `en`, `de`, `tr`, with the default English prefix optional. Dashboard and admin routes do **not** exist below a locale prefix. Login, signup, and auth routes are excluded from locale middleware. After a quote, navigate to `/dashboard/orders/<id>`, never `/tr/dashboard/...` or `/de/dashboard/...`.

The language selector preserves query parameters and hash and persists `NEXT_LOCALE`. On dashboard/auth routes it refreshes the current route instead of navigating away. The root provider and HTML `lang` use that cookie; public pages have nested locale providers. Public navigation, footer, quote flow, dashboard shell and order list are translated. Several detail, account, B2B and admin strings remain English.

## Demo versus real services

`isSupabaseConfigured()` checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, excluding recognized placeholders. No secret/service-role key may be placed in a NEXT_PUBLIC variable or client code.

Without Supabase, a first visit initializes the demo customer. Explicit sign-out stores JSON `null` so another read does not silently sign the user back in. Demo operator/customer switching is intentional in unconfigured mode. Demo data is browser-local and does not sync between devices.

With Supabase, auth must not fall back to a local demo identity. Role authority comes from the database profile, never editable auth user metadata. Demo account controls are disabled in this mode. Email signup without a session displays a confirmation notice.

Supabase mode includes OAuth callback exchange, password-reset email requests, database-backed profile updates, database-backed messages, CMS tables/policies and private customer/preview storage paths. Remote mutations now surface failures rather than reporting local fallback success. The SQL still has to be applied and tested on a real project. Do not claim that supplying environment variables completes the integration.

## Orders, pricing and files

- The visual brand accent uses a Radix-inspired green scale: `#18794E` for primary actions and text, `#115C3B` for hover states, `#E9F9EE` for soft surfaces, and `#B4DFC4` for accent borders. Amber remains reserved for semantic pending/warning states rather than brand decoration.
- Order states: `quote_requested`, `in_review`, `in_progress`, `preview_ready`, `approved`, `revision_requested`, `completed`, `cancelled`. Customer approval enters `approved`; only an operator delivery moves the order to `completed`.
- New order IDs use UUIDs; existing demo order IDs retain their original strings.
- Base tiers: simple 25, standard 45, complex 75 USD. CMS can override base rates. Add-ons and express pricing are defined in `lib/pricing.ts`.
- Complex artwork plus reconstruction plus text triggers manual review. Customer choice to pay after review also starts at quote_requested.
- `components/ComplexityPicker.tsx` provides localized illustrated detail levels and an explicit artist-assessment choice. `PricingInput.artistReviewRequested` forces manual review regardless of tier. The previous tier remains a provisional estimate, recorded as such in order notes. Review checkout shows zero due now and uses the existing deferred-payment flow. This does not implement live payments or server-side price approval.
- Quote form state is debounced into a browser-local draft and restored after navigation. A prior order can prefill a new quote through `?reorder=<order-id>`. File objects themselves are not serializable; the local demo stores a small data URL while production users may need to choose the file again after a reload.
- Orders have expected-delivery metadata, status-history fallbacks, a next-action panel, notification polling and visual revision annotations. Stored coordinates use percentages so they remain aligned responsively.
- Pricing is currently calculated in the browser. A real payment flow must independently calculate and validate prices on the server.
- Quote submission validates file presence, rejects invalid tiers, reports errors and blocks simultaneous submissions. This is not durable server-side idempotency.
- Current upload helper accepts nonempty JPG/JPEG, PNG, WebP and PDF up to 2 MB, reading them as base64. It handles reader errors and cancellation. This small limit reflects current local storage, not the planned production storage capacity. Browser quota may still fill across multiple orders.
- Production uploads must use private object storage and persist paths rather than base64. Upload type/size validation must also be enforced server-side.
- `processCheckout` is simulated and the checkout UI says so. It does not charge a card or issue an invoice. Demo file downloads can generate representative content; the package action is explicitly a text manifest, not a ZIP. In Supabase mode individual stored files use signed URLs.
- Supabase customer uploads are sent to a private user/order path before order metadata is inserted. Operator preview/master actions require a real file in Supabase mode and store it in the matching bucket. Upload plus database writes are not atomic, so a failed later write can leave an orphan object.
- Portfolio SVG content is displayed in an image context. Do not restore raw `dangerouslySetInnerHTML` insertion for uploaded SVG/HTML.

## Security and migration boundaries

Client-side gates improve navigation only. Enforce real ownership and permissions through database RLS and/or trusted server operations, including every mutation and file download.

The follow-up SQL migration prevents user metadata and profile updates from granting admin rights, constrains customer file/message inserts to owned orders, and limits customer order updates to preview approval/revision rather than arbitrary price/ownership edits. It has **not** been applied to or integration-tested against a live database. Do not assume deployed systems have these policies. Applying it needs a configured target and appropriate migration workflow.

The migration recalculates inserted prices from CMS rates and selected options, overwrites client status, and keeps every remote order at `quote_requested` until a future verified payment flow advances it. Remaining critical gaps include the missing live payment/webhook records, non-atomic upload/order/file operations and lack of live database integration tests. Preview storage is private and CMS tables/bucket policies are included, but the migration has not been applied. Review existing admin grants separately; the migration does not revoke previously granted roles.

## Verification

Use a compatible installed Node runtime; this project was verified with the bundled Node runtime available on the development machine. Do not hardcode a contributor's machine-specific runtime path in repository commands.

```sh
npm run dev
npm run lint
npm run build
node --test tests/regressions.mjs
git diff --check
```

Latest audit: production build/TypeScript passed; all eight regression tests passed; ESLint had zero errors and zero warnings. Browser checks covered the Turkish quote flow, translated footer/navigation, dashboard language switching and responsive order-card rendering. No Lighthouse score, live payment test or live SQL migration test was performed.

Tests isolate auth/storage and exercise the real pricing source. They are not substitutes for database RLS and payment integration tests. Add meaningful regressions for changed behavior, not tests that merely match source text.

## Priorities for future work

1. Real server-validated checkout, durable order/payment records, idempotency and verified webhook processing.
2. Atomic order/upload creation, actual archive generation and live private-storage/RLS integration tests.
3. Apply and validate the database migration, OAuth, confirmation and password recovery against a configured Supabase project.
4. Finish translations for detail/account/B2B/admin content and add localized metadata.
5. Add server-side order-list pagination, reduce homepage client work and measure LCP/INP with production media.
6. Replace the B2B draft demonstration with approved company accounts, batch uploads, per-file quotes and real invoicing.

## Keeping this context useful

Update this document and the audit when fixing a listed limitation. Clearly distinguish local changes, committed code, pushed code, deployed code and applied database migrations. Use Git history for current revision status instead of maintaining a hardcoded commit hash here. Do not report tests, deployments, integrations or performance improvements that have not been verified.
