export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getInstructorProfileByEmail, getLeadPushes, getLeadRequests, saveLeadRequest } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const { email, token, pushId } = await req.json();
    if (!email?.trim() || !token?.trim() || !pushId?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const profile = await getInstructorProfileByEmail(email.trim());
    if (!profile || profile.accessToken !== token.trim() || profile.status !== "approved") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pushes = await getLeadPushes();
    const push = pushes.find((p) => p.id === pushId);
    if (!push) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (push.targetInstructorId !== null && push.targetInstructorId !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await getLeadRequests();
    const duplicate = existing.find((r) => r.pushId === pushId && r.instructorId === profile.id);
    if (duplicate) return NextResponse.json({ error: "You have already requested this lead" }, { status: 409 });

    const request = {
      id: randomUUID(),
      requestedAt: new Date().toISOString(),
      leadId: push.leadId,
      pushId,
      instructorId: profile.id,
      status: "pending" as const,
    };

    await saveLeadRequest(request);
    return NextResponse.json({ ok: true, requestId: request.id });
  } catch (err) {
    console.error("[instructor/request-lead]", err);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
