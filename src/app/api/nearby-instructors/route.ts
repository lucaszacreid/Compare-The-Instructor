export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInstructors } from "@/lib/leads";
import { InstructorInterest } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ADMIN2024";

export interface InstructorWithScore extends InstructorInterest {
  score: number;
  matchedTerms: string[];
}

async function resolveLocationTerms(postcode: string): Promise<string[]> {
  const clean = postcode.trim().toUpperCase();
  const terms: string[] = [clean];

  // Extract outcode (e.g. "M1" from "M1 1AE")
  const outcode = clean.split(" ")[0];
  if (outcode && outcode !== clean) terms.push(outcode);

  try {
    // Try full postcode lookup first
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" }
    );
    if (res.ok) {
      const data = await res.json();
      const r = data?.result;
      if (r) {
        const fields = [
          r.admin_district,
          r.admin_county,
          r.region,
          r.parliamentary_constituency,
          r.admin_ward,
          r.primary_care_trust,
        ];
        for (const f of fields) {
          if (f && typeof f === "string" && !terms.includes(f)) terms.push(f);
        }
      }
      return terms;
    }

    // Fall back to place name search (for city name inputs like "Manchester")
    const res2 = await fetch(
      `https://api.postcodes.io/places?q=${encodeURIComponent(clean)}&limit=1`,
      { signal: AbortSignal.timeout(4000), cache: "no-store" }
    );
    if (res2.ok) {
      const data2 = await res2.json();
      const place = data2?.result?.[0];
      if (place) {
        const extras = [place.name_1, place.county_unitary, place.district_borough, place.region];
        for (const e of extras) {
          if (e && typeof e === "string" && !terms.includes(e)) terms.push(e);
        }
      }
    }
  } catch {
    // graceful degradation — use the raw string
  }

  return terms;
}

function scoreInstructor(instructor: InstructorInterest, terms: string[]): string[] {
  const covered = instructor.areasCovered.toLowerCase();
  return terms.filter((t) => t.length > 1 && covered.includes(t.toLowerCase()));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password") ?? "";
  const postcode = searchParams.get("postcode")?.trim() ?? "";

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!postcode) {
    return NextResponse.json({ error: "Missing postcode" }, { status: 400 });
  }

  const [instructors, terms] = await Promise.all([
    getInstructors(),
    resolveLocationTerms(postcode),
  ]);

  const scored: InstructorWithScore[] = instructors
    .map((inst) => {
      const matchedTerms = scoreInstructor(inst, terms);
      return { ...inst, score: matchedTerms.length, matchedTerms };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({ instructors: scored, locationTerms: terms });
}
