export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getLeadRequests, getInstructorProfiles, getLeadPushes } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [requests, profiles, pushes] = await Promise.all([
      getLeadRequests(),
      getInstructorProfiles(),
      getLeadPushes(),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const pushMap = new Map(pushes.map((p) => [p.id, p]));

    const enriched = requests.map((r) => {
      const inst = profileMap.get(r.instructorId);
      const push = pushMap.get(r.pushId);
      return {
        ...r,
        instructorName: inst?.name ?? "Unknown",
        instructorEmail: inst?.email ?? "",
        instructorPhone: inst?.phone ?? "",
        instructorLocation: inst?.location ?? "",
        pushArea: push?.area ?? "",
        pushLessonType: push?.lessonType ?? "",
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
