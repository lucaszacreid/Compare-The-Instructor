"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-login if query params provided (from approval email link)
  useEffect(() => {
    const qEmail = searchParams.get("email");
    const qToken = searchParams.get("token");
    if (qEmail && qToken) {
      setEmail(qEmail);
      setToken(qToken);
      doLogin(qEmail, qToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doLogin = async (e: string, t: string) => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/instructor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e.trim(), token: t.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        localStorage.setItem("cti_instructor_email", e.trim());
        localStorage.setItem("cti_instructor_token", t.trim());
        router.push("/instructor/hub");
      } else {
        setErrorMsg(data.error ?? `Error ${res.status}`);
        setState("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    doLogin(email, token);
  };

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
          <p className="text-gray-400 mt-3 text-sm">Instructor Hub</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-navy-100 p-8 space-y-4">
          <h1 className="text-2xl font-bold text-navy-700 mb-2">Instructor sign in</h1>

          {state === "loading" && (
            <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-sm">Signing in…</span>
            </div>
          )}

          {state !== "loading" && (
            <>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-700 mb-1.5">Access token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setState("idle"); }}
                  placeholder="Paste your access token"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Sent to you by email when your application was approved.</p>
              </div>

              {state === "error" && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={!email.trim() || !token.trim()}
                className="w-full bg-navy-700 hover:bg-navy-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Sign in to Hub
              </button>
            </>
          )}
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Not approved yet?{" "}
          <Link href="/instructor/register" className="text-orange-500 hover:text-orange-600 font-semibold">
            Apply to join →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function InstructorLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
