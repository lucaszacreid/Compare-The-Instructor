import { NextRequest, NextResponse } from "next/server";
import { upsertLead } from "@/lib/leads";
import { Lead } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, postcode, lessonType } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();

    const lead: Lead = {
      id,
      submittedAt: new Date().toISOString(),
      tier: "free",
      status: "free_lead",
      fullName: fullName ?? "",
      email,
      phone: phone ?? "",
      postcode: postcode ?? "",
      lessonType: lessonType || "",
      experience: "",
      confidence: "",
      duration: "",
      availability: [],
      budget: 35,
      startTime: "",
      paymentStatus: "pending",
    };

    await upsertLead(lead);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("save-free-lead error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
