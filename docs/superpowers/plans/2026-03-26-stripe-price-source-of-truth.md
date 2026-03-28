# Stripe as Price Source of Truth + Rebuild Button

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Stripe the single source of truth for prices — fetch prices from Stripe at build time, remove price duplication from Sanity, and add a "Rebuild Site" button in Sanity Studio.

**Architecture:** At build time, collect all `stripePriceId` values from Sanity products, batch-fetch their current prices from the Stripe API, and inject them into the product data before rendering. The Sanity `price` field on products becomes unnecessary for display (kept in schema as a Studio-only reference hint). A Sanity Studio document action triggers a Netlify build hook so Ben can rebuild the site after changing prices in Stripe.

**Tech Stack:** Stripe Node SDK, Next.js server components, Sanity Studio document actions

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `lib/stripe.ts` | Stripe client singleton + `fetchStripePrices()` helper |
| Modify | `lib/sanity/types.ts` | Make `price` optional on `SanityProduct` and `ProductVariant` |
| Modify | `app/(site)/shop/page.tsx` | Fetch Stripe prices, inject into product data |
| Modify | `app/(site)/page.tsx` | Fetch Stripe prices for featured products |
| Modify | `components/product-card.tsx` | No changes needed (already receives `price` as prop) |
| Modify | `components/product-grid.tsx` | No changes needed (passes through) |
| Create | `sanity/actions/rebuild-site.ts` | "Rebuild Site" document action for Studio |
| Modify | `sanity.config.ts` | Register the rebuild action |

---

### Task 1: Create Stripe client and price-fetching helper

**Files:**
- Create: `lib/stripe.ts`

- [ ] **Step 1: Create `lib/stripe.ts`**

```ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Given a list of Stripe Price IDs, fetch their current unit_amount values.
 * Returns a Map of priceId → amount in £ (e.g. 10.00, not 1000).
 * Skips any IDs that are null/undefined.
 */
export async function fetchStripePrices(
  priceIds: (string | null | undefined)[]
): Promise<Map<string, number>> {
  const validIds = priceIds.filter((id): id is string => Boolean(id));
  if (validIds.length === 0) return new Map();

  // Stripe allows up to 100 IDs per list call — fine for 13 products
  const { data } = await stripe.prices.list({
    limit: 100,
    active: true,
  });

  const priceMap = new Map<string, number>();
  for (const price of data) {
    if (validIds.includes(price.id) && price.unit_amount != null) {
      priceMap.set(price.id, price.unit_amount / 100);
    }
  }

  return priceMap;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit lib/stripe.ts 2>&1 | head -20`
Expected: No errors (or only unrelated pre-existing errors)

- [ ] **Step 3: Commit**

```bash
git add lib/stripe.ts
git commit -m "feat: add Stripe client and price-fetching helper"
```

---

### Task 2: Make price optional in Sanity types

**Files:**
- Modify: `lib/sanity/types.ts`

- [ ] **Step 1: Update `ProductVariant` to make `price` optional**

In `lib/sanity/types.ts`, change the `ProductVariant` interface:

```ts
export interface ProductVariant {
  _key: string;
  name: string;
  price?: number;
  stripePriceId?: string;
}
```

- [ ] **Step 2: Update `SanityProduct` to make `price` optional**

In `lib/sanity/types.ts`, change the `SanityProduct` interface:

```ts
export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  variant: string;
  price?: number;
  stripePriceId?: string;
  images?: SanityImageSource[];
  tag?: string;
  personalisation?: PersonalisationOption[];
  variants?: ProductVariant[];
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/sanity/types.ts
git commit -m "refactor: make price optional on Sanity types (Stripe is source of truth)"
```

---

### Task 3: Inject Stripe prices into shop page

**Files:**
- Modify: `app/(site)/shop/page.tsx`

- [ ] **Step 1: Update `shop/page.tsx` to fetch and inject Stripe prices**

Replace the full file with:

