/**
 * Storage layer — Upstash Redis REST API (no npm package, plain fetch).
 *
 * Production: set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 * Local dev:  leave those vars unset and /tmp JSON files are used instead.
 *
 * Using the REST API directly (not @upstash/redis) means there is no
 * module-level import that can fail and crash every route on cold start.
 */

import { promises as fs } from "fs";
import { Lead, InstructorInterest, InstructorProfile, LeadPush, LeadRequest } from "@/types";

const LEADS_KEY       = "cti:leads";
const INSTRUCTORS_KEY = "cti:instructors";
const LEADS_FILE      = "/tmp/cti-leads.json";
const INSTRUCTORS_FILE= "/tmp/cti-instructors.json";

// ── Upstash REST helpers ──────────────────────────────────────────────────────

function upstashConfig(): { url: string; token: string } | null {
  const url   = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return { url, token };
}

async function upstashGet(key: string): Promise<unknown> {
  const cfg = upstashConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["GET", key]),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[Upstash GET] HTTP", res.status, await res.text());
      return null;
    }
    const json = await res.json() as { result: string | null };
    if (json.result === null) return null;
    try { return JSON.parse(json.result); } catch { return json.result; }
  } catch (err) {
    console.error("[Upstash GET] fetch error:", err);
    return null;
  }
}

async function upstashSet(key: string, value: unknown): Promise<void> {
  const cfg = upstashConfig();
  if (!cfg) return;
  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", key, JSON.stringify(value)]),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[Upstash SET] HTTP", res.status, await res.text());
    }
  } catch (err) {
    console.error("[Upstash SET] fetch error:", err);
  }
}

// ── Low-level read / write ────────────────────────────────────────────────────

async function readLeads(): Promise<Lead[]> {
  if (upstashConfig()) {
    const raw = await upstashGet(LEADS_KEY);
    if (Array.isArray(raw)) return raw as Lead[];
    return [];
  }
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data) as Lead[];
  } catch { return []; }
}

