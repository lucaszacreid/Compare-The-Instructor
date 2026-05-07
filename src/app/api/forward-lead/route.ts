export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getLeadById } from "@/lib/leads";
import { Lead } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Complete beginner (never sat behind the wheel)",
  some: "Some experience (under 10 hours)",
  moderate: "Moderate experience (10–30 hours)",
  ready: "Nearly test ready (30+ hours)",
};

const CONFIDENCE_LABELS: Record<string, string> = {
  very_nervous: "Very nervous — needs extra patience and support",
  somewhat_nervous: "Somewhat nervous",
  fairly_confident: "Fairly confident",
  very_confident: "Very confident",
};

const START_LABELS: Record<string, string> = {
  asap: "ASAP",
  two_weeks: "Within 2 weeks",
  month: "Within a month",
  exploring: "Just exploring",
};

function buildEmailBody(lead: Lead): { html: string; text: string } {
  const avail = Array.isArray(lead.availability) ? lead.availability.map((a) => a.replace(/_/g, " ")).join(", ") : "—";
  const experience = EXPERIENCE_LABELS[lead.experience] ?? lead.experience;
  const confidence = CONFIDENCE_LABELS[lead.confidence] ?? lead.confidence;
  const startTime = START_LABELS[lead.startTime] ?? lead.startTime;
  const tier = lead.tier === "free" ? "General Match (Free)" : "Perfect Match (£3.99)";

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
      <div style="background: #1e3a5f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <p style="color: #fb923c; font-weight: 700; font-size: 18px; margin: 0;">
          CompareThe<span style="color: #fff;">Instructor</span>
        </p>
      </div>
      <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <h1 style="font-size: 20px; font-weight: 800; color: #1e3a5f; margin: 0 0 6px;">
          New learner referral
        </h1>
        <p style="color: #64748b; margin: 0 0 24px; font-size: 14px;">
          Forwarded from CompareTheInstructor · ${tier}
        </p>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; width: 40%; border-bottom: 1px solid #e2e8f0;">Name</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${lead.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Phone</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${lead.phone}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Email</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${lead.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Location</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${lead.postcode}</td>
          </tr>
          ${lead.lessonType ? `<tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Lesson type</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0; text-transform: capitalize;">${lead.lessonType}</td>
          </tr>` : ""}
          ${lead.experience ? `<tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Experience</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${experience}</td>
          </tr>` : ""}
          ${lead.confidence ? `<tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Confidence</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${confidence}</td>
          </tr>` : ""}
          ${lead.budget ? `<tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Budget</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">£${lead.budget}/hr</td>
          </tr>` : ""}
          ${lead.duration ? `<tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Lesson duration</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${lead.duration} hour${parseFloat(lead.duration) !== 1 ? "s" : ""}</td>
          </tr>` : ""}
          ${avail !== "—" ? `<tr>
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f; border-bottom: 1px solid #e2e8f0;">Availability</td>
            <td style="padding: 10px 14px; color: #334155; border-bottom: 1px solid #e2e8f0;">${avail}</td>
          </tr>` : ""}
          ${lead.startTime ? `<tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; font-weight: 600; color: #1e3a5f;">When to start</td>
            <td style="padding: 10px 14px; color: #334155;">${startTime}</td>
          </tr>` : ""}
        </table>

        <p style="margin-top: 24px; color: #64748b; font-size: 13px;">
          This lead was forwarded to you from the CompareTheInstructor admin dashboard.
          Please contact the learner directly to arrange lessons.
        </p>
      </div>
    </div>
  `;

  const text = [
    "New learner referral from CompareTheInstructor",
    `Tier: ${tier}`,
    "",
    `Name: ${lead.fullName}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Location: ${lead.postcode}`,
    lead.lessonType ? `Lesson type: ${lead.lessonType}` : "",
    lead.experience ? `Experience: ${experience}` : "",
    lead.confidence ? `Confidence: ${confidence}` : "",
    lead.budget ? `Budget: £${lead.budget}/hr` : "",
    lead.duration ? `Duration: ${lead.duration}h` : "",
    avail !== "—" ? `Availability: ${avail}` : "",
    lead.startTime ? `When to start: ${startTime}` : "",
    "",
    "Please contact the learner directly to arrange lessons.",
  ].filter(Boolean).join("\n");

  return { html, text };
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { leadId, toEmail, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!leadId || !toEmail) {
      return NextResponse.json({ error: "Missing leadId or toEmail" }, { status: 400 });
    }
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { error: "Email not configured — set EMAIL_HOST, EMAIL_USER and EMAIL_PASSWORD in .env.local" },
        { status: 500 }
      );
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const { html, text } = buildEmailBody(lead);
    const transporter = createTransporter();

    await transporter.sendMail({
      from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
      to: toEmail,
      subject: `Learner referral: ${lead.fullName} — ${lead.postcode}`,
      html,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("forward-lead error:", msg);
    return NextResponse.json({ error: `Failed to forward lead: ${msg}` }, { status: 500 });
  }
}
