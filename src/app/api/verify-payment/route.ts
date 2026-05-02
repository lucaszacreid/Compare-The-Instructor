import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertLead } from "@/lib/leads";
import { Lead } from "@/types";
import crypto from "crypto";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const meta = session.metadata ?? {};

    const lead: Lead = {
      id: meta.leadId || crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      status: "completed",
      fullName: meta.fullName ?? "",
      email: meta.email ?? "",
      phone: meta.phone ?? "",
      postcode: meta.postcode ?? "",
      lessonType: (meta.lessonType as Lead["lessonType"]) || "manual",
      experience: (meta.experience as Lead["experience"]) || "beginner",
      confidence: (meta.confidence as Lead["confidence"]) || "fairly_confident",
      duration: (meta.duration as Lead["duration"]) || "1",
      availability: meta.availability ? meta.availability.split(",") : [],
      budget: Number(meta.budget) || 35,
      startTime: (meta.startTime as Lead["startTime"]) || "asap",
      paymentStatus: "paid",
      stripeSessionId: sessionId,
    };

    await upsertLead(lead);

    return NextResponse.json({ success: true, lead });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
