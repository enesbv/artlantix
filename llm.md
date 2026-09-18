# Artlantix — project context for AI assistants

Last reviewed: 2026-09-18. Read this document before changing the project. It describes the current implementation, not a promise that external production services have been configured. Verify relevant source before relying on a statement; update this document when architecture or behavior changes.

## Purpose and product workflow

Artlantix is a manual vectorization and artwork reconstruction studio platform. Customers upload raster artwork, select reconstruction specifications, request a studio-reviewed quote, and track orders. Operators review jobs, change production status, and prepare previews and final deliverables. Customers can request revisions, approve previews, and access an artwork archive. The B2B portal creates real per-file quote requests from a multi-file batch.

The site markets human redrawing, not automatic vector generation. Do not present generated demo artwork as a real production deliverable.

Public pricing grids (home, comparison home, pricing and business) include a fourth, price-free Contact us option for complex artwork and business/custom scopes. It opens the quote wizard with `review=1`; the detail-level picker also offers this choice to all customers. Its summary hides the automatic vector estimate and leaves price and delivery subject to studio review. The existing internal estimate remains in the order contract; the request is explicitly marked in notes and requires operator review before any agreed price.

## Stack and entry points

- Next.js 16.3.4 App Router, React 19.2.8, TypeScript, Tailwind CSS 4.
- next-intl for English, German, and Turkish; lucide-react icons.
- Supabase browser client from `@supabase/ssr` for production. localStorage mock data is allowed only in development or with explicit `NEXT_PUBLIC_DEMO_MODE=true`; production fails closed without Supabase.
- `package.json` pins pnpm 11.19.0. `pnpm-lock.yaml` is the only dependency lockfile; use frozen-lockfile installs in CI and do not add a second package-manager lockfile.
- Next.js instructions live in `AGENTS.md`. Read applicable bundled documentation in `node_modules/next/dist/docs/` before writing framework code. Do not delete the Next-generated AGENTS block.

## Repository map

| Location | Responsibility |
| --- | --- |
| `app/[locale]/` | Localized public home, quote, services, work, pricing, guides and FAQ pages; next-intl provider |
| `app/page.tsx`, `app/quote/page.tsx` | English entry pages |
| `app/login`, `app/signup` | Authentication UI, currently not localized routes |
| `app/dashboard/` | Overview, orders and detail, artwork vault, business hub, profile |
| `app/admin/` | Operator orders and content management |
| `components/HomePageContent.tsx` | Public marketing, portfolio and pricing UI |
| `lib/marketing.ts` | Type-safe Turkish, English and German service, case-study, guide and public FAQ catalogue |
| `components/ServiceVisual.tsx` | Six code-native service illustrations displayed in homepage service cards |
| `components/MarketingVisual.tsx` | Code-native localized production artwork used across public marketing pages |
| `components/QuotePageContent.tsx` | Upload/specification/order wizard |
| `components/ComplexityPicker.tsx` | Illustrated detail-level and artist-assessment selector |
| `components/OrderNotifications.tsx` | Portal notification polling and dismissal |
| `components/RevisionAnnotator.tsx` | Percentage-based artwork revision markers |
| `components/AccessGate.tsx` | Client-side account/role navigation gate, not a security boundary |
| `components/BeforeAfterSlider.tsx` | Artwork comparison and keyboard-accessible slider |
| `lib/types.ts` | Shared user, order, file, message, and pricing contracts |
| `lib/pricing.ts` | Base prices, add-ons, express multiplier, manual review rule |
| `lib/order-status.ts` | Delivery estimates, next actions, labels and history fallbacks |
| `lib/services/` | Authentication, orders, CMS and private storage workflows |
| `lib/mock-data.ts` | Demo personas, example orders and portfolio items |
| `lib/supabase/client.ts` | Optional browser client and configuration detection |
| `i18n/`, `messages/`, `lib/locale.ts` | Locale routing, dictionaries and preference persistence |
| `proxy.ts` | Public-page locale middleware |
| `app/auth/callback/route.ts` | Supabase OAuth code exchange and safe redirect |
| `supabase/schema.sql` | Initial tables and RLS/storage setup |
| `supabase/migrations/20260907_access_hardening.sql` | Follow-up role/ownership/status restrictions; apply after base schema |
| `supabase/migrations/20260916_production_workflows.sql` | Atomic order/file metadata RPC and narrowly scoped failed-upload cleanup policy |
| `supabase/migrations/20260916_security_advisor_hardening.sql` | Revokes Data API execution from trigger-only security-definer functions; policy helpers remain intentional boolean-only calls |
| `supabase/config.toml`, `supabase/tests/database/` | Local Supabase config and pgTAP tenant/RLS tests; requires Docker-compatible runtime |
| `infra/malware-scanner/` | Private ClamAV HTTP adapter, container topology and protocol regression test |
| `tests/regressions.mjs` | Isolated regression tests using Node test runner and in-memory TypeScript transpilation |
| `SECURITY_AUDIT.md` | Production security findings, applied code fixes, open deployment risks and release verdict |
| `REVIEW.md` | Detailed Turkish audit, implemented fixes and prioritized remaining work |