```tsx
import { getShopPage } from "@/lib/sanity/queries";
import { fetchStripePrices } from "@/lib/stripe";
import { ShopHero } from "@/components/shop-hero";
import { ProductCard } from "@/components/product-card";
import { urlFor } from "@/lib/sanity/image";
import type { SanityProduct } from "@/lib/sanity/types";
import type { Product } from "@/components/product-card";

function toCardProduct(
  p: SanityProduct,
  stripePrices: Map<string, number>,
  familyDescription?: string
): Product {
  const img = p.images?.[0];

  // Resolve price: Stripe price (authoritative) → Sanity price (fallback)
  const stripePrice = p.stripePriceId
    ? stripePrices.get(p.stripePriceId)
    : undefined;

  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: stripePrice ?? p.price ?? 0,
    stripePriceId: p.stripePriceId ?? "",
    description: p.description || familyDescription,
    image: img
      ? {
          url: urlFor(img).width(480).height(480).url(),
          alt: p.name,
          width: 480,
          height: 480,
        }
      : undefined,
    tag: p.tag,
    variants: p.variants?.map((v) => ({
      _key: v._key,
      name: v.name,
      price: (v.stripePriceId ? stripePrices.get(v.stripePriceId) : undefined) ?? v.price ?? 0,
      stripePriceId: v.stripePriceId,
    })),
  };
}

export default async function ShopPage() {
  const { hero, families } = await getShopPage();

  // Collect all Stripe price IDs from all products and variants
  const allPriceIds = families.flatMap((f) =>
    f.products.flatMap((p) => [
      p.stripePriceId,
      ...(p.variants?.map((v) => v.stripePriceId) ?? []),
    ])
  );

  const stripePrices = await fetchStripePrices(allPriceIds);

  return (
    <main>
      {hero && <ShopHero hero={hero} />}

      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {families.flatMap((family) =>
            family.products.map((product) => (
              <ProductCard
                key={product._id}
                product={toCardProduct(product, stripePrices, family.description)}
                layout="compact"
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Run dev server to verify no errors**

Run: `npm run dev` — navigate to `/shop`, verify prices display correctly.

- [ ] **Step 3: Commit**

```bash
git add app/(site)/shop/page.tsx
git commit -m "feat: fetch prices from Stripe at build time on shop page"
```

---

### Task 4: Inject Stripe prices into homepage

**Files:**
- Modify: `app/(site)/page.tsx`
- Modify: `components/product-grid.tsx`

- [ ] **Step 1: Update `product-grid.tsx` to accept a `stripePrices` prop**

The `ProductGrid` component currently calls `toCardProduct` internally. It needs the price map. Update it:

```tsx
import { ProductCard } from "./product-card";
import type { SanityProduct } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import type { Product } from "./product-card";

interface ProductGridProps {
  heading?: string;
  products: SanityProduct[];
  stripePrices?: Map<string, number>;
}

function toCardProduct(
  p: SanityProduct,
  layout: "featured" | "compact",
  stripePrices?: Map<string, number>
): Product {
  const img = p.images?.[0];
  const w = layout === "featured" ? 900 : 600;
  const h = layout === "featured" ? 600 : 600;

  const stripePrice = p.stripePriceId
    ? stripePrices?.get(p.stripePriceId)
    : undefined;

  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: stripePrice ?? p.price ?? 0,
    stripePriceId: p.stripePriceId ?? "",
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
    variants: p.variants?.map((v) => ({
      _key: v._key,
      name: v.name,
      price: (v.stripePriceId ? stripePrices?.get(v.stripePriceId) : undefined) ?? v.price ?? 0,
      stripePriceId: v.stripePriceId,
    })),
  };
}

