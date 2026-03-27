# Contact Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a contact page at `/contact` where visitors can send enquiries to ben@sipshield.co.uk via Resend, with honeypot spam protection and rate limiting.

**Architecture:** Server component page with Sanity-managed intro copy and hardcoded fallback, wrapping a client-side form component. Form POSTs to an API route that validates input, checks honeypot/rate limit, and sends email via Resend. Two-column layout at desktop (opener left, form right), stacked on mobile.

**Tech Stack:** Next.js 16, Sanity CMS, Resend, Tailwind v4 with OKLCH tokens

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `sanity/schema/contact-page.ts` | Create | Sanity document schema for contact page (opener copy) |
| `sanity/schema/index.ts` | Modify | Register contactPage schema |
| `lib/sanity/types.ts` | Modify | Add ContactPageData interface |
| `lib/sanity/queries.ts` | Modify | Add getContactPage() GROQ query |
| `app/api/contact/route.ts` | Create | POST handler: validate, honeypot, rate limit, send via Resend |
| `components/contact-form.tsx` | Create | Client component: form with fields, honeypot, submission states |
| `app/(site)/contact/page.tsx` | Create | Server component: Sanity data + fallback + metadata + layout |
| `CLAUDE.md` | Modify | Add RESEND_API_KEY to env section |

---

### Task 1: Install Resend dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install resend**

Run: `npm install resend`

- [ ] **Step 2: Verify installation**

Run: `node -e "require('resend')"`
Expected: No error output

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add resend dependency for contact form email"
```

---

### Task 2: Sanity schema, type, and query

**Files:**
- Create: `sanity/schema/contact-page.ts`
- Modify: `sanity/schema/index.ts`
- Modify: `lib/sanity/types.ts`
- Modify: `lib/sanity/queries.ts`

- [ ] **Step 1: Create the Sanity document schema**

Create `sanity/schema/contact-page.ts`:

```typescript
import { defineType, defineField } from "sanity";
import { EnvelopeIcon } from "@sanity/icons";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "opener",
      title: "Page Opener",
      type: "object",
      fields: [
        defineField({
          name: "kicker",
          title: "Kicker",
          type: "string",
          initialValue: "Get in touch",
        }),
        defineField({
          name: "headline",
          title: "Headline",
          type: "string",
          initialValue: "Have a question? Drop us a message",
        }),
        defineField({
          name: "body",
          title: "Intro Text",
          type: "text",
          rows: 4,
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Contact Page" }),
  },
});
```

- [ ] **Step 2: Register the schema**

In `sanity/schema/index.ts`, add the import and registration:

```typescript
import { contactPage } from "./contact-page";
```

Add `contactPage` to the `schemaTypes` array.

- [ ] **Step 3: Add the TypeScript type**

In `lib/sanity/types.ts`, add at the end:

```typescript
export interface ContactPageData {
  opener?: {
    kicker: string;
    headline: string;
    body: string;
  };
}
```

- [ ] **Step 4: Add the GROQ query**

In `lib/sanity/queries.ts`, add the import of `ContactPageData` to the existing import line, then add:

```typescript
const contactPageQuery = `*[_type == "contactPage"][0]{ opener }`;

export async function getContactPage(): Promise<ContactPageData | null> {
  return sanityClient.fetch(contactPageQuery);
}
```

- [ ] **Step 5: Verify Sanity Studio loads**

Run: `npx sanity dev`
Expected: Studio loads without errors, "Contact Page" document type appears in the sidebar.

- [ ] **Step 6: Commit**

```bash
git add sanity/schema/contact-page.ts sanity/schema/index.ts lib/sanity/types.ts lib/sanity/queries.ts
git commit -m "feat: add Sanity schema and query for contact page"
```

---

### Task 3: Contact API route

**Files:**
- Create: `app/api/contact/route.ts`

- [ ] **Step 1: Create the API route**

Create `app/api/contact/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/* ── Rate limiting ── */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Clean up expired entries
  for (const [key, entry] of rateMap) {
    if (entry.resetAt <= now) rateMap.delete(key);
  }

  const entry = rateMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;

  entry.count++;
  return false;
}

