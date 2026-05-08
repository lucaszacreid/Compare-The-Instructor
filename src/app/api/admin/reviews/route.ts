export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getReviews } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const reviews = await getReviews();
    return NextResponse.json({
      reviews: reviews.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    });
  } catch (err) {
    console.error("[admin/reviews]", err);
    return NextResponse.json({ error: "Failed to load reviews", reviews: [] }, { status: 500 });
  }
}
