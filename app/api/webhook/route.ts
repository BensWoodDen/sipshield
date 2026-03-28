import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";

/**
 * Stripe webhook handler for production.
 * Listens for checkout.session.completed events and writes orders to Supabase.
 *
 * Setup: Create a webhook in Stripe Dashboard pointing to
 * https://yourdomain.com/api/webhook with event checkout.session.completed.
 * Set STRIPE_WEBHOOK_SECRET in env vars.
 */
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.payment_status !== "paid") {
    return NextResponse.json({ received: true });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Fetch full session with line items
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items"],
  });

  const items = fullSession.line_items?.data.map((li) => ({
    name: li.description,
    quantity: li.quantity,
    price_pence: li.amount_total,
  })) ?? [];

  const personalisation: Record<string, { text?: string; image?: string }> = {};
  const personalisationPaths: Record<string, string> = {};
  if (fullSession.metadata) {
    for (const [key, value] of Object.entries(fullSession.metadata)) {
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
      const pathMatch = key.match(/^personalisation_path_(\d+)$/);
      if (pathMatch) {
        personalisationPaths[pathMatch[1]] = value;
      }
    }
  }

  const shipping = fullSession.collected_information?.shipping_details;
  const shippingAddress = shipping?.address
    ? {
        name: shipping.name,
        ...shipping.address,
      }
    : null;

  const { error } = await supabase.from("orders").insert({
    stripe_session_id: session.id,
    customer_email: fullSession.customer_details?.email,
    shipping_address: shippingAddress,
    items,
    personalisation: Object.keys(personalisation).length > 0 ? personalisation : null,
    personalisation_paths: Object.keys(personalisationPaths).length > 0 ? personalisationPaths : null,
    total_pence: fullSession.amount_total,
    status: "paid",
  });

  if (error) {
    console.error("Webhook: failed to save order:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
