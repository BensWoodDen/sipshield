# SipShield Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-cost e-commerce site for handcrafted oak drink covers with Sanity CMS for content management and Stripe Checkout Sessions for payment.

**Architecture:** Single Next.js 16 App Router application. Content and products managed in Sanity CMS (free tier), fetched at build time via GROQ queries. Client-side cart with Zustand + localStorage persistence. One API route creates Stripe Checkout Sessions. Hosted on Netlify free tier. See `docs/architecture/` for full ADRs and domain map.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4 (OKLCH), Zustand, Sanity CMS, Stripe Checkout Sessions, Netlify

---

## File Structure

```
sipshield/
├── app/
│   ├── layout.tsx                    # Root layout: HTML shell, fonts, Tailwind, cart provider
│   ├── page.tsx                      # Home page (hero, featured products, value prop)
│   ├── shop/page.tsx                 # Product catalog grouped by family
│   ├── about/page.tsx                # Brand story
│   ├── faq/page.tsx                  # FAQ with Sanity content
│   ├── contact/page.tsx              # Contact info (WhatsApp, Instagram, email)
│   ├── cart/page.tsx                 # Cart review page
│   ├── success/page.tsx              # Post-checkout success
│   ├── api/
│   │   ├── checkout/route.ts         # POST: create Stripe Checkout Session
│   │   └── revalidate/route.ts       # POST: Sanity webhook → on-demand revalidation
│   └── studio/[[...tool]]/
│       └── page.tsx                  # Sanity Studio embedded route
├── components/
│   ├── header.tsx                    # Site header with nav + cart icon
│   ├── footer.tsx                    # Site footer with links + social
│   ├── mobile-nav.tsx                # Mobile hamburger menu
│   ├── cart-icon.tsx                 # Header cart icon with item count badge
│   ├── cart-drawer.tsx               # Slide-out cart drawer
│   ├── cart-item.tsx                 # Single cart item row (image, qty, remove)
│   ├── product-card.tsx              # Product display card with "Add to Cart"
│   ├── product-family-section.tsx    # Groups products by family on shop page
│   ├── portable-text.tsx             # Renders Sanity Portable Text as HTML
│   ├── sanity-image.tsx              # Sanity image with next/image integration
│   └── add-to-cart-button.tsx        # Client component: add to cart interaction
├── lib/
│   ├── sanity/
│   │   ├── client.ts                 # Sanity client config (projectId, dataset, apiVersion)
│   │   ├── queries.ts                # All GROQ queries
│   │   ├── image.ts                  # Sanity image URL builder helper
│   │   └── types.ts                  # TypeScript types for Sanity documents
│   ├── stripe.ts                     # Stripe server-side client init
│   ├── cart-store.ts                 # Zustand store with persist middleware
│   └── utils.ts                      # Shared helpers (format currency, etc.)
├── sanity/
│   ├── sanity.config.ts              # Sanity Studio configuration
│   ├── sanity.cli.ts                 # Sanity CLI configuration
│   ├── env.ts                        # Sanity env var validation
│   └── schema/
│       ├── index.ts                  # Schema export barrel
│       ├── product.ts                # Product document type
│       ├── product-family.ts         # Product family document type
│       ├── page.ts                   # Page document type
│       └── site-settings.ts          # Singleton: site-wide settings
├── app/globals.css                   # Tailwind v4 directives + @theme with OKLCH palette
├── postcss.config.mjs                # PostCSS config (required by Tailwind v4)
├── next.config.ts                    # Next.js config (Sanity image domains)
├── .env.local.example                # Template for required env vars
├── netlify.toml                      # Netlify build configuration
└── package.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.env.local.example`, `.gitignore`, `netlify.toml`

- [ ] **Step 1: Scaffold Next.js project**

Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack`

Accept defaults. This creates the base Next.js 16 project with TypeScript, Tailwind, ESLint, and App Router.

- [ ] **Step 2: Install core dependencies**

Run: `npm install zustand stripe next-sanity @sanity/image-url @sanity/vision sanity @portabletext/react @netlify/plugin-nextjs`

Run: `npm install -D @sanity/types`

Note: `@netlify/plugin-nextjs` is also declared in `netlify.toml`. Including it in `package.json` ensures the correct version is locked.

- [ ] **Step 3: Create `.env.local.example`**

Create `.env.local.example` with all required env vars (no values):

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
SANITY_REVALIDATE_SECRET=
# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 4: Configure `next.config.ts` for Sanity images**

```typescript
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

