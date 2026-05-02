"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.success ? "success" : "error");
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-navy-700 font-semibold text-lg">Confirming your payment…</p>
          <p className="text-gray-500 mt-2">Just a moment while we lock in your match.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-navy-700 mb-3">Something went wrong</h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t verify your payment. If you were charged, please email us at{" "}
            <a href="mailto:hello@comparetheinstructor.co.uk" className="text-orange-500 underline">
              hello@comparetheinstructor.co.uk
            </a>{" "}
            and we&apos;ll sort it straight away.
          </p>
          <Link
            href="/"
            className="inline-block bg-navy-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-navy-500 transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 px-4 py-16">
      <div className="max-w-xl mx-auto">
        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-navy-100 border border-navy-100 p-10 text-center mb-8">
          {/* Green tick */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-3">
            You&apos;re matched! 🎉
          </h1>
          <p className="text-gray-500 text-lg mb-2">
            We&apos;re finding your perfect instructor right now.
          </p>
          <p className="text-gray-500">
            Expect a call or message{" "}
            <span className="text-navy-700 font-semibold">within 24 hours.</span>{" "}
            Check your email for confirmation.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-3xl shadow-xl shadow-navy-100 border border-navy-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-navy-700 mb-6">What happens next</h2>
          <div className="space-y-0">
            {[
              {
                time: "Right now",
                title: "We review your preferences",
                body: "Our matching engine analyses your requirements against our instructor network.",
                color: "bg-orange-500",
              },
              {
                time: "Within 2 hours",
                title: "We identify your best matches",
                body: "We shortlist instructors based on your location, budget, experience level and availability.",
                color: "bg-navy-500",
              },
              {
                time: "Within 24 hours",
                title: "Your instructor reaches out",
                body: "Your matched instructor will contact you directly by phone or message to introduce themselves and arrange your first lesson.",
                color: "bg-green-500",
              },
            ].map((item, i) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {i + 1}
                  </div>
                  {i < 2 && <div className="w-0.5 h-8 bg-gray-200 my-1" />}
                </div>
                <div className="pb-6">
                  <p className="text-orange-500 text-xs font-semibold uppercase tracking-wide mb-0.5">{item.time}</p>
                  <p className="font-bold text-navy-700 mb-1">{item.title}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-navy-700 text-sm transition-colors"
          >
            ← Back to CompareTheInstructor.co.uk
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
