---
tags: [comparison]
status: complete
date: 2026-03-25
domain: backend
related_adr: "[[ADR-007-content-management]]"
---

# Headless CMS Comparison for SipShield

> Supporting evidence for [[ADR-007-content-management]]

**Context:** 13 products, 5 static pages, 1 non-technical editor (Ben), zero monthly budget, Next.js 16 App Router, Netlify hosting

---

## Quick Comparison Table

| CMS | Free Tier | Entries/Stories | Assets/Images | API Calls/mo | Users | Image Hosting | Editor UX (for Ben) | Webhook Rebuilds | Next.js App Router |
|-----|-----------|-----------------|---------------|--------------|-------|---------------|---------------------|------------------|--------------------|
| **Sanity** | Yes (forever) | 10,000 docs | 10 GB storage | 200K API + CDN | 20 seats | Included (CDN) | Good (customisable Studio) | Native GROQ webhooks | Excellent |
| **Contentful** | Yes (forever) | Not explicitly capped* | 50 GB bandwidth | 100K | 10 | Included (CDN) | Good (polished UI) | Native webhooks | Excellent |
| **Hygraph** | Yes (forever) | Up to 50,000 | 100 GB traffic | 1M | 5 | Included (CDN) | Good (GraphQL-native) | Native webhooks | Good |
| **Storyblok** | Yes (forever) | Unlimited stories | 500 MB/asset | Not specified | 2 | Included (CDN) | Best (visual editor) | Native webhooks | Good |
| **Keystatic** | Free (open source) | Unlimited (Git) | Git repo / Cloud | N/A (Git-based) | Unlimited | Cloud Images (paid) or Git | Good (clean UI) | Git push = rebuild | Excellent |
| **Payload CMS** | Free (open source) | Unlimited | Unlimited (self-hosted) | Unlimited | Unlimited | Self-hosted | Good (auto-generated admin) | Custom setup | Native (runs in Next.js) |
| **Decap CMS** | Free (open source) | Unlimited (Git) | Git repo | N/A (Git-based) | Unlimited | Git repo only | Dated but functional | Git push = rebuild | Limited |

*Contentful free plan caps at 25 content types; entry limit is not prominently documented but is generous for small projects.

---

## Detailed Analysis

### 1. Sanity

**Free tier limits:**
- 10,000 documents, 200,000 API requests/month, 10 GB storage, 10 GB bandwidth
- 20 user seats, 2 roles, 2 public datasets (no private datasets on free)
- Hard caps: service pauses when limits are reached

**Editor UX:**
Sanity Studio is a React-based editor that is highly customisable. Once configured by a developer, non-technical users can manage content effectively. The 2025 Spring Release added Dashboard, Canvas, Media Library, and improved Portable Text editing. Visual Editing mode provides a live preview experience. However, the initial Studio configuration requires developer effort -- Ben cannot set it up himself, but once built, the editing experience is clean and intuitive.

**Image hosting:** Included. All assets served via a global CDN with automatic image transformations (crop, resize, hotspot).

**Next.js integration:** First-class. Official `next-sanity` package with App Router support, `sanity-image` for optimised images, and GROQ for queries. Excellent TypeScript support via `sanity-typegen`.

**Webhook support:** Native GROQ-powered webhooks. Can filter to only trigger on published documents (not drafts). Dedicated Netlify Deploy plugin exists for Sanity Studio. Well-documented Netlify integration.

**Gotchas:**
- Free datasets are **public only** (content is readable without auth). For a public e-commerce site this is fine, but product data is technically accessible via API.
- Hard caps mean the site could stop working if limits are hit (unlikely at this scale).
- GROQ is a proprietary query language (learning curve, but powerful).

**Verdict for SipShield:** Strong fit. 13 products + 5 pages = ~20 documents, well within 10K limit. Image CDN included. Generous free tier. Good editor UX once configured.

---

### 2. Contentful

**Free tier limits (post April 2025 changes):**
- 25 content types (was unlimited), 100K API calls/month, 50 GB bandwidth
- 10 users, 2 roles, 2 locales
- API rate limits: 55 req/sec (CDA), 7 req/sec (CMA)

**Editor UX:**
Polished, enterprise-grade UI. The most "finished" feeling editor of the API-first options. Structured content editing with clear field types, media library, and content modelling tools. Ben would find this approachable.

**Image hosting:** Included via Contentful's asset CDN with image API (resize, crop, format conversion).

**Next.js integration:** Official `contentful` JS SDK. Works well with App Router. Good TypeScript support via generated types. Mature ecosystem.

