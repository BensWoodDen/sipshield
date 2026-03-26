# Product Modal & Personalisation — Design Spec

## Goal

Let customers view full product details and optionally personalise products (engraving text, logo/image upload) via a modal triggered from the product card. Images are stored privately in Supabase Storage and delivered to Ben via signed URLs in Stripe order metadata.

## Architecture

Product cards gain a click-to-open-modal behaviour (add-to-cart button remains for quick-add). The modal is a client component showing product image, details, variant selector, and personalisation fields driven by Sanity's `personalisation` array. Image uploads go through a Next.js API route to a Supabase private storage bucket. At checkout, signed URLs are generated and passed as Stripe Checkout Session metadata so Ben can download customer images from his Stripe dashboard.

## Decisions

- **Modal, not page** — keeps the shop browsing context; customer doesn't leave the product grid
- **Side-by-side layout** — image left, details + personalisation right; stacks vertically on mobile
- **Supabase Storage for image uploads** — private bucket, signed URLs (7-day expiry), no public access
- **Email-style delivery to Ben** — personalisation text + signed image URLs appear in Stripe order metadata; no separate admin UI needed
- **Quick-add stays** — add-to-cart button on cards works without opening modal; modal is for personalisation

## Components

### 1. Product Card Changes

**Files:** `components/product-card.tsx`, `components/variant-product-card.tsx`

- Clicking anywhere on the card (except the add-to-cart button) opens the product modal
- Cards with personalisation options show a "Personalisable" indicator (small text or badge below the description)
- The existing add-to-cart button continues to work for quick-add without personalisation
- Product card needs to pass the full product data (including personalisation options) to the modal

### 2. Product Modal Component

**File:** `components/product-modal.tsx` (new, client component)

**Layout:** Side-by-side on desktop (grid 1fr 1fr), stacked on mobile.

**Left half:**
- Product image (large, from Sanity CDN via next/image)

**Right half (top to bottom):**
- Product name (font-display heading)
- Variant label (e.g. "Standard", "With lanyard")
- Description
- Price from Stripe (passed as prop — already resolved by parent page)
- Variant selector (if product has `variants` array) — same pill buttons as current variant card
- Personalisation section (if product has `personalisation` array):
  - Section heading: "Personalise this piece (optional)"
  - For each personalisation option:
    - If `type === "text"`: text input with the Sanity `label` as placeholder
    - If `type === "image"`: drag-and-drop upload zone with the Sanity `label` as description
  - Image preview thumbnail after upload (with remove button)
- "Add to Cart" button (full width)

**Behaviour:**
- Closes on backdrop click, Escape key, or X button
- Focus trapped inside modal (reuse same pattern as cart drawer)
- Body scroll locked while open
- Uses a React portal to render at document root

**Upload timing:** Image upload to Supabase happens immediately when the customer selects/drops a file (not on add-to-cart). This gives instant feedback — the customer sees a thumbnail preview and upload status before deciding to add to cart. If upload fails, they can retry before committing.

**State management:**
- `selectedVariantIdx` — for variant selector (same as current variant card)
- `personalisationText` — controlled text input
- `uploadedFile` — File object reference for preview
- `uploadState` — idle / uploading / uploaded / error
- `supabasePath` — returned file path after successful upload

### 3. Image Upload API Route

**File:** `app/api/upload/route.ts` (new)

**Endpoint:** `POST /api/upload`

**Request:** `multipart/form-data` with a single `file` field

**Behaviour:**
1. Validate file type (image/jpeg, image/png, image/webp — reject others)
2. Validate file size (max 5MB)
3. Generate filename: `{Date.now()}-{crypto.randomUUID().slice(0,8)}.{ext}`
4. Upload to Supabase Storage bucket `personalisation-uploads` using the service key
5. Return JSON: `{ path: "personalisation-uploads/<filename>" }`

**Error responses:**
- 400: Invalid file type or size
- 500: Supabase upload failure

### 4. Supabase Setup

**New dependency:** `@supabase/supabase-js`

**File:** `lib/supabase.ts` (new) — server-side Supabase client using service role key

**Environment variables:**
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never exposed to client

**Storage bucket:** `personalisation-uploads`
- Private (no public access)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

**Signed URL generation:** done at checkout time, 7-day expiry

### 5. Cart Store Changes

**File:** `lib/cart-store.ts`

Add two optional fields to `CartItem`:

```
personalisationText?: string
personalisationImage?: string  // Supabase file path (e.g. "personalisation-uploads/1234-abcd.jpg")
```

The `addItem` signature already accepts `Omit<CartItem, "quantity">`, so these new fields flow through automatically.

**Cart item ID:** When a product is added with personalisation, the cart item ID should include a personalisation suffix to prevent merging with non-personalised versions of the same product. E.g. `{sanityId}-personalised-{timestamp}`.

### 6. Checkout Integration

**File:** `app/api/checkout/route.ts` (to be created — part of checkout work)

At checkout time:
1. For each cart item with `personalisationImage`, generate a Supabase signed URL (7-day expiry)
2. Include personalisation data in Stripe Checkout Session `metadata` per line item:
   - `personalisation_text_{index}`: the engraving text
   - `personalisation_image_{index}`: the signed URL
3. Ben sees these in the Stripe Dashboard order details

**Note:** Stripe metadata values are limited to 500 characters. Signed URLs from Supabase are well within this limit.

### 7. Personalisation Data Flow

**File:** `components/product-card.tsx` and `components/product-modal.tsx`

The `personalisation` array from Sanity needs to reach the modal. Currently `product-card.tsx` receives a `Product` interface that doesn't include personalisation. The interface needs extending:

```ts
interface PersonalisationOption {
  _key: string;
  type: "text" | "image";
  label: string;
}
```

Add `personalisation?: PersonalisationOption[]` to the `Product` interface in `product-card.tsx`.

The shop page and homepage `toCardProduct` functions need to map the Sanity personalisation data through to the card props.

### 8. GROQ Query Update

The `personalisation` field is already fetched in the homepage query but **not** in the shop page query (it fetches the legacy `personalisable` and `personalisationLabel` fields). The shop page query needs updating to fetch `personalisation` instead.

## Non-Goals

- No admin panel for viewing orders — Ben uses Stripe Dashboard
- No Supabase auth — server-side service key only
- No image processing/resizing — Ben gets the original upload
- No order log in Supabase (just file storage for now — can add later)
- No product detail page (URL-based) — modal only for now

## Testing

- Upload an image via the modal → verify it appears in Supabase Storage bucket
- Add personalised item to cart → verify text and image path are stored
- Complete checkout → verify signed URL appears in Stripe metadata
- Verify signed URL is accessible and expires after 7 days
- Verify quick-add (card button) works without opening modal
- Verify modal opens/closes correctly, focus trap works, body scroll locks
- Verify mobile layout stacks correctly
- Verify cards without personalisation options don't show the "Personalisable" indicator
