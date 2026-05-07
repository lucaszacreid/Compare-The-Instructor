export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getLeadRequests, getInstructorProfiles, getLeadPushes, getLeads } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [requests, profiles, pushes, leads] = await Promise.all([
      getLeadRequests(),
      getInstructorProfiles(),
      getLeadPushes(),
      getLeads(),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const pushMap    = new Map(pushes.map((p) => [p.id, p]));
    const leadMap    = new Map(leads.map((l) => [l.id, l]));

    const enriched = requests.map((r) => {
      const inst = profileMap.get(r.instructorId);
      const push = pushMap.get(r.pushId);
      const lead = leadMap.get(r.leadId);
      return {
        ...r,
        instructorName:     inst?.name     ?? "Unknown",
        instructorEmail:    inst?.email    ?? "",
        instructorPhone:    inst?.phone    ?? "",
        instructorLocation: inst?.location ?? "",
        pushArea:           push?.area         ?? "",
        pushLessonType:     push?.lessonType   ?? "",
        // Full lead details — only populate for paid requests
        leadFullName: r.status === "paid" ? (lead?.fullName  ?? "") : "",
        leadEmail:    r.status === "paid" ? (lead?.email     ?? "") : "",
        leadPhone:    r.status === "paid" ? (lead?.phone     ?? "") : "",
        leadPostcode: r.status === "paid" ? (lead?.postcode  ?? "") : "",
      };
    });

    return NextResponse.json({
      requests: enriched.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    });
  } catch (err) {
    console.error("[admin/lead-requests]", err);
    return NextResponse.json({ error: "Failed to load requests", requests: [] }, { status: 500 });
  }
}
