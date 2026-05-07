export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { getInstructorProfileByEmail, saveInstructorProfile } from "@/lib/leads";

async function sendConfirmationEmail(name: string, email: string) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  const firstName = name.split(" ")[0] || name;
  await transporter.sendMail({
    from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
    to: email,
    subject: "Application received — we’ll be in touch within 48 hours",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 12px;">Hi ${firstName}, we&rsquo;ve received your application!</h1>
          <p style="color:#64748b;line-height:1.6;margin:0 0 16px;">
            Thank you for applying to join the CompareTheInstructor instructor hub.
            We&rsquo;ll review your details and get back to you within <strong>48 hours</strong>.
          </p>
          <p style="color:#64748b;line-height:1.6;margin:0 0 24px;">
            Once approved, you&rsquo;ll receive a separate email with your personal access code and a direct link to log in to your instructor hub &mdash; where you&rsquo;ll be able to browse and request learner leads in your area.
          </p>
          <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:0 0 24px;">
            <p style="color:#64748b;font-size:13px;margin:0;"><strong>What happens next:</strong></p>
            <ol style="color:#64748b;font-size:13px;margin:8px 0 0;padding-left:20px;line-height:1.8;">
              <li>We review your application (within 48 hours)</li>
              <li>You receive an approval email with your login link &amp; access code</li>
              <li>Log in to your hub and start browsing leads in your area</li>
            </ol>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:0;">
            Questions? Email us at <a href="mailto:info@comparetheinstructor.co.uk" style="color:#f97316;">info@comparetheinstructor.co.uk</a>
          </p>
        </div>
      </div>
    `,
    text: `Hi ${firstName},\n\nWe've received your application to join the CompareTheInstructor instructor hub.\n\nWe'll review your details and get back to you within 48 hours.\n\nOnce approved, you'll receive a separate email with your personal access code and login link.\n\nQuestions? Email info@comparetheinstructor.co.uk`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, location, areasCovered, yearsExperience, adiNumber } = body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !location?.trim() || !areasCovered?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getInstructorProfileByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: "An application with this email already exists" }, { status: 409 });
    }

    const profile = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: "pending" as const,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim(),
      areasCovered: areasCovered.trim(),
      yearsExperience: yearsExperience?.trim() ?? "",
      adiNumber: adiNumber?.trim() ?? "",
      accessToken: randomUUID(),
    };

    await saveInstructorProfile(profile);

    // Send confirmation email — failure must not block the 200 response
    try {
      await sendConfirmationEmail(profile.name, profile.email);
    } catch (emailErr) {
      console.error("[instructor/register] confirmation email failed:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[instructor/register]", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
