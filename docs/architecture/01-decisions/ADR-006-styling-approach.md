---
tags: [adr]
status: decided
date: 2026-03-25
domain: frontend
reversibility: two-way-door
---

# ADR-006: Tailwind CSS v4 with OKLCH colour system

## Status

Decided — 2026-03-25

## Context

SipShield needs a CSS approach for 7 pages of e-commerce UI. The sole developer will rely heavily on AI (Claude) for code generation. The site is photography-forward with an oak/amber colour palette that needs perceptual consistency across lightness scales.

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| Tailwind CSS v4 | Best AI code generation, huge ecosystem (shadcn/ui), zero runtime, native OKLCH | Developer dislikes utility-class approach | two-way-door | $0 |
| CSS Modules | Zero dependencies, real CSS, enjoyable to write | Less AI-ready component ecosystem, more manual design token work | two-way-door | $0 |
| Panda CSS | Type-safe, zero runtime, has Claude MCP server | ~90K weekly npm downloads, small community, risky for solo dev | two-way-door | $0 |
| Vanilla Extract | Type-safe CSS-in-TypeScript | Poor AI support, separate `.css.ts` files, extra plugin setup | two-way-door | $0 |

### Tailwind CSS v4

Version 4.2.2 (March 2026). 30-50M weekly npm downloads. Tailwind v4 introduced a CSS-first configuration model using `@theme` directives — no more `tailwind.config.js`. Critically, **v4 uses OKLCH as its default colour space**, meaning custom colour scales defined in OKLCH are first-class citizens. AI tools (Claude, v0, Cursor) generate excellent Tailwind code due to massive training data. The shadcn/ui ecosystem provides production-ready e-commerce components.

### CSS Modules

Built into Next.js — zero setup, zero dependencies. Scoped CSS with standard syntax. AI handles plain CSS well but doesn't provide the same "copy-paste ready" component experience. For 7 pages, the extra effort would be manageable but adds up when AI is doing most of the work.

### Panda CSS

Type-safe CSS-in-TypeScript with zero runtime. Ships a Claude MCP server for better AI assistance. However, ~90K weekly downloads means a much smaller community. If the sole developer (relying on AI) hits an edge case, Stack Overflow and GitHub issues won't have answers.

## Decision

**Tailwind CSS v4** with a custom OKLCH colour theme. Despite personal preference against utility classes, the AI code generation quality is a decisive advantage when Claude writes most of the code. The OKLCH requirement aligns naturally — Tailwind v4 supports it natively.

### OKLCH colour approach

The SipShield colour palette (oak/amber primary, charcoal text, cream background, forest green CTAs) will be defined using OKLCH values in the Tailwind theme:

```css
@theme {
  --color-oak-50: oklch(0.97 0.02 80);
  --color-oak-100: oklch(0.93 0.04 80);
  /* ... full scale */
  --color-oak-900: oklch(0.25 0.06 80);

  --color-forest-500: oklch(0.55 0.15 155);
  --color-cream: oklch(0.97 0.01 90);
  --color-charcoal: oklch(0.25 0.01 260);
}
```

OKLCH ensures perceptually uniform lightness steps — important for a product photography site where colour consistency across backgrounds, hover states, and borders affects perceived quality.

## Consequences

### Positive
- AI generates production-quality Tailwind code reliably
- Access to shadcn/ui and extensive component ecosystem
- OKLCH colour system provides perceptually uniform palette
- Zero runtime CSS — excellent performance
- v4's CSS-first config is simpler than v3's JavaScript config

### Negative
- Developer personally dislikes utility-class approach (mitigated by AI writing most code)
- Tailwind markup can look cluttered in templates

### Neutral
- Tailwind v4 is a significant change from v3 — most online tutorials reference v3 patterns. The CSS-first `@theme` approach replaces `tailwind.config.js`.

## What if we're wrong?

Two-way door. Migrating from Tailwind to CSS Modules means rewriting styles — tedious but mechanical for 7 pages. The component structure and logic remain unchanged. If AI code generation improves for other CSS approaches, switching becomes more viable.

## Cost implications

$0. Tailwind CSS is open-source (MIT license).

## Growth path

No change needed. Tailwind scales well to larger projects. If a design system emerges, Tailwind's `@theme` and component patterns support it naturally. If the developer wants to enjoy writing CSS more, a future migration to CSS Modules is feasible given the small codebase.
