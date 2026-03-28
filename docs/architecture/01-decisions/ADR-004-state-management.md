---
tags: [adr]
status: decided
date: 2026-03-25
domain: frontend
reversibility: two-way-door
---

# ADR-004: Zustand for cart state management

## Status

Decided — 2026-03-25

## Context

SipShield needs client-side state for the shopping cart: items, quantities, and persistence across page navigations. The cart must survive page refreshes (localStorage) but doesn't need server-side persistence.

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| Zustand | Tiny (~1KB), simple API, built-in persist middleware, no boilerplate | Another dependency | two-way-door | $0 |
| React Context | Zero dependencies, built into React | Verbose for complex state, no built-in persistence, re-renders all consumers on any change | two-way-door | $0 |
| Jotai | Atomic model, good for derived state | Overkill for a single store, less intuitive for simple use cases | two-way-door | $0 |

## Decision

Zustand. The developer has expressed a preference for it, and it's well-suited to the use case:

```typescript
// Example cart store shape
interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (priceId: string) => void
  updateQuantity: (priceId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}
```

Zustand's `persist` middleware handles localStorage serialisation automatically — no custom code needed for cart persistence.

## Consequences

### Positive
- ~1KB gzipped — negligible bundle impact
- `persist` middleware gives free localStorage cart persistence
- No provider wrappers needed (unlike Context) — cleaner component tree
- Selective subscriptions — components only re-render when the slice they use changes

### Negative
- External dependency (though very stable — 50M+ weekly npm downloads, actively maintained)

### Neutral
- Zustand stores work fine in Client Components. Server Components don't need cart state.

## What if we're wrong?

Two-way door. Zustand stores are simple enough to migrate to React Context or any other state library in an afternoon. The store interface stays the same — only the implementation changes.

## Cost implications

$0. Open-source (MIT license).

## Growth path

Zustand handles multiple stores cleanly if SipShield needs more client-side state in the future (e.g., UI preferences, recently viewed products). No architecture changes needed.
