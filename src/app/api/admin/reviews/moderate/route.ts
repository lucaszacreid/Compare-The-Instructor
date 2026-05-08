export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { updateReview } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function POST(req: NextRequest) {
  try {
    const { password, reviewId, action } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }
    if (!reviewId?.trim()) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

    await updateReview(reviewId, {
      status: action === "approve" ? "approved" : "rejected",
      ...(action === "approve" ? { approvedAt: new Date().toISOString() } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/reviews/moderate]", err);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
