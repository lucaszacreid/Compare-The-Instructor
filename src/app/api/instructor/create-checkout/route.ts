export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getInstructorProfileByEmail, getLeadRequests } from "@/lib/leads";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: NextRequest) {
  try {
    const { email, token, requestId } = await req.json();
    if (!email?.trim() || !token?.trim() || !requestId?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profile = await getInstructorProfileByEmail(email.trim());
    if (!profile || profile.accessToken !== token.trim() || profile.status !== "approved") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requests = await getLeadRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.instructorId !== profile.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (request.status !== "priced") return NextResponse.json({ error: "This request has not been priced yet" }, { status: 409 });
    if (!request.assignedPrice || request.assignedPrice <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Lead Purchase — CompareTheInstructor",
              description: `Unlock full learner contact details for lead in ${profile.areasCovered}`,
            },
            unit_amount: Math.round(request.assignedPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: profile.email,
      success_url: `${baseUrl}/instructor/hub?payment_session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/instructor/hub`,
      metadata: {
        type: "instructor_lead",
        requestId: request.id,
        instructorId: profile.id,
        instructorEmail: profile.email,
        instructorName: profile.name,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[instructor/create-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
