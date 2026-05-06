"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Lead } from "@/types";
import { InstructorInterest } from "@/types";

// ── Label maps ───────────────────────────────────────────────────────────────

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Complete beginner",
  some: "Some (<10 hrs)",
  moderate: "Moderate (10–30)",
  ready: "Nearly ready (30+)",
};
const CONFIDENCE_LABELS: Record<string, string> = {
  very_nervous: "Very nervous",
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

// ── Shared helpers ───────────────────────────────────────────────────────────

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-navy-700 font-medium">{value}</p>
    </div>
  );
}

// ── Reminder button ──────────────────────────────────────────────────────────

function ReminderButton({ lead, password }: { lead: Lead; password: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSend = async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) { setState("sent"); }
      else { setErrorMsg(data.error ?? `HTTP ${res.status}`); setState("error"); }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
  };

  if (state === "sent") return (
    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-3 py-2 rounded-lg">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      Reminder sent
    </span>
  );
  if (state === "error") return (
    <span className="flex flex-col gap-1 text-red-600 text-xs font-semibold bg-red-50 px-3 py-2 rounded-lg">
      <span>Failed: {errorMsg}</span>
      <button onClick={handleSend} className="underline text-left">Retry</button>
    </span>
  );
  return (
    <button onClick={handleSend} disabled={state === "loading"}
      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
      {state === "loading" ? (
        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.4" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      )}
      {state === "loading" ? "Sending…" : "Send reminder"}
    </button>
  );
}

// ── Forward lead form ────────────────────────────────────────────────────────

function ForwardLeadForm({ lead, password, prefillEmail = "" }: { lead: Lead; password: string; prefillEmail?: string }) {
  const [toEmail, setToEmail] = useState(prefillEmail);
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleForward = async () => {
    if (!toEmail.trim()) return;
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/forward-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, toEmail: toEmail.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) { setState("sent"); }
      else { setErrorMsg(data.error ?? `HTTP ${res.status}`); setState("error"); }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
  };

  if (state === "sent") return (
    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 px-4 py-3 rounded-xl">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      Lead forwarded to {toEmail}
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          value={toEmail}
          onChange={(e) => { setToEmail(e.target.value); setState("idle"); }}
          placeholder="instructor@example.com"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-navy-700"
        />
        <button
          onClick={handleForward}
          disabled={state === "loading" || !toEmail.trim()}
          className="inline-flex items-center gap-1.5 bg-navy-700 hover:bg-navy-500 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          {state === "loading" ? (
            <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.4" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          {state === "loading" ? "Forwarding…" : "Forward"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">Failed: {errorMsg}</p>
      )}
    </div>
  );
}

// ── Nearby instructors ───────────────────────────────────────────────────────

interface InstructorResult extends InstructorInterest {
  score: number;
  matchedTerms: string[];
}

