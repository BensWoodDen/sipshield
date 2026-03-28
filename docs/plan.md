# SipShield — Standalone E-Commerce Website Plan

> **Note:** Architecture decisions have been finalised in `docs/architecture/`. This plan
> predates the architecture session — see the Architecture Overview for the current stack
> (Netlify instead of Vercel, Sanity CMS, Tailwind v4 with OKLCH, etc.).

## Context

Ben (Jess's brother) runs Ben's Wood Den Ltd in Bournemouth, making handcrafted woodwork. His product line "Sip Shield" — solid oak drink covers for cans and mugs — has grown to 13 variants (£10–£25) and is already selling via benswoodden.com (Webador). He wants to leave Webador and launch a dedicated SipShield website, but has essentially zero budget.

**The problem**: Free-tier platforms (Big Cartel, Ecwid) cap at 5 products. He has 13. Shopify Basic is £32/month — too expensive. He needs a professional, functional shop for £0/month.

**Cart requirement**: Customers need to mix different products in a single checkout (e.g. 2 Classic + 1 Lanyard).

## Recommendation: Next.js + Stripe Checkout Sessions on Vercel

| Cost | Amount |
|------|--------|
| Hosting (Vercel Hobby) | Free |
| Platform fees | None |
| Payment processing (Stripe UK) | 1.5% + 20p per transaction |
| Domain (sipshield.co.uk) | ~£10/year |
| **Monthly total** | **£0** (+ domain annually) |

### Why Vercel
- **Free tier**: 100GB bandwidth, 6000 build mins/mo, serverless functions, preview deploys
- **Next.js native**: Built by the same team — best-in-class DX and optimisation
- **Preview deploys**: Every PR gets a live preview URL — great for reviewing changes
- **Edge network**: Fast globally, automatic HTTPS, custom domain support
- **CMS-ready**: When/if a headless CMS is added later, Vercel's ISR/webhook-triggered rebuilds make content updates seamless for Ben

### Why Stripe Checkout Sessions (not Payment Links, not Shopify, not Snipcart)

**Alternatives considered:**

| Option | Monthly Cost | Effective Fees (on £500/mo sales) | Why Not |
|--------|-------------|-----------------------------------|---------|
| **Stripe Checkout Sessions** | **£0** | **~£14** | **Winner** |
| Snipcart + Stripe | ~£16 | ~£40 | $20/mo minimum + 2% on top of Stripe fees |
| Shopify Starter | ~£4 | ~£58 | 5% transaction fee on top of card processing |
| Shopify Basic | ~£32 | ~£42 | Monthly cost too high for zero budget |
| Braintree/PayPal | £0 | ~£18 | Higher UK fees (1.9% vs 1.5%), no hosted checkout, more dev work |

**Stripe Checkout Sessions provide:**
- **Multi-item cart checkout** — customers can buy different products in one transaction
- **Custom text fields** (up to 3) — for personalisation text on engraved items
- **Promotion codes** — managed in Stripe Dashboard, enabled per checkout
- **Shipping rates** — flat-rate or per-order, configured in Stripe
- **Hosted checkout page** — Stripe handles PCI compliance, SCA/3D Secure, card UI
- **UK VAT support** — Stripe Tax available if needed

**How it works:**
1. Cart UI built in React (local state / context) — customer adds products, sees cart
2. On "Checkout", a Next.js API route creates a Stripe Checkout Session with all line items
3. Customer is redirected to Stripe's hosted checkout page
4. Stripe handles payment, sends receipt, redirects back to success page

### Honest Trade-offs
- **No inventory tracking**: Ben manually manages stock. Fine for handmade low-volume
- **Cart is client-side only**: Cart clears on browser close (no server-side persistence). Acceptable for a small catalog with quick purchase decisions
- **Personalisation UX**: Custom fields appear on Stripe's checkout page, not on the product page. Customer adds "Personalised Oak" to cart → enters text at checkout

## Tech Stack

- **Next.js** (React) — framework (SSG/SSR, API routes, image optimisation)
- **Tailwind CSS** — styling
- **Vercel** — hosting (free Hobby tier, custom domain + HTTPS)
- **Stripe Checkout Sessions** — multi-item cart checkout, hosted payment page
- **Headless CMS (TBD)** — future addition so Ben can manage content himself

_Architecture decisions finalised — see `docs/architecture/` for full ADRs and comparisons._

**Architecture changes from this initial plan:**
- **Hosting:** Netlify Free (not Vercel) — Vercel Hobby prohibits commercial use
- **CMS:** Sanity Free tier — Ben manages products and content himself
- **Styling:** Tailwind CSS v4 with OKLCH colour system
- **State:** Zustand (confirmed)
- **Stripe:** Checkout Sessions (confirmed)

## Product Organization

13 variants grouped into 5 families on the shop page:

| Family | Products | Price |
|--------|----------|-------|
| **Classic** | Plain Oak, Personalised Oak | £10 |
| **Lanyard Edition** | Standard, Personalised | £11.50 |
| **Bull Edition** | Individual (S/M/L), Set, Personalised variants | £10–£25 |
| **Limited Editions** | The Mulberry, The BIG Ash + personalised | £12.50 |
| **Mug Edition** | Personalised (70-90mm sizes) | £15 |

Each family is a product card with Standard/Personalised toggle. Products are created in Stripe Dashboard and referenced by price ID in the checkout API route.

## Site Structure

_Indicative — final structure determined by architecture session._

```
sipshield/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing: hero, value prop, featured products
│   ├── shop/page.tsx           # Product catalog with cart functionality
│   ├── about/page.tsx          # Brand story, craftsmanship
│   ├── faq/page.tsx            # Sizing, care, shipping, returns
│   ├── contact/page.tsx        # Contact form
│   ├── cart/page.tsx           # Cart review page
│   ├── success/page.tsx        # Post-checkout success page
│   ├── api/checkout/route.ts   # Creates Stripe Checkout Session
│   └── layout.tsx              # Shared layout (header, footer, cart icon)
├── components/
│   ├── Cart/                   # Cart drawer/modal, cart context provider
│   ├── ProductCard/            # Product display with "Add to Cart"
│   └── ...
├── lib/
│   ├── stripe.ts               # Stripe server-side client
│   └── products.ts             # Product data (or fetched from CMS later)
└── public/
    └── images/                 # Product photos, icons
```

## Design Direction

Based on existing Instagram/website branding:
- **Colours**: Oak/amber primary, charcoal text, cream background, forest green CTA buttons
- **Typography**: Clean sans-serif body (Inter), serif display headings (DM Serif Display)
- **Photography-forward**: Large product images, lifestyle shots
- **Mobile-first**: Instagram audience = mobile users

## Implementation Sequence

### Phase 1 — Foundation
1. `npx create-next-app` with Tailwind, TypeScript, App Router
2. Deploy to Vercel (connect GitHub repo)
3. Base layout: header, footer, mobile nav, cart icon

### Phase 2 — Cart & Checkout
4. Cart context/provider (React Context or Zustand) — add/remove/update items
5. Cart UI (drawer or dedicated page) showing items, quantities, total
6. Next.js API route: `POST /api/checkout` — creates Stripe Checkout Session with `line_items`
7. Create products + prices in Stripe Dashboard (test mode)
8. Success/cancel redirect pages

### Phase 3 — Core Pages
9. Shop page — product grid with 5 families, "Add to Cart" buttons, variant selectors
10. Home page — hero, value prop, featured products, social proof
11. About, FAQ, Contact pages

### Phase 4 — Polish & SEO
12. Product photography (Next.js Image optimisation)
13. SEO meta tags, Open Graph, Product schema markup
14. Mobile/browser testing, Lighthouse audit

### Phase 5 — Launch
15. Register `sipshield.co.uk` domain
16. Configure Vercel custom domain + HTTPS
17. Switch Stripe to live mode
18. Submit sitemap to Google Search Console
19. Update Instagram bio with new URL

## Domain

**Recommended: `sipshield.co.uk`** — available as of 2026-03-24.

| Domain | Status | Approx. Cost/Year | Notes |
|--------|--------|-------------------|-------|
| sipshield.co.uk | Available | ~£5–8 | **Primary pick** — trusted by UK buyers for e-commerce |
| sipshield.uk | Available | ~£5–7 | Good secondary/redirect |
| sipshield.com | Available | ~£8–10 | Grab if budget allows (global reach) |
| sipshield.shop | Available | ~£3–10 | On-brand but less recognised |

**Register via Cloudflare Registrar** (at-cost pricing, no markup — cheapest option).

Minimum spend: ~£5–8/year for `sipshield.co.uk` only.
Ideal: ~£12–15/year for both `sipshield.co.uk` + `sipshield.uk` (redirect the .uk to .co.uk).

## Migration Path to Shopify

When monthly revenue consistently exceeds ~£250/month, Shopify Basic (£32/month) becomes worthwhile for: inventory management, discount codes, abandoned cart recovery, analytics.

Migration is simple:
- Products re-created in Shopify (only 13)
- Domain DNS pointed to Shopify (5-minute change)
- Content copied from clean HTML into Shopify theme
- Stripe transaction history retained

## Verification

- [ ] Add multiple different products to cart, verify correct totals
- [ ] Complete full checkout flow in Stripe test mode (multi-item)
- [ ] Personalisation custom fields appear and submit correctly on Stripe checkout
- [ ] Promotion code applies correctly at checkout
- [ ] Shipping rate options shown at checkout
- [ ] Success page displays after payment
- [ ] Mobile responsive on iPhone/Android
- [ ] Lighthouse performance score ≥ 90
- [ ] Custom domain resolves with HTTPS
- [ ] Vercel preview deploys working on PRs
