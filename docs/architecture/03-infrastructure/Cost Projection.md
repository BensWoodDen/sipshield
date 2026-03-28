---
tags: [infrastructure, cost]
status: decided
date: 2026-03-25
---

# Cost Projection

## Monthly estimate: ~£0/mo (+ transaction fees)

| Service | Purpose | Monthly cost | Notes |
|---------|---------|-------------|-------|
| Netlify Free | Hosting, CDN, serverless functions | £0 | 100 GB bandwidth, 125K function invocations, 300 build minutes |
| Stripe | Payment processing | ~£14 | At estimated £500/mo revenue: 1.5% + 20p per UK transaction |
| Domain (sipshield.co.uk) | Custom domain | ~£0.50 | ~£5-8/year via Cloudflare Registrar, amortised monthly |
| **Total fixed** | | **~£0.50/mo** | |
| **Total including Stripe fees** | | **~£14.50/mo** | At £500/mo revenue |

## Assumptions

- ~100-1,000 visitors/month (Instagram-driven traffic)
- ~£500/month revenue (estimated based on product prices £10-£25)
- ~20-40 orders/month (average order ~£15)
- Majority UK domestic cards (1.5% + 20p fee tier)
- 10 deploys/month, ~3 minutes each = 30 build minutes
- ~1-5 GB bandwidth/month (optimised images, small catalog)

## Stripe fee breakdown

| Revenue/month | Estimated orders | Stripe fees | Effective rate |
|--------------|-----------------|-------------|---------------|
| £100 | ~5-8 | ~£3-5 | ~3-5% |
| £250 | ~12-20 | ~£8-10 | ~3-4% |
| £500 | ~25-40 | ~£14-18 | ~2.8-3.5% |
| £1,000 | ~50-80 | ~£25-35 | ~2.5-3.5% |

Note: Effective rate is higher at low volumes because the 20p fixed fee is a larger percentage of small transactions. A £10 order pays 35p (3.5%), while a £25 order pays 57p (2.3%).

## Scale triggers

| Trigger | Impact | New cost |
|---------|--------|----------|
| >100 GB bandwidth/month (~50K+ visitors) | Netlify Pro upgrade needed | +£16/mo ($19/mo) |
| >300 build minutes/month (>100 deploys) | Netlify Pro upgrade needed | +£16/mo ($19/mo) |
| >£250/mo revenue consistently | Shopify Basic becomes worthwhile for inventory/analytics | +£32/mo (replacing Netlify) |
| International sales volume | Higher Stripe fees (2.5-3.25% + 20p) | Variable |

## Cost optimisation opportunities

- **Image optimisation at build time:** Use `next/image` with appropriate sizing to minimise bandwidth. Each product has ~2-3 photos; total image payload should be well under 5 MB per page load.
- **Static generation:** Most pages are static (SSG) — served from CDN with no serverless function invocation cost.
- **Stripe pricing:** UK domestic rate (1.5% + 20p) is among the lowest in the market. No monthly platform fee.
- **Domain via Cloudflare:** At-cost pricing with no markup — cheapest registrar option.

## Year 1 projected total cost

| Item | Annual cost |
|------|------------|
| Domain (sipshield.co.uk) | ~£5-8 |
| Domain (sipshield.uk redirect, optional) | ~£5-7 |
| Hosting (Netlify) | £0 |
| Stripe fees (at £500/mo avg revenue) | ~£168 |
| **Total** | **~£175-185/year** |

Of this, ~£168 is Stripe transaction fees which scale with revenue — they're a cost of doing business, not infrastructure overhead. The actual infrastructure cost is ~£5-15/year (domain only).
