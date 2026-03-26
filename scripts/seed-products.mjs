/**
 * Seed script: downloads product images from Ben's Webador site
 * and creates products in Sanity with proper family references.
 *
 * Usage: node scripts/seed-products.mjs
 *
 * Requires: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *           SANITY_API_TOKEN in .env.local
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  token: env.SANITY_API_TOKEN,
  apiVersion: "2026-03-25",
  useCdn: false,
});

// Family IDs
const FAMILIES = {
  classic: "871caf3a-679a-4e2e-b4d1-246b0a3427d9",
  lanyard: "81c53d19-edb6-4b15-96a7-3737b4deed36",
  bull: "e030e8a6-432c-4ea0-bcaa-cb261b9ebe47",
  limited: "0da4fa99-a0c9-46a3-b3f3-a415d72ea90e",
  mug: "e348953c-6843-4b1e-967f-9375660d3749",
};

// Product definitions from Ben's site
const PRODUCTS = [
  {
    name: "Plain Oak",
    slug: "plain-oak",
    variant: "Standard",
    description:
      "The one that started it all. Solid English oak, sized for a standard drinks can.",
    price: 10,
    family: FAMILIES.classic,
    tag: null,
    personalisable: false,
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/chatgpt-image-feb-25-2026-at-06_51_42-pm-high-g563um.png",
  },
  {
    name: "Personalised Oak",
    slug: "personalised-oak",
    variant: "Custom engraving",
    description:
      "Your name, initials, slogan or company logo laser engraved on solid English oak.",
    price: 10,
    family: FAMILIES.classic,
    tag: "Personalised",
    personalisable: true,
    personalisationLabel: "Engraving text",
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/chatgpt-image-feb-25-2026-at-06_51_42-pm-standard-s77cs5.png",
  },
  {
    name: "Lanyard Edition",
    slug: "lanyard-edition",
    variant: "Standard",
    description:
      "Keep your cover close with an attached lanyard. Clip it to your belt or bag.",
    price: 11,
    family: FAMILIES.lanyard,
    tag: "New",
    personalisable: false,
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_5070-high.jpg",
  },
  {
    name: "Personalised Lanyard Edition",
    slug: "personalised-lanyard-edition",
    variant: "Custom engraving",
    description:
      "Lanyard edition with your name, initials or logo laser engraved.",
    price: 11,
    family: FAMILIES.lanyard,
    tag: "New",
    personalisable: true,
    personalisationLabel: "Engraving text",
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_5070-high-2fl3f8.jpg",
  },
  {
    name: "The Bull Edition",
    slug: "bull-edition",
    variant: "Individual",
    description:
      "Bold statement piece with the signature bull mark. Available in Small, Medium and Large.",
    price: 10,
    family: FAMILIES.bull,
    tag: "Popular",
    personalisable: false,
    variants: [
      { name: "Small", price: 10 },
      { name: "Medium", price: 12.5 },
      { name: "Large", price: 15 },
    ],
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4840-high.jpg",
  },
  {
    name: "Personalised Bull Edition",
    slug: "personalised-bull-edition",
    variant: "Custom engraving",
    description:
      "The Bull Edition with your personalisation laser engraved alongside the bull mark.",
    price: 10,
    family: FAMILIES.bull,
    tag: null,
    personalisable: true,
    personalisationLabel: "Engraving text",
    variants: [
      { name: "Small", price: 10 },
      { name: "Medium", price: 12.5 },
      { name: "Large", price: 15 },
    ],
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4840-high-2fuqb2.jpg",
  },
  {
    name: "The Bull Edition Set",
    slug: "bull-edition-set",
    variant: "S + M + L",
    description:
      "All three sizes in one box. The complete Bull Edition collection.",
    price: 25,
    family: FAMILIES.bull,
    tag: "Best Value",
    personalisable: false,
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/image-high-lkw5uy.png",
  },
  {
    name: "Personalised Bull Edition Set",
    slug: "personalised-bull-edition-set",
    variant: "S + M + L, Custom engraving",
    description:
      "All three Bull Edition sizes with matching personalisation on each.",
    price: 25,
    family: FAMILIES.bull,
    tag: null,
    personalisable: true,
    personalisationLabel: "Engraving text",
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/image-high-7a2ewl.png",
  },
  {
    name: "The Mulberry",
    slug: "the-mulberry",
    variant: "Limited Edition",
    description:
      "Crafted from mulberry wood. A unique grain pattern that's different on every piece.",
    price: 12,
    family: FAMILIES.limited,
    tag: "Limited Edition",
    personalisable: false,
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4998-high.jpg",
  },
  {
    name: "Personalised Mulberry",
    slug: "personalised-mulberry",
    variant: "Limited Edition, Custom engraving",
    description:
      "The Mulberry with your personalisation laser engraved.",
    price: 12,
    family: FAMILIES.limited,
    tag: "Limited Edition",
    personalisable: true,
    personalisationLabel: "Engraving text",
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4998-high-8ifywz.jpg",
  },
  {
    name: "The BIG Ash",
    slug: "the-big-ash",
    variant: "Limited Edition",
    description:
      "An oversized cover crafted from ash wood. Bold and distinctive.",
    price: 12,
    family: FAMILIES.limited,
    tag: "Limited Edition",
    personalisable: false,
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4997-high-wo85pj.jpg",
  },
  {
    name: "Personalised BIG Ash",
    slug: "personalised-big-ash",
    variant: "Limited Edition, Custom engraving",
    description:
      "The BIG Ash with your personalisation laser engraved.",
    price: 12,
    family: FAMILIES.limited,
    tag: "Limited Edition",
    personalisable: true,
    personalisationLabel: "Engraving text",
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4995-high.jpg",
  },
  {
    name: "Personalised Mug Edition",
    slug: "personalised-mug-edition",
    variant: "Custom fit",
    description:
      "Sized for your favourite mug. Measure the inner rim diameter and pick your size.",
    price: 15,
    family: FAMILIES.mug,
    tag: "New",
    personalisable: true,
    personalisationLabel: "Engraving text",
    variants: [
      { name: "70mm", price: 15 },
      { name: "75mm", price: 15 },
      { name: "80mm", price: 15 },
      { name: "85mm", price: 15 },
      { name: "90mm", price: 15 },
    ],
    imageUrl:
      "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4856-high.jpg",
  },
];

async function uploadImage(url) {
  console.log(`  Downloading ${url.split("/").pop().split("?")[0]}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const asset = await client.assets.upload("image", buffer, { contentType });
  return asset._id;
}

async function main() {
  console.log("Seeding products into Sanity...\n");

  for (const p of PRODUCTS) {
    console.log(`Creating: ${p.name}`);

    // Upload image
    let imageAssetId;
    try {
      imageAssetId = await uploadImage(p.imageUrl);
    } catch (err) {
      console.warn(`  Warning: image upload failed - ${err.message}`);
    }

    // Build document
    const doc = {
      _type: "product",
      name: p.name,
      slug: { _type: "slug", current: p.slug },
      description: p.description,
      variant: p.variant,
      price: p.price,
      family: { _type: "reference", _ref: p.family },
      personalisable: p.personalisable,
    };

    if (p.tag) doc.tag = p.tag;
    if (p.personalisationLabel) doc.personalisationLabel = p.personalisationLabel;

    if (p.variants) {
      doc.variants = p.variants.map((v, i) => ({
        _key: `variant-${i}`,
        _type: "object",
        name: v.name,
        price: v.price,
      }));
    }

    if (imageAssetId) {
      doc.images = [
        {
          _key: "img-0",
          _type: "image",
          asset: { _type: "reference", _ref: imageAssetId },
        },
      ];
    }

    const created = await client.create(doc);
    console.log(`  Created: ${created._id}`);

    // Publish
    const draftId = `drafts.${created._id}`;
    // Documents created via client.create are published by default (no drafts prefix)
    // Only need to publish if the ID has a drafts prefix
    if (created._id.startsWith("drafts.")) {
      const publishId = created._id.replace("drafts.", "");
      await client
        .transaction()
        .createOrReplace({ ...created, _id: publishId })
        .delete(created._id)
        .commit();
      console.log(`  Published: ${publishId}`);
    } else {
      console.log(`  Already published`);
    }
  }

  console.log("\nDone! All products seeded.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
