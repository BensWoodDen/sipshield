# SipShield

Standalone e-commerce site for handcrafted oak drink covers. Next.js 16 on Netlify, Sanity CMS, Stripe Checkout Sessions, Supabase (file storage + order log).

## Architecture Reference

For detailed context on any architectural decision, consult `docs/architecture/`:

- `00-overview/Architecture Overview.md` — System diagram, full stack summary, solo maintainability audit
- `01-decisions/ADR-*.md` — Individual decisions with trade-offs, alternatives considered, and cost implications
- `02-domains/Domain Map.md` — Bounded contexts, data flow, and file structure rationale
- `03-infrastructure/` — Deployment topology, operational runbook, cost projection
- `04-comparisons/` — Researched comparisons for hosting, CSS, and CMS choices

When making implementation decisions, check the relevant ADR first — it documents what was decided and why.

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npx sanity dev` | Start Sanity Studio locally |
| `pm2 restart all --update-env` | Restart dev server (picks up .env.local changes) |

## Architecture

```
app/
  (site)/
    page.tsx               # Home (Content domain)
    shop/page.tsx           # Product catalog (Catalog domain)
    success/page.tsx        # Post-checkout confirmation, writes order to Supabase
    layout.tsx              # Site layout (header, footer)
  api/
    checkout/route.ts       # Creates Stripe Checkout Session with personalisation metadata
    upload/route.ts         # Image upload to Supabase Storage (personalisation)
    order/confirm/route.ts  # Dev-mode: writes order to Supabase from success page
    webhook/route.ts        # Prod-mode: Stripe webhook writes order to Supabase
  studio/[[...tool]]/       # Sanity Studio admin UI
lib/
  sanity/                   # Sanity client, GROQ queries, image helpers, types
  stripe.ts                 # Stripe client + fetchStripePrices() for build-time price resolution
  supabase.ts               # Supabase server client (storage + orders)
  cart-store.ts             # Zustand cart store with localStorage persist
sanity/
  schema/                   # Sanity document schemas (product, page, settings)
  actions/rebuild-site.ts   # "Rebuild Site" Studio action (Netlify build hook)
components/
  product-card.tsx          # Product card with "Personalisable" badge, click opens modal
  variant-product-card.tsx  # Multi-size product card with variant selector
  product-modal.tsx         # Side-by-side product detail modal with personalisation fields
  image-upload.tsx          # Drag-and-drop image upload to Supabase Storage
  cart-drawer.tsx           # Slide-out cart with personalisation badges
  cart-button.tsx           # Header cart button with hydration-safe count
  add-to-cart-button.tsx    # Quick-add button (no personalisation)
  header.tsx                # Site header with nav + cart + checkout integration
docs/
  architecture/             # ADRs, domain map, cost projection (Obsidian vault)
  superpowers/specs/        # Design specs
  superpowers/plans/        # Implementation plans
```

## Key Decisions

### Stripe is the single source of truth for prices
- **No price field in Sanity** — prices are fetched from Stripe at build time via `fetchStripePrices()`
- Sanity only stores `stripePriceId` (top-level for single-size products, per-variant for multi-size)
- Ben changes prices in Stripe Dashboard → clicks "Rebuild Site" in Sanity Studio → site rebuilds with fresh prices
- The `scripts/create-stripe-products.mjs` script was used to bulk-create Stripe products and patch price IDs into Sanity

### Personalisation uploads go to Supabase Storage (private)
- Customer images are uploaded to a private `personalisation-uploads` bucket via `POST /api/upload`
- At checkout, signed URLs (7-day expiry) are generated and passed in Stripe Checkout Session metadata
- Ben sees personalisation text + image download links in his Stripe Dashboard order details
- Customer images are **never** stored in Sanity (public CDN) for privacy

### Orders are stored in Supabase
- Dev: success page calls `/api/order/confirm` to write order to Supabase `orders` table
- Prod: Stripe webhook at `/api/webhook` handles `checkout.session.completed` events
- Both routes have duplicate protection via `stripe_session_id` unique constraint

## Key Files

- `lib/stripe.ts` - Stripe client + `fetchStripePrices()` for build-time price fetching
- `lib/supabase.ts` - Supabase server client (gracefully handles missing env vars during build)
- `lib/sanity/queries.ts` - All GROQ queries for fetching products and pages
- `lib/cart-store.ts` - Zustand store; cart persists in localStorage; includes personalisation fields
- `app/api/checkout/route.ts` - Creates Stripe Checkout Session with line items + personalisation metadata
- `app/api/webhook/route.ts` - Stripe webhook for production order storage
- `sanity/schema/` - Content model definitions (Product, ProductFamily, Page, SiteSettings)

## Environment

Required in Netlify env vars (and `.env.local` for dev):
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset (usually "production")
- `SANITY_API_TOKEN` - Read token for Sanity API (server-side only)
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_SITE_URL` - Site URL for Stripe success/cancel redirects
- `SUPABASE_URL` - Supabase project URL (server-side only)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (production only)
- `SANITY_STUDIO_NETLIFY_BUILD_HOOK` - Netlify build hook URL for Studio rebuild action (production only)

## Code Style

- Tailwind CSS v4 with OKLCH colour system — custom palette defined via `@theme` in CSS
- Use `oklch()` values for all custom colours, not hex/rgb
- React Server Components by default; only add `'use client'` for interactive elements (cart, modals, buttons)
- Product images always via Sanity CDN + next/image — never store images in the repo
- Cart totals are display-only; Stripe calculates the authoritative total at checkout

## Gotchas

- Sanity free-tier datasets are **public** (read-only via API). Fine for a public e-commerce site but don't store secrets or customer uploads in Sanity.
- **No price field in Sanity.** Prices come from Stripe. When creating a new product, create the Stripe product/price first, then add the `stripePriceId` in Sanity Studio.
- Netlify free tier is used for commercial purposes (explicitly allowed, unlike Vercel Hobby which prohibits it).
- Cart clears only on explicit user action or successful checkout — persists via localStorage across browser sessions.
- Content changes in Sanity trigger Netlify rebuild via webhook (~2-5 min to go live).
- `lib/supabase.ts` exports `null` when env vars are missing — all consumers must check for `null` before using.
- `useSearchParams()` requires a Suspense boundary in Next.js 16 — see `success/page.tsx` for the pattern.
- Product cards are client components (`'use client'`) because they manage modal open/close state.

## Workflow

- All content (products, pages) managed in Sanity Studio — not hardcoded
- Ben (non-technical) manages products and content; Jess manages code
- Sanity publish → webhook → Netlify rebuild → site updated
- **Price changes:** Ben updates price in Stripe Dashboard → clicks "Rebuild Site" in Sanity Studio
- Stripe Dashboard for orders, refunds, promotion codes — no admin panel in the app
- Orders are logged in Supabase `orders` table with items, personalisation, shipping, and payment total
