---
tags: [comparison]
status: complete
date: 2026-03-25
domain: infrastructure
related_adr: "[[ADR-003-hosting-platform]]"
---

# Hosting Platform Comparison

> Supporting evidence for [[ADR-003-hosting-platform]]

## Context

SipShield is a commercial e-commerce site that needs zero-cost hosting with Next.js App Router support, serverless functions (for Stripe checkout), and custom domain + HTTPS. The original plan assumed Vercel Hobby, but its fair use policy prohibits commercial use.

## Candidates

| Criterion | Vercel Hobby | Vercel Pro | Netlify Free | Cloudflare Workers | Render Free |
|-----------|-------------|-----------|-------------|-------------------|-------------|
| **Monthly cost** | $0 | $20 | $0 | $0 | $0 |
| **Commercial use** | No | Yes | Yes | Yes | Yes |
| **Next.js support** | Best (native) | Best (native) | Good (auto-detect) | Good (OpenNext adapter) | OK (container) |
| **Bandwidth** | 100 GB | 1 TB | 100 GB | Unlimited | 100 GB |
| **Serverless invocations** | 1M/mo | 1M/mo | 125K/mo | 100K/day | N/A |
| **Build minutes** | 6,000/mo | 6,000/mo | 300/mo | 500 builds/mo | 500/mo |
| **Preview deploys** | Yes | Yes | Yes | Yes | Yes |
| **Custom domain + HTTPS** | Yes | Yes | Yes | Yes | Yes |
| **Cold starts** | No | No | No | No | 30-60 seconds |
| **Setup complexity** | Easiest | Easiest | Easy | Medium | Easy |

## Detailed analysis

### Vercel Hobby ($0, non-commercial only)

**What it is:** The free tier of Vercel, the company that builds Next.js.

**Strengths:**
- Best-in-class Next.js deployment — zero configuration, automatic optimisation
- Generous resource limits (1M function invocations, 6K build minutes)
- Image optimisation, edge network, analytics included

**Weaknesses:**
- **Commercial use explicitly prohibited** by [fair use policy](https://vercel.com/docs/limits/fair-use-guidelines)
- Building a revenue-generating site on a ToS violation is avoidable risk

**Pricing:** $0 but restricted to non-commercial use. Vercel Pro is $20/user/month for commercial sites.

**Operational complexity:** Lowest of any option. Connect GitHub, deploy. No configuration needed for Next.js.

### Netlify Free ($0, commercial allowed)

**What it is:** A JAMstack/serverless platform with solid Next.js support.

**Strengths:**
- Commercial use explicitly allowed on free tier
- Auto-detects Next.js App Router, SSR, ISR, API routes
- Simple GitHub-connected deployment workflow
- 125K serverless invocations covers Stripe checkout API route easily
- Mature platform with large community

**Weaknesses:**
- Not as deeply optimised for Next.js as Vercel (minor for this project's scope)
- Post-September 2025 accounts use credit-based pricing (free credits map to equivalent limits)
- 300 build minutes/month is adequate but tighter than Vercel's 6,000

**Ecosystem snapshot** (as of 2026-03-25):
- Established platform, publicly traded company (Netlify Inc)
- Active development, regular Next.js support updates
- Large community, good documentation

**Pricing:** $0/month. Pro tier is $19/member/month if needed.

### Cloudflare Workers ($0, commercial allowed)

**What it is:** Edge computing platform with unlimited free bandwidth.

**Strengths:**
- Unlimited bandwidth on free tier (unique among options)
- 100,000 requests/day is extremely generous
- Cloudflare also handles DNS and CDN — full stack in one provider
- Long-term free tier stability (Cloudflare's business model doesn't depend on upselling developers)

**Weaknesses:**
- Requires OpenNext adapter (`@opennextjs/cloudflare`) for Next.js deployment
- Workers runtime doesn't support all Node.js APIs (must stick to Web APIs)
- ISR works differently than on Vercel/Netlify
- More complex initial setup than Netlify

**Ecosystem snapshot** (as of 2026-03-25):
- OpenNext is actively maintained, growing community
- Cloudflare investing heavily in developer platform
- Workers runtime expanding Node.js API compatibility

**Pricing:** $0/month. Paid Workers plan is $5/month for higher limits.

### Render Free ($0, commercial allowed — cold start issues)

**What it is:** Cloud platform that deploys Next.js as a web service.

**Strengths:**
- Simple deployment from Git
- Docker-based, so full Node.js compatibility

**Weaknesses:**
- **Free tier services spin down after 15 minutes of inactivity**
- **Cold starts take 30-60 seconds** — dealbreaker for e-commerce (Instagram click → 60-second wait → customer leaves)
- Not serverless — runs as persistent process

**Pricing:** $0 free tier with cold starts, $7/month for always-on.

## Recommendation

**Netlify Free** best satisfies the zero-budget constraint while allowing commercial use and providing good Next.js DX. The 125K serverless invocations and 100 GB bandwidth provide 20-100x headroom over projected usage.

## What the other options are better for

- **Vercel** is better if budget allows $20/month — unmatched Next.js DX
- **Cloudflare Workers** is better for bandwidth-heavy sites or projects needing edge computing
- **Render** is better for always-on server workloads where $7/month is acceptable
