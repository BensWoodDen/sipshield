"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

export default function SuccessPage() {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart on successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="max-w-[600px] mx-auto px-6 py-24 text-center">
      <CheckCircle className="w-16 h-16 text-forest-500 mx-auto mb-6" />

      <h1 className="font-display text-3xl text-charcoal mb-3">
        Thank you for your order!
      </h1>

      <p className="text-neutral-600 leading-relaxed mb-2">
        Your payment was successful. Ben will get started on your order right away.
      </p>

      <p className="text-sm text-neutral-400 mb-8">
        You&apos;ll receive a confirmation email from Stripe with your order details.
      </p>

      <Link
        href="/shop"
        className="inline-flex px-6 py-3 bg-forest-500 text-white font-medium rounded-md hover:bg-forest-600 transition-colors duration-100"
      >
        Back to Shop
      </Link>
    </main>
  );
}
