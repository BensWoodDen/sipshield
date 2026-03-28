import { supabase } from "@/lib/supabase";
import { OrderTable } from "@/components/admin/order-table";
import { Package } from "lucide-react";

export const metadata = {
  title: "Orders | SipShield Admin",
};

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  stripe_session_id: string;
  customer_email: string | null;
  shipping_address: Record<string, string> | null;
  items: Array<{ name: string; quantity: number; price_pence: number }>;
  personalisation: Record<
    string,
    { text?: string; image?: string }
  > | null;
  personalisation_paths: Record<string, string> | null;
  total_pence: number;
  status: string;
  fulfilment_status: string;
  created_at: string;
}

export default async function AdminOrdersPage() {
  if (!supabase) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Database not configured
      </div>
    );
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center text-error">
        Failed to load orders: {error.message}
      </div>
    );
  }

  // Generate fresh signed URLs for personalisation images
  // Falls back to extracting filenames from old signed URLs for pre-existing orders
  const ordersWithFreshUrls = await Promise.all(
    (orders as OrderRow[]).map(async (order) => {
      const imagePaths: Record<string, string> = {};
      if (order.personalisation_paths) {
        Object.assign(imagePaths, order.personalisation_paths);
      } else if (order.personalisation) {
        for (const [key, val] of Object.entries(order.personalisation)) {
          if (val.image) {
            const match = val.image.match(/personalisation-uploads\/([^?]+)/);
            if (match) imagePaths[key] = match[1];
          }
        }
      }

      if (Object.keys(imagePaths).length === 0) return order;

      const freshUrls: Record<string, string> = {};
      for (const [key, path] of Object.entries(imagePaths)) {
        const { data } = await supabase!.storage
          .from("personalisation-uploads")
          .createSignedUrl(path, 60 * 60); // 1 hour
        if (data?.signedUrl) {
          freshUrls[key] = data.signedUrl;
        }
      }

      return { ...order, _freshImageUrls: freshUrls };
    })
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Package size={24} className="text-forest-600" />
        <h1 className="font-display text-2xl text-charcoal">Orders</h1>
        <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
          {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-neutral-500">No orders yet</p>
        </div>
      ) : (
        <OrderTable orders={ordersWithFreshUrls} />
      )}
    </main>
  );
}
