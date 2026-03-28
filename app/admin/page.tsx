import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  ChevronRight,
  Clock,
  LayoutDashboard,
  PoundSterling,
  ShoppingBag,
  Package,
} from "lucide-react";

export const metadata = {
  title: "Dashboard | SipShield Admin",
};

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
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

export default async function AdminDashboardPage() {
  if (!supabase) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Database not configured
      </div>
    );
  }

  const now = new Date();
  const todayUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
  const firstOfMonthUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const [revenueResult, todayResult, pendingResult, monthResult, recentResult] =
    await Promise.all([
      supabase.from("orders").select("total_pence"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayUTC),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("fulfilment_status", "pending"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", firstOfMonthUTC),
      supabase
        .from("orders")
        .select(
          "id, customer_email, items, total_pence, fulfilment_status, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  const totalRevenue = (revenueResult.data ?? []).reduce(
    (sum: number, row: { total_pence: number }) => sum + row.total_pence,
    0
  );
  const ordersToday = todayResult.count ?? 0;
  const pendingOrders = pendingResult.count ?? 0;
  const ordersThisMonth = monthResult.count ?? 0;
  const recentOrders = (recentResult.data ?? []) as Array<{
    id: string;
    customer_email: string | null;
    items: Array<{ name: string; quantity: number; price_pence: number }>;
    total_pence: number;
    fulfilment_status: string;
    created_at: string;
  }>;

  const kpis = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      icon: PoundSterling,
      iconBg: "bg-forest-50",
      iconColor: "text-forest-600",
      valueColor: "text-charcoal",
    },
    {
      label: "Orders Today",
      value: String(ordersToday),
      icon: ShoppingBag,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      valueColor: "text-charcoal",
    },
    {
      label: "Pending Orders",
      value: String(pendingOrders),
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      valueColor: pendingOrders > 0 ? "text-amber-700" : "text-charcoal",
    },
    {
      label: "This Month",
      value: String(ordersThisMonth),
      icon: CalendarDays,
      iconBg: "bg-oak-50",
      iconColor: "text-oak-700",
      valueColor: "text-charcoal",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <LayoutDashboard size={24} className="text-forest-600" />
        <h1 className="font-display text-2xl text-charcoal">Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-neutral-200 bg-white p-5"
          >
            <div className="mb-3 flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${kpi.iconBg}`}
              >
                <kpi.icon size={18} className={kpi.iconColor} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {kpi.label}
              </span>
            </div>
            <div className={`font-display text-2xl ${kpi.valueColor}`}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="font-display text-base text-charcoal">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-forest-600 hover:text-forest-700"
          >
            View all &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto mb-3 text-neutral-300" />
            <p className="text-neutral-500">No orders yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-neutral-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-charcoal">
                    {order.customer_email ?? "\u2014"}
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
