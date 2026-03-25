# Homepage Layout Design

**Date:** 2026-03-25
**Status:** Approved

## Summary

SipShield homepage layout combining an editorial hero (oversized typography with a floating product photo) and a bento product grid. The page balances product visibility with craft storytelling, paced between dense and spacious. All content is CMS-driven via Sanity.

## Design Direction

- **First impression:** Products visible early, but with enough story that it doesn't feel like a cold product grid
- **Pacing:** Balanced — not sprawling with whitespace, not crammed. Enough room to feel intentional and crafted.
- **Audience:** Visitors arriving primarily from Instagram expecting a handcrafted, artisan brand

## Section Breakdown

### 1. Header

Sticky header with backdrop-blur on scroll. Logo ("SipShield" in DM Serif Display) left-aligned. Nav links (Shop, About, FAQ, Contact) and cart button right-aligned. No visible border on initial load — a subtle bottom border appears on scroll. Transparent over the cream background.

- Nav links are hardcoded (they map directly to app routes and won't change). The existing `header.tsx` is a server component with a static border — it must be converted to a client component with a scroll listener for the border/blur behaviour.
- Cart button uses Zustand store for item count badge

### 2. Editorial Hero

Asymmetric layout. Left side: small uppercase kicker ("Handcrafted in the UK"), large DM Serif Display headline, body copy in Plus Jakarta Sans, single forest-green CTA button ("Shop Collection"). Right side: product photo that overlaps the grid boundary slightly with a subtle rotation (2-3deg) and oak-tinted shadow.

- Kicker, headline, body copy, CTA label, CTA link, and product image all from Sanity homepage document
- The photo breaks the container — should not feel boxed in
- Single CTA only — the existing dual-CTA ("Shop the Collection" + "Our Story") is intentionally reduced to one to focus on conversion. The "Our Story" link is available in the nav and story band instead.

### 3. Trust Bar

Single horizontal row directly under the hero, bordered top and bottom with subtle `oak-100` lines. Four selling points prefixed with a centred dot separator (·), e.g. "· Hand-turned · English Oak · Sustainable · Made in UK".

- Acts as a visual bridge between hero and products, not a full section
- Content CMS-driven from the homepage document — Ben may swap these seasonally or for promotions
- Compact: no icons, no expanded descriptions

### 4. Bento Product Grid

Section heading (CMS-driven, e.g. "Featured Pieces") followed by an asymmetric CSS Grid:

- **Row 1:** Featured product spans 2 columns (image left, name/description/price right). Two smaller cards stacked in the third column (image, name, price).
- **Row 2:** Mirrors but flipped — 2-column card on the right (description left, image right). One smaller card on the left.

Products selected via an ordered reference array on the homepage document (not a boolean flag — ordering matters because position 1 gets the large featured treatment). The array references 4 Product documents. Each card links to the shop page. Add-to-cart buttons on cards for direct purchase from the homepage.

**Featured card variant:** Horizontal layout (image left, content right). Shows product name, short description (new field from Product document — the `description` field exists in the Sanity schema but is not yet in the TypeScript interface), price, and add-to-cart button. Image uses a landscape aspect ratio (~3:2).

**Compact card variant:** Vertical layout (image top, content below). Shows product name, price, add-to-cart. No description. Image uses a square aspect ratio (1:1).

The existing `ProductCard` component is vertical-only and needs a `variant` prop (`"featured" | "compact"`) to support both layouts.

**Responsive behaviour:**
- **Desktop (>1024px):** 3-column bento grid as described above
- **Tablet (768–1024px):** 2-column grid. Featured product still spans 2 columns (full width). Compact cards in a 2-column row below.
- **Mobile (<768px):** Single column stack. Featured product uses its horizontal layout at full width. Compact cards stack vertically.

**Empty/partial states:**
- **0 products:** Hide the entire section. Don't show a heading with no products.
- **1 product:** Show as a single full-width featured card (spans all 3 columns).
- **2–3 products:** Show only Row 1. First product gets featured treatment (spans 2 columns), remaining get compact cards in the third column.
- **4 products:** Full bento grid as described above.

### 5. Story Band

Full-bleed dark section (`oak-900` background) creating a strong visual break after the product grid. Two columns:

- **Left:** Workshop photo from Sanity (atmospheric — workshop, lathe, wood shavings, not a posed portrait)
- **Right:** DM Serif Display heading, body copy in `neutral-300` for readability against dark background, "Meet the maker" link in `forest-300` (oklch 0.74) pointing to About page — `forest-300` chosen over `forest-400` to safely pass WCAG AA contrast on the dark background.

All copy and image CMS-driven. This is the emotional anchor of the page — the dark shift forces the eye to pause.

**Empty state:** If story band fields are empty in Sanity, hide the section entirely.

### 6. Instagram Grid

Back on cream background. 4 square tiles in a row linking to @sipshield Instagram. Static images managed in Sanity (not a live Instagram API feed — avoids API complexity and rate limits). "Follow @sipshield" link centred below.

- Images updated by Ben in Sanity when he wants to refresh
- Lightweight section — present because traffic comes from Instagram

**Empty state:** If no Instagram images are set, hide the section. Don't show an empty grid.

### 7. Footer

Dark `oak-900` background matching the story band, creating a visual bookend. Three columns:

- **Left:** Brand name + short tagline
- **Centre:** Shop links
- **Right:** Info links (About, FAQ, Contact)
- **Bottom:** Copyright, Instagram icon link

Footer links are hardcoded (same rationale as header — they map to app routes). Social links (Instagram URL) from Sanity SiteSettings.

## Semantic HTML

The page uses `<main>` as the primary landmark. Each section uses `<section>` with an `aria-label` or visible heading for accessibility. The header is a `<header>` landmark, footer is a `<footer>` landmark. Nav links in the header and footer use `<nav>` with distinct `aria-label` values.

## Technical Notes

### CSS Approach

- Tailwind v4 with `@theme` tokens already defined in `globals.css`
- CSS Grid for page sections and bento product layout
- `clamp()` for fluid typography on hero headline and section headings
- All colours via OKLCH tokens
- Motion tokens for hover/scroll transitions, `prefers-reduced-motion` respected

### CMS Integration

A new `homepage` singleton document type is required in the Sanity schema. The existing schema (ADR-007) defines Product, ProductFamily, Page, and SiteSettings but has no homepage-specific document. The new schema:

```
homepage (singleton):
  hero:
    kicker: string
    headline: string
    body: text
    ctaLabel: string
    ctaLink: string (default: "/shop")
    productImage: image
  trustBar: array of strings (max 4)
  featuredProducts: array of references to Product (ordered, max 4)
  storyBand:
    heading: string
    body: text
    photo: image
    linkText: string (default: "Meet the maker")
    linkTarget: string (default: "/about")
  instagram:
    images: array of image (max 4, each with alt text)
```

ADR-007 should be updated to include this document type.

The Instagram profile URL lives in `SiteSettings.socialLinks` (site-wide, not homepage-specific). Both the Instagram grid section and the footer read from this single source — no duplicate URL fields.

The existing Product document type already has a `description` field in Sanity — the TypeScript interface in `product-card.tsx` needs to be updated to include it.

### Data Fetching

A new GROQ query is needed in `lib/sanity/queries.ts` for the homepage singleton. The `featuredProducts` field is an array of references and must be dereferenced in the query:

```groq
*[_type == "homepage"][0]{
  hero,
  trustBar,
  featuredProducts[]->{ _id, name, slug, description, price, stripePriceId, images },
  storyBand,
  instagram
}
```

The projected fields on `featuredProducts` must include everything `ProductCard` needs: name, slug, description (for featured variant), price, `stripePriceId` (for add-to-cart), and images. Site settings (for Instagram URL and other global data) are fetched separately via the existing settings query.

### Component Architecture

- **Header** — client component (converted from current server component, needs scroll listener for border/blur)
- **Hero** — server component, content from Sanity homepage document
- **TrustBar** — server component
- **ProductGrid** — server component wrapper, individual cards may be client (add-to-cart)
- **ProductCard** — existing component, extended with `variant` prop (`"featured" | "compact"`) for bento layout
- **AddToCartButton** — existing client component
- **StoryBand** — server component
- **InstagramGrid** — server component
- **Footer** — server component (hardcoded links, social URL from SiteSettings)

### What's Not Included

- Newsletter section (explicitly excluded per Jess)
- "Why SipShield?" features section (trust signals consolidated into trust bar)
- Dark mode (not in scope for launch)

## Alternatives Considered

Six approaches were explored across two rounds:

**Round 1:**
- A (Structured Flow): Traditional split hero + even sections. Too predictable.
- B (Editorial Craft): Oversized typography hero, horizontal product scroll. Hero selected.
- C (Product-Immersive): Dark photo-grid hero, bento products. Product grid selected.

**Round 2** (all using B's hero + C's bento grid):
- D (Story Band): Full dark story section. **Selected.**
- E (Tight Narrative): Minimal, pullquote story, Instagram merged into footer. Too compact.
- F (Maker's Journey): "How it's made" process steps. Interesting but adds complexity.

D was chosen for its strong visual contrast between shop and story halves, and the dramatic dark band that gives the craft narrative proper weight.
