import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

/**
 * Dev-mode order confirmation: called from the success page.
 * Fetches the Stripe session and writes the order to Supabase.
 * In production, the Stripe webhook at /api/webhook handles this instead.
 */
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const { sessionId } = (await request.json()) as { sessionId: string };

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session ID" },
      { status: 400 }
    );
  }

  // Check if order already exists (prevent duplicates on page refresh)
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not completed" },
      { status: 400 }
    );
  }

  const items = session.line_items?.data.map((li) => ({
    name: li.description,
    quantity: li.quantity,
    price_pence: li.amount_total,
  })) ?? [];

  // Extract personalisation from session metadata
  const personalisation: Record<string, { text?: string; image?: string }> = {};
  if (session.metadata) {
    for (const [key, value] of Object.entries(session.metadata)) {
      const textMatch = key.match(/^personalisation_text_(\d+)$/);
      if (textMatch) {
        const idx = textMatch[1];
        personalisation[idx] = { ...personalisation[idx], text: value };
      }
      const imageMatch = key.match(/^personalisation_image_(\d+)$/);
      if (imageMatch) {
        const idx = imageMatch[1];
        personalisation[idx] = { ...personalisation[idx], image: value };
      }
    }
  }

  const shipping = session.collected_information?.shipping_details;
  const shippingAddress = shipping?.address
    ? {
        name: shipping.name,
        ...shipping.address,
      }
    : null;

  const { error } = await supabase.from("orders").insert({
    stripe_session_id: sessionId,
    customer_email: session.customer_details?.email,
    shipping_address: shippingAddress,
    items,
    personalisation: Object.keys(personalisation).length > 0 ? personalisation : null,
    total_pence: session.amount_total,
    status: "paid",
  });

  if (error) {
    console.error("Failed to save order:", error);
    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
