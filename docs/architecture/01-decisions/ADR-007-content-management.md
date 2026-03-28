---
tags: [adr]
status: decided
date: 2026-03-25
domain: backend
reversibility: two-way-door
---

# ADR-007: Sanity CMS for content and product management

## Status

Decided — 2026-03-25

## Context

SipShield's products (13 variants) and static page content (Home, About, FAQ, Contact) were originally planned as hardcoded TypeScript files. However, Ben (the business owner) is non-technical and needs to manage products, images, and page content independently — without asking Jess for every text change or new product addition.

The CMS must:
- Have a usable free tier (zero monthly budget)
- Be intuitive for a non-technical editor
- Include image hosting with CDN delivery
- Integrate well with Next.js 16 App Router on Netlify
- Support webhook-triggered rebuilds

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| Sanity | Image CDN included, 10K docs free, excellent Next.js SDK, customisable Studio editor, 20 user seats | Free datasets are public (read-only API), GROQ learning curve for developer, hard caps on free tier | two-way-door | $0 |
| Keystatic | Zero external dependency, content in Git, native Next.js, TypeScript-first | No image CDN (images in Git = repo bloat), smaller community | two-way-door | $0 |
| Storyblok | Best visual editor for non-technical users | Only 2 user seats free, no GraphQL on free, steep paid jump (€99/mo) | two-way-door | $0 |
| Contentful | Polished enterprise editor UI | Free tier shrinking (April 2025 reductions), paid jump to ~$300/mo | two-way-door | $0 |
| No CMS (static files) | Simplest architecture, zero dependency | Ben cannot manage content independently | two-way-door | $0 |

### Sanity

Free tier: 10,000 documents, 200K API requests/month, 10 GB storage, 10 GB bandwidth, 20 user seats. SipShield needs ~20 documents — 0.2% of the limit.

The key differentiator is **included image CDN**. Ben uploads a product photo → Sanity hosts it on a global CDN with automatic transforms (crop, resize, format conversion to WebP). No separate image hosting service needed. For a product-photography-forward site, this is significant.

Sanity Studio is a customisable React-based editor. Jess configures it once with the right content schemas (Product, ProductFamily, Page, SiteSettings), and Ben gets a tailored admin interface. The `next-sanity` SDK provides first-class App Router integration with TypeScript generation via `sanity-typegen`.

Webhook-triggered Netlify rebuilds are well-documented with a dedicated Sanity plugin.

Trade-off: free-tier datasets are public (content readable without authentication via API). For a public e-commerce site displaying this content anyway, this is a non-issue.

### Keystatic

The strongest alternative. Content stored as files in the Git repo — zero external service dependency. Native Next.js integration, TypeScript-first schemas, clean editor UI designed for non-technical users.

Loses to Sanity on image hosting: product images would live in the Git repo (acceptable for ~30-50 images but no CDN transforms, no automatic WebP, no resize-on-demand). For a photography-heavy site, this matters.

## Decision

**Sanity** with the free tier. The included image CDN, generous free limits, and excellent Next.js integration make it the best fit for a non-technical editor managing a small product catalog.

### Content schema

| Content type | Type | Fields |
|-------------|------|--------|
| Product | Collection | name, slug, description, price, stripePriceId, family (ref), personalisable, personalisationLabel, images[], sizeOptions[] |
| ProductFamily | Collection | name, slug, description, displayOrder |
| Page | Collection | title, slug, body (Portable Text), seo metadata |
| SiteSettings | Singleton | siteName, heroImage, heroText, contactEmail, shippingInfo, socialLinks |

### Architecture impact

- `lib/products.ts` (static file) → replaced by Sanity queries via `next-sanity`
- Product images → hosted on Sanity CDN, served via `sanity-image` with Next.js Image component
- Static pages → content fetched from Sanity at build time (SSG), rebuilt on webhook
- Sanity Studio → hosted as part of the Next.js app at `/studio` route, or separately on Sanity's hosted Studio

## Consequences

### Positive
- Ben can independently manage products, images, and page content
- Image CDN with automatic transforms — no separate image hosting needed
- Content changes trigger Netlify rebuilds via webhook — site stays up to date
- TypeScript-generated types from Sanity schema — type-safe content queries
- 20 user seats means room for Ben + Jess + future collaborators

### Negative
- Adds an external service dependency (Sanity)
- Free-tier datasets are public (content readable via API — acceptable for public e-commerce)
- GROQ query language has a learning curve (though simpler than GraphQL for most use cases)
- Hard caps on free tier — service pauses if limits exceeded (extremely unlikely at this scale)
- Sanity Studio configuration requires upfront developer effort

### Neutral
- Content is no longer in the Git repo — changes are tracked in Sanity's content history instead of Git history
- Build times may increase slightly (fetching content from Sanity API during build)

## What if we're wrong?

Two-way door. Content can be exported from Sanity as JSON and migrated to another CMS (Keystatic, Contentful, Storyblok) or back to static files. The content model (Product, ProductFamily, Page) is standard — only the data fetching layer (`next-sanity` queries) needs rewriting. For 13 products and 5 pages, migration takes hours, not days.

## Cost implications

$0/month. Sanity Free tier includes everything SipShield needs:
- 10,000 documents (need ~20)
- 200,000 API requests/month (need ~1,000-10,000)
- 10 GB storage (need <1 GB for product images)
- 10 GB bandwidth (need <1 GB)

Scale trigger: if SipShield grows beyond 200K API requests/month or 10 GB bandwidth (would require tens of thousands of visitors), Sanity's next tier is $15/project/month.

## Growth path

- **Short term:** Sanity Studio configured with Product, ProductFamily, Page, and SiteSettings schemas. Ben manages all content.
- **Medium term:** Add Sanity's Scheduled Publishing for timed product launches. Add Visual Editing for live preview of content changes.
- **Long term:** If migrating to Shopify, product data can be exported from Sanity. Page content could remain in Sanity even with Shopify for commerce (headless CMS + Shopify is a common pattern).
