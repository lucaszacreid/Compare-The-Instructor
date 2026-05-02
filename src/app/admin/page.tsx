"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Lead } from "@/types";

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

function ReminderButton({ lead, password }: { lead: Lead; password: string }) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const handleSend = async () => {
    setState("loading");
    try {
      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id, password }),
      });
      const data = await res.json();
      setState(res.ok && data.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1.5 rounded-lg">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Sent
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2.5 py-1.5 rounded-lg">
        Failed — retry?
        <button onClick={handleSend} className="underline ml-1">Retry</button>
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={state === "loading"}
      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
    >
      {state === "loading" ? (
        <>
          <svg className="animate-spin" width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.4" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Sending…
        </>
      ) : (
        <>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          Send reminder
        </>
      )}
    </button>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLeads = useCallback(async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/leads?password=${encodeURIComponent(pw)}`);
      if (res.status === 401) {
        setError("Incorrect password");
        setPassword("");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setLeads(data.leads ?? []);
      setPassword(pw);
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads(passwordInput);
  };

  const handleExportCSV = () => {
    const url = `/api/leads?password=${encodeURIComponent(password)}&format=csv`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!password) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span className="text-navy-700 font-bold text-xl">
                CompareThe<span className="text-orange-500">Instructor</span>
              </span>
            </Link>
            <p className="text-gray-400 mt-3 text-sm">Admin access</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-lg border border-navy-100 p-8"
          >
            <h1 className="text-2xl font-bold text-navy-700 mb-6">Sign in</h1>

            <label className="block text-sm font-semibold text-navy-700 mb-1.5">
              Admin password
            </label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors mb-4"
            />

            {error && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !passwordInput}
              className="w-full bg-navy-700 hover:bg-navy-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const completedLeads = leads.filter((l) => !l.status || l.status === "completed");
  const abandonedLeads = leads.filter((l) => l.status === "abandoned");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              ← Site
            </Link>
            <span className="text-white/30">|</span>
            <span className="font-bold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm">
              {completedLeads.length} completed · {abandonedLeads.length} abandoned
            </span>
            <button
              onClick={handleExportCSV}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={() => { setPassword(""); setLeads([]); }}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">

        {/* ── Completed leads ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Completed leads
            <span className="text-gray-400 font-normal text-sm">({completedLeads.length})</span>
          </h2>

          {completedLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-gray-400">No completed leads yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-700 text-white">
                    {["Date / Time", "Name", "Email", "Phone", "Postcode", "Type", "Experience", "Confidence", "Duration", "Availability", "Budget", "Start", "Payment"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedLeads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`border-t border-gray-100 hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(lead.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{lead.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <a href={`mailto:${lead.email}`} className="hover:text-orange-500 transition-colors">{lead.email}</a>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone}</td>
                      <td className="px-4 py-3 text-gray-600 uppercase whitespace-nowrap">{lead.postcode}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${lead.lessonType === "automatic" ? "bg-navy-100 text-navy-700" : "bg-orange-100 text-orange-700"}`}>
                          {lead.lessonType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{EXPERIENCE_LABELS[lead.experience] ?? lead.experience}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{CONFIDENCE_LABELS[lead.confidence] ?? lead.confidence}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.duration}h</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px]">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(lead.availability) ? lead.availability : []).map((a) => (
                            <span key={a} className="bg-gray-100 rounded px-1.5 py-0.5 text-xs whitespace-nowrap">{a.replace(/_/g, " ")}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">£{lead.budget}/hr</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{START_LABELS[lead.startTime] ?? lead.startTime}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${lead.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {lead.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Abandoned leads ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-navy-700 mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
            Abandoned leads
            <span className="text-gray-400 font-normal text-sm">({abandonedLeads.length})</span>
          </h2>

          {abandonedLeads.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-gray-400">No abandoned leads — everyone is completing the form!</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-yellow-600 text-white">
                    {["Date / Time", "Name", "Email", "Phone", "Dropped at step", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {abandonedLeads.map((lead, i) => (
                    <tr
                      key={lead.id}
                      className={`border-t border-gray-100 hover:bg-yellow-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(lead.submittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">
                        {lead.fullName || <span className="text-gray-400 font-normal italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <a href={`mailto:${lead.email}`} className="hover:text-orange-500 transition-colors">{lead.email}</a>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {lead.phone || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          lead.abandonedAtStep === 1
                            ? "bg-red-100 text-red-700"
                            : lead.abandonedAtStep === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          Step {lead.abandonedAtStep ?? 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ReminderButton lead={lead} password={password} />
                      </td>
                    </tr>
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