- [ ] **Step 5: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- [ ] **Step 6: Set up Tailwind v4 with OKLCH palette in `app/globals.css`**

Replace the generated `globals.css` with Tailwind v4 directives and the SipShield OKLCH colour theme:

```css
@import "tailwindcss";

@theme {
  /* Oak/Amber primary */
  --color-oak-50: oklch(0.97 0.02 80);
  --color-oak-100: oklch(0.93 0.04 80);
  --color-oak-200: oklch(0.87 0.06 80);
  --color-oak-300: oklch(0.79 0.09 80);
  --color-oak-400: oklch(0.70 0.12 80);
  --color-oak-500: oklch(0.60 0.13 80);
  --color-oak-600: oklch(0.52 0.12 80);
  --color-oak-700: oklch(0.43 0.10 80);
  --color-oak-800: oklch(0.35 0.08 80);
  --color-oak-900: oklch(0.25 0.06 80);

  /* Forest green CTAs */
  --color-forest-50: oklch(0.96 0.03 155);
  --color-forest-100: oklch(0.92 0.05 155);
  --color-forest-200: oklch(0.85 0.08 155);
  --color-forest-300: oklch(0.75 0.12 155);
  --color-forest-400: oklch(0.65 0.14 155);
  --color-forest-500: oklch(0.55 0.15 155);
  --color-forest-600: oklch(0.47 0.13 155);
  --color-forest-700: oklch(0.38 0.11 155);
  --color-forest-800: oklch(0.30 0.09 155);
  --color-forest-900: oklch(0.22 0.06 155);

  /* Neutrals */
  --color-cream: oklch(0.97 0.01 90);
  --color-charcoal: oklch(0.25 0.01 260);
  --color-charcoal-light: oklch(0.40 0.01 260);

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "DM Serif Display", ui-serif, Georgia, serif;
}
```

- [ ] **Step 7: Update `app/layout.tsx` with fonts and base styling**

Import Inter and DM Serif Display from `next/font/google`. Set `<html>` with `font-sans` and `bg-cream text-charcoal` classes. Add placeholder `<header>` and `<footer>` to be built in later tasks.

- [ ] **Step 8: Verify dev server starts**

Run: `npm run dev`
Expected: App starts on `http://localhost:3000` with the default Next.js page styled with the OKLCH cream background.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 project with Tailwind v4 OKLCH theme and Netlify config"
```

---

## Task 2: Sanity CMS Schema and Studio

**Files:**
- Create: `sanity/sanity.config.ts`, `sanity/sanity.cli.ts`, `sanity/env.ts`, `sanity/schema/index.ts`, `sanity/schema/product.ts`, `sanity/schema/product-family.ts`, `sanity/schema/page.ts`, `sanity/schema/site-settings.ts`, `app/studio/[[...tool]]/page.tsx`

**Prerequisite:** A Sanity project must be created at sanity.io. Run `npx sanity init` or create via the dashboard. Note the project ID.

- [ ] **Step 1: Create Sanity env helper**

Create `sanity/env.ts`:

```typescript
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2026-03-25";
```

- [ ] **Step 2: Create Product Family schema**

Create `sanity/schema/product-family.ts`:

```typescript
import { defineType, defineField } from "sanity";