## Routing invariants

Public pages support `en`, `de`, `tr`, with the default English prefix optional. Dashboard and admin routes do **not** exist below a locale prefix. Login, signup, and auth routes are excluded from locale middleware. After a quote, navigate to `/dashboard/orders/<id>`, never `/tr/dashboard/...` or `/de/dashboard/...`.

The language selector preserves query parameters and hash and persists `NEXT_LOCALE`. On dashboard/auth routes it refreshes the current route instead of navigating away. The root provider and HTML `lang` use that cookie; public pages have nested locale providers. Public navigation, footer, marketing pages and quote flow are translated. Several account, B2B and admin strings remain English.

The public `/business` page in all three locales targets sign manufacturers, print/card producers, apparel companies and agencies, with a split hero and labelled workspace preview, an interactive industry selector with code-native signage/card/apparel/brand illustrations in BusinessArtwork.tsx, operational benefits and CMS-backed tier starting prices. CTAs open the real batch workspace or preselect business signup with a safe dashboard return path. It does not implement volume discounts or invoicing.

The public marketing information architecture includes `/services`, `/services/<slug>`, `/work`, `/work/<slug>`, `/pricing`, `/guides`, `/guides/<slug>` and `/faq` below every locale. English uses the unprefixed canonical path. Case studies in the code are explicitly labelled studio demonstrations; do not turn them into customer claims unless publication permission and verifiable project information exist.

The only dedicated order-list page is `/admin/orders`, restricted to operators. `/dashboard/orders` is a compatibility redirect to it. Customer sign-in defaults to `/dashboard`; customer order details remain at `/dashboard/orders/<id>` for quotes, approval, revisions and downloads. The admin header/sidebar no longer offer a second customer-list view.

The operator panel is a responsive order workspace with actionable review/production/revision/packaging cards, all-status filters, search and 20-row client pagination. It fetches order rows without embedding file/message arrays; chat loads messages on demand. Visible tabs refresh the list every 60 seconds and operators can refresh manually. The header notification dropdown derives actionable review, revision, approved-master and overdue alerts from the same order list and opens the update dialog. These are workflow alerts, not push notifications or an unread-message service. Loading failures are visible and retain the last fetched list. Static SLA percentages, decorative charts, fake active artists, shift claims and inert collapse/calendar controls have been removed. Operator updates require a chosen file to upload a deliverable even in demo mode; changing status alone does not create one. The existing upload/metadata/status sequence is still non-atomic.

The customer `/dashboard` is a localized order tracker, not a metrics dashboard. Cards show three milestones (artist review, drawing, files ready), a short status-specific explanation and one relevant action. Preview approval/revision and approved packaging remain in the drawing milestone; only `completed` shows files ready. Cancelled orders do not show a progress path. Active orders prioritize previews awaiting approval; past orders appear separately and all orders are accessible through incremental display. Authenticated customer-only queries refresh once per minute, show loading/error/empty states and use no fabricated delivery percentages or SLA data. The customer shell uses a compact brand/header with notifications and an account menu for profile, files and business-only batch tools.

The tracker now shows a large code-native illustration for the current milestone (review clipboard, drawing pen, ready folder), with the three small steps underneath. Only one initial demo order is seeded (`ord_atx_9480`). Reading old demo storage retires the four other known fixture IDs, saving the original records under `artlantix_orders_before_single_sample`; custom orders are preserved and live Supabase orders are never cleaned this way.

