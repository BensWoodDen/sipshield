# Product Modal & Personalisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a product detail modal with personalisation fields (text + image upload), storing uploaded images privately in Supabase Storage.

**Architecture:** Product cards open a side-by-side modal on click. The modal shows product details, variant selector, and optional personalisation fields driven by Sanity's `personalisation` array. Image uploads go through a Next.js API route to a Supabase private storage bucket. Personalisation data travels with the cart item through to checkout.

**Tech Stack:** Next.js 16, React, Zustand, Supabase Storage, Tailwind CSS v4, Sanity CMS

---

## File Structure

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `lib/sanity/queries.ts` | Fix shop page GROQ query to fetch `personalisation` |
| Modify | `components/product-card.tsx` | Add `personalisation` to Product interface, add "Personalisable" badge, card click opens modal |
| Modify | `components/variant-product-card.tsx` | Card click opens modal, "Personalisable" badge |
| Create | `components/product-modal.tsx` | Side-by-side product detail modal with personalisation fields |
| Create | `components/image-upload.tsx` | Drag-and-drop image upload component |
| Modify | `lib/cart-store.ts` | Add personalisation fields to CartItem |
| Create | `lib/supabase.ts` | Server-side Supabase client |
| Create | `app/api/upload/route.ts` | Image upload API route |
| Modify | `app/(site)/shop/page.tsx` | Pass personalisation data through toCardProduct |
| Modify | `components/product-grid.tsx` | Pass personalisation data through toCardProduct |

---

### Task 1: Fix shop page GROQ query

**Files:**
- Modify: `lib/sanity/queries.ts`

- [ ] **Step 1: Replace legacy personalisation fields in shop query**

In `lib/sanity/queries.ts`, find the shop page query and replace the legacy fields with the correct `personalisation` field:

```ts
// In shopPageQuery, inside the products projection, replace:
      personalisable,
      personalisationLabel,
// With:
      personalisation,
```

The full products projection should now be:
```
"products": *[_type == "product" && references(^._id)] | order(name asc) {
  _id,
  name,
  slug,
  description,
  variant,
  stripePriceId,
  images,
  tag,
  personalisation,
  variants
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/sanity/queries.ts
git commit -m "fix: fetch personalisation field in shop page GROQ query

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Add personalisation to Product interface and data flow

**Files:**
- Modify: `components/product-card.tsx`
- Modify: `app/(site)/shop/page.tsx`
- Modify: `components/product-grid.tsx`

- [ ] **Step 1: Add PersonalisationOption to Product interface**

In `components/product-card.tsx`, add a new interface and extend `Product`:

```ts
// Add after ProductVariantOption interface:
export interface PersonalisationOption {
  _key: string;
  type: "text" | "image";
  label: string;
}

// Add to the Product interface, after variants:
  personalisation?: PersonalisationOption[];
```

- [ ] **Step 2: Pass personalisation through in shop page toCardProduct**

In `app/(site)/shop/page.tsx`, add `personalisation` to the returned object in `toCardProduct`:

```ts
// In the return object, after the variants mapping:
    personalisation: p.personalisation,
```

- [ ] **Step 3: Pass personalisation through in product-grid toCardProduct**

In `components/product-grid.tsx`, add `personalisation` to the returned object in `toCardProduct`:

```ts
// In the return object, after the variants mapping:
    personalisation: p.personalisation,
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/product-card.tsx app/(site)/shop/page.tsx components/product-grid.tsx
git commit -m "feat: add personalisation data to Product interface and data flow

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Add personalisation fields to cart store

**Files:**
- Modify: `lib/cart-store.ts`

- [ ] **Step 1: Add personalisation fields to CartItem**

In `lib/cart-store.ts`, add two optional fields to the `CartItem` interface after `stripePriceId`:

```ts
export interface CartItem {
  id: string;
  sanityId: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
  stripePriceId: string;
  personalisationText?: string;
  personalisationImage?: string; // Supabase file path
}
```

No other changes needed — `addItem` accepts `Omit<CartItem, "quantity">` so the new fields flow through automatically.

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add lib/cart-store.ts
git commit -m "feat: add personalisation fields to CartItem

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Create Supabase client and upload API route

**Files:**
- Create: `lib/supabase.ts`
- Create: `app/api/upload/route.ts`

- [ ] **Step 1: Install Supabase SDK**

Run: `npm install @supabase/supabase-js`

- [ ] **Step 2: Create Supabase server client**

