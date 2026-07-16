import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

export async function GET(request) {
  try {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      return NextResponse.redirect(
        new URL("/pricing?error=payment_not_configured", request.url)
      );
    }

    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: (process.env.POLAR_SERVER || "sandbox") === "production" ? "production" : "sandbox",
    });

    const { searchParams } = new URL(request.url);
    const products = searchParams.getAll("products");
    const discountCode = searchParams.get("discount");

    if (products.length === 0) {
      return NextResponse.redirect(
        new URL("/pricing?error=missing_product", request.url)
      );
    }

    const origin = new URL(request.url).origin;
    const successUrl = `${origin}/success?checkoutId={CHECKOUT_ID}`;
    const returnUrl = `${origin}/pricing`;

    const checkoutParams = {
      products,
      successUrl,
      returnUrl,
    };

    if (discountCode) {
      const { items } = await polar.discounts.list({ code: discountCode });
      const discount = items?.[0];
      if (discount) {
        checkoutParams.discount_id = discount.id;
      }
    }

    const result = await polar.checkouts.create(checkoutParams);

    return NextResponse.redirect(result.url);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.redirect(
      new URL("/pricing?error=checkout_failed", request.url)
    );
  }
}
