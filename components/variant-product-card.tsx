"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import type { Product } from "./product-card";

interface VariantProductCardProps {
  product: Product;
}

export function VariantProductCard({ product }: VariantProductCardProps) {
  const variants = product.variants!;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = variants[selectedIdx];

  const productWithSelectedVariant: Product = {
    ...product,
    price: selected.price,
    stripePriceId: selected.stripePriceId || product.stripePriceId,
    variant: selected.name,
  };

  const allSamePrice = variants.every((v) => v.price === variants[0].price);

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
        <h3 className="font-display text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-charcoal mb-0.5">
          {product.name}
        </h3>
        <p className="text-sm text-neutral-500 mb-3">{product.variant}</p>

        {/* Size selector */}
        <div className="flex flex-wrap gap-1.5 mb-4" role="radiogroup" aria-label="Select size">
          {variants.map((v, i) => (
            <button
              key={v._key}
              onClick={() => setSelectedIdx(i)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border cursor-pointer transition-colors duration-100 ${
                i === selectedIdx
                  ? "bg-oak-800 text-white border-oak-800"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-oak-300 hover:text-oak-700"
              }`}
              role="radio"
              aria-checked={i === selectedIdx}
              aria-label={v.name}
            >
              {v.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-semibold text-oak-700">
            {allSamePrice ? (
              <>&pound;{selected.price.toFixed(2)}</>
            ) : (
              <>&pound;{selected.price.toFixed(2)}</>
            )}
          </span>
          <AddToCartButton product={productWithSelectedVariant} />
        </div>
      </div>
    </article>
  );
}
