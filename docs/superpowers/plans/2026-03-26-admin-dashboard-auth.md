# Admin Order Dashboard + Custom Auth

## Context

Ben currently views orders in the Stripe Dashboard, but can't easily see personalisation details (text + images) or track fulfilment status. We're adding a `/admin/orders` dashboard with custom email/password auth for Ben and 1-2 helpers.

**Key discovery:** Personalisation images stored in orders are 7-day signed URLs from Stripe metadata — they expire. The dashboard fix: store raw Supabase Storage paths alongside, generate fresh signed URLs at render time.

---

## Architecture Decisions

### Auth: Custom email/password with argon2id + pepper
- `@node-rs/argon2` (WASM-based, works on Netlify serverless — the native `argon2` package doesn't)
- Pepper stored in `AUTH_PEPPER` env var
- `admin_users` table in Supabase (id, email, password_hash, name, created_at)
- No self-registration — users seeded via CLI script

### Sessions: `iron-session` encrypted cookies
- Stateless — session data encrypted in HTTP-only cookie, no session table needed
- Cookie name: `sipshield-admin`
- 7-day expiry, secure + httpOnly + sameSite=lax
- Single dependency, trivial to understand and maintain

### Route protection: Next.js middleware
- `middleware.ts` at project root, matching `/admin/:path*` (excluding `/admin/login`)
- Reads + decrypts session cookie, redirects to `/admin/login` if invalid

### New dependencies (2 total)
- `iron-session` — encrypted cookie sessions
- `@node-rs/argon2` — argon2id hashing (WASM)

---

## Database Changes (Supabase)

### New table: `admin_users`
```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
-- No RLS policies needed: service role key bypasses RLS, anon gets nothing
```

### Alter `orders` table
```sql
-- Fulfilment tracking
ALTER TABLE orders ADD COLUMN fulfilment_status TEXT DEFAULT 'pending'
  CHECK (fulfilment_status IN ('pending', 'shipped', 'complete'));

-- Raw storage paths for generating fresh signed URLs
ALTER TABLE orders ADD COLUMN personalisation_paths JSONB;
```

---

## File Structure

```
middleware.ts                              # NEW — protect /admin/* routes
lib/auth.ts                               # NEW — argon2 hash/verify, iron-session config
app/admin/layout.tsx                       # NEW — admin layout (minimal, no site header/footer)
app/admin/login/page.tsx                   # NEW — login form (client component)
app/admin/orders/page.tsx                  # NEW — order list (server component)
app/admin/orders/[id]/page.tsx             # NEW — order detail with personalisation images
app/api/admin/login/route.ts              # NEW — POST: validate credentials, set cookie
app/api/admin/logout/route.ts             # NEW — POST: clear cookie
app/api/admin/orders/[id]/status/route.ts # NEW — PATCH: update fulfilment_status
components/admin/order-table.tsx           # NEW — sortable order list
components/admin/order-detail.tsx          # NEW — order detail with inline images
components/admin/login-form.tsx            # NEW — login form component
scripts/seed-admin.ts                     # NEW — CLI script to create admin users
```

---

## Implementation Phases

### Phase 1: Database + Auth Foundation
1. Run SQL migrations in Supabase (new table + alter orders)
2. `npm install iron-session @node-rs/argon2`
3. Create `lib/auth.ts`:
   - `hashPassword(plain)` — argon2id hash with `AUTH_PEPPER` prepended
   - `verifyPassword(plain, hash)` — verify with pepper
   - `sessionOptions` — iron-session config (cookie name, password from `SESSION_SECRET` env var, ttl 7 days)
   - TypeScript session type: `{ userId: string; email: string; name: string }`
4. Create `scripts/seed-admin.ts` — prompts for email/name/password, hashes + inserts into `admin_users`
5. Add `AUTH_PEPPER` and `SESSION_SECRET` to `.env.local`

### Phase 2: Auth Routes + Middleware
1. Create `app/api/admin/login/route.ts`:
   - POST: lookup user by email, verify password, set iron-session cookie
   - Rate limit: track failed attempts (simple in-memory counter, reset on success)
2. Create `app/api/admin/logout/route.ts`:
   - POST: destroy session cookie
3. Create `middleware.ts`:
   - Match `/admin/:path*` excluding `/admin/login` and `/api/admin/login`
   - Decrypt session cookie, redirect to `/admin/login` if missing/invalid
4. Create `app/admin/login/page.tsx` + `components/admin/login-form.tsx`

### Phase 3: Dashboard UI
1. Create `app/admin/layout.tsx` — minimal admin chrome (logo, logout button, no site nav)
2. Create `app/admin/orders/page.tsx` (server component):
   - Fetch orders from Supabase, sorted by created_at desc
   - Generate fresh signed URLs for any personalisation images (from `personalisation_paths`)
   - Pass to client component for rendering
3. Create `components/admin/order-table.tsx`:
   - Columns: date, customer, items summary, total, fulfilment status, personalisation badge
   - Click row → order detail
4. Create `app/admin/orders/[id]/page.tsx` + `components/admin/order-detail.tsx`:
   - Full order detail: items, shipping address, personalisation text + inline images
   - Fulfilment status dropdown (pending → shipped → complete)
5. Create `app/api/admin/orders/[id]/status/route.ts`:
   - PATCH: update `fulfilment_status` in Supabase

### Phase 4: Fix Personalisation Image Paths
1. Modify `app/api/checkout/route.ts`:
   - In metadata, also store raw path as `personalisation_path_${i}` (alongside the signed URL)
2. Modify `app/api/webhook/route.ts` and `app/api/order/confirm/route.ts`:
   - Extract `personalisation_path_*` from metadata
   - Store in new `personalisation_paths` JSONB column
3. Dashboard reads from `personalisation_paths` and generates fresh signed URLs at render time

---

## New Environment Variables

| Variable | Purpose |
|----------|---------|
| `AUTH_PEPPER` | Secret pepper prepended to passwords before hashing |
| `SESSION_SECRET` | 32+ char secret for iron-session cookie encryption |

---

## Security Considerations

- argon2id with pepper — industry standard for password hashing
- HTTP-only, secure, sameSite=lax cookies — not accessible to JavaScript
- No self-registration — admin users created via CLI only
- Service role key stays server-side only — no client exposure
- Rate limiting on login endpoint (simple in-memory, sufficient for 2-3 users)
- CSRF: POST-only mutations + sameSite cookie = sufficient for this scale

---

## Verification

1. Run `scripts/seed-admin.ts` to create Ben's account
2. Visit `/admin/orders` — should redirect to `/admin/login`
3. Log in with credentials — should see order list
4. Click an order — should see detail with personalisation images loading
5. Change fulfilment status — should persist on refresh
6. Open incognito → `/admin/orders` — should redirect to login
7. Place a test order with personalisation → verify it appears in dashboard with images
8. Wait > 7 days (or manually expire) → verify dashboard still shows images (fresh signed URLs)
