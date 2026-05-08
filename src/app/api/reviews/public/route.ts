export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getApprovedReviews } from "@/lib/leads";

export async function GET() {
  try {
    const reviews = await getApprovedReviews();
    return NextResponse.json({ reviews });
  } catch (err) {
    console.error("[reviews/public]", err);
    return NextResponse.json({ reviews: [] });
  }
}
