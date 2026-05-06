export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInstructorProfiles } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const instructors = await getInstructorProfiles();
    return NextResponse.json({ instructors });
  } catch (err) {
    console.error("[admin/instructors]", err);
    return NextResponse.json({ error: "Failed to load instructors", instructors: [] }, { status: 500 });
  }
}
