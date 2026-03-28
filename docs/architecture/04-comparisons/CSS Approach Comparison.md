---
tags: [comparison]
status: complete
date: 2026-03-25
domain: frontend
related_adr: "[[ADR-006-styling-approach]]"
---

# CSS Approach Comparison

> Supporting evidence for [[ADR-006-styling-approach]]

## Context

SipShield needs a CSS approach for 7 pages of e-commerce UI. AI (Claude) writes most of the code. The developer dislikes Tailwind's utility-class approach but prioritises pragmatism. OKLCH colour support is required for perceptually uniform colour scales.

## Candidates

| Criterion | Tailwind CSS v4 | CSS Modules | Panda CSS | Vanilla Extract |
|-----------|----------------|-------------|-----------|-----------------|
| **TypeScript support** | Weak (CSS-first config) | None inherent | Excellent (core feature) | Excellent (core feature) |
| **Solo-dev operability** | Excellent | Excellent | Good | Fair |
| **Monthly cost** | $0 | $0 | $0 | $0 |
| **Ecosystem health** | Massive (30-50M npm/wk) | Universal (built-in) | Small (90K npm/wk) | Moderate (440K npm/wk) |
| **Documentation quality** | Excellent | Good (Next.js docs) | Good | Good |
| **Learning curve** | Low | Lowest | Medium | High |
| **Reversibility** | Tedious but mechanical | Easiest | Moderate | Moderate |
| **AI code generation** | Best in class | Good | Fair (improving) | Fair to poor |
| **RSC compatibility** | Excellent | Excellent | Excellent | Good (needs plugin) |
| **OKLCH support** | Native (v4 default) | Yes (standard CSS) | Yes (CSS values) | Yes (CSS values) |
| **Extra dependencies** | 1 package | 0 | 1 pkg + codegen | 3+ pkgs + plugin |
| **Component ecosystem** | shadcn/ui, Headless UI | None specific | Park UI | None specific |

## Detailed analysis

### Tailwind CSS v4

**What it is:** Utility-first CSS framework, now with CSS-first configuration and native OKLCH.

**Strengths:**
- AI tools generate near-perfect Tailwind code — decisive for an AI-authored project
- shadcn/ui provides production-ready e-commerce components
- v4 uses OKLCH internally — custom OKLCH colour scales are first-class
- Zero runtime, v4 produces ~70% smaller CSS than v3
- 5x faster full builds, 100x faster incremental builds vs v3

**Weaknesses:**
- Developer dislikes utility-class markup
- v4 is a significant departure from v3 — many tutorials are outdated
- No type-safe token references

**Ecosystem snapshot** (as of 2026-03-25):
- 30-50M weekly npm downloads
- Maintained by Tailwind Labs (Adam Wathan), well-funded
- v4.2.2 released March 2026
- Massive community, countless resources

### CSS Modules

**What it is:** Scoped CSS files built into Next.js — no extra dependencies.

**Strengths:**
- Zero setup, zero dependencies, zero risk of abandonment
- Standard CSS — all knowledge transfers, AI handles it well
- Perfect RSC and App Router compatibility
- OKLCH works via standard CSS custom properties

**Weaknesses:**
- No built-in design token system — must create manually with CSS custom properties
- No component ecosystem — every UI element built from scratch
- AI generates CSS well but doesn't produce "plug and play" components
- More files (separate `.module.css` per component)

**Ecosystem snapshot:** Built into Next.js. No external dependency to track.

### Panda CSS

**What it is:** Build-time CSS-in-JS by the Chakra UI team, designed for React Server Components.

**Strengths:**
- Type-safe `css()` function with full autocompletion
- Zero runtime, PostCSS-based
- Ships a Claude MCP server for AI assistance
- Built-in design token system

**Weaknesses:**
- ~90K weekly npm downloads — smallest community
- Code generation step (`panda codegen`) adds friction
- Dependent on Chakra UI team's continued investment
- Fewer resources for troubleshooting

**Ecosystem snapshot** (as of 2026-03-25):
- Actively maintained, v1.6.0
- Backed by Chakra UI team
- Park UI component library available

### Vanilla Extract

**What it is:** Zero-runtime CSS-in-TypeScript with excellent type safety.

**Strengths:**
- Full TypeScript type checking on styles
- `recipe()` API for type-safe component variants
- Zero runtime

**Weaknesses:**
- Requires `@vanilla-extract/next-plugin` and multiple packages
- Styles must live in separate `.css.ts` files
- Poor AI code generation support
- Historical issues with RSC navigation edge cases

**Ecosystem snapshot** (as of 2026-03-25):
- ~440K weekly npm downloads, actively maintained
- Used by Mantine and some design systems
- Moderate community size

## Recommendation

**Tailwind CSS v4** for SipShield specifically because AI writes most of the code. The massive training data advantage means faster, more consistent output. Native OKLCH support satisfies the colour requirement without extra work. The developer's preference against utility classes is acknowledged but outweighed by the AI productivity gain in this context.

## What the other options are better for

- **CSS Modules** is better if the developer writes most of the code themselves — more enjoyable and zero dependencies
- **Panda CSS** is better for TypeScript-heavy projects where type-safe tokens matter and the developer is comfortable with a smaller community
- **Vanilla Extract** is better for design system libraries where type safety on variants is critical and the team can invest in the learning curve
