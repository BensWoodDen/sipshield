"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { ImageUpload } from "./image-upload";
import type { Product } from "./product-card";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
}

export function ProductModal({ product, open, onClose }: ProductModalProps) {
  const addItem = useCartStore((s) => s.addItem);

  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = hasVariants ? variants[selectedIdx] : null;

  const currentPrice = selected?.price ?? product.price;
  const currentStripePriceId = selected?.stripePriceId ?? product.stripePriceId;
  const currentVariantName = selected?.name ?? product.variant;

  const personalisation = product.personalisation ?? [];
  const hasText = personalisation.some((p) => p.type === "text");
  const hasImage = personalisation.some((p) => p.type === "image");
  const textOption = personalisation.find((p) => p.type === "text");
  const imageOption = personalisation.find((p) => p.type === "image");

  const [personalisationText, setPersonalisationText] = useState("");
  const [supabasePath, setSupabasePath] = useState<string | null>(null);

  const [addedState, setAddedState] = useState<"idle" | "success">("idle");

  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (open) {
      setSelectedIdx(0);
      setPersonalisationText("");
      setSupabasePath(null);
      setAddedState("idle");
    }
  }, [open, product.id]);

  // Focus trap and Escape to close
  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleAddToCart = useCallback(() => {
    const hasPersonalisation = personalisationText.trim() || supabasePath;

    const variantKey = hasVariants
      ? variants[selectedIdx]._key
      : undefined;

    const baseId = variantKey ? `${product.id}-${variantKey}` : product.id;
    const id = hasPersonalisation
      ? `${baseId}-personalised-${Date.now()}`
      : baseId;

    addItem({
      id,
      sanityId: product.id,
      name: product.name,
      variant: currentVariantName || undefined,
      price: currentPrice,
      image: product.image?.url,
      stripePriceId: currentStripePriceId,
      personalisationText: personalisationText.trim() || undefined,
      personalisationImage: supabasePath || undefined,
    });

    setAddedState("success");
    setTimeout(() => {
      onClose();
    }, 800);
  }, [
    product,
    selectedIdx,
    variants,
    hasVariants,
    currentPrice,
    currentStripePriceId,
    currentVariantName,
    personalisationText,
    supabasePath,
    addItem,
    onClose,
  ]);

  if (!open) return null;

  const modal = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 opacity-100"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
          className="relative bg-neutral-50 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-charcoal hover:bg-neutral-100 rounded-full transition-colors duration-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content: side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: Image */}
            <div className="relative aspect-square bg-gradient-to-br from-oak-200 to-oak-100 rounded-t-xl md:rounded-l-xl md:rounded-tr-none overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image.url}
                  alt={product.image.alt}
                  width={product.image.width}
                  height={product.image.height}
                  className="object-cover w-full h-full"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-oak-300 text-6xl">
                  &#9673;
                </div>
              )}
              {product.tag && (
                <span className="absolute top-4 left-4 bg-forest-500 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.tag}
                </span>
              )}
            </div>

            {/* Right: Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <h2 className="font-display text-2xl text-charcoal">
                  {product.name}
                </h2>
                {currentVariantName && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {currentVariantName}
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              <span className="text-2xl font-semibold text-oak-700">
                &pound;{currentPrice.toFixed(2)}
              </span>

              {/* Variant selector */}
              {hasVariants && (
                <div>
                  <p className="text-xs uppercase text-neutral-400 font-medium mb-2 tracking-wide">
                    Size
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    role="radiogroup"
                    aria-label="Select size"
                  >
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
                </div>
              )}

              {/* Personalisation */}
              {personalisation.length > 0 && (
                <div className="border-t border-neutral-200 pt-4">
                  <p className="text-xs uppercase text-neutral-400 font-medium mb-3 tracking-wide">
                    Personalise this piece (optional)
                  </p>

                  <div className="flex flex-col gap-3">
                    {hasText && textOption && (
                      <input
                        type="text"
                        value={personalisationText}
                        onChange={(e) => setPersonalisationText(e.target.value)}
                        placeholder={textOption.label}
                        maxLength={100}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md bg-white placeholder:text-neutral-400 focus:outline-none focus:border-oak-400 focus:ring-1 focus:ring-oak-400 transition-colors"
                      />
                    )}

                    {hasImage && imageOption && (
                      <ImageUpload
                        label={imageOption.label}
                        onUploaded={(path) => setSupabasePath(path)}
                        onRemoved={() => setSupabasePath(null)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full py-3 font-medium rounded-md text-white transition-colors duration-100 cursor-pointer mt-auto ${
                  addedState === "success"
                    ? "bg-forest-600"
                    : "bg-forest-500 hover:bg-forest-600 active:bg-forest-700"
                }`}
              >
                {addedState === "success" ? "Added to Cart!" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
