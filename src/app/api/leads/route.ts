import { NextRequest, NextResponse } from "next/server";
import { getLeads, leadsToCSV } from "@/lib/leads";

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "ADMIN2024";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const password = searchParams.get("password");
  const format = searchParams.get("format");

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await getLeads();

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
}
