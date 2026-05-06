export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getLeadRequests, updateLeadRequest, getInstructorProfiles } from "@/lib/leads";
import { InstructorProfile } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";

async function sendPricedEmail(instructor: InstructorProfile, price: number) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  const hubUrl = `${SITE_URL}/instructor/hub?email=${encodeURIComponent(instructor.email)}&token=${encodeURIComponent(instructor.accessToken)}`;
  const firstName = instructor.name.split(" ")[0] || instructor.name;
  await transporter.sendMail({
    from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
    to: instructor.email,
    subject: "Your lead request has been priced — log in to accept",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 12px;">Hi ${firstName}, your lead is ready!</h1>
          <p style="color:#64748b;line-height:1.6;margin:0 0 16px;">
            We've reviewed your lead request and we're offering it to you for <strong>£${price}</strong>.
          </p>
          <p style="color:#64748b;line-height:1.6;margin:0 0 24px;">Log in to your hub to accept or decline:</p>
          <a href="${hubUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:16px;">
            Accept lead for £${price} →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
            Once accepted, full learner contact details will be shared with you by our team.
          </p>
        </div>
      </div>
    `,
    text: `Hi ${firstName},\n\nYour lead request has been priced at £${price}.\n\nLog in to accept or decline: ${hubUrl}`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { password, requestId, price } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!requestId?.trim()) return NextResponse.json({ error: "requestId required" }, { status: 400 });
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) return NextResponse.json({ error: "price must be a positive number" }, { status: 400 });

    const requests = await getLeadRequests();
    const request = requests.find((r) => r.id === requestId);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    await updateLeadRequest(requestId, {
      status: "priced",
      assignedPrice: numPrice,
      pricedAt: new Date().toISOString(),
    });

    const profiles = await getInstructorProfiles();
    const instructor = profiles.find((p) => p.id === request.instructorId);
    if (instructor) {
      try { await sendPricedEmail(instructor, numPrice); }
      catch (e) { console.error("[assign-lead-request] email failed:", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/assign-lead-request]", err);
    return NextResponse.json({ error: "Failed to assign price" }, { status: 500 });
  }
}
