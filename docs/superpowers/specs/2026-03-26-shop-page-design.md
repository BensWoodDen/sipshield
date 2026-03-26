# Shop Page Design Spec

## Overview

The shop page is the primary product catalog for SipShield — a single scrolling page showing all 13 oak drink cover variants grouped into 5 product families. It pulls all data from Sanity CMS and reuses existing product card components.

## Page Structure

### 1. Mini Hero

A slim, text-only banner providing context for customers who land directly on the shop page (e.g. from Google or Instagram).

- **Content**: kicker line, headline, one sentence of body copy
- **Source**: Sanity `shopPage` singleton document (so Ben can edit it)
- **Size**: compact — roughly 40–50% the height of the homepage hero. No image, no CTA button.
- **Mobile**: stacks naturally, no special handling needed

### 2. Family Sections

One section per `productFamily`, rendered in `displayOrder`. Each section contains:

- **Family name** as `h2` (e.g. "Classic Edition")
- **Family description** — one line of copy from the `productFamily.description` field
- **Product grid** — equal-size cards in an adaptive column layout:
  - **1 column** on mobile (< 768px)
  - **2 columns** for families with ≤ 2 products on tablet/desktop
  - **3 columns** for families with 3+ products on tablet/desktop
- **Spacing**: generous vertical spacing between family sections (no divider lines)

### 3. Product Cards

Reuse the existing `CompactCard` component from `components/product-card.tsx`. No modifications needed. Each card shows:

- Product image (Sanity CDN via `next/image`, 4:3 aspect ratio)
- Product name
- Variant name
- Price
- Tag badge if present (e.g. "Popular", "Personalised")
- Add to Cart button (existing `AddToCartButton` component)

## Data Model

### New Sanity Schema: `shopPage`

Singleton document for the shop page hero content:

```
shopPage (document, singleton)
├── heroKicker: string       — e.g. "The Collection"
├── heroHeadline: string     — e.g. "Handcrafted Oak Drink Covers"
└── heroBody: text           — e.g. "Each piece is cut, shaped and finished by hand..."
```

### Existing Schemas (no changes)

- `productFamily` — name, slug, description, displayOrder
- `product` — name, slug, description, variant, price, stripePriceId, family (ref), images, tag, personalisable, personalisationLabel

## GROQ Query

A single query fetches everything the page needs:

```groq
{
  "hero": *[_type == "shopPage"][0]{
    heroKicker,
    heroHeadline,
    heroBody
  },
  "families": *[_type == "productFamily"] | order(displayOrder asc) {
    _id,
    name,
    slug,
    description,
    "products": *[_type == "product" && references(^._id)] | order(price asc) {
      _id,
      name,
      slug,
      description,
      variant,
      price,
      stripePriceId,
      images,
      tag
    }
  }
}
```

This returns the hero content and all families with their products nested, in a single network request.

## New Files

| File | Purpose |
|------|---------|
| `app/(site)/shop/page.tsx` | Shop page server component |
| `components/shop-hero.tsx` | Mini hero component |
| `sanity/schema/shop-page.ts` | Sanity schema for shop page singleton |
| Updated: `sanity/schema/index.ts` | Register new schema |
| Updated: `lib/sanity/queries.ts` | Add shop page query |
| Updated: `lib/sanity/types.ts` | Add TypeScript types |

## Reused Components

- `ProductCard` (compact layout) from `components/product-card.tsx`
- `AddToCartButton` from `components/add-to-cart-button.tsx`
- `urlFor` image helper from `lib/sanity/image.ts`
- All design tokens from `app/globals.css`

## Component Design

### `ShopHero`

Server component. Receives hero data as props. Renders:

```
<section>
  <p>  kicker (uppercase, forest green, small)  </p>
  <h1> headline (display font, large)           </h1>
  <p>  body (neutral text, relaxed leading)      </p>
</section>
```

Styled consistently with the homepage hero typography but without the image or CTA. Constrained to `max-w-[1200px]` like all other sections.

### `app/(site)/shop/page.tsx`

Server component that:

1. Fetches shop page data (hero + families with products) in a single query
2. Renders `ShopHero` with hero content
3. Maps over families, rendering each as a `<section>` with heading, description, and product grid
4. Uses a `toCardProduct` helper (same pattern as `product-grid.tsx`) to transform Sanity products into `Product` card props — duplicated inline rather than extracted, since only two consumers exist
5. Applies adaptive grid columns based on product count per family

### Product Grid (inline, not a separate component)

The shop page renders its own grid per family rather than reusing `ProductGrid` from the homepage. Reason: `ProductGrid` has hero+compact bento logic that doesn't apply here. The shop grid is simpler — all equal cards with adaptive column count.

```tsx
<div className={`grid grid-cols-1 gap-4 ${
  products.length <= 2
    ? "md:grid-cols-2"
    : "md:grid-cols-3"
}`}>
  {products.map(p => <ProductCard ... layout="compact" />)}
</div>
```

## Responsive Behaviour

| Breakpoint | Grid | Hero |
|-----------|------|------|
| < 768px (mobile) | 1 column | Stacked, smaller text |
| ≥ 768px (tablet/desktop) | 2 or 3 columns (adaptive) | Full width text |

## Accessibility

- Each family section uses `aria-labelledby` pointing to its `h2`
- Product cards already have `aria-label` on the add-to-cart button
- Heading hierarchy: `h1` (page headline in hero) → `h2` (family names)
- No interactive elements beyond existing add-to-cart buttons

## Out of Scope

- Product detail pages (no individual product pages in this spec)
- Search or filtering (unnecessary with 13 products)
- Sorting controls (family order managed by Ben in Sanity via `displayOrder`)
- Cart store wiring (already has TODO in `AddToCartButton` — separate task)
- Mobile hamburger menu (cross-cutting concern, separate task)
