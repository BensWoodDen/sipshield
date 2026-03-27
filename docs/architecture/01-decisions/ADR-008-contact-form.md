---
tags: [adr]
status: decided
date: 2026-03-27
domain: frontend, backend
reversibility: two-way-door
---

# ADR-008: Contact form submission handling

## Status

Decided -- 2026-03-27

## Context

SipShield needs a contact page where visitors can send enquiries to Ben (ben@sipshield.co.uk). The form needs to handle general enquiries, custom order requests, and anything else visitors might ask about.

Key constraints:
- Zero budget (free tiers only)
- Must work identically in local dev and production (no platform-specific features)
- Solo maintainer -- minimal operational complexity
- Spam protection needed but no heavy CAPTCHA friction (handcrafted goods audience)
- Future extension path to admin dashboard comms module

## Options considered

| Option | Pros | Cons | Reversibility | Monthly cost |
|--------|------|------|---------------|-------------|
| Netlify Forms | Zero code, built-in spam filtering | Vendor lock-in, no local dev, 100/month limit | two-way-door | $0 |
| Resend | Great DX, works everywhere, high deliverability | New dependency, new env var | two-way-door | $0 |
| SendGrid | Mature, high deliverability | Heavier SDK, more complex setup | two-way-door | $0 |
| Nodemailer + SMTP | No third-party dependency | Fiddly SMTP config, deliverability depends on provider | two-way-door | $0 |

### Option A: Netlify Forms

Netlify detects forms at build time via HTML attributes and handles submission, spam filtering (Akismet-powered), and email notification automatically. Zero backend code required.

However, this is a platform-specific feature that does not work in local development. The form would silently fail or need a mock locally, creating dev/prod divergence. It also ties a core feature to the hosting platform, contradicting our goal of keeping features portable. The 100 submissions/month free tier is adequate but inflexible.

### Option B: Resend

A modern email API with first-class Next.js support. Setup is minimal: one npm package (`resend`), one env var (`RESEND_API_KEY`), and a `POST /api/contact` route. The SDK is tiny (~3 lines to send an email). Free tier allows 100 emails/day (3,000/month), well above projected volume.

Requires one DNS record (DKIM) on sipshield.co.uk for verified sending, which improves deliverability. Works identically in local dev and production. Easy to swap out later since the integration surface is a single API route.

### Option C: SendGrid

Mature email delivery platform with a free tier of 100 emails/day. TypeScript SDK exists but is heavier than Resend's. Setup involves more configuration and the DX is less streamlined for a simple "send one email" use case. Viable but more complexity than needed.

### Option D: Nodemailer + SMTP

Uses Ben's existing email provider's SMTP credentials directly. No third-party email service needed. However, SMTP configuration is error-prone (ports, TLS settings, auth methods vary by provider), and deliverability depends entirely on the provider's reputation. Debugging SMTP issues is painful for a solo maintainer.

## Decision

**Resend** for email delivery, with a honeypot field and rate limiting for spam protection.

Resend is chosen because:
- Works identically in dev and prod (no platform coupling)
- Minimal integration surface (one API route, one env var)
- Free tier of 100 emails/day is generous for this use case
- High deliverability with DKIM verification
- Easy to swap out -- the entire integration is one `POST` handler

Spam protection uses a honeypot field (hidden input that bots fill, humans skip) and simple in-memory rate limiting (3 submissions per IP per hour). This avoids adding CAPTCHA friction for visitors. If spam becomes a problem, Cloudflare Turnstile is a free zero-friction upgrade path.

## Consequences

### Positive
- Contact form works the same in local dev and production
- No vendor lock-in to Netlify for a core feature
- Clean extension path to Supabase storage for admin dashboard comms
- Minimal code: one API route, one dependency

### Negative
- One more env var to manage (`RESEND_API_KEY`)
- One DNS record needed on sipshield.co.uk domain
- In-memory rate limiting resets on server restart (acceptable at this volume)

### Neutral
- Spam filtering is simpler than Netlify Forms' Akismet, but adequate for projected volume
- Contact page content managed in Sanity (consistent with other pages), form fields hardcoded

## What if we're wrong?

If Resend's free tier disappears or the service degrades, the migration cost is low. The API route is ~20 lines of code. Swapping to SendGrid, Postmark, or Nodemailer means changing the email-sending function inside a single file. The form, validation, and spam protection stay the same.

If spam becomes unmanageable with honeypot + rate limiting alone, add Cloudflare Turnstile (free, privacy-friendly, invisible mode available). This is an additive change to the existing form, not a rearchitecture.

## Cost implications

- **Resend**: $0/month (free tier: 100 emails/day, 3,000/month)
- **Scale trigger**: At 100+ emails/day sustained, Resend Pro is $20/month. This would indicate significant traction and justify the cost.
- **Operational cost**: Near zero. No infrastructure to maintain. DNS record is set-and-forget.

## Growth path

With a team of 5, you might:
- Store all enquiries in Supabase alongside the email send (add one `insert` call to the existing API route)
- Build an `/admin/enquiries` view for tracking and responding to messages
- Add structured form fields (e.g. order number, product interest) for routing
- Replace in-memory rate limiting with Redis or Supabase-backed rate limiting

None of these changes require rearchitecting the contact form. The API route grows; the form and page stay the same.