Quote submission now displays a receipt screen with the saved order number rather than immediately opening details. In isolated demo mode, signed-out visitors can submit using name/email with a browser-local guest identity and no password; this is NOT production guest intake or cross-device guest tracking. Production still requires authenticated ownership. `/api/orders/receipt` prepares Resend confirmation emails for verified authenticated owners using database-confirmed numbers and the authenticated email, with same-origin checks and a provider idempotency key. It does not send demo emails. `RESEND_API_KEY` and verified `ORDER_EMAIL_FROM` are required; neither is currently configured. Provider acceptance is labelled as queued, not delivered. No transactional outbox or delivery webhook exists. Production guest orders require a separate secure email-verified ownership/tracking flow before launch; never expose orders by number/email alone.

## Demo versus real services

`isSupabaseConfigured()` checks `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, excluding recognized placeholders. No secret/service-role key may be placed in a NEXT_PUBLIC variable or client code.

`lib/runtime-mode.ts` is the mode boundary. In development, mock mode is enabled unless `NEXT_PUBLIC_DEMO_MODE=false`; in production it is disabled unless explicitly set to `true`. When both Supabase and demo mode are unavailable, authentication and mutations fail closed instead of creating browser-local identities or orders. The `/api/health` route returns 503 for this invalid production configuration.

With Supabase, auth must not fall back to a local demo identity. Role authority comes from the database profile, never editable auth user metadata. Demo account controls are disabled in this mode. Email signup without a session displays a confirmation notice.

Supabase mode includes OAuth callback exchange, password-reset email requests, database-backed profile updates, database-backed messages, CMS tables/policies and private customer/preview storage paths. Remote mutations now surface failures rather than reporting local fallback success. On 2026-09-16 the consolidated schema and trigger-access hardening were applied through the authenticated Supabase MCP connection to project `lsgrbyyatcssrrkvmxmg`; all six public tables reported RLS enabled. Live multi-tenant authorization tests are still required. Do not claim that supplying environment variables alone completes the integration.

## Orders, pricing and files

- The visual brand accent uses a Radix-inspired green scale: `#18794E` for primary actions and text, `#115C3B` for hover states, `#E9F9EE` for soft surfaces, and `#B4DFC4` for accent borders. Amber remains reserved for semantic pending/warning states rather than brand decoration.
- The interface uses Geist Sans only. Do not load a monospace webfont, use the Tailwind `font-mono` utility, or reintroduce letter-spaced monospace eyebrow labels.
- Order states: `quote_requested`, `in_review`, `in_progress`, `preview_ready`, `approved`, `revision_requested`, `completed`, `cancelled`. Customer approval enters `approved`; only an operator delivery moves the order to `completed`.
- New order IDs use UUIDs; existing demo order IDs retain their original strings.
- Base tiers: simple 25, standard 45, complex 75 USD. CMS can override base rates. Add-ons and express pricing are defined in `lib/pricing.ts`.
- Complex artwork plus reconstruction plus text triggers manual review. Customer choice to pay after review also starts at quote_requested.
- `components/ComplexityPicker.tsx` provides localized illustrated detail levels and an explicit artist-assessment choice. `PricingInput.artistReviewRequested` forces manual review regardless of tier. The shown price is provisional. Every public submission starts as `quote_requested` with `pay_after_quote_review`; the site does not collect payment or claim that a card or invoice transaction occurred.
- Quote form state is debounced into a browser-local draft and restored after navigation. A prior order can prefill a new quote through `?reorder=<order-id>`. File objects themselves are not serializable; the local demo stores a small data URL while production users may need to choose the file again after a reload.
- Service pages prefill the quote through `?service=<slug>`. The production brief captures intended use and optional company/brand. The quote UI no longer collects the AI tool or a requested date, or offers typography, damage repair or colour separation add-ons; new quotes and restored drafts use no such add-ons. Optional agency services (brand identity, alternative logo and social media design kit) each cost USD 50 and add to the estimate after the vector-only express multiplier. Each has an independent provisional 3–5 business day delivery window after studio approval. Selections persist in drafts, summary, order notes and the agency_services array. The 20260917_agency_services.sql migration adds trusted database pricing and RPC persistence; it is prepared locally, not applied to the live database in this session. Apply it before using agency selections with Supabase; the old database trigger otherwise recalculates only vector pricing. Turnaround remains selectable through large standard/express radio cards. The artwork classification selector is removed; artwork type remains derived from service/reorder/draft context or the default. Section containers are white with neutral borders; only selected complexity, agency and turnaround cards use green backgrounds and borders; keyboard focus uses an inset indicator without adding an outer frame on pointer clicks. These fields are stored as structured lines within the existing order notes boundary so current deployments remain schema-compatible.
- Orders have expected-delivery metadata, status-history fallbacks, a next-action panel with direct section links, notification polling and visual revision annotations. Stored coordinates use percentages so they remain aligned responsively. The annotation UI shows its marker limit and supports removing the selected marker or undoing the latest marker.
- The quote wizard keeps an itemized price, turnaround, privacy and deliverable summary visible beside the specification/review steps. Specification sections share consistent heading, body and card styles. The desktop continue action is in the right summary. On small screens, the specification step uses a fixed bottom price/action bar; do not add a second mobile forward action.
- Customer order lists and details use loading skeletons so an unresolved request is not shown as an empty result. Signed preview URL failure must not leave the detail page loading indefinitely; action failures are presented in the page rather than only logged.
- The operator queue begins with actionable workload cards for review, production, customer approval, revisions and due/overdue work. It has separate mobile cards and a desktop table.
- Homepage FAQ copy must match the approval boundary: customer approval starts master packaging and QA; downloads unlock only after an operator completes delivery. FAQ accordions expose their expanded state to assistive technology.
- Pricing is shown in the browser and independently recalculated by the database insert trigger. If online payment is introduced later, its trusted server flow must use the database-confirmed amount and a verified webhook.
- Quote submission validates file presence, rejects invalid tiers, reports errors and blocks simultaneous submissions. This is not durable server-side idempotency.
- Current customer upload helper accepts nonempty JPG/JPEG, PNG, WebP and PDF up to 2 MB, validates extension, MIME and magic bytes, and handles reader/decode errors and cancellation. Operator and portfolio uploads have category-specific extension, MIME, signature and size checks. Browser quota may still fill across multiple demo orders.
- Production buckets enforce MIME and size limits through SQL while metadata constraints and RLS bind file rows to owned orders. Customer uploads start with `scan_status=pending`; only the server-only scan route may send them to the private ClamAV adapter. Admin Storage reads require `clean`; infected objects are deleted and scanner failures remain quarantined. The adapter protocol is tested, but the real ClamAV engine still needs deployment verification.
- There is no checkout service. The launch workflow is quote-first with external collection after studio review. Do not reintroduce fake payment success states.
- Supabase customer uploads are sent to a private user/order path before `create_order_with_file` atomically inserts the order and file metadata. If the RPC fails, the client removes the still-unattached object through a constrained Storage delete policy. Operator preview/master actions require a real file in Supabase mode; their upload/metadata/status sequence still needs production integration testing and periodic orphan monitoring.
- The artwork vault downloads only stored `final_master` files. The old fake package-manifest action was removed.
- The business hub accepts up to 20 validated files and creates one independently trackable quote request per file. It does not promise invoicing or automatic volume discounts.
- Portfolio SVG content is displayed in an image context. Do not restore raw `dangerouslySetInnerHTML` insertion for uploaded SVG/HTML.

