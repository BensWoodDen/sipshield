# Cart State System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Zustand cart store and wire it into the existing cart UI components so users can add, remove, and update items with localStorage persistence.

**Architecture:** A single Zustand store (`lib/cart-store.ts`) with persist middleware owns all cart state. The header component manages drawer open/close as local UI state, passing store data to the existing `CartDrawer` as props. `AddToCartButton` and `CartButton` consume the store directly.

**Tech Stack:** Zustand (with persist middleware), React 19, TypeScript

---

### Task 1: Install Zustand

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install zustand**

Run: `npm install zustand`
Expected: zustand added to dependencies in package.json

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install zustand for cart state management"
```

---

### Task 2: Create the cart store

**Files:**
- Create: `lib/cart-store.ts`

- [ ] **Step 1: Create the store file**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  sanityId: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
  stripePriceId: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "sipshield-cart",
    }
  )
);
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/cart-store.ts
git commit -m "feat: add Zustand cart store with localStorage persistence"
```

---

### Task 3: Wire AddToCartButton to the store

**Files:**
- Modify: `components/add-to-cart-button.tsx`

- [ ] **Step 1: Replace the full file contents**

```tsx
"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "./product-card";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const addItem = useCartStore((s) => s.addItem);

  function handleClick() {
    if (state !== "idle") return;

    setState("loading");

    const variantKey = product.variants?.find(
      (v) => v.name === product.variant
    )?._key;

    addItem({
      id: variantKey ? `${product.id}-${variantKey}` : product.id,
      sanityId: product.id,
      name: product.name,
      variant: product.variant || undefined,
      price: product.price,
      image: product.image?.url,
      stripePriceId: product.stripePriceId,
    });

    setState("success");
    setTimeout(() => setState("idle"), 1200);
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="inline-flex items-center gap-2 px-4 py-2 bg-forest-500 text-white text-sm font-medium rounded-md cursor-pointer transition-[background-color,box-shadow] duration-100 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-forest-600 hover:shadow-sm focus-visible:outline-none focus-visible:shadow-focus active:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Add ${product.name} to cart`}
    >
      {state === "loading" && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {state === "success" && <Check className="w-4 h-4" />}
      {state === "idle" && <Plus className="w-4 h-4" />}
      {state === "success" ? "Added" : "Add"}
    </button>
  );
}
```

Key changes from the existing file:
- Import `useCartStore` and call `addItem` on click
- Remove the fake `await` delay — store mutation is synchronous
- Build cart item ID: `${product.id}-${variantKey}` for variant products, `${product.id}` for single products
- Look up variant `_key` from the product's variants array using the `variant` name (which `VariantProductCard` sets on the spread product)

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/add-to-cart-button.tsx
git commit -m "feat: wire AddToCartButton to Zustand cart store"
```

---

### Task 4: Wire CartButton to the store and add drawer toggle

**Files:**
- Modify: `components/cart-button.tsx`

- [ ] **Step 1: Replace the full file contents**

```tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-oak-50 border border-oak-100 rounded-full text-sm font-medium text-oak-700 hover:bg-oak-100 transition-colors duration-100 cursor-pointer"
      aria-label={`Cart with ${totalItems} items`}
    >
      <ShoppingCart className="w-[18px] h-[18px]" />
      <span className="hidden sm:inline">Cart</span>
      <span className="inline-flex items-center justify-center min-w-5 h-5 bg-forest-500 text-white rounded-full text-[0.6875rem] font-semibold">
        {totalItems}
      </span>
    </button>
  );
}
```

Key changes:
- Import `useCartStore`, read `totalItems()` from store instead of hardcoded `0`
- Accept `onClick` prop for the header to toggle the drawer

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/cart-button.tsx
git commit -m "feat: wire CartButton to Zustand store and accept onClick prop"
```

---

### Task 5: Add CartDrawer to the header with open/close state

**Files:**
- Modify: `components/header.tsx`

- [ ] **Step 1: Replace the full file contents**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";
import { useCartStore } from "@/lib/cart-store";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
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

          <CartButton onClick={() => setCartOpen(true)} />
        </div>
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
      />
    </>
  );
}
```

Key changes:
- Add `cartOpen` state and toggle via `CartButton` onClick
- Import and render `CartDrawer`, passing store data as props
- Pass `updateQuantity` and `removeItem` from store as drawer handlers

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit --pretty`
Expected: No errors

- [ ] **Step 3: Manual test**

Run: `npm run dev`

Test these flows in the browser:
1. Go to `/shop`, click "Add" on a product — badge count on CartButton should increment
2. Click the cart button — drawer slides open showing the item
3. Use +/- buttons in the drawer — quantity and subtotal update
4. Click minus when quantity is 1 — item is removed
5. Close the drawer (X button or Escape or backdrop click)
6. Refresh the page — cart items persist (check localStorage key `sipshield-cart`)
7. Add a variant product (select a size, then add) — appears as separate line from base product

- [ ] **Step 4: Commit**

```bash
git add components/header.tsx
git commit -m "feat: mount CartDrawer in header with open/close state wired to cart store"
```

---

### Task 6: Verify build

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: Build completes with no errors. May show warnings about missing env vars — that's fine.

- [ ] **Step 2: Commit any fixes if needed**
