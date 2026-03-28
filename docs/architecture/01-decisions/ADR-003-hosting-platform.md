---
tags: [adr]
status: decided
date: 2026-03-25
domain: infrastructure
reversibility: two-way-door
---

# ADR-003: Netlify Free tier for hosting

## Status

Decided — 2026-03-25

## Context

SipShield is a commercial e-commerce site (selling oak drink covers). The hosting platform must:
- Cost £0/month
- Allow commercial use on its free tier
- Support Next.js App Router with API routes (serverless functions for Stripe checkout)
- Provide custom domain + HTTPS
- Offer GitHub integration with preview deploys

The original plan specified Vercel Hobby tier, but research revealed that **Vercel Hobby explicitly restricts commercial use** to personal, non-commercial projects. SipShield sells products — this violates the fair use policy.

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| Vercel Hobby | Best Next.js DX, built by same team | Commercial use prohibited on free tier | two-way-door | $0 (ToS risk) |
| Vercel Pro | Full commercial use, best DX | $20/month — exceeds zero budget | two-way-door | $20 |
| Netlify Free | Commercial use allowed, good Next.js support, easy setup | Not quite as optimised as Vercel for Next.js, credit-based pricing for new accounts (post Sep 2025) | two-way-door | $0 |
| Cloudflare Workers | Unlimited bandwidth, commercial use allowed, 100k req/day | Requires OpenNext adapter, some Node.js APIs unavailable in Workers runtime, more setup complexity | two-way-door | $0 |
| Render Free | Simple deployment | 30-60 second cold starts after 15 min inactivity — dealbreaker for e-commerce | two-way-door | $0 |
| Coolify + VPS | Full control, no vendor restrictions | $4-5/month, server management burden | two-way-door | $4-5 |

### Vercel Hobby

The best Next.js deployment experience — built by the same team, zero configuration. However, the [fair use policy](https://vercel.com/docs/limits/fair-use-guidelines) restricts the Hobby tier to non-commercial, personal use. While enforcement on tiny sites is unlikely, building a business on a ToS violation creates unnecessary risk. Ruled out.

### Netlify Free

Solid Next.js support with auto-detection of App Router, SSR, ISR, and API routes. Commercial use is explicitly allowed on the free tier. 100 GB bandwidth and 125,000 serverless function invocations per month far exceed SipShield's needs (~1-5 GB bandwidth, ~50-500 invocations/month). GitHub integration with preview deploys works similarly to Vercel.

Post-September 2025 accounts use credit-based pricing, but the free credit allocation maps to equivalent limits. At SipShield's traffic level, this is not a concern.

### Cloudflare Workers

Technically superior free tier (unlimited bandwidth, 100k requests/day). However, Next.js deployment requires the OpenNext adapter (`@opennextjs/cloudflare`), which adds setup complexity and is a moving target. Some Node.js APIs aren't available in the Workers runtime. For a 7-page site with one API route, this complexity isn't justified.

## Decision

**Netlify Free tier.** It satisfies all constraints: zero cost, commercial use allowed, good Next.js support, simple deployment, and generous limits with massive headroom for SipShield's expected traffic.

## Consequences

### Positive
- Zero monthly cost with commercial use allowed — no ToS risk
- Simple GitHub-connected deployment with preview deploys
- Serverless functions for Stripe checkout API route
- Custom domain with automatic HTTPS (via Let's Encrypt)

### Negative
- Not quite as optimised for Next.js as Vercel (minor — Netlify's Next.js support is solid)
- Credit-based pricing for new accounts adds slight uncertainty about long-term free tier stability
- Edge function support and image optimisation are less mature than Vercel's

### Neutral
- Migration from Netlify to Vercel Pro (or vice versa) is straightforward — both deploy from the same Git repo with minimal config changes

## What if we're wrong?

Two-way door. Migrating between Netlify, Vercel, and Cloudflare is a DNS change + minor config file update. The Next.js application code doesn't change. If Netlify degrades its free tier or SipShield outgrows it, moving to Vercel Pro ($20/month) or Cloudflare Workers is a 30-minute task.

## Cost implications

$0/month. Netlify Free tier includes:
- 100 GB bandwidth/month
- 125,000 serverless function invocations/month
- 300 build minutes/month
- Unlimited sites
- Custom domains with HTTPS

SipShield's projected usage (~1-5 GB bandwidth, ~50-500 invocations, ~50 build minutes) uses less than 5% of the free tier. Even at 10x growth, the free tier holds comfortably.

## Growth path

- **10x traffic (1,000-10,000 visitors/month):** Still within free tier limits
- **100x traffic:** May approach bandwidth limits. Upgrade to Netlify Pro ($19/month) or migrate to Vercel Pro ($20/month)
- **Revenue justifies cost:** At ~£250/month revenue, consider Vercel Pro for optimal Next.js DX, or Shopify Basic for managed e-commerce
