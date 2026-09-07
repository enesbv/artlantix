# Artlantix · Manual Vectorization & Artwork Reconstruction Studio

Artlantix is a premium manual vectorization, logo reconstruction, and production artwork studio platform. Engineered for commercial printers, screen printing & DTF apparel shops, signage makers, and brand creators who need pristine, mathematically clean vector files (AI, EPS, SVG, PDF, high-res PNG) from AI concepts, degraded scans, and raster sketches.

> **"AI creates the concept. We make it production-ready."**

---

## 1. Key Features & Architecture

- **Bespoke Editorial Visual System**:
  - Warm paper tones (`#FAFAF8`, `#F4F3EF`), pure white cards (`#FFFFFF`).
  - Deep charcoal typography (`#111111`), hairline borders (`#E6E4DF`), and terracotta high-intent accents (`#E25C34`).
  - Strictly zero generic blue/purple SaaS gradients, cartoon illustrations, or frosted glass blurs.
- **Interactive Before/After Slider**:
  - Live split-view comparison with interactive Bezier Anchor Points and Wireframe toggles.
- **Multi-Step Pricing Engine (`lib/pricing.ts`)**:
  - Simple ($25), Standard ($45), and Complex ($75) tiers.
  - Add-ons for font reconstruction (+$15), damage repair (+$20 / +$35), color separations, and rush speed (+35%).
  - **Complexity Threshold Guard**: Automatically flags complex artwork for senior manual review with a *"Submit without upfront charge"* guarantee.
- **Dual-Mode Zero-Config Fallback Layer**:
  - Built-in `localStorage` mock store pre-seeded with realistic customer projects across all 6 lifecycle states.
  - The entire application is 100% clickable, demonstrable, and testable out of the box without requiring API keys.
- **Dedicated Portals**:
  - **Client Portal**: Project timelines, side-by-side comparison inspection, preview approvals, revision requests, and master vector download drawer.
  - **Artwork Vault (`/dashboard/artwork`)**: Permanent digital asset archive with 1-click re-downloads and reorders.
  - **B2B Commercial Hub (`/dashboard/business`)**: Bulk batch upload tool, Net-30 monthly invoicing, and white-label delivery toggle.
  - **Internal Operator Queue (`/admin/orders`)**: Dedicated production management panel for vector artists and QA leads.

---

## 2. Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node.js v24.15.0)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Zero-Config Mock Mode & Demo Personas

When running without Supabase environment variables, Artlantix automatically activates **Zero-Config Mock Mode**.

### 1-Click Demo Persona Switcher
Use the role selector on the top navigation bar or the `/login` page to switch between personas:
- **Demo Customer**:
  - **Name**: Alex Morgan (`alex.morgan@ateliercreative.com`)
  - **Role**: Studio Director, Atelier Creative Studio (B2B Partner)
  - **Access**: Client Portal, Active Orders, Artwork Vault, B2B Hub
- **Demo Operator / QA Lead**:
  - **Name**: Elena Vance (`elena.vance@artlantix.com`)
  - **Role**: Senior Vector Specialist & QA Lead
  - **Access**: Internal Production Queue (`/admin/orders`), status transitions, quote adjustments, and deliverable attachments.

---

## 4. Supabase Deployment & Setup Guide

To connect a live Supabase project:

### Step 1: Set Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Populate your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 2: Run Database Migration & Storage Bucket Setup
Run the SQL migration in `supabase/schema.sql` inside the Supabase SQL Editor. This script creates:
1. Tables: `profiles`, `orders`, `order_files`, `order_messages`.
2. Automatic profile creation trigger on `auth.users`.
3. Row Level Security (RLS) policies on all tables.
4. **Three Dedicated Storage Buckets**:
   - `customer-assets`: **Private** bucket with RLS for original customer uploads and revision attachments.
   - `previews`: **Public / Signed** bucket for watermarked vector draft previews.
   - `master-deliveries`: **Private, strictly protected** bucket. Master vector files (`.AI`, `.EPS`, `.SVG`, `.PDF`) can only be accessed via temporary signed download URLs generated upon order completion.

---

## 5. Project File Structure

```
artlantix/
├── app/
│   ├── page.tsx                    # 11-section high-converting landing page
│   ├── quote/page.tsx              # Multi-step pricing & upload calculator
│   ├── login/page.tsx              # Authentication & 1-click demo personas
│   ├── signup/page.tsx             # Individual & B2B account creation
│   ├── dashboard/
│   │   ├── page.tsx                # Customer overview & metrics
│   │   ├── orders/page.tsx         # Filterable order history
│   │   ├── orders/[id]/page.tsx    # Detail timeline, dual comparison & master download
│   │   ├── artwork/page.tsx        # Artwork Vault / digital asset archive
│   │   ├── business/page.tsx       # B2B hub with bulk upload & invoicing
│   │   └── account/page.tsx        # Studio profile & tax settings
│   └── admin/orders/page.tsx       # Internal operator production queue
├── components/
│   ├── Navbar.tsx                  # Responsive header with role switcher
│   ├── Footer.tsx                  # Editorial studio footer
│   └── BeforeAfterSlider.tsx       # Interactive split-view with wireframe/anchor toggle
├── lib/
│   ├── types.ts                    # TypeScript domain interfaces
│   ├── pricing.ts                  # Isolated pricing rules & threshold guard
│   ├── mock-data.ts                # Realistic seeded orders & showcase items
│   ├── services/
│   │   ├── auth.ts                 # Unified auth with mock fallback
│   │   ├── orders.ts               # Order state machine & message threads
│   │   ├── storage.ts              # File processor, signed URLs & generators
│   │   └── payments.ts             # Decoupled payment & Stripe checkout readiness
│   └── supabase/
│       └── client.ts               # Supabase browser client with zero-config detection
├── supabase/
│   └── schema.sql                  # PostgreSQL tables, RLS policies & bucket setup
├── .env.example                    # Configuration template
└── package.json
```

---

## 6. Verification & Quality Checks

Run the verification suite:

```bash
# 1. TypeScript Strict Typecheck
npx tsc --noEmit

# 2. ESLint Code Quality
npm run lint

# 3. Next.js Production Build
npm run build
```

All 13 routes prerender as optimized production builds with zero errors.