function NearbyInstructors({ lead, password }: { lead: Lead; password: string }) {
  const [instructors, setInstructors] = useState<InstructorResult[] | null>(null);
  const [locationTerms, setLocationTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFind = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/nearby-instructors?postcode=${encodeURIComponent(lead.postcode)}&password=${encodeURIComponent(password)}`
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to load"); return; }
      setInstructors(data.instructors ?? []);
      setLocationTerms(data.locationTerms ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {instructors === null ? (
        <button
          onClick={handleFind}
          disabled={loading || !lead.postcode}
          className="inline-flex items-center gap-2 bg-white border-2 border-navy-700 text-navy-700 hover:bg-navy-50 disabled:opacity-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          )}
          {loading ? "Searching…" : `Find instructors near ${lead.postcode}`}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-navy-700">
              {instructors.length === 0
                ? "No instructors in your network yet"
                : `${instructors.filter(i => i.score > 0).length} match${instructors.filter(i => i.score > 0).length !== 1 ? "es" : ""} · ${instructors.length} total`}
            </p>
            {locationTerms.length > 0 && (
              <p className="text-xs text-gray-400">
                Searched: {locationTerms.slice(0, 4).join(", ")}
              </p>
            )}
          </div>

          {instructors.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-center">
              No instructors have signed up to your network yet.
              <Link href="/instructors" className="block mt-1 text-orange-500 underline text-xs">
                View instructor sign-up page →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {instructors.map((inst) => (
                <div key={inst.id}
                  className={`rounded-xl border p-4 ${inst.score > 0 ? "border-orange-200 bg-orange-50/40" : "border-gray-200 bg-white"}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-navy-700 text-sm">{inst.name}</p>
                        {inst.score > 0 && (
                          <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {inst.matchedTerms[0]} match
                          </span>
                        )}
                        {inst.hourlyRate && (
                          <span className="text-xs text-gray-500">£{inst.hourlyRate}/hr</span>
                        )}
                        {inst.yearsExperience && (
                          <span className="text-xs text-gray-500">{inst.yearsExperience}yrs exp</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-0.5">
                        <a href={`tel:${inst.phone}`} className="hover:text-navy-700">{inst.phone}</a>
                        {" · "}
                        <a href={`mailto:${inst.email}`} className="hover:text-orange-500">{inst.email}</a>
                      </p>
                      <p className="text-xs text-gray-400">Areas: {inst.areasCovered}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <ForwardLeadForm lead={lead} password={password} prefillEmail={inst.email} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={() => setInstructors(null)} className="text-xs text-gray-400 hover:text-gray-600 underline">
            ← Clear results
          </button>
        </div>
      )}
      {error && instructors === null && (
        <p className="mt-2 text-red-600 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}

// ── Expanded lead detail panel ───────────────────────────────────────────────

function LeadDetailPanel({ lead, password }: { lead: Lead; password: string }) {
  const avail = Array.isArray(lead.availability) && lead.availability.length > 0
    ? lead.availability.map((a) => a.replace(/_/g, " ")).join(", ")
    : null;

  return (
    <div className="bg-gray-50 border-t border-gray-100 p-6">
      <div className="max-w-4xl">
        {/* Details grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <DetailRow label="Name" value={lead.fullName} />
          <DetailRow label="Email" value={lead.email} />
          <DetailRow label="Phone" value={lead.phone} />
          <DetailRow label="Location" value={lead.postcode} />
          <DetailRow label="Submitted" value={fmt(lead.submittedAt)} />
          <DetailRow label="Tier" value={lead.tier === "free" ? "General Match (Free)" : "Perfect Match (£3.99)"} />
          <DetailRow label="Status" value={lead.status} />
          {lead.lessonType && <DetailRow label="Lesson type" value={lead.lessonType} />}
          {lead.experience && <DetailRow label="Experience" value={EXPERIENCE_LABELS[lead.experience] ?? lead.experience} />}
          {lead.confidence && <DetailRow label="Confidence" value={CONFIDENCE_LABELS[lead.confidence] ?? lead.confidence} />}
          {lead.duration && <DetailRow label="Duration" value={`${lead.duration}h`} />}
          {avail && <DetailRow label="Availability" value={avail} />}
          {lead.budget > 0 && <DetailRow label="Budget" value={`£${lead.budget}/hr`} />}
          {lead.startTime && <DetailRow label="Start time" value={START_LABELS[lead.startTime] ?? lead.startTime} />}
          {lead.paymentStatus && <DetailRow label="Payment" value={lead.paymentStatus} />}
          {lead.stripeSessionId && <DetailRow label="Stripe session" value={lead.stripeSessionId} />}
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-6 pt-5 border-t border-gray-200">
          {/* Send reminder */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Send reminder to learner</p>
            <ReminderButton lead={lead} password={password} />
          </div>

          {/* Forward lead */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Forward lead to instructor</p>
            <ForwardLeadForm lead={lead} password={password} />
          </div>

          {/* Nearby instructors */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Find instructors in network</p>
            <NearbyInstructors lead={lead} password={password} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared chevron ───────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 text-gray-400 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── Main admin page ──────────────────────────────────────────────────────────

// ── Stripe session recovery ──────────────────────────────────────────────────

function RecoverLeadPanel({ password, onRecovered }: { password: string; onRecovered: () => void }) {
  const [sessionId, setSessionId] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleRecover = async () => {
    if (!sessionId.trim()) return;
    setState("loading");
    setMsg("");
    try {
      const res = await fetch("/api/recover-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState("ok");
        setMsg(`Recovered: ${data.lead.fullName} (${data.lead.email})`);
        setSessionId("");
        onRecovered();
      } else {
        setState("error");
        setMsg(data.error ?? `HTTP ${res.status}`);
      }
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Network error");
    }
  };

  return (
    <details className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <summary className="cursor-pointer text-sm font-semibold text-amber-800 select-none">
        ⚠ Recover a lead from Stripe (use when a payment went through but the lead is missing)
      </summary>
      <div className="mt-4 space-y-3">
        <p className="text-xs text-amber-700">
          Paste the Stripe checkout session ID (starts with <code className="bg-amber-100 px-1 rounded">cs_</code>).
          Find it in your Stripe dashboard under Payments → the relevant charge → Payment details.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={sessionId}
            onChange={(e) => { setSessionId(e.target.value); setState("idle"); }}
            placeholder="cs_live_..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-amber-300 focus:border-amber-500 focus:outline-none font-mono"
          />
          <button
            onClick={handleRecover}
            disabled={state === "loading" || !sessionId.trim()}
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {state === "loading" ? "Recovering…" : "Recover lead"}
          </button>
        </div>
        {state === "ok" && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">✓ {msg}</p>}
        {state === "error" && <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">Failed: {msg}</p>}
      </div>
    </details>
  );
}

// ── Main admin page ──────────────────────────────────────────────────────────

interface StorageStatus { upstashConfigured: boolean; upstashUrl: string; pingResult: string; }

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [storage, setStorage] = useState<StorageStatus | null>(null);

  const fetchLeads = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/leads?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) { setError("Incorrect password"); setPassword(""); setLoading(false); return; }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setStorage(data.storage ?? null);
      setPassword(pw);
    } catch { setError("Failed to load leads. Please try again."); }
    finally { setLoading(false); }
  }, []);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); fetchLeads(passwordInput); };

  const handleExportCSV = () => {
    const url = `/api/leads?password=${encodeURIComponent(password)}&format=csv`;
    const a = document.createElement("a"); a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  const toggleExpand = (id: string) => setExpandedId((prev) => prev === id ? null : id);

  if (!password) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2.5" />
                  <line x1="12" y1="9.5" x2="12" y2="2" /><line x1="14.2" y1="13.3" x2="20.7" y2="17" /><line x1="9.8" y1="13.3" x2="3.3" y2="17" />
                </svg>
              </div>
              <span className="text-navy-700 font-bold text-xl">CompareThe<span className="text-orange-500">Instructor</span></span>
            </Link>
            <p className="text-gray-400 mt-3 text-sm">Admin access</p>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-lg border border-navy-100 p-8">
            <h1 className="text-2xl font-bold text-navy-700 mb-6">Sign in</h1>
            <label className="block text-sm font-semibold text-navy-700 mb-1.5">Admin password</label>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors mb-4" />
            {error && <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading || !passwordInput}
              className="w-full bg-navy-700 hover:bg-navy-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const completedLeads = leads.filter((l) => (!l.status || l.status === "completed") && l.tier !== "free");
  const abandonedLeads = leads.filter((l) => l.status === "abandoned");
  const freeLeads = leads.filter((l) => l.status === "free_lead" || l.tier === "free");

  // ── Shared expanded row renderer ──────────────────────────────────────────
  const expandedRow = (lead: Lead, colSpan: number) =>
    expandedId === lead.id ? (
      <tr key={`${lead.id}-detail`}>
        <td colSpan={colSpan} className="p-0">
          <LeadDetailPanel lead={lead} password={password} />
        </td>
      </tr>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">← Site</Link>
            <span className="text-white/30">|</span>
            <span className="font-bold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm hidden sm:block">
              {completedLeads.length} paid · {abandonedLeads.length} abandoned · {freeLeads.length} free
            </span>
            <button onClick={handleExportCSV}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
            <button onClick={() => { setPassword(""); setLeads([]); }}
              className="text-white/60 hover:text-white text-sm transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <p className="text-xs text-gray-400">Click any row to expand and see full details, forward the lead, or find nearby instructors.</p>

        {/* ── Storage status banner ─────────────────────────────────────────── */}
        {storage && (
          <div className={`rounded-xl px-4 py-3 text-sm ${
            storage.pingResult === "OK"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <span>
                <strong>Storage:</strong>{" "}
                {storage.pingResult === "OK" ? "✓ Upstash connected" : "✗ " + (storage.upstashConfigured ? "Upstash unreachable" : "Upstash NOT configured")}
              </span>
              {storage.upstashConfigured && <span><strong>URL:</strong> {storage.upstashUrl}</span>}
              <span><strong>Ping:</strong> {storage.pingResult}</span>
              <button
                onClick={() => fetchLeads(password)}
                className="ml-auto text-xs underline opacity-70 hover:opacity-100"
              >
                Refresh
              </button>
            </div>
            {storage.pingResult !== "OK" && (
              <p className="text-xs mt-2 text-red-700">
                Leads are not being saved. In Vercel → Settings → Environment Variables, verify{" "}
                <code className="bg-red-100 px-1 rounded">UPSTASH_REDIS_REST_URL</code> and{" "}
                <code className="bg-red-100 px-1 rounded">UPSTASH_REDIS_REST_TOKEN</code> are correct,
                then trigger a redeploy.
              </p>
            )}
          </div>
        )}

        {/* ── Stripe recovery tool ─────────────────────────────────────────── */}
        <RecoverLeadPanel password={password} onRecovered={() => fetchLeads(password)} />

        {/* ── Completed leads ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Completed leads
            <span className="text-gray-400 font-normal text-sm">({completedLeads.length})</span>
          </h2>
          {completedLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">📋</div><p className="text-gray-400">No completed leads yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-700 text-white">
                    {["", "Date / Time", "Name", "Email", "Phone", "Postcode", "Type", "Budget", "Start", "Payment"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedLeads.map((lead, i) => (
                    <>
                      <tr key={lead.id} onClick={() => toggleExpand(lead.id)} className={`border-t border-gray-100 cursor-pointer transition-colors ${expandedId === lead.id ? "bg-orange-50" : i % 2 === 0 ? "bg-white hover:bg-orange-50/40" : "bg-gray-50/50 hover:bg-orange-50/40"}`}>
                        <td className="px-3 py-3"><Chevron open={expandedId === lead.id} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lead.submittedAt)}</td>
                        <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{lead.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-500 transition-colors">{lead.email}</a>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone}</td>
                        <td className="px-4 py-3 text-gray-600 uppercase whitespace-nowrap">{lead.postcode}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${lead.lessonType === "automatic" ? "bg-navy-100 text-navy-700" : "bg-orange-100 text-orange-700"}`}>{lead.lessonType}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">£{lead.budget}/hr</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{START_LABELS[lead.startTime] ?? lead.startTime}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${lead.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{lead.paymentStatus}</span>
                        </td>
                      </tr>
                      {expandedRow(lead, 10)}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Abandoned leads ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
            Abandoned leads
            <span className="text-gray-400 font-normal text-sm">({abandonedLeads.length})</span>
          </h2>
          {abandonedLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">🎉</div><p className="text-gray-400">No abandoned leads!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-600 text-white">
                    {["", "Date / Time", "Name", "Email", "Phone", "Dropped at step"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abandonedLeads.map((lead, i) => (
                    <>
                      <tr key={lead.id} onClick={() => toggleExpand(lead.id)} className={`border-t border-gray-100 cursor-pointer transition-colors ${expandedId === lead.id ? "bg-yellow-50" : i % 2 === 0 ? "bg-white hover:bg-yellow-50/40" : "bg-gray-50/50 hover:bg-yellow-50/40"}`}>
                        <td className="px-3 py-3"><Chevron open={expandedId === lead.id} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lead.submittedAt)}</td>
                        <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{lead.fullName || <span className="text-gray-400 font-normal italic">—</span>}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-500 transition-colors">{lead.email}</a>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone || <span className="text-gray-400 italic">—</span>}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lead.abandonedAtStep === 1 ? "bg-red-100 text-red-700" : lead.abandonedAtStep === 2 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                            Step {lead.abandonedAtStep ?? 1}
                          </span>
                        </td>
                      </tr>
                      {expandedRow(lead, 6)}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Free leads ───────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
            Free leads
            <span className="text-gray-400 font-normal text-sm">({freeLeads.length})</span>
          </h2>
          {freeLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">🆓</div><p className="text-gray-400">No free leads yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    {["", "Date / Time", "Name", "Email", "Phone", "Postcode", "Type"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {freeLeads.map((lead, i) => (
                    <>
                      <tr key={lead.id} onClick={() => toggleExpand(lead.id)} className={`border-t border-gray-100 cursor-pointer transition-colors ${expandedId === lead.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white hover:bg-blue-50/40" : "bg-gray-50/50 hover:bg-blue-50/40"}`}>
                        <td className="px-3 py-3"><Chevron open={expandedId === lead.id} /></td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{fmt(lead.submittedAt)}</td>
                        <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{lead.fullName}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <a href={`mailto:${lead.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-orange-500 transition-colors">{lead.email}</a>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone}</td>
                        <td className="px-4 py-3 text-gray-600 uppercase whitespace-nowrap">{lead.postcode}</td>
                        <td className="px-4 py-3">
                          {lead.lessonType && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${lead.lessonType === "automatic" ? "bg-navy-100 text-navy-700" : "bg-orange-100 text-orange-700"}`}>{lead.lessonType}</span>}
                        </td>
                      </tr>
                      {expandedRow(lead, 7)}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
