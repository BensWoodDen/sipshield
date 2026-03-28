import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/admin/order-detail";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!supabase) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Database not configured
      </div>
    );
  }

  const { id } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  // Generate fresh signed URLs for personalisation images
  // Use personalisation_paths if available, otherwise extract filenames from old signed URLs
  const imagePaths: Record<string, string> = {};
  if (order.personalisation_paths) {
    Object.assign(imagePaths, order.personalisation_paths);
  } else if (order.personalisation) {
    for (const [key, val] of Object.entries(
      order.personalisation as Record<string, { text?: string; image?: string }>
    )) {
      if (val.image) {
        const match = val.image.match(/personalisation-uploads\/([^?]+)/);
        if (match) imagePaths[key] = match[1];
      }
    }
  }

  const freshImageUrls: Record<string, string> = {};
  for (const [key, path] of Object.entries(imagePaths)) {
    const { data } = await supabase.storage
      .from("personalisation-uploads")
      .createSignedUrl(path, 60 * 60); // 1 hour
    if (data?.signedUrl) {
      freshImageUrls[key] = data.signedUrl;
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <OrderDetail order={order} freshImageUrls={freshImageUrls} />
    </main>
  );
}
