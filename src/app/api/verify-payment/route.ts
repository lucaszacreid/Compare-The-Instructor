export const dynamic = "force-dynamic";
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

  // ── 1. Verify with Stripe ────────────────────────────────────────────────
  let session: Stripe.Checkout.Session;
  try {
    const stripe = getStripe();
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("Stripe session retrieval failed:", err);
    return NextResponse.json({ error: "Failed to reach payment provider" }, { status: 500 });
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
  }

  // ── 2. Build lead record ─────────────────────────────────────────────────
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

  // ── 3. Save lead — but NEVER let a storage failure show the user an error ─
  // Payment is confirmed by Stripe above; the user must see success regardless.
  // If saving fails we log the session ID so it can be recovered from the
  // admin panel using /api/recover-lead.
  try {
    await upsertLead(lead);
  } catch (saveErr) {
    console.error(
      "[LEAD SAVE FAILED] Payment confirmed but lead not stored. " +
      "Use the admin 'Recover from Stripe' tool with session ID:",
      sessionId,
      "Error:", saveErr
    );
  }

  return NextResponse.json({ success: true, lead });
}
