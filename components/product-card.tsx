import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./add-to-cart-button";

export interface Product {
  id: string;
  name: string;
  slug: string;
  variant: string;
  price: number;
  stripePriceId: string;
  description?: string;
  image?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  tag?: string;
}

interface ProductCardProps {
  product: Product;
  layout?: "featured" | "compact";
}

export function ProductCard({ product, layout = "compact" }: ProductCardProps) {
  if (layout === "featured") {
    return <FeaturedCard product={product} />;
  }
  return <CompactCard product={product} />;
}

function FeaturedCard({ product }: { product: Product }) {
  return (
    <article className="group relative grid grid-cols-1 sm:grid-cols-2 bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300 h-full">
      <div className="relative aspect-[3/2] sm:aspect-auto overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-oak-300 text-5xl">
            &#9673;
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-forest-500 text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col justify-center">
        <Link href="/shop" className="after:absolute after:inset-0" tabIndex={-1} aria-hidden="true" />
        <h3 className="font-display text-[clamp(1.25rem,2vw+0.5rem,1.5rem)] text-charcoal mb-1">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-neutral-500 leading-relaxed mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
            &pound;{product.price.toFixed(2)}
          </span>
          <span className="relative z-10">
            <AddToCartButton product={product} />
          </span>
        </div>
      </div>
    </article>
  );
}

function CompactCard({ product }: { product: Product }) {
  return (
    <article className="group relative bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-oak-300 text-5xl">
            &#9673;
          </div>
        )}
        {product.tag && (
          <span className="absolute top-3 left-3 bg-forest-500 text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.tag}
          </span>
        )}
      </div>

      <div className="p-4 pb-5">
        <Link href="/shop" className="after:absolute after:inset-0" tabIndex={-1} aria-hidden="true" />
        <h3 className="font-display text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-charcoal mb-0.5">
          {product.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-4">
          {product.variant}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
            &pound;{product.price.toFixed(2)}
          </span>
          <span className="relative z-10">
            <AddToCartButton product={product} />
          </span>
        </div>
      </div>
    </article>
  );
}
