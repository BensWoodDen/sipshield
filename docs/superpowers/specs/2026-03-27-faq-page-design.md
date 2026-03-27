# FAQ Page Design

## Overview

CMS-driven FAQ page at `/faq` with expandable accordion items, managed entirely through Sanity Studio.

## Page Sections

### 1. Opener

Same pattern as the about page: kicker, headline, optional body text.

### 2. FAQ Accordion List

Flat list of question/answer pairs using native `<details>`/`<summary>` HTML elements. No JS required, accessible by default. Styled to match the site's oak/forest palette.

No category grouping. No max limit on items in Sanity.

### 3. CTA

Reusable CTA block (heading, body, button label, button link). Same pattern as the about page.

## Sanity Schema

Document type: `faqPage` (singleton)

```
faqPage
  opener (object)
    kicker: string
    headline: string
    body: text
  faqs (array of objects, no max limit)
    question: string
    answer: text
  cta (object)
    heading: string
    body: text
    buttonLabel: string
    buttonLink: string
```

## Default Content

Seeded into Sanity on creation so the page works immediately.

1. **How long does delivery take?** - Most orders are posted within 3-5 working days. Ben makes each cover to order, so busy periods can take a little longer.
2. **Can I personalise any cover?** - Most covers can be personalised with a name, date, or your own image. Look for the "Personalisable" badge on the product page.
3. **How do I look after my drink cover?** - Wipe it down with a damp cloth after use. The food-safe oil finish protects the oak, but avoid soaking it or putting it in the dishwasher.
4. **What sizes are available?** - Covers come in different sizes to fit standard pint glasses, wine glasses, and tumblers. Check each product for exact dimensions.
5. **Can I return or exchange a cover?** - Personalised covers are made to order and can't be returned unless faulty. Standard covers can be returned unused within 14 days.

## Technical Details

- **No `'use client'` needed** - `<details>`/`<summary>` is native HTML, so the page stays a server component
- **Nav link already exists** in `components/header.tsx`
- **Follows existing patterns**: types in `lib/sanity/types.ts`, query in `lib/sanity/queries.ts`, schema registered in `sanity/schema/index.ts`

## Files to Create/Modify

- `sanity/schema/faq-page.ts` (new) - Sanity document schema
- `app/(site)/faq/page.tsx` (new) - Page component
- `lib/sanity/types.ts` (edit) - Add `FaqPageData` interface
- `lib/sanity/queries.ts` (edit) - Add `getFaqPage()` query
- `sanity/schema/index.ts` (edit) - Register schema
