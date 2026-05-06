/**
 * Storage layer for leads and instructors.
 *
 * Production: Upstash Redis (persistent, shared across all serverless
 * function instances). Set UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN in your deployment environment.
 *
 * Local dev: falls back to /tmp JSON files when the env vars are absent.
 */

import { promises as fs } from "fs";
import { Redis } from "@upstash/redis";
import { Lead, InstructorInterest } from "@/types";

// ── Redis keys ────────────────────────────────────────────────────────────────
const LEADS_KEY        = "cti:leads";
const INSTRUCTORS_KEY  = "cti:instructors";

// ── Local-dev fallback paths ──────────────────────────────────────────────────
const LEADS_FILE       = "/tmp/cti-leads.json";
const INSTRUCTORS_FILE = "/tmp/cti-instructors.json";

// ── Client factory (lazy, one instance per process) ───────────────────────────
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null; // local dev — use file fallback
  }
  if (!_redis) {
    _redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

// ── Low-level read/write helpers ──────────────────────────────────────────────

async function readLeads(): Promise<Lead[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<unknown>(LEADS_KEY);
      if (Array.isArray(raw)) return raw as Lead[];
      if (typeof raw === "string") {
        try { return JSON.parse(raw) as Lead[]; } catch { return []; }
      }
      return [];
    } catch (err) {
      console.error("Redis readLeads error:", err);
      return [];
    }
  }
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data) as Lead[];
  } catch {
    return [];
  }
}

async function writeLeads(leads: Lead[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    try {
      await redis.set(LEADS_KEY, leads);
    } catch (err) {
      console.error("Redis writeLeads error:", err);
      throw err; // re-throw so callers (e.g. verify-payment) know the write failed
    }
    return;
  }
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
}

async function readInstructors(): Promise<InstructorInterest[]> {
  const redis = getRedis();
  if (redis) {
    try {
      const raw = await redis.get<unknown>(INSTRUCTORS_KEY);
      if (Array.isArray(raw)) return raw as InstructorInterest[];
      if (typeof raw === "string") {
        try { return JSON.parse(raw) as InstructorInterest[]; } catch { return []; }
      }
      return [];
    } catch (err) {
      console.error("Redis readInstructors error:", err);
      return [];
    }
  }
  try {
    const data = await fs.readFile(INSTRUCTORS_FILE, "utf-8");
    return JSON.parse(data) as InstructorInterest[];
  } catch {
    return [];
  }
}

async function writeInstructors(entries: InstructorInterest[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(INSTRUCTORS_KEY, entries);
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
  return readInstructors();
}

export async function saveInstructorInterest(entry: InstructorInterest): Promise<void> {
  const entries = await readInstructors();
  entries.push(entry);
  await writeInstructors(entries);
}

export function leadsToCSV(leads: Lead[]): string {
  const headers = [
    "Submitted At", "Status", "Dropped Off Step", "Name", "Email", "Phone",
    "Postcode", "Lesson Type", "Experience", "Confidence", "Duration (hrs)",
    "Availability", "Budget (£/hr)", "Start Time", "Payment Status", "Stripe Session ID",
  ];
  const rows = leads.map((l) => [
    l.submittedAt,
    l.status ?? "completed",
    l.abandonedAtStep ?? "",
    l.fullName, l.email, l.phone, l.postcode,
    l.lessonType, l.experience, l.confidence, l.duration,
    Array.isArray(l.availability) ? l.availability.join("; ") : l.availability,
    l.budget, l.startTime, l.paymentStatus,
    l.stripeSessionId ?? "",
  ]);
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}
