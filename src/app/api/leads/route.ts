export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getLeads, leadsToCSV } from "@/lib/leads";
import { Lead } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const password = searchParams.get("password");
    const format = searchParams.get("format");

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let leads: Lead[] = [];
    try {
      leads = await getLeads();
    } catch (err) {
      console.error("getLeads failed:", err);
      // Return empty list rather than crashing — admin stays accessible
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

    return NextResponse.json({ leads });
  } catch (err) {
    console.error("leads route error:", err);
    return NextResponse.json({ error: "Internal server error", leads: [] }, { status: 500 });
  }
}
