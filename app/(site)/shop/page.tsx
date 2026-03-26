import { getShopPage } from "@/lib/sanity/queries";
import { fetchStripePrices } from "@/lib/stripe";
import { ShopHero } from "@/components/shop-hero";
import { ProductCard } from "@/components/product-card";
import { urlFor } from "@/lib/sanity/image";
import type { SanityProduct } from "@/lib/sanity/types";
import type { Product } from "@/components/product-card";

function toCardProduct(
  p: SanityProduct,
  stripePrices: Map<string, number>,
  familyDescription?: string
): Product {
  const img = p.images?.[0];

  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: (p.stripePriceId ? stripePrices.get(p.stripePriceId) : undefined) ?? 0,
    stripePriceId: p.stripePriceId ?? "",
    description: p.description || familyDescription,
    image: img
      ? {
          url: urlFor(img).width(480).height(480).url(),
          alt: p.name,
          width: 480,
          height: 480,
        }
      : undefined,
    tag: p.tag,
    variants: p.variants?.map((v) => ({
      _key: v._key,
      name: v.name,
      price: (v.stripePriceId ? stripePrices.get(v.stripePriceId) : undefined) ?? 0,
      stripePriceId: v.stripePriceId,
    })),
  };
}

export default async function ShopPage() {
  const { hero, families } = await getShopPage();

  // Collect all Stripe price IDs from all products and variants
  const allPriceIds = families.flatMap((f) =>
    f.products.flatMap((p) => [
      p.stripePriceId,
      ...(p.variants?.map((v) => v.stripePriceId) ?? []),
    ])
  );

  const stripePrices = await fetchStripePrices(allPriceIds);

  return (
    <main>
      {hero && <ShopHero hero={hero} />}

      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
          {families.flatMap((family) =>
            family.products.map((product) => (
              <ProductCard
                key={product._id}
                product={toCardProduct(product, stripePrices, family.description)}
                layout="compact"
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
