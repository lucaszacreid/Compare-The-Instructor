export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInstructorProfileByEmail, getLeadPushes, getLeadRequests } from "@/lib/leads";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.trim() ?? "";
    const token = searchParams.get("token")?.trim() ?? "";

    if (!email || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await getInstructorProfileByEmail(email);
    if (!profile || profile.accessToken !== token || profile.status !== "approved") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allPushes = await getLeadPushes();
    const feed = allPushes.filter(
      (p) => p.targetInstructorId === null || p.targetInstructorId === profile.id
    );

    const allRequests = await getLeadRequests();
    const myRequests = allRequests.filter((r) => r.instructorId === profile.id);
    const requestedPushIds = new Set(myRequests.map((r) => r.pushId));

    return NextResponse.json({
      feed: feed.sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)),
      requests: myRequests.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
      requestedPushIds: Array.from(requestedPushIds),
    });
  } catch (err) {
    console.error("[instructor/feed]", err);
    return NextResponse.json({ error: "Failed to load feed" }, { status: 500 });
  }
}
