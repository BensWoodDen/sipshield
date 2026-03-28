/**
 * Creates Stripe products and prices for all SipShield products.
 * Run once in test mode: node scripts/create-stripe-products.mjs
 *
 * Outputs a JSON mapping of Sanity document IDs → Stripe price IDs
 * so they can be patched into Sanity.
 */

import Stripe from "stripe";
import { config } from "dotenv";

config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Products from Sanity — each entry becomes a Stripe Product
// Variants become separate Stripe Prices on the same Product
const products = [
  {
    sanityId: "7d08b33b-5c60-49a8-a226-e32bb507708c",
    name: "Plain Oak",
    description: "Classic solid oak drink cover",
    price: 1000, // £10.00 in pence
  },
  {
    sanityId: "859d9722-0fe7-4e65-b18c-20963e5752b2",
    name: "Lanyard Edition",
    description: "Solid oak drink cover with lanyard attachment",
    price: 1100, // £11.00
  },
  {
    sanityId: "1fc933d1-b477-4be7-b2ff-45e2dc9bc079",
    name: "The Bull Edition",
    description: "Bull-branded solid oak drink cover",
    variants: [
      { key: "v-sm", name: "Small", price: 1000 },
      { key: "v-md", name: "Medium", price: 1250 },
      { key: "v-lg", name: "Large", price: 1500 },
    ],
  },
  {
    sanityId: "2fedc292-39b7-4bef-a03d-6c25ace45106",
    name: "The Bull Edition Set",
    description: "Bull Edition complete set — Small, Medium & Large",
    price: 2500, // £25.00
  },
  {
    sanityId: "2683cfbe-aa42-46f5-a73a-bccb37a5e8fa",
    name: "The Mulberry",
    description: "Limited edition mulberry wood drink cover",
    price: 1200, // £12.00
  },
  {
    sanityId: "01053d07-5588-4f19-b29f-69d63e8565a5",
    name: "The BIG Ash",
    description: "Limited edition oversized ash wood drink cover",
    price: 1200, // £12.00
  },
  {
    sanityId: "8f0a7284-bd4e-4447-bf77-d7f73b0734f1",
    name: "Mug Edition",
    description: "Custom-fit oak drink cover for mugs",
    variants: [
      { key: "v-70", name: "70mm", price: 1500 },
      { key: "v-75", name: "75mm", price: 1500 },
      { key: "v-80", name: "80mm", price: 1500 },
      { key: "v-85", name: "85mm", price: 1500 },
      { key: "v-90", name: "90mm", price: 1500 },
    ],
  },
];

async function main() {
  console.log("Creating Stripe products in TEST mode...\n");

  const results = [];

  for (const product of products) {
    // Create the Stripe Product
    const stripeProduct = await stripe.products.create({
      name: product.name,
      description: product.description,
      metadata: { sanity_id: product.sanityId },
    });

    console.log(`✓ Product: ${product.name} (${stripeProduct.id})`);

    if (product.variants) {
      // Multi-variant: create a Price per variant
      const variantPrices = [];
      for (const variant of product.variants) {
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: variant.price,
          currency: "gbp",
          metadata: { variant_key: variant.key, variant_name: variant.name },
        });
        variantPrices.push({
          key: variant.key,
          name: variant.name,
          stripePriceId: price.id,
        });
        console.log(`  ↳ ${variant.name}: ${price.id} (£${(variant.price / 100).toFixed(2)})`);
      }
      results.push({
        sanityId: product.sanityId,
        name: product.name,
        stripeProductId: stripeProduct.id,
        variants: variantPrices,
      });
    } else {
      // Single price
      const price = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: "gbp",
      });
      console.log(`  ↳ Price: ${price.id} (£${(product.price / 100).toFixed(2)})`);
      results.push({
        sanityId: product.sanityId,
        name: product.name,
        stripeProductId: stripeProduct.id,
        stripePriceId: price.id,
      });
    }
  }

  console.log("\n--- Results (for patching into Sanity) ---\n");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
