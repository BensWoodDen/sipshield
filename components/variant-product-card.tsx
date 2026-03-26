"use client";

import { useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductModal } from "./product-modal";
import type { Product } from "./product-card";

interface VariantProductCardProps {
  product: Product;
}

export function VariantProductCard({ product }: VariantProductCardProps) {
  const variants = product.variants!;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = variants[selectedIdx];
  const [modalOpen, setModalOpen] = useState(false);

  const productWithSelectedVariant: Product = {
    ...product,
    price: selected.price,
    stripePriceId: selected.stripePriceId || product.stripePriceId,
    variant: selected.name,
  };

  const hasPersonalisation = product.personalisation && product.personalisation.length > 0;

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="group relative flex flex-col bg-neutral-50 rounded-lg overflow-hidden border border-neutral-200 transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-neutral-300 cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-oak-200 to-oak-100">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-300 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-display text-[clamp(0.9375rem,1vw+0.25rem,1.125rem)] text-charcoal mb-0.5">
            {product.name}
          </h3>
          {product.variant && (
            <p className="text-sm text-neutral-500 mb-0.5">{product.variant}</p>
          )}
          {product.description && (
            <p className="text-xs text-neutral-400 line-clamp-2 mb-1">
              {product.description}
            </p>
          )}
          {hasPersonalisation && (
            <p className="text-xs text-oak-600 font-medium mb-1">
              Personalisable
            </p>
          )}

          {/* Size selector */}
          <div
            className="flex flex-wrap gap-1.5 mb-2"
            role="radiogroup"
            aria-label="Select size"
            onClick={(e) => e.stopPropagation()}
          >
            {variants.map((v, i) => (
              <button
                key={v._key}
                onClick={() => setSelectedIdx(i)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border cursor-pointer transition-colors duration-100 ${
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

          <div className="flex items-center justify-between mt-auto">
            <span className="text-base font-semibold text-oak-700">
              &pound;{selected.price.toFixed(2)}
            </span>
            <span onClick={(e) => e.stopPropagation()}>
              <AddToCartButton product={productWithSelectedVariant} />
            </span>
          </div>
        </div>
      </article>

      <ProductModal
        product={product}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
