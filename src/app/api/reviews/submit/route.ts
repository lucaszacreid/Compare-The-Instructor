export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveReview } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const { name, rating, text } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!text?.trim()) return NextResponse.json({ error: "Review text is required" }, { status: 400 });
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });

    await saveReview({
      id: randomUUID(),
      submittedAt: new Date().toISOString(),
      status: "pending",
      name: name.trim(),
      rating: r,
      text: text.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reviews/submit]", err);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