/* ── Validation ── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  website?: string;
}

export async function POST(request: NextRequest) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { name, email, message, website } = body;

  // Honeypot: bots fill the hidden "website" field — silently succeed
  if (website) {
    return NextResponse.json({ success: true });
  }

  // Validate required fields
  if (
    !name?.trim() ||
    !email?.trim() ||
    !message?.trim() ||
    !EMAIL_RE.test(email.trim())
  ) {
    return NextResponse.json(
      { error: "Please fill in all fields with a valid email address." },
      { status: 400 }
    );
  }

  // Rate limit
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 }
    );
  }

  // Send email
  if (!resend) {
    console.error("RESEND_API_KEY is not configured");
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try emailing ben@sipshield.co.uk directly.",
      },
      { status: 500 }
    );
  }

  try {
    await resend.emails.send({
      from: "SipShield <noreply@sipshield.co.uk>",
      to: "ben@sipshield.co.uk",
      replyTo: email.trim(),
      subject: `New enquiry from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json(
      {
        error:
          "Something went wrong. Please try emailing ben@sipshield.co.uk directly.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Smoke test the API route**

Start the dev server (`npm run dev`) and test with curl:

```bash
# Should return 400 (missing fields)
curl -s -X POST http://localhost:60100/api/contact \
  -H "Content-Type: application/json" \
  -d '{}' | head -c 200

# Should return 200 with success (honeypot triggered)
curl -s -X POST http://localhost:60100/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hi","website":"gotcha"}' | head -c 200

# Should return 200 and send email (if RESEND_API_KEY is set and DNS verified)
curl -s -X POST http://localhost:60100/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","message":"Hello from curl"}' | head -c 200
```

- [ ] **Step 3: Commit**

```bash
git add app/api/contact/route.ts
git commit -m "feat: add contact form API route with Resend, honeypot, and rate limiting"
```

---

### Task 4: Contact form client component

**Files:**
- Create: `components/contact-form.tsx`

- [ ] **Step 1: Create the form component**

Create `components/contact-form.tsx`:

```tsx
"use client";

import { useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage(
        "Something went wrong. Please try emailing ben@sipshield.co.uk directly."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-forest-50 border border-forest-200 p-8 text-center">
        <p className="font-display text-xl text-forest-700 mb-2">
          Message sent
        </p>
        <p className="text-neutral-600">
          Ben will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from humans, bots fill it */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <label htmlFor="website">Do not fill this in</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={200}
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)]"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-oak-700 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          className="w-full rounded-lg border border-oak-200 bg-white px-4 py-2.5 text-charcoal placeholder:text-neutral-400 focus-visible:outline-none focus-visible:shadow-focus transition-shadow duration-[var(--duration-fast)] resize-y"
          placeholder="What can we help with?"
        />
      </div>

      {status === "error" && errorMessage && (
        <p className="text-sm text-error" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full px-8 py-3.5 bg-forest-500 text-white font-medium rounded-lg shadow-sm hover:bg-forest-600 hover:shadow-md transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/contact-form.tsx
git commit -m "feat: add contact form client component with honeypot and submission states"
```

---

### Task 5: Contact page server component

**Files:**
- Create: `app/(site)/contact/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(site)/contact/page.tsx`:

```tsx
import { getContactPage } from "@/lib/sanity/queries";
import { ContactForm } from "@/components/contact-form";
import type { ContactPageData } from "@/lib/sanity/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — SipShield",
  description:
    "Get in touch with Ben about custom orders, personalisation, or anything else. We typically reply within a day or two.",
};

const fallback: Required<ContactPageData> = {
  opener: {
    kicker: "Get in touch",
    headline: "Have a question? Drop us a message",
    body: "Whether it's about a custom order, personalisation options, or anything else, we'd love to hear from you. Ben typically replies within a day or two.",
  },
};

export default async function ContactPage() {
  const data = await getContactPage();

  const opener = data?.opener ?? fallback.opener;

  return (
    <main>
      <div className="max-w-[1200px] mx-auto px-6 pt-16 pb-16 md:pt-24 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* ── Opener ── */}
          <section aria-label="Introduction">
            <p className="text-sm font-semibold uppercase tracking-widest text-forest-600 mb-4">
              {opener.kicker}
            </p>
            <h1 className="font-display text-[clamp(2.25rem,5vw+0.75rem,4rem)] leading-[1.1] tracking-tight text-oak-800 max-w-[20ch] mb-6">
              {opener.headline}
            </h1>
            {opener.body && (
              <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-neutral-600 leading-relaxed max-w-[52ch]">
                {opener.body}
              </p>
            )}
          </section>

          {/* ── Form ── */}
          <section aria-label="Contact form" className="relative">
            <ContactForm />
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run the dev server and visit `http://localhost:60100/contact`.
Expected: Two-column layout with opener text on the left and form on the right. On mobile, stacks vertically.

- [ ] **Step 3: Test the full flow**

1. Fill in name, email, and message
2. Click "Send message"
3. Expected: Button shows "Sending...", then form is replaced with success message
4. Check Ben's inbox (or Resend dashboard) for the email
5. If DNS is still validating, the send may fail with a Resend error -- the error message should display with the fallback email address

- [ ] **Step 4: Test honeypot**

Open browser dev tools, find the hidden `website` input, fill it with any value, submit the form.
Expected: Form shows success (silent discard), no email sent.

- [ ] **Step 5: Commit**

```bash
git add app/\(site\)/contact/page.tsx
git commit -m "feat: add contact page with Sanity-managed copy and contact form"
```

---

### Task 6: Update CLAUDE.md with new env var

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add RESEND_API_KEY to the environment section**

In `CLAUDE.md`, add to the environment variables list (after `SESSION_SECRET`):

```
- `RESEND_API_KEY` - Resend API key for contact form email delivery (server-side only)
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add RESEND_API_KEY to environment variables"
```
