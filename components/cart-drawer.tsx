"use client";

import { useEffect, useRef } from "react";
import { X, Minus, Plus, ImageIcon } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  variant?: string;
  price: number;
  quantity: number;
  image?: string;
  personalisationText?: string;
  personalisationImage?: string;
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartDrawer({
  open,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap and Escape to close
  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-charcoal/40 transition-opacity duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-neutral-50 shadow-lg flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="font-display text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] text-charcoal">
            Your Cart ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-charcoal hover:bg-neutral-100 rounded-sm transition-colors duration-100 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <p className="text-[clamp(1.125rem,1.5vw+0.5rem,1.375rem)] font-medium text-neutral-500 mb-2">
                Your cart is empty
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Browse our collection and find the perfect drink cover.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-forest-500 text-white font-medium rounded-md hover:bg-forest-600 transition-colors duration-100 cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[56px_1fr_auto] gap-3 px-6 py-4 border-b border-neutral-100 items-center"
              >
                <div className="w-14 h-14 rounded-md bg-oak-100 flex-shrink-0 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium text-charcoal">{item.name}</p>
                  <p className="text-sm text-neutral-500">{item.variant}</p>
                  {(item.personalisationText || item.personalisationImage) && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.personalisationText && (
                        <span className="inline-flex items-center text-[0.6875rem] text-oak-700 bg-oak-50 border border-oak-100 rounded px-1.5 py-0.5">
                          &ldquo;{item.personalisationText}&rdquo;
                        </span>
                      )}
                      {item.personalisationImage && (
                        <span className="inline-flex items-center gap-1 text-[0.6875rem] text-oak-700 bg-oak-50 border border-oak-100 rounded px-1.5 py-0.5">
                          <ImageIcon className="w-3 h-3" />
                          {item.personalisationImage.split("/").pop()}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="inline-flex items-center border border-neutral-200 rounded-md overflow-hidden mt-2">
                    <button
                      onClick={() =>
                        item.quantity <= 1
                          ? onRemove(item.id)
                          : onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors duration-100 cursor-pointer"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium text-charcoal border-x border-neutral-200">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors duration-100 cursor-pointer"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <span className="font-semibold text-oak-700">
                  &pound;{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 pt-4 pb-6 border-t border-neutral-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-200">
              <span className="font-medium text-neutral-600">Subtotal</span>
              <span className="font-display text-[clamp(1.5rem,2.5vw+0.75rem,2.25rem)] text-charcoal">
                &pound;{subtotal.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-neutral-400 mb-4">
              Shipping calculated at checkout
            </p>
            <button className="flex items-center justify-center w-full py-3.5 bg-forest-500 text-white font-medium rounded-md shadow-sm hover:bg-forest-600 hover:shadow-md transition-[background-color,box-shadow] duration-100 cursor-pointer">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