**Webhook support:** Native webhook support for content events. Straightforward Netlify build hook integration.

**Gotchas:**
- Free tier limits were **reduced in April 2025** (content models capped at 25, bandwidth at 50 GB). This trend of tightening free tiers is concerning for long-term reliance.
- The platform is enterprise-focused; paid tiers jump to ~$300/month (Team plan). If Ben ever outgrows free, it is expensive.
- More rigid content modelling compared to Sanity.

**Verdict for SipShield:** Works fine at this scale but the free tier is shrinking. The enterprise pricing trajectory means Ben could get stuck if Contentful tightens the free plan further.

---

### 3. Hygraph (formerly GraphCMS)

**Free tier limits:**
- Up to 50,000 content entries, 75 content models
- 1M API calls/month, 100 GB asset traffic
- 5 users, 2 locales

**Editor UX:**
Clean GraphQL-native interface. The editor is structured around content models with a sidebar navigation. Less customisable than Sanity but more approachable out of the box. Media library included.

**Image hosting:** Included with asset CDN. 100 GB monthly traffic on free tier.

**Next.js integration:** GraphQL API works with any GraphQL client. No official Next.js-specific SDK, but integrates cleanly with `graphql-request` or Apollo. App Router compatible.

**Webhook support:** Granular webhooks included on the free plan.

**Gotchas:**
- GraphQL-only API (no REST option). Queries are more verbose than GROQ.
- Smaller community and ecosystem compared to Sanity/Contentful.
- UI is functional but not as polished as Contentful or as customisable as Sanity.

**Verdict for SipShield:** Most generous free tier limits by far (1M API calls, 50K entries). Works well technically but the editor UX is the least differentiated option.

---

### 4. Storyblok

**Free tier limits:**
- Unlimited stories (content entries)
- 2 user seats, 1 space
- 500 MB max per individual asset upload
- Visual editor included on free tier
- GraphQL API **not available** on free tier (REST only)

**Editor UX:**
Best-in-class visual editor. Content editors see a live preview of the page as they edit, with click-to-edit on individual components. This is the most intuitive option for a non-technical user -- Ben would understand it immediately because it feels like editing a live webpage.

**Image hosting:** Included via Storyblok's asset CDN with image optimisation service.

**Next.js integration:** Official `@storyblok/react` SDK. App Router support is available but the visual editor integration requires some setup. The bridge (live preview) works best with client components.

**Webhook support:** Native webhooks for content events. Standard Netlify build hook integration.

**Gotchas:**
- Only 2 user seats on free (fine for Ben as solo editor).
- No GraphQL on free tier (REST API only, which is adequate for this use case).
- The visual editor integration with Next.js App Router requires more configuration than simpler API-based options.
- Paid plans start at ~EUR 99/month (significant jump from free).

**Verdict for SipShield:** Best editor UX for a non-technical user. The visual editor is a genuine differentiator for Ben. Free tier is generous enough. The trade-off is more complex developer setup for the visual editor integration.

---

### 5. Payload CMS

**Free tier:** Fully open source (MIT licence). No usage limits whatsoever. Free forever.

**But:** Requires self-hosting with a database (MongoDB or PostgreSQL). After Figma acquired Payload in June 2025, Payload Cloud signups were paused. You must host it yourself.

**Hosting reality for SipShield:**
- Payload 3.0 **can deploy to Netlify** (official guide exists at developers.netlify.com).
- However, it needs a persistent database (e.g., MongoDB Atlas free tier or Neon PostgreSQL free tier).
- Serverless cold starts can affect admin panel responsiveness.
- Typical self-hosted cost: $0 if using free-tier database providers, but adds operational complexity.

**Editor UX:**
Auto-generated admin panel from config. Clean, functional UI with field-level customisation. Not as visually polished as Contentful or Storyblok's visual editor, but very capable.

**Image hosting:** Self-managed. You would need to configure S3-compatible storage (e.g., Cloudflare R2 free tier) or use Netlify's storage.

**Next.js integration:** Native. Payload 3.0 installs directly into the Next.js `/app` folder. It IS your Next.js app. Best possible integration because it is one application.

**Webhook support:** Since Payload runs inside the same Next.js app, content changes can trigger rebuilds directly. For ISR, you can use `revalidatePath()` / `revalidateTag()` natively.

**Gotchas:**
- **Operational complexity is the killer for this project.** Ben cannot debug database connection issues, cold starts, or deployment failures.
- Jess (developer) would need to maintain the infrastructure ongoing.
- Database hosting adds a dependency (even if free tier).
- Figma acquisition creates uncertainty about the project's future direction.