## Security and migration boundaries

Client-side gates improve navigation only. Enforce real ownership and permissions through database RLS and/or trusted server operations, including every mutation and file download.

The SQL migrations prevent user metadata and profile updates from granting admin rights, constrain customer file/message inserts to owned orders, limit customer order updates to preview approval/revision, and add atomic customer order/file creation. The consolidated `schema.sql` and `20260916_security_advisor_hardening.sql` are applied to the current live Supabase project. They have not yet been integration-tested with separate customer/admin JWTs. For a new project, apply the consolidated schema, then any later timestamped migrations not already incorporated into it.

Production responses define CSP, HSTS, clickjacking, MIME-sniffing, referrer, permissions and private-cache headers in `next.config.ts`; `X-Powered-By` is disabled. The static CSP currently requires `unsafe-inline` for framework scripts/styles. Treat a nonce- or SRI-based strict CSP as future hardening, and verify headers again at the final CDN/proxy because intermediaries can alter them.

The database recalculates inserted prices from CMS rates and selected options, overwrites client status, and keeps every remote order at `quote_requested`. A payment webhook is not required for the current quote-only launch model because no online payment is accepted. Remaining deployment blockers are live multi-tenant RLS/Storage validation, deployment of the included ClamAV stack, auth/WAF operational settings and end-to-end staging tests. Review existing admin grants separately; the migrations do not revoke previously granted roles.

