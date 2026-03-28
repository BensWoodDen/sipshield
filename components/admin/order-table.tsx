"use client";

import Link from "next/link";
import { ChevronRight, ImageIcon } from "lucide-react";

interface Order {
  id: string;
  customer_email: string | null;
  items: Array<{ name: string; quantity: number; price_pence: number }>;
  personalisation: Record<string, { text?: string; image?: string }> | null;
  total_pence: number;
  fulfilment_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200",
  shipped:
    "bg-blue-50 text-blue-700 border-blue-200",
  complete:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(pence: number) {
  return `\u00A3${(pence / 100).toFixed(2)}`;
}

export function OrderTable({ orders }: { orders: Order[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Items</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => {
            const hasPersonalisation =
              order.personalisation &&
              Object.keys(order.personalisation).length > 0;

            return (
              <tr
                key={order.id}
                className="transition-colors hover:bg-neutral-50"
              >
                <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3 text-charcoal">
                  {order.customer_email ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  <div className="flex items-center gap-2">
                    <span>
                      {order.items
                        .map((i) =>
                          i.quantity > 1
                            ? `${i.name} x${i.quantity}`
                            : i.name
                        )
                        .join(", ")}
                    </span>
                    {hasPersonalisation && (
                      <span
                        className="inline-flex items-center gap-0.5 rounded-full bg-oak-100 px-2 py-0.5 text-xs font-medium text-oak-700"
                        title="Has personalisation"
                      >
                        <ImageIcon size={10} />
                        Personalised
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-charcoal">
                  {formatPrice(order.total_pence)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[order.fulfilment_status] ?? statusColors.pending}`}
                  >
                    {order.fulfilment_status ?? "pending"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700"
                  >
                    View
                    <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
