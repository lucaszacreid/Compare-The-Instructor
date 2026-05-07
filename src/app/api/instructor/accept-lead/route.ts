export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInstructorProfileByEmail, getLeadRequests, updateLeadRequest } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const { email, token, requestId, action } = await req.json();
    if (!email?.trim() || !token?.trim() || !requestId?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (action !== "accept" && action !== "decline") {
      return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
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
    if (action !== "decline") return NextResponse.json({ error: "Only decline is supported here; pay via checkout to accept" }, { status: 400 });

    await updateLeadRequest(requestId, {
      status: "declined",
      respondedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[instructor/accept-lead]", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
