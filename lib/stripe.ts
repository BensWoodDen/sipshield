import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Given a list of Stripe Price IDs, fetch their current unit_amount values.
 * Returns a Map of priceId → amount in £ (e.g. 10.00, not 1000).
 * Skips any IDs that are null/undefined.
 */
export async function fetchStripePrices(
  priceIds: (string | null | undefined)[]
): Promise<Map<string, number>> {
  const validIds = priceIds.filter((id): id is string => Boolean(id));
  if (validIds.length === 0) return new Map();

  // Stripe allows up to 100 IDs per list call — fine for 13 products
  const { data } = await stripe.prices.list({
    limit: 100,
    active: true,
  });

  const priceMap = new Map<string, number>();
  for (const price of data) {
    if (validIds.includes(price.id) && price.unit_amount != null) {
      priceMap.set(price.id, price.unit_amount / 100);
    }
  }

  return priceMap;
}
