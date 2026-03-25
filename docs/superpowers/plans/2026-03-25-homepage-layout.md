# Homepage Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete SipShield homepage with 7 sections (header, editorial hero, trust bar, bento product grid, story band, Instagram grid, footer), all driven by a Sanity CMS homepage singleton.

**Architecture:** Server-rendered Next.js 16 page fetching from a Sanity homepage singleton document via GROQ. Header is the only client component (scroll detection). All other sections are server components. Products in the bento grid use the existing AddToCartButton client component. Tailwind v4 with OKLCH design tokens already defined in `globals.css`.

**Tech Stack:** Next.js 16, React 19, Sanity CMS, Tailwind v4, TypeScript, lucide-react (icons)

**Spec:** `docs/superpowers/specs/2026-03-25-homepage-layout-design.md`

---

## File Structure

### New files to create

| File | Responsibility |
|------|---------------|
| `lib/sanity/client.ts` | Sanity client instance (projectId, dataset, token from env vars) |
| `lib/sanity/image.ts` | Sanity image URL builder helper |
| `lib/sanity/queries.ts` | All GROQ queries (homepage, settings) |
| `lib/sanity/types.ts` | TypeScript types for Sanity documents (Homepage, SiteSettings, Product) |
| `sanity/schema/homepage.ts` | Sanity schema for homepage singleton document |
| `components/hero.tsx` | Editorial hero section (server component) |
| `components/trust-bar.tsx` | Trust bar section (server component) |
| `components/product-grid.tsx` | Bento product grid layout (server component) |
| `components/story-band.tsx` | Dark story band section (server component) |
| `components/instagram-grid.tsx` | Instagram image grid (server component) |

### Existing files to modify

| File | Changes |
|------|---------|
| `components/header.tsx` | Convert to client component, add scroll-based border/blur |
| `components/footer.tsx` | Add Instagram URL prop from SiteSettings, add `<nav>` landmarks |
| `components/product-card.tsx` | Add `description` to Product interface, add `variant` prop for featured/compact layouts |
| `app/layout.tsx` | Import and render Header + Footer wrapping children |
| `app/page.tsx` | Replace hardcoded hero with full homepage sections fetching from Sanity |
| `app/globals.css` | No changes needed — tokens already complete |
| `package.json` | Add `@sanity/client` and `@sanity/image-url` dependencies |
| `next.config.ts` | Add Sanity CDN to `images.remotePatterns` |

---

## Task 1: Install Sanity dependencies and configure Next.js

**Files:**
- Modify: `package.json`
- Modify: `next.config.ts`

- [ ] **Step 1: Install Sanity client packages**

```bash
npm install @sanity/client @sanity/image-url
```

- [ ] **Step 2: Configure Next.js for Sanity CDN images**

In `next.config.ts`, add the Sanity CDN hostname to `images.remotePatterns` so `next/image` can load Sanity-hosted images:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: add Sanity client deps and configure image CDN"
```

---

## Task 2: Create Sanity client, image helper, and types

**Files:**
- Create: `lib/sanity/client.ts`
- Create: `lib/sanity/image.ts`
- Create: `lib/sanity/types.ts`

- [ ] **Step 1: Create the Sanity client**

Create `lib/sanity/client.ts`:

```ts
import { createClient } from "@sanity/client";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2026-03-25",
  useCdn: true,
});
```

- [ ] **Step 2: Create the image URL builder**

Create `lib/sanity/image.ts`:

```ts
import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

- [ ] **Step 3: Create TypeScript types for Sanity documents**

Create `lib/sanity/types.ts`. These types mirror the Sanity schema and are used by components:

