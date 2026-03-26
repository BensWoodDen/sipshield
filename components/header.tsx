"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";
import { useCartStore } from "@/lib/cart-store";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = useCallback(async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            stripePriceId: item.stripePriceId,
            quantity: item.quantity,
            name: item.name,
            variant: item.variant,
            personalisationText: item.personalisationText,
            personalisationImage: item.personalisationImage,
          })),
        }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      setCheckoutLoading(false);
    }
  }, [items]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[border-color,background-color,backdrop-filter] duration-200 ${
          scrolled
            ? "bg-cream/92 backdrop-blur-md border-b border-oak-100"
            : "bg-cream border-b border-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-2xl text-oak-800 hover:text-oak-700 transition-colors duration-100"
          >
            SipShield
          </Link>

          <nav aria-label="Main navigation" className="hidden md:block">
            <ul className="flex gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 font-medium hover:text-oak-700 transition-colors duration-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <CartButton onClick={() => setCartOpen(true)} />
        </div>
      </header>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={items}
        onUpdateQuantity={updateQuantity}
        onRemove={removeItem}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
      />
    </>
  );
}