**Verdict for SipShield:** Most powerful option technically, but the operational burden is disproportionate for 13 products and 5 pages. Only recommended if Jess wants full control and is willing to be the ongoing ops person.

---

### 6. Decap CMS (formerly Netlify CMS)

**Free tier:** Fully open source and free. Git-based (content stored in the repo).

**Editor UX:**
Web-based admin with rich-text editing, real-time preview, and drag-and-drop media uploads. However, the UI looks dated compared to modern alternatives. The project is **no longer actively maintained by Netlify** and is maintained by volunteers only. New features are rare.

**Image hosting:** Images stored in the Git repository. Works fine for small numbers of product images but bloats the repo over time.

**Next.js integration:** Limited. Designed for static site generators (Hugo, Gatsby, Jekyll). No official Next.js App Router support. Would require custom integration work.

**Webhook support:** Git-based, so pushing content triggers Netlify builds automatically. No separate webhook setup needed.

**Gotchas:**
- **Effectively unmaintained.** Netlify dropped support. Community forks like Sveltia CMS are emerging as replacements.
- No Next.js App Router support out of the box.
- Images in Git repos become unwieldy (though Git LFS could help).
- Editor UI feels 2019-era compared to Sanity/Storyblok.

**Verdict for SipShield:** Not recommended. The project's maintenance status is a serious concern, and the lack of Next.js App Router support makes it a poor fit.

---

### 7. Keystatic

**Free tier:** Open source (MIT). Local mode is completely free. GitHub mode is free for content (uses GitHub API). Keystatic Cloud offers team features (free for up to 3 users).

**Editor UX:**
Clean, modern admin UI that separates content into Collections and Singletons. Navigation can be customised. The developer who built it specifically designed it for non-technical editors and reports it has "made life infinitely better for non-technical friends." Content editing feels familiar and lightweight. Not as visual as Storyblok, but simpler and less overwhelming than Sanity Studio.

**Image hosting:**
- **Local/GitHub mode:** Images stored in the Git repo (same caveat as Decap CMS -- repo bloat for many images).
- **Keystatic Cloud (Pro):** Cloud Images service for optimised image hosting and delivery. This is a paid feature.
- For SipShield's ~30-50 product images, Git storage is acceptable.

**Next.js integration:** Excellent. Built specifically for Next.js (and Astro/Remix). Works with App Router. TypeScript-first with auto-generated types from content schemas. Content stored as Markdown/MDX/JSON/YAML files that Next.js reads at build time -- perfect for static generation.

**Webhook support:** Git-based workflow. When Ben saves content in the admin UI, it commits to GitHub, which triggers a Netlify build automatically. No webhook configuration needed -- it is the natural Git flow.

**Gotchas:**
- Relatively new project (smaller community than Sanity/Contentful).
- Image handling is the weakest point -- either Git storage (repo bloat) or paid Cloud Images.
- GitHub mode requires a GitHub account (Ben would need one, or Jess configures Git Gateway).
- No visual/live preview editing like Storyblok.

**Verdict for SipShield:** Excellent fit for the constraints. Zero cost, intuitive editor, native Next.js integration, content as files (no external service dependency), Git-based deployment works naturally with Netlify. The main trade-off is image hosting.

---

## Recommendation

### Best choice: Sanity (with Keystatic as close runner-up)

**Why Sanity wins for SipShield:**

1. **Free tier is comfortably sufficient:** 13 products + 5 pages + images = well under 10K documents, 200K API calls, and 10 GB storage/bandwidth limits.
2. **Image hosting included:** CDN-delivered, with automatic transforms (crop, resize). No need for separate image hosting or Git repo bloat. This is a significant advantage over Git-based options.
3. **Editor UX is good for Ben:** Once Jess configures Sanity Studio with the right schemas (Product family, Product variant, Page), Ben gets a clean editing interface tailored to SipShield's content model. The 2025 Media Library improvement makes image management straightforward.
4. **Next.js integration is best-in-class:** `next-sanity` SDK, GROQ queries, TypeScript generation, ISR support, visual editing mode -- all well-documented.
5. **Netlify webhook support is proven:** GROQ-powered webhooks with Netlify build hooks. Dedicated Studio plugin exists. Well-trodden path.
6. **20 user seats on free:** Overkill for Ben alone, but means zero pressure on user limits.
7. **Large, active community:** Abundant tutorials, Stack Overflow answers, and official documentation specifically for Next.js + Sanity + Netlify stacks.

**Why not the others:**

