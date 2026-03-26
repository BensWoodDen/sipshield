/**
 * Upload product images to Sanity and attach them to existing products.
 * Usage: node scripts/upload-images.mjs
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

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

const IMAGES = [
  {
    slug: "plain-oak",
    file: "tmp-images/plain-oak.png",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/chatgpt-image-feb-25-2026-at-06_51_42-pm-high-g563um.png",
  },
  {
    slug: "lanyard-edition",
    file: "tmp-images/lanyard-edition.jpg",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_5070-high.jpg",
  },
  {
    slug: "bull-edition",
    file: "tmp-images/bull-edition.jpg",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4840-high.jpg",
  },
  {
    slug: "bull-edition-set",
    file: "tmp-images/bull-edition-set.png",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/image-high-lkw5uy.png",
  },
  {
    slug: "the-mulberry",
    file: "tmp-images/the-mulberry.jpg",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4998-high.jpg",
  },
  {
    slug: "the-big-ash",
    file: "tmp-images/the-big-ash.jpg",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4997-high-wo85pj.jpg",
  },
  {
    slug: "mug-edition",
    file: "tmp-images/mug-edition.jpg",
    url: "https://primary.jwwb.nl/public/m/g/f/temp-hicvotucwqmmnqkkbuqd/img_4856-high.jpg",
  },
];

async function main() {
  for (const img of IMAGES) {
    // Find the product by slug
    const product = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]{ _id }`,
      { slug: img.slug }
    );

    if (!product) {
      console.log(`  Skipping ${img.slug} — product not found`);
      continue;
    }

    console.log(`${img.slug}: uploading image...`);
    const buffer = readFileSync(resolve(process.cwd(), img.file));
    const ext = img.file.endsWith(".png") ? "image/png" : "image/jpeg";
    const asset = await client.assets.upload("image", buffer, {
      contentType: ext,
      filename: img.file.split("/").pop(),
    });
    console.log(`  Asset: ${asset._id}`);

    // Create a draft with the image, then publish via transaction
    const draftId = `drafts.${product._id}`;

    // Fetch current published doc
    const fullDoc = await client.getDocument(product._id);

    // Create draft with image added
    const draft = {
      ...fullDoc,
      _id: draftId,
      images: [
        {
          _key: "img-0",
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      ],
    };

    await client.createOrReplace(draft);

    // Publish: copy draft to published, delete draft
    await client
      .transaction()
      .createOrReplace({ ...draft, _id: product._id })
      .delete(draftId)
      .commit();

    console.log(`  Attached to ${product._id}`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
