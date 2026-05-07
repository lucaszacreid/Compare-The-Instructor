export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { getInstructorProfileByEmail, getLeadRequests, updateLeadRequest, getLeadById } from "@/lib/leads";

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

async function notifyAdmin(instructorName: string, instructorEmail: string, instructorPhone: string, leadArea: string, price: number) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  await transporter.sendMail({
    from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
    to: process.env.EMAIL_USER ?? "info@comparetheinstructor.co.uk",
    subject: `Instructor paid £${price} for a lead — action required`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 16px;">
            An instructor has paid for a lead
          </h1>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
            <tr><td style="padding:8px;font-size:13px;color:#64748b;font-weight:600;background:#f8fafc;border-radius:4px;">Instructor</td><td style="padding:8px;font-size:13px;color:#1e293b;">${instructorName}</td></tr>
            <tr><td style="padding:8px;font-size:13px;color:#64748b;font-weight:600;">Email</td><td style="padding:8px;font-size:13px;"><a href="mailto:${instructorEmail}" style="color:#f97316;">${instructorEmail}</a></td></tr>
            <tr><td style="padding:8px;font-size:13px;color:#64748b;font-weight:600;background:#f8fafc;border-radius:4px;">Phone</td><td style="padding:8px;font-size:13px;color:#1e293b;">${instructorPhone}</td></tr>
            <tr><td style="padding:8px;font-size:13px;color:#64748b;font-weight:600;">Lead area</td><td style="padding:8px;font-size:13px;color:#1e293b;">${leadArea}</td></tr>
            <tr><td style="padding:8px;font-size:13px;color:#64748b;font-weight:600;background:#f8fafc;border-radius:4px;">Amount paid</td><td style="padding:8px;font-size:13px;font-weight:700;color:#16a34a;">£${price}</td></tr>
          </table>
          <p style="color:#64748b;font-size:14px;margin:0 0 20px;">
            <strong>Action required:</strong> Forward the full lead details to ${instructorEmail} via the admin dashboard.
          </p>
          <a href="${SITE_URL}/admin" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:12px 24px;border-radius:10px;text-decoration:none;font-size:15px;">
            Go to Admin Dashboard →
          </a>
        </div>
      </div>
    `,
    text: `An instructor has paid for a lead.\n\nInstructor: ${instructorName}\nEmail: ${instructorEmail}\nPhone: ${instructorPhone}\nArea: ${leadArea}\nAmount: £${price}\n\nPlease forward the full lead details to ${instructorEmail}.\n\nAdmin: ${SITE_URL}/admin`,
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    const email = searchParams.get("email")?.trim() ?? "";
    const token = searchParams.get("token")?.trim() ?? "";

    if (!sessionId || !email || !token) {
      return NextResponse.json({ error: "Missing required params" }, { status: 400 });
    }

    const profile = await getInstructorProfileByEmail(email);
    if (!profile || profile.accessToken !== token || profile.status !== "approved") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify with Stripe
    let session: Stripe.Checkout.Session;
    try {
      session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: "Failed to reach payment provider" }, { status: 500 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
    }

    const meta = session.metadata ?? {};
    if (meta.type !== "instructor_lead") {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }
    if (meta.instructorId !== profile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = meta.requestId;
    const requests = await getLeadRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    // Idempotent — already marked paid
    if (request.status === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    await updateLeadRequest(requestId, {
      status: "paid",
      paidAt: new Date().toISOString(),
      stripeSessionId: sessionId,
    });

    // Get lead area for the admin email
    let leadArea = "Unknown area";
    try {
      const lead = await getLeadById(request.leadId);
      if (lead?.postcode) {
        leadArea = lead.postcode.trim().split(" ")[0].toUpperCase() + " area";
      }
    } catch {}

    try {
      await notifyAdmin(
        profile.name,
        profile.email,
        profile.phone,
        leadArea,
        request.assignedPrice ?? 0,
      );
    } catch (e) {
      console.error("[verify-lead-payment] admin email failed:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[instructor/verify-lead-payment]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
