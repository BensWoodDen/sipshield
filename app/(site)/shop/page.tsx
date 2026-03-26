import { getShopPage } from "@/lib/sanity/queries";
import { ShopHero } from "@/components/shop-hero";
import { ProductCard } from "@/components/product-card";
import { urlFor } from "@/lib/sanity/image";
import type { SanityProduct } from "@/lib/sanity/types";
import type { Product } from "@/components/product-card";

function toCardProduct(p: SanityProduct): Product {
  const img = p.images?.[0];
  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: p.price,
    stripePriceId: p.stripePriceId,
    description: p.description,
    image: img
      ? {
          url: urlFor(img).width(600).height(450).url(),
          alt: p.name,
          width: 600,
          height: 450,
        }
      : undefined,
    tag: p.tag,
    variants: p.variants?.map((v) => ({
      _key: v._key,
      name: v.name,
      price: v.price,
      stripePriceId: v.stripePriceId,
    })),
  };
}

export default async function ShopPage() {
  const { hero, families } = await getShopPage();

  return (
    <main>
      {hero && <ShopHero hero={hero} />}

      <div className="max-w-[1200px] mx-auto px-6 pb-16">
        {families.map((family) => (
          <section
            key={family._id}
            aria-labelledby={`family-${family._id}`}
            className="mt-12 first:mt-0"
          >
            <h2
              id={`family-${family._id}`}
              className="font-display text-[clamp(1.25rem,2vw+0.5rem,1.75rem)] text-oak-800 mb-1"
            >
              {family.name}
            </h2>
            {family.description && (
              <p className="text-neutral-500 text-[clamp(0.875rem,1vw+0.25rem,1rem)] mb-6 max-w-[60ch]">
                {family.description}
              </p>
            )}
            <div
              className={`grid grid-cols-1 gap-4 ${
                family.products.length <= 2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-3"
              }`}
            >
              {family.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={toCardProduct(product)}
                  layout="compact"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
