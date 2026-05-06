export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";
const LEADS_KEY = "cti:leads";

async function rawUpstash(command: unknown[]): Promise<{ status: number; body: unknown; error?: string }> {
  const url   = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return { status: 0, body: null, error: "env vars not set" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
    });
    const body = await res.json();
    return { status: res.status, body };
  } catch (err) {
    return { status: 0, body: null, error: String(err) };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url   = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  // 1. Check env vars are present (redact token to first 8 chars)
  const envCheck = {
    UPSTASH_REDIS_REST_URL:   url   ? `${url.slice(0, 30)}...` : "NOT SET",
    UPSTASH_REDIS_REST_TOKEN: token ? `${token.slice(0, 8)}...` : "NOT SET",
  };

  // 2. Test write: SET cti:debug-ping "ok"
  const writeResult = await rawUpstash(["SET", "cti:debug-ping", "ok"]);

  // 3. Test read-back: GET cti:debug-ping
  const readBack = await rawUpstash(["GET", "cti:debug-ping"]);

  // 4. Read the actual leads key
  const leadsRaw = await rawUpstash(["GET", LEADS_KEY]);

  // 5. Parse leads count from raw result
  let leadsCount = "parse error";
  try {
    const result = (leadsRaw.body as { result?: string | null })?.result;
    if (result === null || result === undefined) {
      leadsCount = "key does not exist in Redis";
    } else {
      const parsed = JSON.parse(result as string);
      leadsCount = Array.isArray(parsed) ? `${parsed.length} leads found` : `unexpected type: ${typeof parsed}`;
    }
  } catch (e) {
    leadsCount = `JSON.parse failed: ${e}`;
  }

  return NextResponse.json({
    envCheck,
    writeResult,
    readBack,
    leadsKey: { raw: leadsRaw, parsed: leadsCount },
  });
}
