import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getLeadById } from "@/lib/leads";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "ADMIN2024";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://comparetheinstructor.co.uk";

export async function POST(req: NextRequest) {
  try {
    const { leadId, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!leadId) {
      return NextResponse.json({ error: "Missing leadId" }, { status: 400 });
    }

    const lead = await getLeadById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { error: "Email not configured — set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env.local" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const firstName = lead.fullName.split(" ")[0] || lead.fullName;
    const isFree = lead.tier === "free" || lead.status === "free_lead";

    if (isFree) {
      await transporter.sendMail({
        from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
        to: lead.email,
        subject: "We've found instructors near you — want your perfect match?",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e3a5f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <p style="color: #fb923c; font-weight: 700; font-size: 18px; margin: 0;">
                CompareThe<span style="color: #fff;">Instructor</span>
              </p>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #1e3a5f; margin: 0 0 12px;">
                Hi ${firstName}, great news!
              </h1>
              <p style="color: #64748b; line-height: 1.6; margin: 0 0 16px;">
                We&rsquo;ve found some driving instructors available in your area.
              </p>
              <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                Want us to find your <strong>perfect</strong> match? For just <strong>£3.99</strong> we&rsquo;ll
                deep search for an instructor that fits your exact confidence level, availability, budget and
                teaching style — not just your postcode.
              </p>
              <a href="${SITE_URL}/#get-matched"
                 style="display: inline-block; background: #f97316; color: #fff; font-weight: 700;
                        padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 16px;">
                Upgrade to Perfect Match — £3.99
              </a>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                You received this because you requested a free match on CompareTheInstructor.co.uk.
                If you didn&rsquo;t, please ignore this email.
              </p>
            </div>
          </div>
        `,
        text: `Hi ${firstName},\n\nGreat news! We've found some driving instructors available in your area.\n\nWant us to find your perfect match? For just £3.99 we'll deep search for an instructor that fits your exact confidence level, availability, budget and teaching style — not just your postcode.\n\nUpgrade here: ${SITE_URL}/#get-matched\n\nThe CompareTheInstructor Team`,
      });
    } else {
      await transporter.sendMail({
        from: "CompareTheInstructor <info@comparetheinstructor.co.uk>",
        to: lead.email,
        subject: "You were so close — finish finding your instructor 🚗",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
            <div style="background: #1e3a5f; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <p style="color: #fb923c; font-weight: 700; font-size: 18px; margin: 0;">
                CompareThe<span style="color: #fff;">Instructor</span>
              </p>
            </div>
            <div style="background: #fff; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #1e3a5f; margin: 0 0 12px;">
                Hi ${firstName}, you were so close!
              </h1>
              <p style="color: #64748b; line-height: 1.6; margin: 0 0 16px;">
                You started finding your perfect driving instructor on
                <strong>CompareTheInstructor.co.uk</strong> but didn&rsquo;t quite finish.
              </p>
              <p style="color: #64748b; line-height: 1.6; margin: 0 0 24px;">
                It only takes <strong>2 minutes</strong> to complete your match and costs just
                <strong>£3.99</strong> — with a full refund if we can&rsquo;t find you the right instructor.
              </p>
              <a href="${SITE_URL}/#get-matched"
                 style="display: inline-block; background: #f97316; color: #fff; font-weight: 700;
                        padding: 14px 28px; border-radius: 10px; text-decoration: none; font-size: 16px;">
                Complete My Match →
              </a>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
              <p style="color: #94a3b8; font-size: 13px; margin: 0;">
                You received this because you started a match request on CompareTheInstructor.co.uk.
                If you didn&rsquo;t, please ignore this email.
              </p>
            </div>
          </div>
        `,
        text: `Hi ${firstName},\n\nYou were so close! You started finding your perfect driving instructor on CompareTheInstructor.co.uk but didn't quite finish.\n\nClick here to complete your match: ${SITE_URL}/#get-matched\n\nIt only takes 2 minutes and costs just £3.99 — with a full refund if we can't match you.\n\nThe CompareTheInstructor Team`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("send-reminder error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