```ts
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  variant: string;
  price: number;
  stripePriceId: string;
  images?: SanityImageSource[];
  tag?: string;
}

export interface HomepageData {
  hero?: {
    kicker: string;
    headline: string;
    body: string;
    ctaLabel: string;
    ctaLink: string;
    productImage: SanityImageSource;
  };
  trustBar?: string[];
  featuredProducts?: SanityProduct[];
  storyBand?: {
    heading: string;
    body: string;
    photo: SanityImageSource;
    linkText: string;
    linkTarget: string;
  };
  instagram?: {
    images?: Array<SanityImageSource & { alt?: string }>;
  };
}

export interface SiteSettings {
  siteName: string;
  socialLinks?: {
    instagram?: string;
  };
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/sanity/
git commit -m "feat: add Sanity client, image helper, and TypeScript types"
```

---

## Task 3: Create GROQ queries

**Files:**
- Create: `lib/sanity/queries.ts`

- [ ] **Step 1: Create the queries file**

Create `lib/sanity/queries.ts` with the homepage query (dereferencing featured products) and a site settings query:

```ts
import { sanityClient } from "./client";
import type { HomepageData, SiteSettings } from "./types";

const homepageQuery = `*[_type == "homepage"][0]{
  hero,
  trustBar,
  featuredProducts[]->{
    _id,
    name,
    slug,
    description,
    variant,
    price,
    stripePriceId,
    images,
    tag
  },
  storyBand,
  instagram
}`;

const settingsQuery = `*[_type == "siteSettings"][0]{
  siteName,
  socialLinks
}`;

export async function getHomepage(): Promise<HomepageData | null> {
  return sanityClient.fetch(homepageQuery);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return sanityClient.fetch(settingsQuery);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/sanity/queries.ts
git commit -m "feat: add GROQ queries for homepage and site settings"
```

---

## Task 4: Create Sanity homepage schema

**Files:**
- Create: `sanity/schema/homepage.ts`

- [ ] **Step 1: Create the homepage singleton schema**

Create `sanity/schema/homepage.ts`. This defines the document type that Ben edits in Sanity Studio:

```ts
import { defineType, defineField } from "sanity";

export const homepage = defineType({
  name: "homepage",
  title: "Homepage",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero Section",
      type: "object",
      fields: [
        defineField({ name: "kicker", title: "Kicker", type: "string", initialValue: "Handcrafted in the UK" }),
        defineField({ name: "headline", title: "Headline", type: "string", initialValue: "Protect your drink in style" }),
        defineField({ name: "body", title: "Body Text", type: "text", rows: 3 }),
        defineField({ name: "ctaLabel", title: "CTA Button Label", type: "string", initialValue: "Shop Collection" }),
        defineField({ name: "ctaLink", title: "CTA Button Link", type: "string", initialValue: "/shop" }),
        defineField({ name: "productImage", title: "Product Image", type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: "trustBar",
      title: "Trust Bar Items",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "featuredProducts",
      title: "Featured Products",
      description: "First product gets the large featured treatment. Maximum 4.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "storyBand",
      title: "Story Band Section",
      type: "object",
      fields: [
        defineField({ name: "heading", title: "Heading", type: "string" }),
        defineField({ name: "body", title: "Body Text", type: "text", rows: 4 }),
        defineField({ name: "photo", title: "Workshop Photo", type: "image", options: { hotspot: true } }),
        defineField({ name: "linkText", title: "Link Text", type: "string", initialValue: "Meet the maker" }),
        defineField({ name: "linkTarget", title: "Link URL", type: "string", initialValue: "/about" }),
      ],
    }),
    defineField({
      name: "instagram",
      title: "Instagram Section",
      type: "object",
      fields: [
        defineField({
          name: "images",
          title: "Instagram Images",
          type: "array",
          of: [{ type: "image", options: { hotspot: true }, fields: [
            defineField({ name: "alt", title: "Alt Text", type: "string" }),
          ]}],
          validation: (rule) => rule.max(4),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Homepage" }),
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add sanity/schema/homepage.ts
git commit -m "feat: add Sanity homepage singleton schema"
```

---

## Task 5: Convert Header to client component with scroll behaviour

**Files:**
- Modify: `components/header.tsx`

- [ ] **Step 1: Rewrite header as a client component with scroll detection**