async function writeLeads(leads: Lead[]): Promise<void> {
  if (upstashConfig()) {
    await upstashSet(LEADS_KEY, leads);
    return;
  }
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

async function readInstructors(): Promise<InstructorInterest[]> {
  if (upstashConfig()) {
    const raw = await upstashGet(INSTRUCTORS_KEY);
    if (Array.isArray(raw)) return raw as InstructorInterest[];
    return [];
  }
  try {
    const data = await fs.readFile(INSTRUCTORS_FILE, "utf-8");
    return JSON.parse(data) as InstructorInterest[];
  } catch { return []; }
}

async function writeInstructors(entries: InstructorInterest[]): Promise<void> {
  if (upstashConfig()) {
    await upstashSet(INSTRUCTORS_KEY, entries);
    return;
  }
  await fs.writeFile(INSTRUCTORS_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function saveLeadToFile(lead: Lead): Promise<void> {
  const leads = await readLeads();
  leads.push(lead);
  await writeLeads(leads);
}

export async function upsertLead(lead: Lead): Promise<void> {
  const leads = await readLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) { leads[idx] = lead; } else { leads.push(lead); }
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

export async function getLeads(): Promise<Lead[]> { return readLeads(); }

export async function getInstructors(): Promise<InstructorInterest[]> {
  return readInstructors();
}

export async function saveInstructorInterest(entry: InstructorInterest): Promise<void> {
  const entries = await readInstructors();
  entries.push(entry);
  await writeInstructors(entries);
}

// ── Instructor Hub storage ────────────────────────────────────────────────────

const INSTRUCTOR_PROFILES_KEY  = "cti:instructor-profiles";
const LEAD_PUSHES_KEY          = "cti:lead-pushes";
const LEAD_REQUESTS_KEY        = "cti:lead-requests";
const INSTRUCTOR_PROFILES_FILE = "/tmp/cti-instructor-profiles.json";
const LEAD_PUSHES_FILE         = "/tmp/cti-lead-pushes.json";
const LEAD_REQUESTS_FILE       = "/tmp/cti-lead-requests.json";

async function readInstructorProfiles(): Promise<InstructorProfile[]> {
  if (upstashConfig()) {
    const raw = await upstashGet(INSTRUCTOR_PROFILES_KEY);
    if (Array.isArray(raw)) return raw as InstructorProfile[];
    return [];
  }
  try { return JSON.parse(await fs.readFile(INSTRUCTOR_PROFILES_FILE, "utf-8")) as InstructorProfile[]; }
  catch { return []; }
}

async function writeInstructorProfiles(profiles: InstructorProfile[]): Promise<void> {
  if (upstashConfig()) { await upstashSet(INSTRUCTOR_PROFILES_KEY, profiles); return; }
  await fs.writeFile(INSTRUCTOR_PROFILES_FILE, JSON.stringify(profiles, null, 2), "utf-8");
}

export async function getInstructorProfiles(): Promise<InstructorProfile[]> {
  return readInstructorProfiles();
}

export async function getInstructorProfileByEmail(email: string): Promise<InstructorProfile | null> {
  const profiles = await readInstructorProfiles();
  return profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function saveInstructorProfile(profile: InstructorProfile): Promise<void> {
  const profiles = await readInstructorProfiles();
  profiles.push(profile);
  await writeInstructorProfiles(profiles);
}

export async function updateInstructorProfile(id: string, updates: Partial<InstructorProfile>): Promise<void> {
  const profiles = await readInstructorProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx >= 0) { profiles[idx] = { ...profiles[idx], ...updates }; await writeInstructorProfiles(profiles); }
}

async function readLeadPushes(): Promise<LeadPush[]> {
  if (upstashConfig()) {
    const raw = await upstashGet(LEAD_PUSHES_KEY);
    if (Array.isArray(raw)) return raw as LeadPush[];
    return [];
  }
  try { return JSON.parse(await fs.readFile(LEAD_PUSHES_FILE, "utf-8")) as LeadPush[]; }
  catch { return []; }
}

async function writeLeadPushes(pushes: LeadPush[]): Promise<void> {
  if (upstashConfig()) { await upstashSet(LEAD_PUSHES_KEY, pushes); return; }
  await fs.writeFile(LEAD_PUSHES_FILE, JSON.stringify(pushes, null, 2), "utf-8");
}

export async function getLeadPushes(): Promise<LeadPush[]> { return readLeadPushes(); }

export async function saveLeadPush(push: LeadPush): Promise<void> {
  const pushes = await readLeadPushes();
  pushes.push(push);
  await writeLeadPushes(pushes);
}

async function readLeadRequests(): Promise<LeadRequest[]> {
  if (upstashConfig()) {
    const raw = await upstashGet(LEAD_REQUESTS_KEY);
    if (Array.isArray(raw)) return raw as LeadRequest[];
    return [];
  }
  try { return JSON.parse(await fs.readFile(LEAD_REQUESTS_FILE, "utf-8")) as LeadRequest[]; }
  catch { return []; }
}

async function writeLeadRequests(requests: LeadRequest[]): Promise<void> {
  if (upstashConfig()) { await upstashSet(LEAD_REQUESTS_KEY, requests); return; }
  await fs.writeFile(LEAD_REQUESTS_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

export async function getLeadRequests(): Promise<LeadRequest[]> { return readLeadRequests(); }

export async function saveLeadRequest(request: LeadRequest): Promise<void> {
  const requests = await readLeadRequests();
  requests.push(request);
  await writeLeadRequests(requests);
}

export async function updateLeadRequest(id: string, updates: Partial<LeadRequest>): Promise<void> {
  const requests = await readLeadRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx >= 0) { requests[idx] = { ...requests[idx], ...updates }; await writeLeadRequests(requests); }
}

export function leadsToCSV(leads: Lead[]): string {
  const headers = [
    "Submitted At", "Status", "Dropped Off Step", "Name", "Email", "Phone",
    "Postcode", "Lesson Type", "Experience", "Confidence", "Duration (hrs)",
    "Availability", "Budget (£/hr)", "Start Time", "Payment Status", "Stripe Session ID",
  ];
  const rows = leads.map((l) => [
    l.submittedAt, l.status ?? "completed", l.abandonedAtStep ?? "",
    l.fullName, l.email, l.phone, l.postcode,
    l.lessonType, l.experience, l.confidence, l.duration,
    Array.isArray(l.availability) ? l.availability.join("; ") : l.availability,
    l.budget, l.startTime, l.paymentStatus, l.stripeSessionId ?? "",
  ]);
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
