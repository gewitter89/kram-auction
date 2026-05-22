import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_...";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-04-10" as any, // fallback for typescript compilation
});

export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerId, deliveryProvider, amount } = await req.json();

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "uah",
            product_data: {
              name: `Лот #${listingId}`,
            },
            unit_amount: amount * 100, // in kopecks
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/lot/${listingId}?checkout_success=true&session_id={CHECKOUT_SESSION_ID}&buyerId=${buyerId}&delivery=${deliveryProvider}`,
      cancel_url: `${origin}/lot/${listingId}?checkout_canceled=true`,
      metadata: {
        listingId,
        buyerId,
        deliveryProvider,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
