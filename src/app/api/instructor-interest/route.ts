import { NextRequest, NextResponse } from "next/server";
import { saveInstructorInterest } from "@/lib/leads";
import { InstructorInterest } from "@/types";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, email, areasCovered, yearsExperience, hourlyRate } = body;

    if (!name || !phone || !email || !areasCovered) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry: InstructorInterest = {
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
      name,
      phone,
      email,
      areasCovered,
      yearsExperience: yearsExperience ?? "",
      hourlyRate: hourlyRate ?? "",
    };

    await saveInstructorInterest(entry);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Instructor interest error:", err);
    return NextResponse.json(
      { error: "Failed to save interest" },
      { status: 500 }
    );
  }
}