Create `lib/supabase.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

- [ ] **Step 3: Create upload API route**

Create `app/api/upload/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BUCKET = "personalisation-uploads";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 5MB" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ path: `${BUCKET}/${filename}` });
}
```

- [ ] **Step 4: Add Supabase env vars to .env.local**

Add placeholder values (user will fill in after creating Supabase project):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add lib/supabase.ts app/api/upload/route.ts package.json package-lock.json
git commit -m "feat: add Supabase client and image upload API route

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Create image upload component

**Files:**
- Create: `components/image-upload.tsx`

- [ ] **Step 1: Create the image upload component**

Create `components/image-upload.tsx`:

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ImageUploadProps {
  label: string;
  onUploaded: (path: string) => void;
  onRemoved: () => void;
}

type UploadState = "idle" | "uploading" | "uploaded" | "error";

export function ImageUpload({ label, onUploaded, onRemoved }: ImageUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(
    async (file: File) => {
      setState("uploading");
      setErrorMsg("");

      // Client-side preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) {
          setState("error");
          setErrorMsg(data.error || "Upload failed");
          setPreview(null);
          URL.revokeObjectURL(objectUrl);
          return;
        }

        setState("uploaded");
        onUploaded(data.path);
      } catch {
        setState("error");
        setErrorMsg("Upload failed — please try again");
        setPreview(null);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [onUploaded]
  );

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function handleRemove() {
    setState("idle");
    setPreview(null);
    setErrorMsg("");
    onRemoved();
    if (inputRef.current) inputRef.current.value = "";
  }

  if (state === "uploaded" && preview) {
    return (
      <div className="relative">
        <img
          src={preview}
          alt="Upload preview"
          className="w-full h-32 object-contain rounded-lg border border-neutral-200 bg-white"
        />
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-charcoal/70 text-white rounded-full hover:bg-charcoal transition-colors cursor-pointer"
          aria-label="Remove uploaded image"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-forest-600">
          <CheckCircle className="w-3.5 h-3.5" />
          Image uploaded
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-100 ${
          dragOver
            ? "border-forest-400 bg-forest-50"
            : state === "error"
              ? "border-red-300 bg-red-50"
              : "border-neutral-200 hover:border-oak-300 bg-white"
        }`}
      >
        {state === "uploading" ? (
          <>
            <Loader2 className="w-6 h-6 text-oak-400 animate-spin" />
            <span className="text-xs text-neutral-500">Uploading...</span>
            {preview && (
              <img
                src={preview}
                alt="Uploading preview"
                className="w-16 h-16 object-contain rounded opacity-50"
              />
            )}
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 text-neutral-400" />
            <span className="text-xs text-neutral-500 text-center">{label}</span>
            <span className="text-[0.625rem] text-neutral-400">
              JPEG, PNG or WebP — max 5MB
            </span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      {state === "error" && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/image-upload.tsx
git commit -m "feat: add drag-and-drop image upload component

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Create product modal component

**Files:**
- Create: `components/product-modal.tsx`

- [ ] **Step 1: Create the product modal**

Create `components/product-modal.tsx`:

```tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { ImageUpload } from "./image-upload";
import type { Product } from "./product-card";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const addItem = useCartStore((s) => s.addItem);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = hasVariants ? variants[selectedIdx] : null;

  const currentPrice = selected?.price ?? product.price;
  const currentStripePriceId = selected?.stripePriceId ?? product.stripePriceId;
  const currentVariantName = selected?.name ?? product.variant;

  const personalisation = product.personalisation ?? [];
  const hasText = personalisation.some((p) => p.type === "text");
  const hasImage = personalisation.some((p) => p.type === "image");
  const textOption = personalisation.find((p) => p.type === "text");
  const imageOption = personalisation.find((p) => p.type === "image");

  const [personalisationText, setPersonalisationText] = useState("");
  const [supabasePath, setSupabasePath] = useState<string | null>(null);

  const [addedState, setAddedState] = useState<"idle" | "success">("idle");

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (open) {
      setSelectedIdx(0);
      setPersonalisationText("");
      setSupabasePath(null);
      setAddedState("idle");
    }
  }, [open, product.id]);

  // Focus trap and Escape to close
  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleAddToCart = useCallback(() => {
    const hasPersonalisation = personalisationText.trim() || supabasePath;

    const variantKey = hasVariants
      ? variants[selectedIdx]._key
      : undefined;

    const baseId = variantKey ? `${product.id}-${variantKey}` : product.id;
    const id = hasPersonalisation
      ? `${baseId}-personalised-${Date.now()}`
      : baseId;

    addItem({
      id,
      sanityId: product.id,
      name: product.name,
      variant: currentVariantName || undefined,
      price: currentPrice,
      image: product.image?.url,
      stripePriceId: currentStripePriceId,
      personalisationText: personalisationText.trim() || undefined,
      personalisationImage: supabasePath || undefined,
    });

    setAddedState("success");
    setTimeout(() => {
      onClose();
    }, 800);
  }, [
    product,
    selectedIdx,
    variants,
    hasVariants,
    currentPrice,
    currentStripePriceId,
    currentVariantName,
    personalisationText,
    supabasePath,
    addItem,
    onClose,
  ]);

  if (!open) return null;

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 opacity-100"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="relative bg-neutral-50 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-charcoal hover:bg-neutral-100 rounded-full transition-colors duration-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content: side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Image */}
            <div className="relative aspect-square bg-gradient-to-br from-oak-200 to-oak-100 rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt}
                  width={product.image.width}
                  height={product.image.height}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-oak-300 text-6xl">
                  &#9673;
                </div>
              )}
              {product.tag && (
                <span className="absolute top-4 left-4 bg-forest-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl text-charcoal">
                  {product.name}
                </h2>
                {currentVariantName && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {currentVariantName}
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              <span className="text-2xl font-semibold text-oak-700">
                &pound;{currentPrice.toFixed(2)}
              </span>

              {/* Variant selector */}
              {hasVariants && (
                <div>
                  <p className="text-xs uppercase text-neutral-400 font-medium mb-2 tracking-wide">
                    Size
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Select size"
                  >
                    {variants.map((v, i) => (
                      <button
                        key={v._key}
                        onClick={() => setSelectedIdx(i)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md border cursor-pointer transition-colors duration-100 ${
                          i === selectedIdx
                            ? "bg-oak-800 text-white border-oak-800"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-oak-300 hover:text-oak-700"
                        }`}
                        role="radio"
                        aria-checked={i === selectedIdx}
                        aria-label={v.name}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalisation */}
              {personalisation.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-xs uppercase text-neutral-400 font-medium mb-3 tracking-wide">
                    Personalise this piece (optional)
                  </p>

                  <div className="flex flex-col gap-3">
                    {hasText && textOption && (
                      <input
                        type="text"
                        value={personalisationText}
                        onChange={(e) => setPersonalisationText(e.target.value)}
                        placeholder={textOption.label}
                        maxLength={100}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white placeholder:text-neutral-400 focus:outline-none focus:border-oak-400 focus:ring-1 focus:ring-oak-400 transition-colors"
                      />
                    )}

                    {hasImage && imageOption && (
                      <ImageUpload
                        label={imageOption.label}
                        onUploaded={(path) => setSupabasePath(path)}
                        onRemoved={() => setSupabasePath(null)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 font-medium rounded-md text-white transition-colors duration-100 cursor-pointer mt-auto ${
                  addedState === "success"
                    ? "bg-forest-600"
                    : "bg-forest-500 hover:bg-forest-600 active:bg-forest-700"
                }`}
              >
                {addedState === "success" ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/product-modal.tsx
git commit -m "feat: add product detail modal with personalisation fields

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Wire product cards to open modal

**Files:**
- Modify: `components/product-card.tsx`
- Modify: `components/variant-product-card.tsx`

This task converts the product cards from server components to client components (they need `useState` for modal open/close) and adds the click-to-open behaviour and "Personalisable" badge.

- [ ] **Step 1: Update CompactCard and FeaturedCard in product-card.tsx**

Replace the entire `components/product-card.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { VariantProductCard } from "./variant-product-card";
import { ProductModal } from "./product-modal";

export interface ProductVariantOption {
  _key: string;
  name: string;
  price: number;
  stripePriceId?: string;
}

export interface PersonalisationOption {
  _key: string;
  type: "text" | "image";
  label: string;
}

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
  variants?: ProductVariantOption[];
  personalisation?: PersonalisationOption[];
}

interface ProductCardProps {
  product: Product;
  layout?: "featured" | "compact";
}

export function ProductCard({ product, layout = "compact" }: ProductCardProps) {
  if (product.variants && product.variants.length > 0 && layout === "compact") {
    return <VariantProductCard product={product} />;
  }
  if (layout === "featured") {
    return <FeaturedCard product={product} />;
  }
  return <CompactCard product={product} />;
}

function FeaturedCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasPersonalisation = product.personalisation && product.personalisation.length > 0;

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="group relative grid grid-cols-1 sm:grid-cols-2 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300 h-full cursor-pointer"
      >
        <div className="relative aspect-[3/2] sm:aspect-auto overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
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
          <h3 className="font-display text-[clamp(1.25rem,2vw+0.5rem,1.5rem)] text-charcoal mb-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-sm text-neutral-500 leading-relaxed mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          {hasPersonalisation && (
            <p className="text-xs text-oak-600 font-medium mb-3">
              Personalisable — click for options
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
              &pound;{product.price.toFixed(2)}
            </span>
            <span
              className="relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <AddToCartButton product={product} />
            </span>
          </div>
        </div>
      </article>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

function CompactCard({ product }: { product: Product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const hasPersonalisation = product.personalisation && product.personalisation.length > 0;

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-display text-[clamp(0.9375rem,1vw+0.25rem,1.125rem)] text-charcoal mb-0.5">
            {product.name}
          </h3>
          {product.variant && (
            <p className="text-sm text-neutral-500 mb-0.5">
              {product.variant}
            </p>
          )}
          {product.description && (
            <p className="text-xs text-neutral-400 line-clamp-2 mb-1">
              {product.description}
            </p>
          )}
          {hasPersonalisation && (
            <p className="text-xs text-oak-600 font-medium mb-1">
              Personalisable
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="text-base font-semibold text-oak-700">
              &pound;{product.price.toFixed(2)}
            </span>
            <span
              className="relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <AddToCartButton product={product} />
            </span>
          </div>
        </div>
      </article>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
```

Key changes from existing code:
- Added `"use client"` directive (needed for `useState`)
- Removed the `<Link href="/shop">` overlay — replaced with `onClick={() => setModalOpen(true)}` on the article
- Added `cursor-pointer` to article className
- Added `onClick={(e) => e.stopPropagation()}` wrapper around `AddToCartButton` so quick-add doesn't open modal
- Added "Personalisable" text when product has personalisation options
- Added `ProductModal` render at bottom of each card

- [ ] **Step 2: Update variant-product-card.tsx**

Replace the entire `components/variant-product-card.tsx` with:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductModal } from "./product-modal";
import type { Product } from "./product-card";

interface VariantProductCardProps {
  product: Product;
}

export function VariantProductCard({ product }: VariantProductCardProps) {
  const variants = product.variants!;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = variants[selectedIdx];
  const [modalOpen, setModalOpen] = useState(false);

  const productWithSelectedVariant: Product = {
    ...product,
    price: selected.price,
    stripePriceId: selected.stripePriceId || product.stripePriceId,
    variant: selected.name,
  };

  const hasPersonalisation = product.personalisation && product.personalisation.length > 0;

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-display text-[clamp(0.9375rem,1vw+0.25rem,1.125rem)] text-charcoal mb-0.5">
            {product.name}
          </h3>
          {product.variant && (
            <p className="text-sm text-neutral-500 mb-0.5">{product.variant}</p>
          )}
          {product.description && (
            <p className="text-xs text-neutral-400 line-clamp-2 mb-1">
              {product.description}
            </p>
          )}
          {hasPersonalisation && (
            <p className="text-xs text-oak-600 font-medium mb-1">
              Personalisable
            </p>
          )}

          {/* Size selector */}
          <div
            className="flex flex-wrap gap-1.5 mb-2"
            role="radiogroup"
            aria-label="Select size"
            onClick={(e) => e.stopPropagation()}
          >
            {variants.map((v, i) => (
              <button
                key={v._key}
                onClick={() => setSelectedIdx(i)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border cursor-pointer transition-colors duration-100 ${
                  i === selectedIdx
                    ? "bg-oak-800 text-white border-oak-800"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-oak-300 hover:text-oak-700"
                }`}
                role="radio"
                aria-checked={i === selectedIdx}
                aria-label={v.name}
              >
                {v.name}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-base font-semibold text-oak-700">
              &pound;{selected.price.toFixed(2)}
            </span>
            <span onClick={(e) => e.stopPropagation()}>
              <AddToCartButton product={productWithSelectedVariant} />
            </span>
          </div>
        </div>
      </article>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
```

Key changes from existing code:
- Added `onClick={() => setModalOpen(true)}` on article
- Added `cursor-pointer` to article className
- Added `onClick={(e) => e.stopPropagation()}` on variant selector and add-to-cart button
- Added "Personalisable" text
- Added `ProductModal` render
- Removed the `allSamePrice` variable (unused)

- [ ] **Step 3: Verify build passes**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Test manually**

Run: `npm run dev` — navigate to `/shop`:
- Click a product card → modal should open with product details
- Click "Add" button on card → product added to cart without modal opening
- Modal shows personalisation fields for products that have them
- Modal closes on X, Escape, backdrop click
- Variant selector works in modal

- [ ] **Step 5: Commit**

```bash
git add components/product-card.tsx components/variant-product-card.tsx
git commit -m "feat: wire product cards to open modal with personalisation

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Notes

- **Supabase project setup:** User must create a Supabase project, create the `personalisation-uploads` storage bucket (private), and add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` before image upload will work.
- **Checkout integration:** The checkout API route (`app/api/checkout/route.ts`) doesn't exist yet. When it's built, it should generate signed URLs for any `personalisationImage` paths using `supabase.storage.from('personalisation-uploads').createSignedUrl(filename, 604800)` (7 days in seconds) and include them in the Stripe Checkout Session metadata.
- **product-card.tsx is now a client component:** Adding `"use client"` means the card renders on the client. This is necessary for `useState` (modal open/close). The parent pages (shop, homepage) remain server components — they pass serialisable props down.
