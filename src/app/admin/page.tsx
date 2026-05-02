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
              {leads.length} lead{leads.length !== 1 ? "s" : ""}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {leads.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-navy-700 mb-2">No leads yet</h2>
            <p className="text-gray-400">Submitted enquiries will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-700 text-white">
                  {[
                    "Date / Time",
                    "Name",
                    "Email",
                    "Phone",
                    "Postcode",
                    "Type",
                    "Experience",
                    "Confidence",
                    "Duration",
                    "Availability",
                    "Budget",
                    "Start",
                    "Payment",
                  ].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr
                    key={lead.id}
                    className={`border-t border-gray-100 hover:bg-orange-50/40 transition-colors ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(lead.submittedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">{lead.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <a href={`mailto:${lead.email}`} className="hover:text-orange-500 transition-colors">
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600 uppercase whitespace-nowrap">{lead.postcode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        lead.lessonType === "automatic"
                          ? "bg-navy-100 text-navy-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {lead.lessonType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {EXPERIENCE_LABELS[lead.experience] ?? lead.experience}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {CONFIDENCE_LABELS[lead.confidence] ?? lead.confidence}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lead.duration}h</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(lead.availability) ? lead.availability : []).map((a) => (
                          <span key={a} className="bg-gray-100 rounded px-1.5 py-0.5 text-xs whitespace-nowrap">
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-700 whitespace-nowrap">£{lead.budget}/hr</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {START_LABELS[lead.startTime] ?? lead.startTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        lead.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {lead.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