export const productFamily = defineType({
  name: "productFamily",
  title: "Product Family",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first on the shop page",
      validation: (rule) => rule.required().min(0),
    }),
  ],
  orderings: [
    {
      title: "Display Order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
});
```

- [ ] **Step 3: Create Product schema**

Create `sanity/schema/product.ts`:

```typescript
import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "family",
      title: "Product Family",
      type: "reference",
      to: [{ type: "productFamily" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "price",
      title: "Price (£)",
      type: "number",
      description: "Display price in GBP. Authoritative price is in Stripe.",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "stripePriceId",
      title: "Stripe Price ID",
      type: "string",
      description: "From Stripe Dashboard (e.g. price_abc123). Create the product in Stripe first, then paste the price ID here.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "personalisable",
      title: "Personalisable?",
      type: "boolean",
      initialValue: false,
      description: "If true, customer can add personalisation text at checkout.",
    }),
    defineField({
      name: "personalisationLabel",
      title: "Personalisation Label",
      type: "string",
      description: "Label shown on Stripe checkout for the custom text field (e.g. 'Engraving text')",
      hidden: ({ document }) => !document?.personalisable,
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "sizeOptions",
      title: "Size Options",
      type: "array",
      of: [{ type: "string" }],
      description: "e.g. S, M, L for Bull Edition, or 70mm, 80mm, 90mm for Mug Edition. Leave empty if no size options.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "family.name",
      media: "images.0",
    },
  },
});
```

- [ ] **Step 4: Create Page schema**

Create `sanity/schema/page.ts`:

```typescript
import { defineType, defineField } from "sanity";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description: "Overrides the page title in <title> tag. Leave blank to use page title.",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      rows: 2,
      description: "Meta description for search engines.",
    }),
  ],
});
```

- [ ] **Step 5: Create Site Settings singleton schema**

Create `sanity/schema/site-settings.ts`:

```typescript
import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      type: "string",
      initialValue: "Sip Shield",
    }),
    defineField({
      name: "siteDescription",
      title: "Site Description",
      type: "text",
      rows: 2,
      description: "Default meta description.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "heroText",
      title: "Hero Text",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp Number",
      type: "string",
      description: "Full international number, no spaces (e.g. 447393404867)",
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram Handle",
      type: "string",
      description: "Without @ (e.g. sipshielduk)",
    }),
    defineField({
      name: "shippingInfo",
      title: "Shipping Information",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});
```

- [ ] **Step 6: Create schema barrel export**

Create `sanity/schema/index.ts`:

```typescript
import { product } from "./product";
import { productFamily } from "./product-family";
import { page } from "./page";
import { siteSettings } from "./site-settings";

export const schemaTypes = [product, productFamily, page, siteSettings];
```

- [ ] **Step 7: Create Sanity Studio config**

Create `sanity/sanity.config.ts`:

```typescript
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schema";
import { projectId, dataset } from "./env";

