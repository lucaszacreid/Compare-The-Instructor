export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertLead } from "@/lib/leads";
import { Lead } from "@/types";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-04-22.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session is not a completed payment" }, { status: 400 });
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

    return NextResponse.json({ ok: true, lead });
  } catch (err) {
    console.error("recover-lead error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
