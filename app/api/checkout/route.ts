import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

interface CheckoutItem {
  stripePriceId: string;
  quantity: number;
  name: string;
  variant?: string;
  personalisationText?: string;
  personalisationImage?: string;
}

export async function POST(request: NextRequest) {
  try {
  const { items } = (await request.json()) as { items: CheckoutItem[] };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Validate all items have a Stripe price ID
  const invalidItems = items.filter((item) => !item.stripePriceId);
  if (invalidItems.length > 0) {
    console.error("Items missing stripePriceId:", invalidItems.map((i) => i.name));
    return NextResponse.json(
      { error: "Some items are missing pricing information" },
      { status: 400 }
    );
  }

  // Build line items for Stripe
  const line_items = items.map((item) => ({
    price: item.stripePriceId,
    quantity: item.quantity,
  }));

  // Build metadata with personalisation info for Ben
  // Stripe metadata: max 50 keys, 500 chars per value
  const metadata: Record<string, string> = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = item.variant ? `${item.name} (${item.variant})` : item.name;
    metadata[`item_${i}`] = `${label} x${item.quantity}`;

    if (item.personalisationText) {
      metadata[`personalisation_text_${i}`] = item.personalisationText;
    }

    if (item.personalisationImage && supabase) {
      // Generate a 7-day signed URL for Ben to download the image
      const filename = item.personalisationImage.replace(
        "personalisation-uploads/",
        ""
      );
      const { data } = await supabase.storage
        .from("personalisation-uploads")
        .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 days

      if (data?.signedUrl) {
        metadata[`personalisation_image_${i}`] = data.signedUrl;
      }
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    metadata,
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/shop`,
    shipping_address_collection: {
      allowed_countries: ["GB"],
    },
  });

  return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("Checkout error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
