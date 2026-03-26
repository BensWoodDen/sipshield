"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface CartButtonProps {
  onClick: () => void;
}

export function CartButton({ onClick }: CartButtonProps) {
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-oak-50 border border-oak-100 rounded-full text-sm font-medium text-oak-700 hover:bg-oak-100 transition-colors duration-100 cursor-pointer"
      aria-label={`Cart with ${totalItems} items`}
    >
      <ShoppingCart className="w-[18px] h-[18px]" />
      <span className="hidden sm:inline">Cart</span>
      <span className="inline-flex items-center justify-center min-w-5 h-5 bg-forest-500 text-white rounded-full text-[0.6875rem] font-semibold">
        {totalItems}
      </span>
    </button>
  );
}
