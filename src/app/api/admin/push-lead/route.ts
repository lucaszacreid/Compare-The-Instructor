export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import nodemailer from "nodemailer";
import { getLeadById, getInstructorProfiles, saveLeadPush } from "@/lib/leads";
import { InstructorProfile, LeadPush } from "@/types";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Cti-Admin-2025";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Complete beginner", some: "Some experience (<10 hrs)",
  moderate: "Moderate (10–30 hrs)", ready: "Nearly test-ready (30+ hrs)",
};
const START_LABELS: Record<string, string> = {
  asap: "ASAP", two_weeks: "Within 2 weeks", month: "Within a month", exploring: "Just exploring",
};

async function notifyInstructor(instructor: InstructorProfile, push: LeadPush) {
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
    subject: "New learner lead available in your instructor hub",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b;">
        <div style="background:#1e3a5f;padding:24px 32px;border-radius:12px 12px 0 0;">
          <p style="color:#fb923c;font-weight:700;font-size:18px;margin:0;">CompareThe<span style="color:#fff;">Instructor</span></p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <h1 style="font-size:22px;font-weight:800;color:#1e3a5f;margin:0 0 12px;">Hi ${firstName}, a new lead is waiting!</h1>
          <p style="color:#64748b;line-height:1.6;margin:0 0 20px;">A new learner lead has been added to your instructor hub:</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;font-size:13px;color:#64748b;font-weight:600;">Area</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;">${push.area}</td></tr>
            <tr><td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">Lesson type</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;text-transform:capitalize;">${push.lessonType}</td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;font-size:13px;color:#64748b;font-weight:600;">Experience</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;">${EXPERIENCE_LABELS[push.experience] ?? push.experience}</td></tr>
            <tr><td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">Budget</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;">${push.budget}</td></tr>
            <tr><td style="padding:8px 12px;background:#f8fafc;border-radius:6px;font-size:13px;color:#64748b;font-weight:600;">Start</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;">${START_LABELS[push.startTime] ?? push.startTime}</td></tr>
            ${push.note ? `<tr><td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:600;">Note</td><td style="padding:8px 12px;font-size:13px;color:#1e293b;">${push.note}</td></tr>` : ""}
          </table>
          <a href="${hubUrl}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:16px;">
            Request this lead →
          </a>
          <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">Log in at your hub to see full details and request the lead before another instructor does.</p>
        </div>
      </div>
    `,
    text: `Hi ${firstName},\n\nA new learner lead is available in your hub.\n\nArea: ${push.area}\nType: ${push.lessonType}\nExperience: ${EXPERIENCE_LABELS[push.experience] ?? push.experience}\nBudget: ${push.budget}\nStart: ${START_LABELS[push.startTime] ?? push.startTime}\n\nLog in to request it: ${hubUrl}`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { password, leadId, targetInstructorId, note } = await req.json();
    if (password !== ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!leadId?.trim()) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const lead = await getLeadById(leadId);
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const outward = (lead.postcode?.trim().split(" ")[0] ?? lead.postcode?.trim().slice(0, 4) ?? "Unknown").toUpperCase();

    const CONFIDENCE_LABELS: Record<string, string> = {
      very_nervous: "Very nervous", somewhat_nervous: "Somewhat nervous",
      fairly_confident: "Fairly confident", very_confident: "Very confident",
    };
    const AVAILABILITY_LABELS: Record<string, string> = {
      weekday_morning: "Weekday mornings", weekday_afternoon: "Weekday afternoons",
      weekday_evening: "Weekday evenings", weekend_morning: "Weekend mornings",
      weekend_afternoon: "Weekend afternoons",
    };

    const availStr = Array.isArray(lead.availability) && lead.availability.length > 0
      ? lead.availability.map((a: string) => AVAILABILITY_LABELS[a] ?? a.replace(/_/g, " ")).join(", ")
      : undefined;

    const push: LeadPush = {
      id: randomUUID(),
      pushedAt: new Date().toISOString(),
      leadId,
      targetInstructorId: targetInstructorId ?? null,
      area: `${outward} area`,
      lessonType: lead.lessonType || "Not specified",
      experience: lead.experience || "Not specified",
      confidence: lead.confidence ? (CONFIDENCE_LABELS[lead.confidence] ?? lead.confidence) : undefined,
      availability: availStr,
      duration: lead.duration ? `${lead.duration}h per lesson` : undefined,
      startTime: lead.startTime || "Not specified",
      budget: lead.budget ? `£${lead.budget}/hr` : "Not specified",
      note: note?.trim() || undefined,
    };

    await saveLeadPush(push);

    // Notify targeted instructor(s)
    const profiles = await getInstructorProfiles();
    const approved = profiles.filter((p) => p.status === "approved");
    const targets = targetInstructorId
      ? approved.filter((p) => p.id === targetInstructorId)
      : approved;

    for (const inst of targets) {
      try { await notifyInstructor(inst, push); }
      catch (e) { console.error("[push-lead] email failed for", inst.email, e); }
    }

    return NextResponse.json({ ok: true, pushId: push.id });
  } catch (err) {
    console.error("[admin/push-lead]", err);
    return NextResponse.json({ error: "Failed to push lead" }, { status: 500 });
  }
}