| CMS | Why not first choice |
|-----|---------------------|
| **Keystatic** | Close second. Excellent DX, zero external dependency. Loses on image hosting (Git bloat or paid Cloud) and slightly less polished editor UX for a non-technical user. Would be the pick if avoiding any external service was the priority. |
| **Storyblok** | Best editor UX (visual editor), but only 2 user seats, no GraphQL on free, and more complex Next.js App Router integration for the visual editor. Also, the paid jump is steep (EUR 99/month). |
| **Hygraph** | Most generous free limits (1M API calls), but less differentiated editor UX and smaller ecosystem. Solid backup choice. |
| **Contentful** | Good but free tier is shrinking (April 2025 changes). Enterprise pricing trajectory is concerning for long-term free-tier reliance. |
| **Payload CMS** | Too much operational overhead for 13 products. Database hosting, cold starts, and maintenance burden are disproportionate. |
| **Decap CMS** | Effectively unmaintained. No Next.js App Router support. Not recommended. |

### Runner-up: Keystatic

If Jess prefers **zero external service dependency** (all content in the Git repo, no Sanity account), Keystatic is the best alternative. The trade-off is solving image hosting separately -- options include:
- Storing images in Git (acceptable for ~30-50 product images)
- Using Cloudflare R2 free tier (10 GB storage, 10M reads/month free) as an image CDN
- Using Keystatic Cloud Images (paid, but nominal)

### Practical next step

Whichever CMS is chosen, define the content schema:
- **Product** (collection): name, slug, description, price, stripePriceId, family, personalisable (bool), personalisationLabel, images[], sizeOptions[]
- **ProductFamily** (collection): name, slug, description, displayOrder
- **Page** (collection or singletons): title, slug, body (rich text), seo metadata
- **SiteSettings** (singleton): siteName, heroImage, heroText, contactEmail, shippingInfo, socialLinks

---

## Sources

- [Contentful Pricing](https://www.contentful.com/pricing/)
- [Contentful Free Plan Changes (Watermark Agency)](https://wmkagency.com/blog/contentful-free-plan-changes-what-they-mean-for-your-website-and-how-to)
- [Contentful Technical Limits](https://www.contentful.com/developers/docs/technical-limits/)
- [Sanity Pricing](https://www.sanity.io/pricing)
- [Sanity Technical Limits](https://www.sanity.io/docs/content-lake/technical-limits)
- [Sanity Plans and Payments](https://www.sanity.io/docs/platform-management/plans-and-payments)
- [Sanity Studio UX Guide (Moze)](https://www.mozestudio.com/journal/sanity-studio-the-missing-ux-guide)
- [Sanity Netlify Deploy Plugin](https://www.sanity.io/plugins/sanity-plugin-dashboard-widget-netlify)
- [Storyblok Pricing](https://www.storyblok.com/pricing)
- [Storyblok Technical Limits](https://www.storyblok.com/pricing/technical-limits)
- [Storyblok Free Plan Entries FAQ](https://www.storyblok.com/faq/how-many-content-entries-can-i-have-on-the-free-plan)
- [Hygraph Pricing](https://hygraph.com/pricing)
- [Hygraph Free CMS Comparison](https://hygraph.com/blog/best-free-headless-cms)
- [Payload CMS](https://payloadcms.com/)
- [Payload CMS Netlify Deployment Guide](https://developers.netlify.com/guides/deploy-payload-cms-3-to-netlify/)
- [Payload CMS 3.0 Announcement](https://payloadcms.com/posts/blog/payload-30-the-first-cms-that-installs-directly-into-any-nextjs-app)
- [Decap CMS](https://decapcms.org/)
- [Decap CMS Alternatives (2026)](https://sitepins.com/blog/decapcms-alternatives)
- [Keystatic](https://keystatic.com/)
- [Keystatic GitHub](https://github.com/Thinkmill/keystatic)
- [Keystatic Cloud Docs](https://keystatic.com/docs/cloud)
- [Keystatic GitHub Mode](https://keystatic.com/docs/github-mode)
- [Headless CMS 2026 Comparison (Digital Applied)](https://www.digitalapplied.com/blog/headless-cms-2026-sanity-contentful-payload-comparison)
- [Best Headless CMS 2026 (Pagepro)](https://pagepro.co/blog/top-5-best-headless-cms-platforms/)
- [Is Sanity Free? (CostBench)](https://costbench.com/software/headless-cms/sanity/free-plan/)
- [Netlify Build Hooks](https://docs.netlify.com/build/configure-builds/build-hooks/)
