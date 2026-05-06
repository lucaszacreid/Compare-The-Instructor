export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const POSTCODE_RE = /^[A-Za-z]{1,2}\d/;

interface PlaceResult {
  name_1?: string | null;
  county_unitary?: string | null;
  district_borough?: string | null;
  region?: string | null;
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const results: string[] = [];

    if (POSTCODE_RE.test(q)) {
      const res = await fetch(
        `https://api.postcodes.io/postcodes?q=${encodeURIComponent(q)}&limit=6`,
        { signal: AbortSignal.timeout(5000), cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const list: unknown = data?.result;
        if (Array.isArray(list)) {
          for (const item of list) {
            if (typeof item === "string" && item) results.push(item);
            if (results.length >= 6) break;
          }
        }
      }
    } else {
      const res = await fetch(
        `https://api.postcodes.io/places?q=${encodeURIComponent(q)}&limit=8`,
        { signal: AbortSignal.timeout(5000), cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const places: unknown = data?.result;
        if (Array.isArray(places)) {
          const seen = new Set<string>();
          for (const p of places as PlaceResult[]) {
            if (!p || typeof p.name_1 !== "string" || !p.name_1) continue;
            const area = p.county_unitary ?? p.district_borough ?? "";
            const label =
              area && typeof area === "string" && area !== p.name_1
                ? `${p.name_1}, ${area}`
                : p.name_1;
            if (!seen.has(label)) {
              seen.add(label);
              results.push(label);
            }
            if (results.length >= 6) break;
          }
        }
      }
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
