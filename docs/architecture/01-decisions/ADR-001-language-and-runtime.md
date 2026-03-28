---
tags: [adr]
status: decided
date: 2026-03-25
domain: backend
reversibility: one-way-door
---

# ADR-001: TypeScript as sole language

## Status

Decided — 2026-03-25

## Context

SipShield is a small e-commerce site built and maintained by a solo developer. The language choice affects every file in the project. Next.js supports both JavaScript and TypeScript natively.

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| TypeScript | Type safety, better IDE support, catches bugs at build time | Slightly more boilerplate, build step required | one-way-door | $0 |
| JavaScript | No build overhead, simpler for tiny scripts | No type safety, harder refactoring, worse DX | two-way-door | $0 |

## Decision

TypeScript. The project uses Next.js which includes TypeScript support out of the box — zero configuration needed. For a solo developer, type safety catches entire categories of bugs (wrong prop types, missing fields, incorrect Stripe API calls) before they reach production.

## Consequences

### Positive
- Stripe SDK has excellent TypeScript types — API misuse caught at compile time
- Zustand store types enforce cart item shape consistency
- IDE autocompletion speeds up development significantly

### Negative
- Minor: generic type annotations on Zustand stores and API routes add a few lines of boilerplate

### Neutral
- Next.js handles `tsconfig.json` automatically — no manual TypeScript configuration needed

## What if we're wrong?

This is a one-way door in practice (converting a TypeScript project to JavaScript is trivial, but converting back would be painful). However, there's no realistic scenario where this decision would need reversal. TypeScript is the default for modern Next.js projects.

## Cost implications

$0. TypeScript is open-source and bundled with Next.js.

## Growth path

No change needed at any team size. TypeScript becomes more valuable, not less, as more people touch the code.
