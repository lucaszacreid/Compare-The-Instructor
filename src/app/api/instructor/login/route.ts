export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getInstructorProfileByEmail } from "@/lib/leads";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();
    if (!email?.trim() || !token?.trim()) {
      return NextResponse.json({ error: "Email and token required" }, { status: 400 });
    }

    const profile = await getInstructorProfileByEmail(email.trim());
    if (!profile) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (profile.accessToken !== token.trim()) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (profile.status === "pending") {
      return NextResponse.json({ error: "Your application is still under review. We'll email you when approved." }, { status: 403 });
    }
    if (profile.status === "denied") {
      return NextResponse.json({ error: "Your application was not approved. Contact info@comparetheinstructor.co.uk for more information." }, { status: 403 });
    }

    // Return profile without accessToken
    const { accessToken: _tok, ...safeProfile } = profile;
    void _tok;
    return NextResponse.json({ ok: true, profile: safeProfile });
  } catch (err) {
    console.error("[instructor/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