export default defineConfig({
  name: "sipshield",
  title: "SipShield",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

- [ ] **Step 8: Create Sanity CLI config**

Create `sanity/sanity.cli.ts`:

```typescript
import { defineCliConfig } from "sanity/cli";
import { projectId, dataset } from "./env";

export default defineCliConfig({
  api: { projectId, dataset },
});
```

- [ ] **Step 9: Create Sanity Studio route in Next.js**

Create `app/studio/[[...tool]]/page.tsx`:

```typescript
"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity/sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 10: Verify Studio loads**

Set `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`.
Run: `npm run dev`
Navigate to `http://localhost:3000/studio`
Expected: Sanity Studio loads with Product, Product Family, Page, and Site Settings document types visible.

- [ ] **Step 11: Commit**

```bash
git add sanity/ app/studio/
git commit -m "feat: add Sanity CMS schemas (product, family, page, settings) and embedded Studio"
```

---

## Task 3: Sanity Client and GROQ Queries

**Files:**
- Create: `lib/sanity/client.ts`, `lib/sanity/image.ts`, `lib/sanity/queries.ts`, `lib/sanity/types.ts`

- [ ] **Step 1: Create Sanity client**

Create `lib/sanity/client.ts`:

```typescript
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "@/sanity/env";

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
```

- [ ] **Step 2: Create image URL builder**

Create `lib/sanity/image.ts`:

```typescript
import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "./client";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

- [ ] **Step 3: Create TypeScript types for Sanity documents**

Create `lib/sanity/types.ts`:

```typescript
import type { PortableTextBlock, ImageAsset } from "sanity";

export interface SanityImage {
  _type: "image";
  asset: ImageAsset;
  hotspot?: { x: number; y: number; height: number; width: number };
}

export interface ProductFamily {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  displayOrder: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  family: ProductFamily;
  description?: string;
  price: number;
  stripePriceId: string;
  personalisable: boolean;
  personalisationLabel?: string;
  images: SanityImage[];
  sizeOptions?: string[];
}

export interface Page {
  _id: string;
  title: string;
  slug: { current: string };
  body?: PortableTextBlock[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface SiteSettings {
  _id: string;
  siteName: string;
  siteDescription?: string;
  heroImage?: SanityImage;
  heroText?: string;
  contactEmail?: string;
  whatsappNumber?: string;
  instagramHandle?: string;
  shippingInfo?: PortableTextBlock[];
}
```

- [ ] **Step 4: Create GROQ queries**

Create `lib/sanity/queries.ts`:

```typescript
import { sanityClient } from "./client";
import type { Product, ProductFamily, Page, SiteSettings } from "./types";

export async function getProducts(): Promise<Product[]> {
  return sanityClient.fetch(`
    *[_type == "product"] | order(family->displayOrder asc, name asc) {
      _id,
      name,
      slug,
      family->{_id, name, slug, displayOrder},
      description,
      price,
      stripePriceId,
      personalisable,
      personalisationLabel,
      images,
      sizeOptions
    }
  `);
}

export async function getProductFamilies(): Promise<ProductFamily[]> {
  return sanityClient.fetch(`
    *[_type == "productFamily"] | order(displayOrder asc) {
      _id, name, slug, description, displayOrder
    }
  `);
}

export async function getPage(slug: string): Promise<Page | null> {
  return sanityClient.fetch(
    `*[_type == "page" && slug.current == $slug][0] {
      _id, title, slug, body, seoTitle, seoDescription
    }`,
    { slug }
  );
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      _id, siteName, siteDescription, heroImage, heroText,
      contactEmail, whatsappNumber, instagramHandle, shippingInfo
    }
  `);
}
```

- [ ] **Step 5: Verify build succeeds**

Run: `npm run build`
Expected: Build succeeds (queries won't return data yet since Sanity has no content, but no type errors).

- [ ] **Step 6: Commit**

```bash
git add lib/sanity/
git commit -m "feat: add Sanity client, GROQ queries, image helper, and TypeScript types"
```

---

## Task 4: Zustand Cart Store

**Files:**
- Create: `lib/cart-store.ts`, `lib/utils.ts`

- [ ] **Step 1: Create currency formatting utility**

Create `lib/utils.ts`:

```typescript
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}
```

Note: Prices are stored as pounds (e.g. 10, 11.50), not pence. The `amount` parameter is in pounds.

- [ ] **Step 2: Create Zustand cart store**

Create `lib/cart-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  stripePriceId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (stripePriceId: string) => void;
  updateQuantity: (stripePriceId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.stripePriceId === item.stripePriceId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.stripePriceId === item.stripePriceId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (stripePriceId) =>
        set((state) => ({
          items: state.items.filter((i) => i.stripePriceId !== stripePriceId),
        })),

      updateQuantity: (stripePriceId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.stripePriceId !== stripePriceId)
              : state.items.map((i) =>
                  i.stripePriceId === stripePriceId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "sipshield-cart",
    }
  )
);
```

- [ ] **Step 3: Verify no type errors**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/cart-store.ts lib/utils.ts
git commit -m "feat: add Zustand cart store with localStorage persistence"
```

---

## Task 5: Stripe Integration and Checkout API Route

**Files:**
- Create: `lib/stripe.ts`, `app/api/checkout/route.ts`, `app/success/page.tsx`

- [ ] **Step 1: Create Stripe server client**

Create `lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});
```

Note: Omitting `apiVersion` uses the version pinned to your Stripe account (set in Dashboard → Developers → API version). This avoids hardcoding a stale version.

- [ ] **Step 2: Create checkout API route**

Create `app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

interface CheckoutItem {
  stripePriceId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CheckoutItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    // Validate all price IDs exist in Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const item of items) {
      try {
        await stripe.prices.retrieve(item.stripePriceId);
      } catch {
        return NextResponse.json(
          { error: `Invalid price ID: ${item.stripePriceId}` },
          { status: 400 }
        );
      }
      lineItems.push({
        price: item.stripePriceId,
        quantity: item.quantity,
      });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ["GB"],
      },
      allow_promotion_codes: true,
      custom_fields: [
        {
          key: "personalisation",
          label: { type: "custom", custom: "Personalisation text (if applicable)" },
          type: "text",
          optional: true,
        },
      ],
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create success page with cart-clearing**

Create `app/success/page.tsx` — this page must clear the cart after a successful checkout. Since `useCartStore` requires a client component, create a `ClearCartOnMount` client component:

```typescript
// app/success/page.tsx
import Link from "next/link";
import { ClearCart } from "@/components/clear-cart";

export default function SuccessPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <ClearCart />
      <h1 className="font-display text-4xl text-oak-800 mb-4">
        Thank you for your order!
      </h1>
      <p className="text-charcoal-light mb-8">
        You&apos;ll receive a confirmation email from Stripe shortly.
        Ben will begin crafting your Sip Shield right away.
      </p>
      <Link
        href="/shop"
        className="inline-block rounded-lg bg-forest-600 px-6 py-3 text-white font-medium hover:bg-forest-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </main>
  );
}
```

```typescript
// components/clear-cart.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function ClearCart() {
  const clearCart = useCartStore((s) => s.clearCart);
  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return null;
}
```
```

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build succeeds. The API route won't work without a Stripe key, but should compile.

- [ ] **Step 5: Commit**

```bash
git add lib/stripe.ts app/api/checkout/ app/success/
git commit -m "feat: add Stripe checkout API route and success page"
```

---

## Task 6: Shared Layout Components (Header, Footer, Mobile Nav)

**Files:**
- Create: `components/header.tsx`, `components/footer.tsx`, `components/mobile-nav.tsx`, `components/cart-icon.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create cart icon component (client component)**

Create `components/cart-icon.tsx` — a client component that reads cart item count from Zustand and renders a shopping bag icon with a badge. Links to `/cart`.

- [ ] **Step 2: Create header component**

Create `components/header.tsx` — site header with:
- SipShield logo/text (links to `/`)
- Desktop nav: Shop, About, FAQ, Contact
- Cart icon (from Step 1)
- Mobile hamburger button (triggers mobile nav)
- Sticky positioning, cream background with subtle bottom border

- [ ] **Step 3: Create mobile nav component (client component)**

Create `components/mobile-nav.tsx` — slide-out mobile navigation panel with the same links as desktop nav. Closes on link click or outside click.

- [ ] **Step 4: Create footer component**

Create `components/footer.tsx` — site footer with:
- SipShield name + "Handcrafted in Bournemouth"
- Nav links (same as header)
- Social links: Instagram (@sipshielduk), WhatsApp
- Copyright line

- [ ] **Step 5: Update `app/layout.tsx`**

Import Header and Footer. Wrap `{children}` with them. Structure:

```tsx
<html lang="en">
  <body className="font-sans bg-cream text-charcoal min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 6: Verify layout renders**

Run: `npm run dev`
Expected: Header with nav links and cart icon visible. Footer with social links. All links navigate correctly. Mobile nav works on small viewports.

- [ ] **Step 7: Commit**

```bash
git add components/header.tsx components/footer.tsx components/mobile-nav.tsx components/cart-icon.tsx app/layout.tsx
git commit -m "feat: add shared layout with header, footer, mobile nav, and cart icon"
```

---

## Task 7: Sanity Image and Portable Text Components

**Files:**
- Create: `components/sanity-image.tsx`, `components/portable-text.tsx`

- [ ] **Step 1: Create Sanity image component**

Create `components/sanity-image.tsx` — wraps `next/image` with Sanity's image URL builder. Accepts a Sanity image source, width, height, alt text. Uses `urlFor()` from `lib/sanity/image.ts` to generate optimised URLs.

- [ ] **Step 2: Create Portable Text renderer**

Create `components/portable-text.tsx` — wraps `@portabletext/react` PortableText component with custom serializers for Sanity block content. Handles: headings, paragraphs, links, images, lists. Applies Tailwind prose-like styling.

- [ ] **Step 3: Commit**

```bash
git add components/sanity-image.tsx components/portable-text.tsx
git commit -m "feat: add Sanity image and Portable Text rendering components"
```

---

## Task 8: Product Card and Shop Page

**Files:**
- Create: `components/product-card.tsx`, `components/product-family-section.tsx`, `components/add-to-cart-button.tsx`, `app/shop/page.tsx`

- [ ] **Step 1: Create "Add to Cart" button (client component)**

Create `components/add-to-cart-button.tsx` — a `'use client'` component that calls `useCartStore().addItem()` on click. Shows a brief "Added!" confirmation state. Accepts product data as props (name, price, stripePriceId, image URL).

- [ ] **Step 2: Create product card component**

Create `components/product-card.tsx` — displays a single product:
- Product image (Sanity image component)
- Product name
- Price (formatted)
- "Personalised" badge if applicable
- Size selector dropdown if `sizeOptions` exists
- Add to Cart button

Server component for the card shell, with the Add to Cart button as a nested client component.

- [ ] **Step 3: Create product family section component**

Create `components/product-family-section.tsx` — groups products under a family heading:
- Family name as section heading
- Family description
- Grid of product cards (responsive: 1 col mobile, 2 col tablet, 3 col desktop)

- [ ] **Step 4: Create shop page**

Create `app/shop/page.tsx` — Server Component that:
- Fetches products and families from Sanity via GROQ queries
- Groups products by family
- Renders a `ProductFamilySection` for each family, ordered by `displayOrder`
- Includes page metadata for SEO

```typescript
import { getProducts, getProductFamilies } from "@/lib/sanity/queries";
import { ProductFamilySection } from "@/components/product-family-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop | Sip Shield",
  description: "Browse our handcrafted solid oak drink covers. 13 designs from £10.",
};

export default async function ShopPage() {
  const [products, families] = await Promise.all([
    getProducts(),
    getProductFamilies(),
  ]);

  const productsByFamily = families.map((family) => ({
    family,
    products: products.filter((p) => p.family._id === family._id),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="font-display text-4xl text-oak-800 mb-8">Our Collection</h1>
      {productsByFamily.map(({ family, products }) => (
        <ProductFamilySection
          key={family._id}
          family={family}
          products={products}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Add test content in Sanity Studio**

Navigate to `http://localhost:3000/studio`. Create:
- 2 Product Families (e.g. "Classic", "Lanyard Edition")
- 3 Products (use placeholder Stripe price IDs like `price_test_123` for now)
- Upload at least 1 image per product

- [ ] **Step 6: Verify shop page renders with Sanity data**

Run: `npm run dev`
Navigate to `http://localhost:3000/shop`
Expected: Products grouped by family, images loading from Sanity CDN, Add to Cart buttons present.

- [ ] **Step 7: Commit**

```bash
git add components/product-card.tsx components/product-family-section.tsx components/add-to-cart-button.tsx app/shop/
git commit -m "feat: add shop page with product cards grouped by family from Sanity CMS"
```

---

## Task 9: Cart Page and Cart Drawer

**Files:**
- Create: `components/cart-drawer.tsx`, `components/cart-item.tsx`, `app/cart/page.tsx`
- Modify: `components/header.tsx` (add cart drawer trigger)

- [ ] **Step 1: Create cart item component (client component)**

Create `components/cart-item.tsx` — single cart row:
- Product image (thumbnail)
- Product name
- Quantity controls (- / count / +)
- Line total price
- Remove button
- Calls `useCartStore().updateQuantity()` and `removeItem()`

- [ ] **Step 2: Create cart drawer component (client component)**

Create `components/cart-drawer.tsx` — slide-out panel from the right:
- Lists all cart items using `CartItem` component
- Shows subtotal (display-only — Stripe calculates real total)
- "Checkout" button that POSTs to `/api/checkout` and redirects to Stripe
- "Continue Shopping" link
- Empty state: "Your cart is empty"
- Closes on outside click or close button

The checkout button handler:

```typescript
async function handleCheckout() {
  setLoading(true);
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        stripePriceId: item.stripePriceId,
        quantity: item.quantity,
      })),
    }),
  });
  const { url } = await res.json();
  if (url) window.location.href = url;
  setLoading(false);
}
```

- [ ] **Step 3: Create cart page**

Create `app/cart/page.tsx` — full-page cart view (alternative to drawer, good for mobile). Same data and checkout logic as drawer but in a page layout.

- [ ] **Step 4: Wire cart drawer into header**

Update `components/header.tsx` to open the cart drawer when the cart icon is clicked (or on hover for desktop). Manage open/close state.

- [ ] **Step 5: Verify full cart flow**

Run: `npm run dev`
1. Go to `/shop`, click "Add to Cart" on a product
2. Cart icon badge updates
3. Click cart icon — drawer opens with the item
4. Adjust quantity, verify total updates
5. Go to `/cart` — see same items in full-page view

- [ ] **Step 6: Commit**

```bash
git add components/cart-drawer.tsx components/cart-item.tsx app/cart/ components/header.tsx
git commit -m "feat: add cart drawer and cart page with checkout flow"
```

---

## Task 10: Home Page

**Files:**
- Create: `app/page.tsx` (replace scaffold default)

- [ ] **Step 1: Build home page**

Replace `app/page.tsx` — Server Component that fetches from Sanity:
- **Hero section:** Full-width hero image from SiteSettings, headline text, CTA button to `/shop`
- **Featured products:** Show 3-4 products from Sanity (e.g. one from each family)
- **Value proposition:** "Handcrafted in Bournemouth", quality messaging, what makes Sip Shield different
- **Instagram CTA:** Link to @sipshielduk

Fetch `getSiteSettings()` and `getProducts()` at build time.

- [ ] **Step 2: Verify home page renders**

Run: `npm run dev`
Expected: Hero with image, featured products with Add to Cart, value prop section, Instagram link.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add home page with hero, featured products, and value prop"
```

---

## Task 11: Content Pages (About, FAQ, Contact)

**Files:**
- Create: `app/about/page.tsx`, `app/faq/page.tsx`, `app/contact/page.tsx`

- [ ] **Step 1: Create About page**

Create `app/about/page.tsx` — fetches the "about" page from Sanity, renders body with Portable Text component. Includes Ben's story, craftsmanship, Bournemouth connection. SEO metadata from Sanity fields.

- [ ] **Step 2: Create FAQ page**

Create `app/faq/page.tsx` — fetches the "faq" page from Sanity. Renders as expandable accordion sections (collapsible `<details>` elements or a simple client component). Covers: sizing, care, shipping, returns, personalisation.

- [ ] **Step 3: Create Contact page**

Create `app/contact/page.tsx` — fetches site settings from Sanity. Displays:
- WhatsApp link (click-to-chat: `https://wa.me/{number}`)
- Instagram link
- Email link
- No contact form needed for MVP — direct messaging channels only.

- [ ] **Step 4: Create seed content in Sanity**

In Sanity Studio, create Page documents for "about", "faq", "contact" with placeholder content. Update SiteSettings with contact details.

- [ ] **Step 5: Verify all content pages render**

Run: `npm run dev`
Navigate to `/about`, `/faq`, `/contact`. All should render Sanity content correctly.

- [ ] **Step 6: Commit**

```bash
git add app/about/ app/faq/ app/contact/
git commit -m "feat: add About, FAQ, and Contact pages with Sanity CMS content"
```

---

## Task 12: Sanity Webhook Revalidation Route

**Note:** The Architecture Overview describes Sanity webhooks triggering full Netlify rebuilds. This task implements **on-demand ISR revalidation** instead — a faster approach (~seconds vs ~2-5 minutes) where Sanity notifies the app directly and Next.js revalidates cached pages. This is a justified improvement over full rebuilds for a site this small.

**Files:**
- Create: `app/api/revalidate/route.ts`

- [ ] **Step 1: Create revalidation API route**

Create `app/api/revalidate/route.ts`:

```typescript
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  // Revalidate all pages — simple approach for a small site
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

- [ ] **Step 2: Add `SANITY_REVALIDATE_SECRET` to `.env.local.example`**

Add the new env var to the example file.

- [ ] **Step 3: Document webhook setup**

The Sanity webhook URL should be: `https://sipshield.co.uk/api/revalidate?secret=YOUR_SECRET`

This is configured in Sanity Dashboard → API → Webhooks. Trigger on all document types, filter to published documents only.

- [ ] **Step 4: Commit**

```bash
git add app/api/revalidate/ .env.local.example
git commit -m "feat: add Sanity webhook revalidation route for on-demand ISR"
```

---

## Task 13: SEO and Metadata

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`, `app/shop/page.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1: Add global metadata to `app/layout.tsx`**

Add default metadata export with site name, description, Open Graph, and Twitter card configuration.

- [ ] **Step 2: Create dynamic sitemap**

Create `app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sipshield.co.uk";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
```

- [ ] **Step 3: Create robots.txt**

Create `app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/api/"] },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sipshield.co.uk"}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Add favicon and Open Graph image**

Add a `favicon.ico` to `app/` (Next.js App Router convention) and an `opengraph-image.png` (1200x630) to `app/` for social sharing. For MVP, use a simple Sip Shield text/logo image. This is important since traffic comes from Instagram — shared links need a preview image.

- [ ] **Step 5: Verify SEO output**

Run: `npm run build && npm run start`
Check: `http://localhost:3000/sitemap.xml` returns valid sitemap.
Check: `http://localhost:3000/robots.txt` returns valid robots.
Check: View source of home page for `<meta>` tags and Open Graph.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts app/robots.ts app/layout.tsx app/favicon.ico app/opengraph-image.png
git commit -m "feat: add sitemap, robots.txt, favicon, OG image, and global SEO metadata"
```

---

## Task 14: End-to-End Checkout Testing with Stripe Test Mode

**Prerequisite:** Stripe test mode products and prices created in Stripe Dashboard. Update Sanity products with real test-mode Stripe price IDs. Set `STRIPE_SECRET_KEY` to the test-mode secret key in `.env.local`.

- [ ] **Step 1: Create Stripe test products**

In Stripe Dashboard (test mode), create products matching the SipShield catalog:
- Classic Plain Oak — £10
- Classic Personalised Oak — £10
- (At minimum 2-3 products for testing)

Copy each price ID (e.g. `price_1abc...`).

- [ ] **Step 2: Update Sanity products with real Stripe price IDs**

In Sanity Studio, update each product's `stripePriceId` field with the real test-mode price IDs from Step 1.

- [ ] **Step 3: Test full checkout flow**

1. Navigate to `/shop`
2. Add 2 different products to cart
3. Open cart drawer → click "Checkout"
4. Verify redirect to Stripe Checkout page
5. Use Stripe test card: `4242 4242 4242 4242`, any future expiry, any CVC
6. Complete payment
7. Verify redirect to `/success` page
8. Check Stripe Dashboard for the test payment

- [ ] **Step 4: Test edge cases**

- Empty cart checkout (should show error or disable button)
- Single item checkout
- Promotion code at Stripe checkout (create a test promo code in Stripe Dashboard)
- Cancel/back from Stripe checkout → returns to `/cart`

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: checkout flow adjustments from end-to-end testing"
```

---

## Task 15: Netlify Deployment

- [ ] **Step 1: Push repo to GitHub**

Ensure the repo is connected to a GitHub remote. Push all commits.

- [ ] **Step 2: Connect to Netlify**

In Netlify Dashboard:
1. Import project from GitHub
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add the `@netlify/plugin-nextjs` plugin

- [ ] **Step 3: Set environment variables in Netlify**

Add all vars from `.env.local.example` to Netlify's environment variables (Settings → Environment variables):
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN`
- `STRIPE_SECRET_KEY` (test mode initially)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (test mode)
- `NEXT_PUBLIC_SITE_URL` (the Netlify deploy URL)
- `SANITY_REVALIDATE_SECRET`

- [ ] **Step 4: Trigger first deploy**

Push a commit or trigger manual deploy. Verify:
- Site builds successfully
- All pages render
- Sanity content loads
- Images load from Sanity CDN
- Cart functionality works
- Checkout redirects to Stripe (test mode)

- [ ] **Step 5: Configure Sanity webhook**

In Sanity Dashboard → API → Webhooks:
- URL: `https://<your-netlify-url>/api/revalidate?secret=YOUR_SECRET`
- Trigger on: Create, Update, Delete
- Filter: Published documents only

- [ ] **Step 6: Test webhook**

Edit a product in Sanity Studio, publish. Verify the site updates within a few minutes.

- [ ] **Step 7: Commit any deployment fixes**

```bash
git add -A
git commit -m "fix: deployment configuration adjustments for Netlify"
```
