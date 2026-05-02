import { NextRequest, NextResponse } from "next/server";

// Matches strings that start like a UK postcode (e.g. "SW1", "M1", "EH1")
const POSTCODE_RE = /^[A-Za-z]{1,2}\d/;

interface PlaceResult {
  name_1: string;
  local_type?: string;
  county_unitary?: string;
  district_borough?: string;
  region?: string;
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    let results: string[] = [];

    if (POSTCODE_RE.test(q)) {
      // Postcode autocomplete
      const res = await fetch(
        `https://api.postcodes.io/postcodes?q=${encodeURIComponent(q)}&limit=6`,
        { cache: "no-store" }
      );
      const data = await res.json();
      results = (data.result as string[] | null) ?? [];
    } else {
      // Place / city / town name search
      const res = await fetch(
        `https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=8`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const places: PlaceResult[] = data.result ?? [];

      // Deduplicate by display name, prefer cities over smaller types
      const seen = new Set<string>();
      for (const p of places) {
        const area = p.county_unitary ?? p.district_borough ?? p.region ?? "";
        const label = area && area !== p.name_1 ? `${p.name_1}, ${area}` : p.name_1;
        if (!seen.has(label)) {
          seen.add(label);
          results.push(label);
        }
        if (results.length >= 6) break;
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
