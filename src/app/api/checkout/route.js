// ============================================
// CHECKOUT API (/api/checkout) - Stripe Payment
// ============================================
// Creates a Stripe Checkout Session and returns
// the URL for the user to complete payment.

import { NextResponse } from "next/server";

// Initialize Stripe with the secret key from environment variables
// We use a try-catch because Stripe might not be configured yet
let stripe = null;
try {
  const Stripe = (await import("stripe")).default;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.warn("Stripe initialization skipped:", error.message);
}

/**
 * POST handler - creates a Stripe Checkout session
 * Body: { plan: "pro" }
 * Returns: { url: "https://checkout.stripe.com/..." }
 */
export async function POST(request) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { plan } = body;

    // Determine the price ID based on the plan
    // You need to create a product in Stripe Dashboard and get the price ID
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            "Stripe Price ID is not configured. Please set NEXT_PUBLIC_STRIPE_PRICE_ID in your .env.local file.",
        },
        { status: 500 }
      );
    }

    // Get the base URL for redirects
    const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Recurring payment ($19/month)
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      // Optional: Pre-fill customer email if provided
      // customer_email: body.email || undefined,
    });

    // Return the checkout URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout API error:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        {
          error:
            "Invalid Stripe request. Check your price ID and API key.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
