# Cart State System Design

**Date:** 2026-03-26
**Scope:** Zustand cart store + wiring to existing UI components. No checkout flow.

## Zustand Store (`lib/cart-store.ts`)

### CartItem Shape

```ts
{
  id: string          // product _id + variant key (for uniqueness)
  sanityId: string    // product _id (for deduplication)
  name: string
  variant?: string    // e.g. "Small", "Large"
  price: number       // in pounds
  quantity: number
  image?: string      // Sanity image URL
  stripePriceId: string  // stored now for checkout later
}
```

### Store Interface

- `items: CartItem[]`
- `addItem(item)` — increment quantity if same `id` exists, otherwise append
- `removeItem(id)` — remove by id
- `updateQuantity(id, quantity)` — set quantity, remove if 0
- `clearCart()`
- `totalItems()` — sum of all quantities
- `totalPrice()` — sum of price x quantity

### Persistence

Zustand `persist` middleware with `localStorage`, key `"sipshield-cart"`.

## Wiring Changes

| Component | Change |
|---|---|
| `add-to-cart-button.tsx` | Call `addItem()` from store on click, pass product data from props |
| `cart-button.tsx` | Read `totalItems()` from store, call `onToggleDrawer` prop |
| `cart-drawer.tsx` | No changes — already accepts items/handlers as props |
| Header/Layout | Render `CartDrawer`, manage open/close state, pass store data as props to drawer |

## Design Decisions

- **ID strategy**: `${sanityId}` for single-variant products, `${sanityId}-${variantKey}` for multi-variant. Same product in different sizes = separate cart lines.
- **No cart page** — drawer only, as designed in existing components.
- **Prices are display-only** — Stripe will be authoritative when checkout is added later.
- **stripePriceId stored in cart items** — ready for checkout integration without refactoring.
- **Header-owned drawer state** — open/close is local UI state in the header, not in the Zustand store. Keeps cart store focused on cart data.
