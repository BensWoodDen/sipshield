---
tags: [adr]
status: decided
date: 2026-03-25
domain: frontend
reversibility: one-way-door
---

# ADR-002: Next.js as application framework

## Status

Decided — 2026-03-25 (fixed constraint — not evaluated against alternatives)

## Context

Next.js was chosen as a fixed constraint before the architecture phase began. This ADR documents the rationale and implications rather than evaluating alternatives.

SipShield needs: static pages (Home, About, FAQ), a dynamic product catalog, a client-side cart, and one server-side API route for Stripe Checkout Session creation.

## Decision

Next.js 16 with App Router. Single application — no monorepo tooling needed for this scope.

### Why App Router over Pages Router

- App Router is the default and recommended approach in Next.js 16
- React Server Components allow product catalog pages to be rendered at build time with zero client-side JavaScript
- Route handlers (`app/api/checkout/route.ts`) provide the serverless function for Stripe integration
- Layout system (shared header/footer via `app/layout.tsx`) avoids prop drilling

### Key Next.js features used

| Feature | Purpose |
|---------|---------|
| Static generation (SSG) | Home, About, FAQ, Contact — built at deploy time, served from CDN |
| Route handlers | `POST /api/checkout` — creates Stripe Checkout Session |
| `next/image` | Optimised product photography (WebP, lazy loading, responsive sizes) |
| Metadata API | SEO meta tags, Open Graph, structured data |
| Client components (`'use client'`) | Cart drawer, product "Add to Cart" buttons — interactive elements only |

## Consequences

### Positive
- One framework covers static pages, dynamic UI, and API routes — no separate backend needed
- Excellent image optimisation built-in (important for product photography)
- Strong TypeScript support
- Large ecosystem of examples and documentation

### Negative
- Vendor coupling: Next.js is tightly coupled to Vercel for optimal deployment (though it runs elsewhere)
- App Router has a steeper learning curve than Pages Router
- React Server Components vs Client Components boundary requires care

### Neutral
- Turbopack is now the default bundler in Next.js 16 — faster dev server, no configuration needed

## What if we're wrong?

Next.js is a one-way door — migrating away means rewriting the application. However, the site is small (7 pages, 1 API route), so a rewrite would take days, not months. The risk is acceptable.

## Cost implications

$0. Next.js is open-source (MIT license).

## Growth path

Next.js scales well beyond this project's needs. If SipShield grows to need a CMS, ISR (Incremental Static Regeneration) enables content updates without full rebuilds. If the product catalog grows significantly, dynamic routes (`/products/[slug]`) can replace the single shop page.
