# Dual Netlify Deployment: Dev + Prod

## Context

SipShield currently has no deployment infrastructure. Local development uses `npm run dev` with `.env.local`. To provide a proper staging environment that mirrors production (testing Stripe checkout, Supabase schema isolation, real Netlify builds), we need two separate Netlify sites deploying from different branches.

This also gives Ben (non-technical) a way to preview content changes on the dev site before they go live.

## Architecture

Two independent Netlify sites, same GitHub repo, different branches:

| | Dev Site | Prod Site |
|---|---|---|
| **Netlify site name** | sipshield-dev | sipshield-prod |
| **Branch** | `dev` | `main` |
| **Custom domain** | `dev.sipshield.co.uk` | `sipshield.co.uk` |
| **Stripe keys** | Test (`sk_test_` / `pk_test_`) | Live (`sk_live_` / `pk_live_`) |
| **Supabase schema** | `dev` (via `SUPABASE_SCHEMA=dev`) | `public` (default, no override) |
| **Webhook endpoint** | `dev.sipshield.co.uk/api/webhook` | `sipshield.co.uk/api/webhook` |

### Why two sites, not branch deploys?

Netlify free tier does not support custom domains on branch deploys. Since `dev.sipshield.co.uk` is required, two separate sites is the only option on the free tier.

## Environment Variables

### Shared (same value on both sites)

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` (`production`)
- `SANITY_API_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_PEPPER`
- `SESSION_SECRET`
- `RESEND_API_KEY`

### Per-site (different values)

| Env Var | Dev | Prod |
|---|---|---|
| `SUPABASE_SCHEMA` | `dev` | *(omit)* |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `NEXT_PUBLIC_SITE_URL` | `https://dev.sipshield.co.uk` | `https://sipshield.co.uk` |
| `STRIPE_WEBHOOK_SECRET` | Dev webhook signing secret | Prod webhook signing secret |
| `SANITY_STUDIO_NETLIFY_BUILD_HOOK` | Dev build hook URL | Prod build hook URL |

## Code Changes

**None.** The existing `lib/supabase.ts` schema-switching logic already supports this:

```typescript
const dbSchema =
  process.env.SUPABASE_SCHEMA ||
  (process.env.NODE_ENV === "production" ? "public" : "dev");
```

Setting `SUPABASE_SCHEMA=dev` on the dev Netlify site overrides the default. Omitting it on prod lets NODE_ENV drive the selection to `public`.

## Git Workflow

```
dev branch ──push──> sipshield-dev (dev.sipshield.co.uk)
                          │
                      test & verify
                          │
main branch <──merge── dev branch
      │
      └──auto-deploy──> sipshield-prod (sipshield.co.uk)
```

- `dev` is the working branch. All development happens here.
- When changes are verified on the dev site, merge `dev` into `main` to deploy to production.
- Both sites auto-deploy on push to their respective branches (Netlify native git integration).

## Implementation Steps

1. **Create `dev` branch** from current `main`
2. **Create Netlify dev site** via CLI (`pnpm netlify sites:create --name sipshield-dev`)
3. **Create Netlify prod site** via CLI (`pnpm netlify sites:create --name sipshield-prod`)
4. **Link project** to the dev site for local development (`pnpm netlify link`)
5. **Connect both sites to GitHub repo** and set production branch per site
6. **Set environment variables** on each site per the table above
7. **Configure custom domains** - `dev.sipshield.co.uk` on dev site, `sipshield.co.uk` on prod site (DNS via domain registrar)
8. **Create Stripe webhook endpoints** for each domain and set the signing secrets
9. **Create Netlify build hooks** for each site (used by Sanity "Rebuild Site" action)
10. **Connect Netlify MCP server** (should work once project is linked)
11. **Update `CLAUDE.md`** to document the two-site setup and workflow
12. **Test dev deployment** - push to `dev`, verify site builds, Stripe test checkout works, orders go to `dev` schema

## Verification

- Push to `dev` branch triggers build on dev site only
- `dev.sipshield.co.uk` loads correctly with HTTPS
- Stripe test checkout completes on dev site
- Order appears in Supabase `dev` schema (not `public`)
- Sanity "Rebuild Site" action triggers dev site rebuild
- Netlify MCP server connects successfully in Claude Code
