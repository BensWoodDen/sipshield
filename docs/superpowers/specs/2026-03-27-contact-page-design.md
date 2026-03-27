# Contact page design spec

## Overview

A contact page at `/contact` where visitors can send enquiries to Ben (ben@sipshield.co.uk). Sanity-managed intro copy with a hardcoded form. Email delivery via Resend. Spam protection via honeypot field and in-memory rate limiting.

## Page layout

Two-column layout at desktop (opener left, form right), stacked on mobile (opener top, form below). Follows the visual patterns established on the about page.

### Opener section (Sanity-managed)

Server component fetches from Sanity `contactPage` document with hardcoded fallback:

- **Kicker:** "Get in touch"
- **Headline:** "Have a question? Drop us a message"
- **Body:** "Whether it's about a custom order, personalisation options, or anything else, we'd love to hear from you. Ben typically replies within a day or two."

### Contact form (client component)

`components/contact-form.tsx` with `'use client'` directive.

**Visible fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | text input | yes | Non-empty, max 200 chars |
| Email | email input | yes | Non-empty, valid email format |
| Message | textarea (5 rows) | yes | Non-empty, max 2000 chars |

**Hidden fields:**

| Field | Purpose |
|-------|---------|
| `website` | Honeypot. Hidden via CSS (`position: absolute; left: -9999px`), labelled "Do not fill this in" for screen readers. If filled, API silently returns success (no error to tip off bots). |

**Form states:**

- **Idle:** Submit button reads "Send message"
- **Submitting:** Button disabled, reads "Sending..."
- **Success:** Form replaced with success message: "Message sent. Ben will get back to you soon."
- **Error:** Inline error message above submit button, form stays filled so user can retry

**Styling:** Follows existing Tailwind patterns. Inputs with `rounded-lg` borders, `focus-visible:shadow-focus` ring. Submit button matches the forest-500 CTA style used elsewhere.

## API route

`app/api/contact/route.ts` -- POST only.

### Request body

```json
{
  "name": "string",
  "email": "string",
  "message": "string",
  "website": "string"
}
```

### Processing steps

1. Parse JSON body
2. If `website` field is non-empty, return `200 OK` with `{ success: true }` (honeypot triggered, silent success)
3. Validate required fields (name, email, message) and email format
4. Check rate limit: max 3 submissions per IP per hour
5. Send email via Resend
6. Return `200 OK` with `{ success: true }` or appropriate error

### Rate limiting

In-memory `Map<string, { count: number; resetAt: number }>` keyed by IP address. On each request:

- If no entry or `resetAt` has passed, create new entry with count 1 and resetAt = now + 1 hour
- If count >= 3 and resetAt hasn't passed, return 429
- Otherwise increment count

Cleanup: stale entries removed on each request (iterate and delete expired). Acceptable that this resets on server restart -- at this volume that's fine.

IP resolution: `request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()` with fallback to `'unknown'`.

### Email via Resend

```
From: SipShield <noreply@sipshield.co.uk>  (or Resend default if DNS not verified yet)
To: ben@sipshield.co.uk
Subject: New enquiry from {name}
Reply-To: {visitor's email}

Body (plain text):
Name: {name}
Email: {email}

{message}
```

Reply-To is set to the visitor's email so Ben can reply directly from his inbox.

### Error responses

| Scenario | Status | Body |
|----------|--------|------|
| Honeypot filled | 200 | `{ success: true }` |
| Missing/invalid fields | 400 | `{ error: "Please fill in all fields with a valid email address." }` |
| Rate limited | 429 | `{ error: "Too many messages. Please try again later." }` |
| Resend failure | 500 | `{ error: "Something went wrong. Please try emailing ben@sipshield.co.uk directly." }` |
| Missing RESEND_API_KEY | 500 | `{ error: "Something went wrong. Please try emailing ben@sipshield.co.uk directly." }` |

## Sanity schema

`sanity/schema/contact-page.ts` -- singleton document, same pattern as aboutPage/faqPage.

Fields:
- `opener` object: kicker (string), headline (string), body (text, 4 rows)

No CTA section. The form is the action.

Icon: `EnvelopeIcon` from `@sanity/icons`.

## Type and query additions

**`lib/sanity/types.ts`** -- add:

```typescript
export interface ContactPageData {
  opener?: {
    kicker: string;
    headline: string;
    body: string;
  };
}
```

**`lib/sanity/queries.ts`** -- add:

```typescript
const contactPageQuery = `*[_type == "contactPage"][0]{ opener }`;

export async function getContactPage(): Promise<ContactPageData | null> {
  return sanityClient.fetch(contactPageQuery);
}
```

**`sanity/schema/index.ts`** -- register `contactPage`.

## New dependency

`resend` npm package.

## New environment variable

`RESEND_API_KEY` -- already added to `.env.local`.

Add to CLAUDE.md environment section.

## Files to create/modify

| File | Action |
|------|--------|
| `sanity/schema/contact-page.ts` | Create -- Sanity document schema |
| `sanity/schema/index.ts` | Modify -- register contactPage |
| `lib/sanity/types.ts` | Modify -- add ContactPageData |
| `lib/sanity/queries.ts` | Modify -- add getContactPage query |
| `app/(site)/contact/page.tsx` | Create -- server component with Sanity data + fallback |
| `components/contact-form.tsx` | Create -- client form component |
| `app/api/contact/route.ts` | Create -- POST handler |
| `package.json` | Modify -- add resend dependency |
| `CLAUDE.md` | Modify -- add RESEND_API_KEY to env section |

## Extension path

When admin comms feature is built:
- Add Supabase `enquiries` table
- Add a `supabase.from('enquiries').insert(...)` call alongside the Resend send in the API route
- Build `/admin/enquiries` view
- The form and page don't change