The existing header has a static border. The new header starts borderless and transparent, then adds a border + backdrop-blur when the user scrolls past 0. It must also use `<nav aria-label="Main navigation">` for accessibility:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartButton } from "./cart-button";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[border-color,background-color,backdrop-filter] duration-200 ${
        scrolled
          ? "bg-cream/92 backdrop-blur-md border-b border-oak-100"
          : "bg-cream border-b border-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl text-oak-800 hover:text-oak-700 transition-colors duration-100"
        >
          SipShield
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-neutral-600 font-medium hover:text-oak-700 transition-colors duration-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <CartButton />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/header.tsx
git commit -m "feat: convert header to client component with scroll-based border/blur"
```

---

## Task 6: Update ProductCard with featured/compact variants

**Files:**
- Modify: `components/product-card.tsx`

- [ ] **Step 1: Add `description` to Product interface and `variant` prop to ProductCardProps**

Rewrite `components/product-card.tsx` to support two layouts. The `"featured"` variant is horizontal (image left, content right, shows description). The `"compact"` variant (default) is the existing vertical layout:

```tsx
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";

export interface Product {
  id: string;
  name: string;
  slug: string;
  variant: string;
  price: number;
  stripePriceId: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  tag?: string;
}

interface ProductCardProps {
  product: Product;
  layout?: "featured" | "compact";
}

export function ProductCard({ product, layout = "compact" }: ProductCardProps) {
  if (layout === "featured") {
    return <FeaturedCard product={product} />;
  }
  return <CompactCard product={product} />;
}

function FeaturedCard({ product }: { product: Product }) {
  return (
    <article className="group relative grid grid-cols-1 sm:grid-cols-2 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300">
      <div className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-oak-300 text-5xl">
            &#9673;
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-forest-500 text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col justify-center">
        <Link href="/shop" className="after:absolute after:inset-0" tabIndex={-1} aria-hidden="true" />
        <h3 className="font-display text-[clamp(1.25rem,2vw+0.5rem,1.5rem)] text-charcoal mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-neutral-500 leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
            &pound;{product.price.toFixed(2)}
          </span>
          <span className="relative z-10">
            <AddToCartButton product={product} />
          </span>
        </div>
      </div>
    </article>
  );
}

function CompactCard({ product }: { product: Product }) {
  return (
    <article className="group relative bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-oak-300 text-5xl">
            &#9673;
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-forest-500 text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-4 pb-5">
        <Link href="/shop" className="after:absolute after:inset-0" tabIndex={-1} aria-hidden="true" />
        <h3 className="font-display text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-charcoal mb-0.5">
          {product.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          {product.variant}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
            &pound;{product.price.toFixed(2)}
          </span>
          <span className="relative z-10">
            <AddToCartButton product={product} />
          </span>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/product-card.tsx
git commit -m "feat: add featured/compact variants to ProductCard with description field"
```

---

## Task 7: Create Hero component

**Files:**
- Create: `components/hero.tsx`

- [ ] **Step 1: Create the editorial hero section**

Create `components/hero.tsx`. Server component. Asymmetric layout with oversized display type left, floating product image right:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { HomepageData } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

interface HeroProps {
  hero: NonNullable<HomepageData["hero"]>;
}

export function Hero({ hero }: HeroProps) {
  return (
    <section aria-label="Hero" className="relative max-w-[1200px] mx-auto px-6 pt-16 pb-24 md:pt-20 md:pb-32">
      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] items-center gap-8 md:gap-0">
        {/* Text content */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-forest-600 mb-4">
            {hero.kicker}
          </p>
          <h1 className="font-display text-[clamp(2.5rem,5vw+1rem,4.5rem)] leading-[1.08] tracking-tight text-oak-800 mb-6">
            {hero.headline}
          </h1>
          <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 leading-relaxed max-w-[42ch] mb-8">
            {hero.body}
          </p>
          <Link
            href={hero.ctaLink}
            className="inline-block px-6 py-3 bg-forest-500 text-white font-medium rounded-md shadow-sm hover:bg-forest-600 hover:shadow-md transition-all duration-100 focus-visible:outline-none focus-visible:shadow-focus"
          >
            {hero.ctaLabel}
          </Link>
        </div>

        {/* Floating product image */}
        {hero.productImage && (
          <div className="relative justify-self-center md:justify-self-end">
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] rotate-2">
              <Image
                src={urlFor(hero.productImage).width(680).height(680).url()}
                alt={hero.headline || "Featured drink cover"}
                width={680}
                height={680}
                className="rounded-xl object-cover shadow-lg"
                sizes="(max-width: 768px) 280px, 340px"
                priority
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero.tsx
git commit -m "feat: add Hero component with editorial layout and CMS content"
```

---

## Task 8: Create TrustBar component

**Files:**
- Create: `components/trust-bar.tsx`

- [ ] **Step 1: Create the trust bar**

Create `components/trust-bar.tsx`. Server component. A compact row of selling points separated by centred dots (no leading dot on the first item):

```tsx
interface TrustBarProps {
  items: string[];
}

export function TrustBar({ items }: TrustBarProps) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-label="Why SipShield" className="border-y border-oak-100">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-neutral-500">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-oak-300">·</span>}
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/trust-bar.tsx
git commit -m "feat: add TrustBar component"
```

---

## Task 9: Create ProductGrid component (bento layout)

**Files:**
- Create: `components/product-grid.tsx`

- [ ] **Step 1: Create the bento product grid**

Create `components/product-grid.tsx`. Server component that wraps ProductCards in a bento CSS Grid layout. Handles 0-4 products with the partial states from the spec:

```tsx
import { ProductCard } from "./product-card";
import type { SanityProduct } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import type { Product } from "./product-card";

interface ProductGridProps {
  heading?: string;
  products: SanityProduct[];
}

function toCardProduct(p: SanityProduct, layout: "featured" | "compact"): Product {
  const img = p.images?.[0];
  // Featured cards use 3:2 landscape, compact cards use 1:1 square
  const w = layout === "featured" ? 900 : 600;
  const h = layout === "featured" ? 600 : 600;
  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: p.price,
    stripePriceId: p.stripePriceId,
    description: p.description,
    image: img
      ? {
          url: urlFor(img).width(w).height(h).url(),
          alt: p.name,
          width: w,
          height: h,
        }
      : undefined,
    tag: p.tag,
  };
}

export function ProductGrid({ heading, products }: ProductGridProps) {
  if (!products || products.length === 0) return null;

  const [first, ...rest] = products;

  return (
    <section aria-labelledby="product-grid-heading" className="max-w-[1200px] mx-auto px-6 py-16">
      {heading && (
        <h2
          id="product-grid-heading"
          className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-800 mb-8"
        >
          {heading}
        </h2>
      )}

      {products.length === 1 ? (
        <ProductCard product={toCardProduct(first, "featured")} layout="featured" />
      ) : products.length <= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(first, "featured")} layout="featured" />
          </div>
          {rest.map((p) => (
            <ProductCard key={p._id} product={toCardProduct(p, "compact")} layout="compact" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: featured left (spans 2 on lg), 2 compact right */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProductCard product={toCardProduct(products[0], "featured")} layout="featured" />
          </div>
          <div className="flex flex-col gap-4">
            <ProductCard product={toCardProduct(products[1], "compact")} layout="compact" />
            <ProductCard product={toCardProduct(products[2], "compact")} layout="compact" />
          </div>
          {/* Row 2: single compact card */}
          <ProductCard product={toCardProduct(products[3], "compact")} layout="compact" />
        </div>
      )}
    </section>
  );
}
```

Note: With exactly 4 products, row 2 shows only `products[3]` as a single compact card. A full two-row bento (with a second featured card) would require 5+ products, but the spec caps at 4. This keeps each product appearing exactly once. The grid uses `md:grid-cols-2 lg:grid-cols-3` to match the spec's three-tier responsive breakpoints (mobile single-col, tablet 2-col, desktop 3-col).

- [ ] **Step 2: Commit**

```bash
git add components/product-grid.tsx
git commit -m "feat: add ProductGrid bento layout with partial-state handling"
```

---

## Task 10: Create StoryBand component

**Files:**
- Create: `components/story-band.tsx`

- [ ] **Step 1: Create the dark story band section**

Create `components/story-band.tsx`. Server component. Full-bleed dark background, two-column layout:

```tsx
import Image from "next/image";
import Link from "next/link";
import type { HomepageData } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

interface StoryBandProps {
  storyBand: NonNullable<HomepageData["storyBand"]>;
}

export function StoryBand({ storyBand }: StoryBandProps) {
  if (!storyBand.heading && !storyBand.body) return null;

  const hasPhoto = Boolean(storyBand.photo);

  return (
    <section aria-label="Our story" className="bg-oak-900">
      <div className={`grid grid-cols-1 ${hasPhoto ? "md:grid-cols-[1fr_1.4fr]" : ""}`}>
        {/* Workshop photo */}
        {hasPhoto && (
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image
              src={urlFor(storyBand.photo).width(800).height(600).url()}
              alt="Workshop"
              width={800}
              height={600}
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        )}

        {/* Text content */}
        <div className={`px-6 py-12 md:py-16 flex flex-col justify-center ${hasPhoto ? "md:px-12" : "md:px-12 max-w-[1200px] mx-auto"}`}>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-100 mb-4 leading-tight">
            {storyBand.heading}
          </h2>
          <p className="text-neutral-300 leading-relaxed max-w-[48ch] mb-6">
            {storyBand.body}
          </p>
          {storyBand.linkTarget && (
            <Link
              href={storyBand.linkTarget}
              className="text-forest-300 font-medium hover:text-forest-200 transition-colors duration-100 focus-visible:outline-none focus-visible:shadow-focus w-fit"
            >
              {storyBand.linkText || "Learn more"} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/story-band.tsx
git commit -m "feat: add StoryBand dark section with workshop photo"
```

---

## Task 11: Create InstagramGrid component

**Files:**
- Create: `components/instagram-grid.tsx`

- [ ] **Step 1: Create the Instagram image grid**

Create `components/instagram-grid.tsx`. Server component. 4 square tiles linking to Instagram:

```tsx
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface InstagramGridProps {
  images: Array<SanityImageSource & { alt?: string }>;
  profileUrl: string;
}

export function InstagramGrid({ images, profileUrl }: InstagramGridProps) {
  if (!images || images.length === 0) return null;

  return (
    <section aria-label="Instagram" className="max-w-[1200px] mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <a
            key={i}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <Image
              src={urlFor(img).width(400).height(400).url()}
              alt={img.alt || `Instagram photo ${i + 1}`}
              width={400}
              height={400}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300 ease-out"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </a>
        ))}
      </div>
      <p className="text-center mt-4">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-500 hover:text-oak-700 transition-colors duration-100 font-medium"
        >
          Follow @sipshield
        </a>
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/instagram-grid.tsx
git commit -m "feat: add InstagramGrid component"
```

---

## Task 12: Update Footer with nav landmarks and Instagram URL prop

**Files:**
- Modify: `components/footer.tsx`

- [ ] **Step 1: Add `<nav>` landmarks and accept `instagramUrl` prop**

Update `components/footer.tsx` to accept an `instagramUrl` prop (from SiteSettings) instead of hardcoding it, and wrap link groups in `<nav>` elements with `aria-label`:

```tsx
import Link from "next/link";

const shopLinks = [
  { href: "/shop", label: "All Products" },
];

const infoLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

interface FooterProps {
  instagramUrl?: string;
}

export function Footer({ instagramUrl }: FooterProps) {
  return (
    <footer className="bg-oak-900 text-oak-200">
      <div className="max-w-[1200px] mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-12 mb-10 pb-8 border-b border-white/10">
          <div>
            <p className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-100 mb-3">
              SipShield
            </p>
            <p className="text-oak-400 leading-relaxed max-w-[32ch]">
              Handcrafted oak drink covers, made in the UK.
              Each piece is unique — no two are the same.
            </p>
          </div>

          <nav aria-label="Shop links">
            <p className="text-sm font-semibold uppercase tracking-wider text-oak-300 mb-4">
              Shop
            </p>
            <ul className="flex flex-col gap-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-oak-400 hover:text-oak-100 transition-colors duration-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Info links">
            <p className="text-sm font-semibold uppercase tracking-wider text-oak-300 mb-4">
              Info
            </p>
            <ul className="flex flex-col gap-3">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-oak-400 hover:text-oak-100 transition-colors duration-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-oak-500">
          <span>&copy; {new Date().getFullYear()} SipShield. All rights reserved.</span>
          {instagramUrl && (
            <div className="flex gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-oak-400 font-medium hover:text-oak-100 transition-colors duration-100"
              >
                Instagram
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/footer.tsx
git commit -m "feat: update Footer with nav landmarks and instagramUrl prop"
```

---

## Task 13: Wire Header + Footer into layout, assemble homepage

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Add Header and Footer to the root layout**

Update `app/layout.tsx` to import and render both Header and Footer. The layout is async so it can fetch SiteSettings for the Footer's Instagram URL. This avoids every page needing to fetch settings and render the Footer individually:

```tsx
import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSiteSettings } from "@/lib/sanity/queries";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: "400",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "SipShield — Handcrafted Oak Drink Covers",
  description:
    "Hand-turned oak drink covers that protect your drink in style. Each piece is unique, sustainably sourced, and made in the UK.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshield";

  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${plusJakarta.variable}`}
    >
      <body>
        <Header />
        {children}
        <Footer instagramUrl={instagramUrl} />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Rewrite homepage to assemble all sections from Sanity data**

Replace `app/page.tsx` entirely. This is the main integration point — it fetches from Sanity and passes data to each section component:

```tsx
import { getHomepage, getSiteSettings } from "@/lib/sanity/queries";
import { Hero } from "@/components/hero";
import { TrustBar } from "@/components/trust-bar";
import { ProductGrid } from "@/components/product-grid";
import { StoryBand } from "@/components/story-band";
import { InstagramGrid } from "@/components/instagram-grid";

export default async function Home() {
  const [homepage, settings] = await Promise.all([
    getHomepage(),
    getSiteSettings(),
  ]);

  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshield";

  return (
    <main>
      {homepage?.hero && <Hero hero={homepage.hero} />}

      {homepage?.trustBar && <TrustBar items={homepage.trustBar} />}

      {homepage?.featuredProducts && (
        <ProductGrid heading="Featured Pieces" products={homepage.featuredProducts} />
      )}

      {homepage?.storyBand && <StoryBand storyBand={homepage.storyBand} />}

      {homepage?.instagram?.images && (
        <InstagramGrid
          images={homepage.instagram.images}
          profileUrl={instagramUrl}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: assemble homepage with all sections from Sanity CMS"
```

---

## Task 14: Verify build

- [ ] **Step 1: Run the build**

```bash
npm run build
```

This will fail if Sanity env vars are not set (expected for now — the Sanity project hasn't been created yet). The build will confirm TypeScript compilation and component imports are correct. If env vars are available, it will also validate the GROQ queries.

Expected: TypeScript compiles without errors. Build may fail at data-fetching time if env vars are missing — that's acceptable. The important thing is zero type errors.

- [ ] **Step 2: If type errors exist, fix them and commit**

```bash
git add -A
git commit -m "fix: resolve type errors from homepage assembly"
```

- [ ] **Step 3: Final commit if everything passes**

```bash
git add -A
git commit -m "chore: homepage layout implementation complete"
```