export function ProductGrid({ heading, products, stripePrices }: ProductGridProps) {
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
        <ProductCard product={toCardProduct(first, "featured", stripePrices)} layout="featured" />
      ) : products.length <= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(first, "featured", stripePrices)} layout="featured" />
          </div>
          {rest.map((p) => (
            <ProductCard key={p._id} product={toCardProduct(p, "compact", stripePrices)} layout="compact" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(products[0], "featured", stripePrices)} layout="featured" />
          </div>
          <ProductCard product={toCardProduct(products[1], "compact", stripePrices)} layout="compact" />
          <ProductCard product={toCardProduct(products[2], "compact", stripePrices)} layout="compact" />
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(products[3], "featured", stripePrices)} layout="featured" />
          </div>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Update `page.tsx` to fetch Stripe prices and pass them to `ProductGrid`**

```tsx
import { getHomepage, getSiteSettings } from "@/lib/sanity/queries";
import { fetchStripePrices } from "@/lib/stripe";
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

  // Fetch Stripe prices for featured products
  const featuredProducts = homepage?.featuredProducts ?? [];
  const allPriceIds = featuredProducts.flatMap((p) => [
    p.stripePriceId,
    ...(p.variants?.map((v) => v.stripePriceId) ?? []),
  ]);
  const stripePrices = await fetchStripePrices(allPriceIds);

  const instagramUrl = settings?.socialLinks?.instagram || "https://instagram.com/sipshielduk";

  return (
    <main>
      {homepage?.hero && <Hero hero={homepage.hero} />}

      {homepage?.trustBar && <TrustBar items={homepage.trustBar} />}

      {homepage?.featuredProducts && (
        <ProductGrid
          heading="Featured Pieces"
          products={homepage.featuredProducts}
          stripePrices={stripePrices}
        />
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

- [ ] **Step 3: Run dev server to verify homepage prices display correctly**

Run: `npm run dev` — navigate to `/`, verify featured product prices show.

- [ ] **Step 4: Commit**

```bash
git add components/product-grid.tsx app/(site)/page.tsx
git commit -m "feat: fetch Stripe prices for homepage featured products"
```

---

### Task 5: Add "Rebuild Site" action in Sanity Studio

**Files:**
- Create: `sanity/actions/rebuild-site.ts`
- Modify: `sanity.config.ts`

- [ ] **Step 1: Create `sanity/actions/rebuild-site.ts`**

```ts
import { useCallback, useState } from "react";
import type { DocumentActionComponent } from "sanity";

/**
 * Sanity Studio document action that triggers a Netlify site rebuild.
 * Placeholder until NETLIFY_BUILD_HOOK_URL is configured.
 */
export const rebuildSiteAction: DocumentActionComponent = () => {
  const [status, setStatus] = useState<"idle" | "rebuilding" | "done" | "error">("idle");

  const onHandle = useCallback(async () => {
    const hookUrl = process.env.SANITY_STUDIO_NETLIFY_BUILD_HOOK;
    if (!hookUrl) {
      setStatus("error");
      return;
    }

    setStatus("rebuilding");

    try {
      await fetch(hookUrl, { method: "POST" });
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }, []);

  return {
    label:
      status === "rebuilding"
        ? "Rebuilding…"
        : status === "done"
          ? "Rebuild triggered!"
          : status === "error"
            ? "Rebuild failed (check hook URL)"
            : "Rebuild Site",
    onHandle,
    tone: status === "error" ? "critical" : status === "done" ? "positive" : "default",
    disabled: status === "rebuilding",
  };
};
```

- [ ] **Step 2: Register the action in `sanity.config.ts`**

Update `sanity.config.ts` to:

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schema";
import { rebuildSiteAction } from "./sanity/actions/rebuild-site";

export default defineConfig({
  name: "sipshield",
  title: "SipShield",
  projectId: "vuojv6bg",
  dataset: "production",
  basePath: "/studio",
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev) => [...prev, rebuildSiteAction],
  },
});
```

- [ ] **Step 3: Verify Studio loads without errors**

Run: `npm run dev` — navigate to `/studio`, open any product document, verify the "Rebuild Site" action appears in the action menu.

- [ ] **Step 4: Commit**

```bash
git add sanity/actions/rebuild-site.ts sanity.config.ts
git commit -m "feat: add Rebuild Site action in Sanity Studio (placeholder for Netlify hook)"
```

---

## Notes

- **Fallback behaviour:** If Stripe is unreachable at build time or a price ID is missing, the Sanity `price` field is used as fallback. This prevents a broken build.
- **Netlify build hook:** When Netlify is set up, create a build hook in Netlify Dashboard → Build & Deploy → Build hooks, then add `SANITY_STUDIO_NETLIFY_BUILD_HOOK=<url>` to the Studio's environment. The `SANITY_STUDIO_` prefix makes it available client-side in Sanity Studio.
- **Ben's workflow for price changes:** Change price in Stripe Dashboard → open any document in Sanity Studio → click "Rebuild Site" → site rebuilds with fresh Stripe prices.
