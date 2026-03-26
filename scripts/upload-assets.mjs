/**
 * Upload product images to Sanity as assets only.
 * Outputs asset IDs for patching via MCP.
 * Usage: node scripts/upload-assets.mjs
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
  { slug: "plain-oak", file: "tmp-images/plain-oak.png" },
  { slug: "lanyard-edition", file: "tmp-images/lanyard-edition.jpg" },
  { slug: "bull-edition", file: "tmp-images/bull-edition.jpg" },
  { slug: "bull-edition-set", file: "tmp-images/bull-edition-set.png" },
  { slug: "the-mulberry", file: "tmp-images/the-mulberry.jpg" },
  { slug: "the-big-ash", file: "tmp-images/the-big-ash.jpg" },
  { slug: "mug-edition", file: "tmp-images/mug-edition.jpg" },
];

async function main() {
  const results = [];

  for (const img of IMAGES) {
    console.log(`Uploading ${img.slug}...`);
    const buffer = readFileSync(resolve(process.cwd(), img.file));
    const ext = img.file.endsWith(".png") ? "image/png" : "image/jpeg";
    const asset = await client.assets.upload("image", buffer, {
      contentType: ext,
      filename: img.file.split("/").pop(),
    });
    results.push({ slug: img.slug, assetId: asset._id });
    console.log(`  ${asset._id}`);
  }

  console.log("\n=== ASSET MAP ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
