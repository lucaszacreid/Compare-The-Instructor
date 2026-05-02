import { promises as fs } from "fs";
import { Lead, InstructorInterest } from "@/types";

const LEADS_FILE = "/tmp/cti-leads.json";
const INSTRUCTORS_FILE = "/tmp/cti-instructors.json";

async function readLeads(): Promise<Lead[]> {
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data) as Lead[];
  } catch {
    return [];
  }
}

async function writeLeads(leads: Lead[]): Promise<void> {
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

export async function saveLeadToFile(lead: Lead): Promise<void> {
  const leads = await readLeads();
  leads.push(lead);
  await writeLeads(leads);
}

export async function upsertLead(lead: Lead): Promise<void> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    leads[idx] = lead;
  } else {
    leads.push(lead);
  }
  await writeLeads(leads);
}

export async function updateLeadById(id: string, updates: Partial<Lead>): Promise<void> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx >= 0) {
    leads[idx] = { ...leads[idx], ...updates };
    await writeLeads(leads);
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await readLeads();
  return leads.find((l) => l.id === id) ?? null;
}

export async function getLeads(): Promise<Lead[]> {
  return readLeads();
}

export async function getInstructors(): Promise<InstructorInterest[]> {
  try {
    const data = await fs.readFile(INSTRUCTORS_FILE, "utf-8");
    return JSON.parse(data) as InstructorInterest[];
  } catch {
    return [];
  }
}

export async function saveInstructorInterest(entry: InstructorInterest): Promise<void> {
  let entries: InstructorInterest[] = [];
  try {
    const data = await fs.readFile(INSTRUCTORS_FILE, "utf-8");
    entries = JSON.parse(data);
  } catch {
    // File doesn't exist yet
  }
  entries.push(entry);
  await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export function leadsToCSV(leads: Lead[]): string {
  const headers = [
    "Submitted At",
    "Status",
    "Dropped Off Step",
    "Name",
    "Email",
    "Phone",
    "Postcode",
    "Lesson Type",
    "Experience",
    "Confidence",
    "Duration (hrs)",
    "Availability",
    "Budget (£/hr)",
    "Start Time",
    "Payment Status",
    "Stripe Session ID",
  ];

  const rows = leads.map((l) => [
    l.submittedAt,
    l.status ?? "completed",
    l.abandonedAtStep ?? "",
    l.fullName,
    l.email,
    l.phone,
    l.postcode,
    l.lessonType,
    l.experience,
    l.confidence,
    l.duration,
    Array.isArray(l.availability) ? l.availability.join("; ") : l.availability,
    l.budget,
    l.startTime,
    l.paymentStatus,
    l.stripeSessionId ?? "",
  ]);

  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