## Verification

Use a compatible installed Node runtime; this project was verified with the bundled Node runtime available on the development machine. Do not hardcode a contributor's machine-specific runtime path in repository commands.

```sh
pnpm dev
pnpm lint
pnpm build
pnpm test
git diff --check
```

Latest verification (0.6.5): production build/TypeScript passed; all 22 tests passed, including receipt authorization, demo guest boundaries, customer tracking, scanner protocol and typography guards; ESLint had zero errors and zero warnings. The tracker was visually checked at desktop and 390 px mobile widths. The current local environment is demo-only with no Supabase or mail credentials; real receipt delivery was not tested. The earlier 2026-09-16 audit reported no known production dependency vulnerabilities and successful live schema application with six RLS-enabled public tables; neither audit nor live database checks were repeated for this release. Lighthouse, a real ClamAV engine run and live multi-tenant RLS/Storage tests still need to be performed before launch.

Tests isolate auth/storage and exercise the real pricing source. They are not substitutes for database RLS, private-storage and malware-scanning integration tests. Add meaningful regressions for changed behavior, not tests that merely match source text.

## Priorities for future work

1. Continue UI/UX improvements in the customer and operator portals while preserving the production security boundaries introduced in v0.2.0; the public marketing redesign and content architecture are now implemented.
2. Run live private-storage/RLS authorization tests for two customers and one admin against the applied schema.
3. Deploy the included ClamAV stack and verify clean/EICAR uploads end to end; consider PDF CDR for higher-risk customers.
4. Add idempotency keys, operator-delivery compensation and periodic orphan-object reconciliation.
5. Configure and verify Supabase Auth rate limits, CAPTCHA, redirect allowlists, leaked-password protection, MFA for admins, OAuth, confirmation, recovery and session invalidation.
6. Finish translations for account/B2B/admin content and expand localized metadata beyond the public detail pages.
7. Add server-side order-list pagination, reduce homepage client work and measure LCP/INP with production media.
8. Add approved company accounts and external invoice reconciliation if commercial invoicing becomes part of the product.
9. Add verified customer proof only after obtaining permission to publish real project names, artwork and outcomes; do not invent testimonials or performance claims.

## Keeping this context useful

The homepage process section presents its four localized steps as numbered icon cards on a dark green background, with desktop connector arrows, a responsive one/two/four-column layout and a localized quote link.

Homepage pricing shows one localized starting-price/USD label above the cards, CMS-backed tier amounts, localized complexity descriptions and quote links. Prices remain provisional; the custom-scope card has no fixed price. FAQ content is available on dedicated localized FAQ pages rather than the current homepage.

Update this document and the audit when fixing a listed limitation. Clearly distinguish local changes, committed code, pushed code, deployed code and applied database migrations. Use Git history for current revision status instead of maintaining a hardcoded commit hash here. Do not report tests, deployments, integrations or performance improvements that have not been verified.

The homepage work showcase uses an editorial split heading and a localized comparison panel. `BeforeAfterSlider` presents a fixed studio demonstration, with artwork/node views, pointer and keyboard controls, and descriptive features instead of unverified performance percentages. Its raster and vector layers share responsive bounds; it does not accept or inspect customer files. The shared panel is also used on the work and order-detail pages.

The temporary `/tr1` route renders the Turkish homepage before the latest visual refresh using `PreviousHomePageContent.tsx`, including the service illustrations and process icons. It bypasses locale redirection, is marked noindex and is omitted from the sitemap. `/tr` remains the current homepage.
