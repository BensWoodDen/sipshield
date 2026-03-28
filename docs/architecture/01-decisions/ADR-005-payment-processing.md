---
tags: [adr]
status: decided
date: 2026-03-25
domain: backend
reversibility: two-way-door
---

# ADR-005: Stripe Checkout Sessions for payment

## Status

Decided — 2026-03-25 (fixed constraint)

## Context

SipShield needs multi-item cart checkout with support for personalisation text, promotion codes, and shipping rates. The solution must have zero monthly cost (transaction fees only). This was a fixed constraint — Stripe Checkout Sessions were chosen before the architecture phase.

## Decision

Stripe Checkout Sessions (server-side creation via Next.js API route, customer redirected to Stripe's hosted checkout page).

### How it works

1. Customer builds cart in the React UI (Zustand store)
2. On "Checkout", client sends cart items to `POST /api/checkout`
3. API route creates a Stripe Checkout Session with line items, shipping, and custom fields
4. Customer is redirected to `session.url` (Stripe's hosted checkout)
5. Stripe handles payment, SCA/3DS, and receipt
6. Customer redirected back to `/success` page

### Stripe UK pricing (as of 2026)

| Card origin | Fee |
|-------------|-----|
| UK domestic | 1.5% + 20p |
| European (EEA) | 2.5% + 20p |
| International | 3.25% + 20p |

On estimated £500/month sales: ~£14/month in fees.

### Features used

- **Line items** — multi-product checkout
- **Custom fields** (up to 3) — personalisation text for engraved items
- **Promotion codes** — managed in Stripe Dashboard, enabled per session
- **Shipping rates** — flat-rate configured in Stripe Dashboard
- **Automatic tax** — available if needed for VAT

## Consequences

### Positive
- Zero monthly platform cost — pay only per transaction
- PCI compliance handled entirely by Stripe (hosted checkout page)
- SCA/3D Secure handled automatically
- Ben manages orders, refunds, and promotions through Stripe Dashboard — no admin panel needed

### Negative
- Personalisation text is entered on Stripe's checkout page, not on the product page (UX compromise)
- No inventory tracking — Ben manages stock manually
- No abandoned cart recovery (would need Stripe webhooks + email service)

### Neutral
- Cart totals displayed on the site are display-only — Stripe calculates the authoritative total, preventing price manipulation

## What if we're wrong?

Two-way door. Stripe Checkout Sessions can be replaced with Stripe Elements (embedded checkout) for more UI control, or the entire payment layer could migrate to another provider. The cart domain is decoupled — only the checkout API route and `lib/stripe.ts` would change.

## Cost implications

~£14/month at £500/month revenue (2.8% effective rate for UK cards). No monthly fixed costs. Scales linearly with sales volume.

## Growth path

- **Short term:** Stripe webhooks for order confirmation emails (e.g., via Resend or Stripe's built-in receipts)
- **Medium term:** Stripe Elements for embedded checkout (personalisation fields on product page)
- **Long term:** If revenue exceeds ~£250/month consistently, evaluate Shopify Basic (£32/month) for inventory management and abandoned cart recovery
