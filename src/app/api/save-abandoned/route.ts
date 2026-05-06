export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { upsertLead } from "@/lib/leads";
import { Lead } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, abandonedAtStep, ...fields } = body;

    if (!id || !fields.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead: Lead = {
      id,
      submittedAt: new Date().toISOString(),
      status: "abandoned",
      abandonedAtStep: abandonedAtStep ?? 1,
      fullName: fields.fullName ?? "",
      email: fields.email ?? "",
      phone: fields.phone ?? "",
      postcode: fields.postcode ?? "",
      lessonType: fields.lessonType ?? "",
      experience: fields.experience ?? "",
      confidence: fields.confidence ?? "",
      duration: fields.duration ?? "",
      availability: Array.isArray(fields.availability) ? fields.availability : [],
      budget: Number(fields.budget) || 35,
      startTime: fields.startTime ?? "",
      paymentStatus: "pending",
    };

    await upsertLead(lead);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("save-abandoned error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
