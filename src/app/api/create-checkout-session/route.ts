import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FormData } from "@/types";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body: FormData = await req.json();

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (req.headers.get("origin") ?? "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Instructor Matching Service",
              description:
                "Personalised driving instructor match with 24-hour response guarantee",
            },
            unit_amount: 399,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: body.email,
      success_url: `${baseUrl}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#get-matched`,
      metadata: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        postcode: body.postcode,
        lessonType: body.lessonType,
        experience: body.experience,
        confidence: body.confidence,
        duration: body.duration,
        availability: Array.isArray(body.availability)
          ? body.availability.join(",")
          : "",
        budget: String(body.budget),
        startTime: body.startTime,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
