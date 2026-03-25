import { ProductCard } from "./product-card";
import type { SanityProduct } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import type { Product } from "./product-card";

interface ProductGridProps {
  heading?: string;
  products: SanityProduct[];
}

function toCardProduct(p: SanityProduct, layout: "featured" | "compact"): Product {
  const img = p.images?.[0];
  // Featured cards use 3:2 landscape, compact cards use 1:1 square
  const w = layout === "featured" ? 900 : 600;
  const h = layout === "featured" ? 600 : 600;
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
          url: urlFor(img).width(w).height(h).url(),
          alt: p.name,
          width: w,
          height: h,
        }
      : undefined,
    tag: p.tag,
  };
}

export function ProductGrid({ heading, products }: ProductGridProps) {
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
        <ProductCard product={toCardProduct(first, "featured")} layout="featured" />
      ) : products.length <= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <ProductCard product={toCardProduct(first, "featured")} layout="featured" />
          </div>
          {rest.map((p) => (
            <ProductCard key={p._id} product={toCardProduct(p, "compact")} layout="compact" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Row 1: featured left (spans 2 on lg), 2 compact right */}
          <div className="md:col-span-2 lg:col-span-2">
            <ProductCard product={toCardProduct(products[0], "featured")} layout="featured" />
          </div>
          <div className="flex flex-col gap-4">
            <ProductCard product={toCardProduct(products[1], "compact")} layout="compact" />
            <ProductCard product={toCardProduct(products[2], "compact")} layout="compact" />
          </div>
          {/* Row 2: single compact card */}
          <ProductCard product={toCardProduct(products[3], "compact")} layout="compact" />
        </div>
      )}
    </section>
  );
}
