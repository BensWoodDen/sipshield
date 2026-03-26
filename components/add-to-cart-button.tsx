"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "./product-card";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const addItem = useCartStore((s) => s.addItem);

  function handleClick() {
    if (state !== "idle") return;

    setState("loading");

    const variantKey = product.variants?.find(
      (v) => v.name === product.variant
    )?._key;

    addItem({
      id: variantKey ? `${product.id}-${variantKey}` : product.id,
      sanityId: product.id,
      name: product.name,
      variant: product.variant || undefined,
      price: product.price,
      image: product.image?.url,
      stripePriceId: product.stripePriceId,
    });

    setState("success");
    setTimeout(() => setState("idle"), 1200);
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === "loading"}
      className="inline-flex items-center gap-2 px-4 py-2 bg-forest-500 text-white text-sm font-medium rounded-md cursor-pointer transition-[background-color,box-shadow] duration-100 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-forest-600 hover:shadow-sm focus-visible:outline-none focus-visible:shadow-focus active:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Add ${product.name} to cart`}
    >
      {state === "loading" && (
        <Loader2 className="w-4 h-4 animate-spin" />
      )}
      {state === "success" && <Check className="w-4 h-4" />}
      {state === "idle" && <Plus className="w-4 h-4" />}
      {state === "success" ? "Added" : "Add"}
    </button>
  );
}
