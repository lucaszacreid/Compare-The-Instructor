export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getInstructorProfileByEmail, saveInstructorProfile } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, location, areasCovered, yearsExperience, adiNumber } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !location?.trim() || !areasCovered?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getInstructorProfileByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: "An application with this email already exists" }, { status: 409 });
    }

    const profile = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim(),
      areasCovered: areasCovered.trim(),
      yearsExperience: yearsExperience?.trim() ?? "",
      adiNumber: adiNumber?.trim() ?? "",
      accessToken: randomUUID(),
    };

    await saveInstructorProfile(profile);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[instructor/register]", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
