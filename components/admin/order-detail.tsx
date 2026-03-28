"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  MapPin,
  Package,
  Type,
} from "lucide-react";

interface Order {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  shipping_address: {
    name?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  items: Array<{ name: string; quantity: number; price_pence: number }>;
  personalisation: Record<
    string,
    { text?: string; image?: string }
  > | null;
  total_pence: number;
  fulfilment_status: string;
  created_at: string;
}

const statuses = ["pending", "shipped", "complete"] as const;

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(pence: number) {
  return `\u00A3${(pence / 100).toFixed(2)}`;
}

export function OrderDetail({
  order,
  freshImageUrls,
}: {
  order: Order;
  freshImageUrls: Record<string, string>;
}) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(
    order.fulfilment_status ?? "pending"
  );
  const [updating, setUpdating] = useState(false);

  async function updateStatus(newStatus: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
      }
    } finally {
      setUpdating(false);
    }
  }

  const address = order.shipping_address;

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div>
        <Link
          href="/admin/orders"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-charcoal"
        >
          <ArrowLeft size={14} />
          All orders
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-charcoal">
              Order Details
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl text-charcoal">
              {formatPrice(order.total_pence)}
            </p>
          </div>
        </div>
      </div>

      {/* Fulfilment status */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          Fulfilment Status
        </h2>
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              disabled={updating}
              onClick={() => updateStatus(s)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-colors disabled:opacity-50 ${
                currentStatus === s
                  ? statusColors[s]
                  : "border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Customer + Shipping */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-neutral-500">
            Customer
          </h2>
          <p className="text-charcoal">
            {order.customer_email ?? "No email provided"}
          </p>
        </div>

        {address && (
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-neutral-500">
              <MapPin size={14} />
              Shipping Address
            </h2>
            <div className="space-y-0.5 text-sm text-charcoal">
              {address.name && <p className="font-medium">{address.name}</p>}
              {address.line1 && <p>{address.line1}</p>}
              {address.line2 && <p>{address.line2}</p>}
              {(address.city || address.postal_code) && (
                <p>
                  {[address.city, address.postal_code]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-neutral-500">
          <Package size={14} />
          Items
        </h2>
        <div className="divide-y divide-neutral-100">
          {order.items.map((item, i) => {
            const itemPersonalisation = order.personalisation?.[String(i)];
            const imageUrl = freshImageUrls[String(i)];

            return (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-charcoal">
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="ml-2 text-neutral-500">
                        x{item.quantity}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-charcoal">
                    {formatPrice(item.price_pence)}
                  </span>
                </div>

                {itemPersonalisation && (
                  <div className="mt-2 space-y-2 rounded-lg bg-oak-50 p-3">
                    {itemPersonalisation.text && (
                      <div className="flex items-start gap-2 text-sm">
                        <Type
                          size={14}
                          className="mt-0.5 shrink-0 text-oak-600"
                        />
                        <span className="text-oak-800">
                          {itemPersonalisation.text}
                        </span>
                      </div>
                    )}
                    {imageUrl && (
                      <div className="flex items-center gap-3">
                        <img
                          src={imageUrl}
                          alt="Personalisation upload"
                          className="h-20 w-20 rounded-md border border-oak-200 object-cover"
                        />
                        <button
                          onClick={async () => {
                            const res = await fetch(imageUrl);
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `personalisation-${order.id}-${i}.${blob.type.split("/")[1] || "png"}`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-oak-100 px-3 py-1.5 text-xs font-medium text-oak-700 transition-colors hover:bg-oak-200"
                        >
                          <Download size={12} />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stripe reference */}
      <div className="text-center text-xs text-neutral-400">
        Stripe Session: {order.stripe_session_id}
      </div>
    </div>
  );
}
