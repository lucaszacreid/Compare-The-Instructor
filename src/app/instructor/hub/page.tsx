"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LeadPush, LeadRequest } from "@/types";

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: "Complete beginner", some: "Some experience",
  moderate: "Moderate experience", ready: "Nearly test-ready",
};
const START_LABELS: Record<string, string> = {
  asap: "ASAP", two_weeks: "Within 2 weeks", month: "Within a month", exploring: "Just exploring",
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── Request button ────────────────────────────────────────────────────────────

function RequestButton({ push, email, token, onRequested }: {
  push: LeadPush;
  email: string;
  token: string;
  onRequested: (pushId: string) => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  const handleRequest = async () => {
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/instructor/request-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, pushId: push.id }),
      });
      const data = await res.json();
      if (res.ok) { setState("done"); onRequested(push.id); }
      else { setErr(data.error ?? `Error ${res.status}`); setState("error"); }
    } catch { setErr("Network error"); setState("error"); }
  };

  if (state === "done") return (
    <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      Requested
    </span>
  );
  return (
    <div>
      <button
        onClick={handleRequest}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        {state === "loading" ? (
          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.4" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : null}
        {state === "loading" ? "Requesting…" : "Request this lead →"}
      </button>
      {state === "error" && <p className="text-red-600 text-xs mt-1">{err}</p>}
    </div>
  );
}

// ── Accept / Decline button ────────────────────────────────────────────────────

function RespondButton({ request, email, token, onResponded }: {
  request: LeadRequest;
  email: string;
  token: string;
  onResponded: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [err, setErr] = useState("");

  const respond = async (action: "accept" | "decline") => {
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/instructor/accept-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, requestId: request.id, action }),
      });
      const data = await res.json();
      if (res.ok) { onResponded(); }
      else { setErr(data.error ?? `Error ${res.status}`); setState("error"); }
    } catch { setErr("Network error"); setState("error"); }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => respond("accept")}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        {state === "loading" ? "…" : `Accept for £${request.assignedPrice}`}
      </button>
      <button
        onClick={() => respond("decline")}
        disabled={state === "loading"}
        className="inline-flex items-center gap-1.5 border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        Decline
      </button>
      {state === "error" && <p className="text-red-600 text-xs">{err}</p>}
    </div>
  );
}

// ── Main Hub content ──────────────────────────────────────────────────────────

function HubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileLocation, setProfileLocation] = useState("");
  const [feed, setFeed] = useState<LeadPush[]>([]);
  const [requests, setRequests] = useState<LeadRequest[]>([]);
  const [requestedPushIds, setRequestedPushIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"feed" | "requests">("feed");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const fetchFeed = useCallback(async (e: string, t: string) => {
    try {
      const res = await fetch(`/api/instructor/feed?email=${encodeURIComponent(e)}&token=${encodeURIComponent(t)}`);
      if (res.status === 401) { router.push("/instructor/login"); return; }
      const data = await res.json();
      if (res.ok) {
        setFeed(data.feed ?? []);
        setRequests(data.requests ?? []);
        setRequestedPushIds(new Set<string>(data.requestedPushIds ?? []));
      }
    } catch {}
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qToken = searchParams.get("token");
    const lsEmail = localStorage.getItem("cti_instructor_email");
    const lsToken = localStorage.getItem("cti_instructor_token");

    const e = qEmail || lsEmail || "";
    const t = qToken || lsToken || "";

    if (!e || !t) { router.push("/instructor/login"); return; }

    if (qEmail && qToken) {
      localStorage.setItem("cti_instructor_email", qEmail);
      localStorage.setItem("cti_instructor_token", qToken);
    }

    // Validate credentials and get profile name via login endpoint
    fetch("/api/instructor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: e, token: t }),
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) { setAuthError(data.error); setLoading(false); return; }
        router.push("/instructor/login");
        return;
      }
      setEmail(e);
      setToken(t);
      setProfileName(data.profile?.name ?? "");
      setProfileLocation(data.profile?.location ?? "");
      fetchFeed(e, t);
    }).catch(() => router.push("/instructor/login"));
  }, [router, searchParams, fetchFeed]);

  const signOut = () => {
    localStorage.removeItem("cti_instructor_email");
    localStorage.removeItem("cti_instructor_token");
    router.push("/instructor/login");
  };

  const handleRequested = (pushId: string) => {
    setRequestedPushIds((prev) => new Set<string>(Array.from(prev).concat(pushId)));
    if (email && token) fetchFeed(email, token);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Loading your hub…
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-navy-700 mb-3">Not approved yet</h2>
          <p className="text-gray-500 mb-6 text-sm">{authError}</p>
          <Link href="/" className="text-orange-500 hover:text-orange-600 font-semibold text-sm">← Back to home</Link>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const pricedRequests = requests.filter((r) => r.status === "priced");
  const closedRequests = requests.filter((r) => r.status === "accepted" || r.status === "declined");
  const newNotifications = pricedRequests.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2.5" />
                  <line x1="12" y1="9.5" x2="12" y2="2" /><line x1="14.2" y1="13.3" x2="20.7" y2="17" /><line x1="9.8" y1="13.3" x2="3.3" y2="17" />
                </svg>
              </div>
              <span className="font-bold text-sm hidden sm:block">CompareThe<span className="text-orange-400">Instructor</span></span>
            </Link>
            <span className="text-white/30 hidden sm:block">|</span>
            <span className="text-white/80 text-sm hidden sm:block">Instructor Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{profileName}</p>
              <p className="text-xs text-white/60">{profileLocation}</p>
            </div>
            <button onClick={signOut} className="text-white/60 hover:text-white text-sm transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      {/* Welcome banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <p className="text-sm text-gray-600 font-medium">
              Welcome back, <span className="text-navy-700 font-bold">{profileName}</span>!
              {newNotifications > 0 && (
                <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {newNotifications} lead{newNotifications !== 1 ? "s" : ""} priced
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {(["feed", "requests"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab ? "border-orange-500 text-orange-600" : "border-transparent text-gray-500 hover:text-navy-700"
                }`}
              >
                {tab === "feed" ? "Lead Feed" : "My Requests"}
                {tab === "requests" && pricedRequests.length > 0 && (
                  <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {pricedRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Lead Feed tab ─────────────────────────────────────────────────── */}
        {activeTab === "feed" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-700">Available Leads</h2>
              <button
                onClick={() => fetchFeed(email, token)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Refresh
              </button>
            </div>

            {feed.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 font-medium">No leads in your feed yet.</p>
                <p className="text-gray-400 text-sm mt-1">We&apos;ll email you when a new lead is available.</p>
              </div>
            ) : (
              feed.map((push) => {
                const alreadyRequested = requestedPushIds.has(push.id);
                return (
                  <div key={push.id} className={`bg-white rounded-2xl border p-6 ${alreadyRequested ? "border-green-200 bg-green-50/30" : "border-gray-200"}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wide text-orange-500 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                            {push.area}
                          </span>
                          <span className="text-xs font-semibold text-navy-700 bg-navy-50 border border-navy-100 px-2.5 py-1 rounded-full capitalize">
                            {push.lessonType}
                          </span>
                          <span className="text-xs text-gray-400">{fmt(push.pushedAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Experience</p>
                            <p className="text-sm font-medium text-navy-700">{EXPERIENCE_LABELS[push.experience] ?? push.experience}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Budget</p>
                            <p className="text-sm font-medium text-navy-700">{push.budget}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Start</p>
                            <p className="text-sm font-medium text-navy-700">{START_LABELS[push.startTime] ?? push.startTime}</p>
                          </div>
                          {push.note && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Note</p>
                              <p className="text-sm font-medium text-navy-700">{push.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {alreadyRequested ? (
                          <span className="inline-flex items-center gap-1.5 text-green-700 text-xs font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            Requested
                          </span>
                        ) : (
                          <RequestButton push={push} email={email} token={token} onRequested={handleRequested} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── My Requests tab ───────────────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-navy-700">My Lead Requests</h2>

            {/* Priced — action required */}
            {pricedRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Action required — priced leads</h3>
                {pricedRequests.map((r) => (
                  <div key={r.id} className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-sm font-bold text-navy-700 mb-1">Lead offered at <span className="text-orange-600">£{r.assignedPrice}</span></p>
                        <p className="text-xs text-gray-500">Requested {fmt(r.requestedAt)} · Priced {r.pricedAt ? fmt(r.pricedAt) : ""}</p>
                        <p className="text-xs text-gray-400 mt-1">Accept to receive full learner contact details from our team.</p>
                      </div>
                      <RespondButton request={r} email={email} token={token} onResponded={() => fetchFeed(email, token)} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Awaiting pricing</h3>
                {pendingRequests.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-navy-700 font-medium">Lead request submitted</p>
                      <span className="text-xs font-semibold bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full">Pending pricing</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Requested {fmt(r.requestedAt)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Closed */}
            {closedRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Completed</h3>
                {closedRequests.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-5 opacity-70">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-navy-700 font-medium">
                        Lead — £{r.assignedPrice ?? "—"}
                      </p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        r.status === "accepted" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {r.status === "accepted" ? "Accepted" : "Declined"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Requested {fmt(r.requestedAt)}</p>
                  </div>
                ))}
              </div>
            )}

            {requests.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500 font-medium">No requests yet.</p>
                <p className="text-gray-400 text-sm mt-1">Go to Lead Feed to request a lead.</p>
                <button onClick={() => setActiveTab("feed")} className="mt-4 text-orange-500 hover:text-orange-600 font-semibold text-sm underline">
                  View lead feed →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstructorHubPage() {
  return (
    <Suspense>
      <HubContent />
    </Suspense>
  );
}
