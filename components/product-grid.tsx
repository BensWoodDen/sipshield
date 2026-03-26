import { ProductCard } from "./product-card";
import type { SanityProduct } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import type { Product } from "./product-card";

interface ProductGridProps {
  heading?: string;
  products: SanityProduct[];
  stripePrices?: Map<string, number>;
}

function toCardProduct(
  p: SanityProduct,
  layout: "featured" | "compact",
  stripePrices?: Map<string, number>
): Product {
  const img = p.images?.[0];
  const w = layout === "featured" ? 900 : 600;
  const h = layout === "featured" ? 600 : 600;

  const stripePrice = p.stripePriceId
    ? stripePrices?.get(p.stripePriceId)
    : undefined;

  return {
    id: p._id,
    name: p.name,
    slug: p.slug.current,
    variant: p.variant || "",
    price: stripePrice ?? p.price ?? 0,
    stripePriceId: p.stripePriceId ?? "",
    description: p.description,
    image: img
      ? {
          url: urlFor(img).width(w).height(h).url(),
          alt: p.name,
          width: w,
          height: h,
        }
      : undefined,
    tag: p.tag,
    variants: p.variants?.map((v) => ({
      _key: v._key,
      name: v.name,
      price: (v.stripePriceId ? stripePrices?.get(v.stripePriceId) : undefined) ?? v.price ?? 0,
      stripePriceId: v.stripePriceId,
    })),
  };
}

export function ProductGrid({ heading, products, stripePrices }: ProductGridProps) {
  if (!products || products.length === 0) return null;

  const [first, ...rest] = products;

  return (
    <section aria-labelledby="product-grid-heading" className="max-w-[1200px] mx-auto px-6 py-16">
      {heading && (
        <h2
          id="product-grid-heading"
          className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-oak-800 mb-8"
        >
          {heading}
        </h2>
      )}

      {products.length === 1 ? (
        <ProductCard product={toCardProduct(first, "featured", stripePrices)} layout="featured" />
      ) : products.length <= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(first, "featured", stripePrices)} layout="featured" />
          </div>
          {rest.map((p) => (
            <ProductCard key={p._id} product={toCardProduct(p, "compact", stripePrices)} layout="compact" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(products[0], "featured", stripePrices)} layout="featured" />
          </div>
          <ProductCard product={toCardProduct(products[1], "compact", stripePrices)} layout="compact" />
          <ProductCard product={toCardProduct(products[2], "compact", stripePrices)} layout="compact" />
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(products[3], "featured", stripePrices)} layout="featured" />
          </div>
        </div>
      )}
    </section>
  );
}
