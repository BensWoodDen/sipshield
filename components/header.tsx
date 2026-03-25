"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CartButton } from "./cart-button";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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

        <CartButton />
      </div>
    </header>
  );
}
