export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getInstructorProfiles, updateInstructorProfile } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";

async function sendApprovalEmail(name: string, email: string, token: string) {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return;
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
  const hubUrl = `${SITE_URL}/instructor/hub?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const firstName = name.split(" ")[0] || name;
  await transporter.sendMail({
    from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
    to: email,
    subject: "You're approved — access your instructor hub",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 12px;">Welcome, ${firstName}! You're approved.</h1>
          <p style="color:#64748b;line-height:1.6;margin:0 0 16px;">
            Your application to join the CompareTheInstructor instructor network has been approved.
            You now have access to your personal instructor hub, where you'll see learner leads matched to your area.
          </p>
          <a href="${hubUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:16px;">
            Access my instructor hub →
          </a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
          <p style="color:#64748b;font-size:13px;margin:0 0 8px;"><strong>Bookmark your login link</strong> — you'll need it each time you sign in:</p>
          <p style="color:#64748b;font-size:12px;word-break:break-all;background:#f8fafc;border-radius:8px;padding:10px;margin:0 0 16px;">${hubUrl}</p>
          <p style="color:#64748b;font-size:13px;margin:0 0 4px;">Or log in manually at <a href="${SITE_URL}/instructor/login" style="color:#f97316;">${SITE_URL}/instructor/login</a> with:</p>
          <ul style="color:#64748b;font-size:13px;margin:8px 0 0;padding-left:20px;">
            <li>Email: ${email}</li>
            <li>Access token: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:12px;">${token}</code></li>
          </ul>
        </div>
      </div>
    `,
    text: `Hi ${firstName},\n\nYour application has been approved!\n\nAccess your instructor hub: ${hubUrl}\n\nOr log in at ${SITE_URL}/instructor/login with:\n- Email: ${email}\n- Access token: ${token}\n\nSave this email — you'll need your access token to log in.`,
  });
}

async function sendDenialEmail(name: string, email: string, reason?: string) {
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
    subject: "Your instructor application — update",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 12px;">Hi ${firstName},</h1>
          <p style="color:#64748b;line-height:1.6;margin:0 0 16px;">
            Thank you for applying to join the CompareTheInstructor instructor network.
            Unfortunately we're unable to approve your application at this time.
          </p>
          ${reason ? `<p style="color:#64748b;line-height:1.6;margin:0 0 16px;"><strong>Reason:</strong> ${reason}</p>` : ""}
          <p style="color:#64748b;line-height:1.6;margin:0;">
            If you have any questions please contact us at
            <a href="mailto:info@comparetheinstructor.co.uk" style="color:#f97316;">info@comparetheinstructor.co.uk</a>.
          </p>
        </div>
      </div>
    `,
    text: `Hi ${firstName},\n\nThank you for applying. Unfortunately we're unable to approve your application at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nIf you have questions email info@comparetheinstructor.co.uk.`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { password, instructorId, action, denialReason } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (action !== "approve" && action !== "deny") {
      return NextResponse.json({ error: "action must be approve or deny" }, { status: 400 });
    }

    const profiles = await getInstructorProfiles();
    const profile = profiles.find((p) => p.id === instructorId);
    if (!profile) return NextResponse.json({ error: "Instructor not found" }, { status: 404 });

    if (action === "approve") {
      await updateInstructorProfile(instructorId, { status: "approved", approvedAt: new Date().toISOString() });
      try { await sendApprovalEmail(profile.name, profile.email, profile.accessToken); }
      catch (e) { console.error("[approve-instructor] email failed:", e); }
    } else {
      await updateInstructorProfile(instructorId, {
        status: "denied",
        deniedAt: new Date().toISOString(),
        denialReason: denialReason?.trim() ?? "",
      });
      try { await sendDenialEmail(profile.name, profile.email, denialReason?.trim()); }
      catch (e) { console.error("[approve-instructor] denial email failed:", e); }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/approve-instructor]", err);
    return NextResponse.json({ error: "Failed to update instructor" }, { status: 500 });
  }
}
