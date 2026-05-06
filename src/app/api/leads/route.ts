export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getLeads, leadsToCSV } from "@/lib/leads";
import { Lead } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

async function storageStatus(): Promise<{
  upstashConfigured: boolean;
  upstashUrl: string;
  pingResult: string;
}> {
  const rawUrl   = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const rawToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!rawUrl || !rawToken) {
    return { upstashConfigured: false, upstashUrl: "NOT SET", pingResult: "env vars missing" };
  }

  const url = rawUrl.replace(/\/+$/, "");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${rawToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(["SET", "cti:ping", "ok"]),
      cache: "no-store",
    });
    const body = await res.json() as { result?: string; error?: string };
    const ping = res.ok ? (body.result ?? "no result field") : `HTTP ${res.status}: ${body.error ?? JSON.stringify(body)}`;
    return { upstashConfigured: true, upstashUrl: `${url.slice(0, 35)}...`, pingResult: ping };
  } catch (err) {
    return { upstashConfigured: true, upstashUrl: `${url.slice(0, 35)}...`, pingResult: `fetch error: ${err}` };
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get("password");
    const format   = searchParams.get("format");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let leads: Lead[] = [];
    try {
      leads = await getLeads();
    } catch (err) {
      console.error("getLeads failed:", err);
    }

    if (format === "csv") {
      const csv = leadsToCSV(leads);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const storage = await storageStatus();
    return NextResponse.json({ leads, storage });
  } catch (err) {
    console.error("leads route error:", err);
    return NextResponse.json({ error: "Internal server error", leads: [], storage: null }, { status: 500 });
  }
}
