"use client";

import { useState, useEffect } from "react";
import { Review } from "@/types";

// ── Star display ──────────────────────────────────────────────────────────────

function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" fill={n <= rating ? "#f97316" : "none"}
          stroke={n <= rating ? "#f97316" : "#d1d5db"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Interactive star picker ───────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover || value);
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="focus:outline-none"
            aria-label={`${n} star${n !== 1 ? "s" : ""}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? "#f97316" : "none"}
              stroke={filled ? "#f97316" : "#9ca3af"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              className="transition-all">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {["", "Poor", "Below average", "Average", "Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

// ── Submit form ───────────────────────────────────────────────────────────────

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Please enter your name"); return; }
    if (!rating) { setErr("Please select a star rating"); return; }
    if (!text.trim()) { setErr("Please write a short review"); return; }
    setState("loading"); setErr("");
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rating, text: text.trim() }),
      });
      const data = await res.json();
      if (res.ok) { setState("done"); onSubmitted(); }
      else { setErr(data.error ?? `Error ${res.status}`); setState("error"); }
    } catch { setErr("Something went wrong. Please try again."); setState("error"); }
  };

  if (state === "done") return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-navy-700 mb-1">Thank you for your review!</h3>
      <p className="text-gray-500 text-sm">Your review is pending approval and will appear on this page once approved.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-navy-100 shadow-sm p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Your name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setState("idle"); }}
          placeholder="e.g. Sarah M."
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-navy-700 mb-2">Star rating</label>
        <StarPicker value={rating} onChange={(n) => { setRating(n); setState("idle"); }} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-navy-700 mb-1.5">Your review</label>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setState("idle"); }}
          placeholder="Tell others about your experience finding an instructor through CompareTheInstructor..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors text-sm resize-none"
        />
      </div>
      {(state === "error" || err) && (
        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-2">{err}</p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm"
      >
        {state === "loading" ? "Submitting…" : "Submit review"}
      </button>
      <p className="text-xs text-gray-400 text-center">Reviews are moderated before going live.</p>
    </form>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-2xl border border-navy-100 p-6 flex flex-col gap-3">
      <Stars rating={review.rating} />
      <p className="text-gray-700 text-sm leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>
      <p className="text-sm font-semibold text-navy-700">&mdash; {review.name}</p>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews/public");
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  const avgRating = reviews.length >= 3
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="py-20 px-4 bg-navy-50">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Learner reviews
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-4">
            What our learners say
          </h2>

          {/* Average rating badge — only if 3+ reviews */}
          {avgRating && (
            <div className="inline-flex items-center gap-3 bg-white border border-orange-200 rounded-2xl px-6 py-3 shadow-sm mt-2">
              <span className="text-4xl font-black text-navy-700">{avgRating}</span>
              <div>
                <Stars rating={Math.round(Number(avgRating))} size={20} />
                <p className="text-xs text-gray-500 mt-0.5">
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        ) : reviews.length === 0 ? (
          /* No reviews yet */
          <div className="max-w-lg mx-auto text-center mb-10">
            <div className="text-5xl mb-4">&#x2B50;</div>
            <h3 className="text-xl font-bold text-navy-700 mb-2">Be the first to leave a review</h3>
            <p className="text-gray-500 text-sm mb-6">
              Used CompareTheInstructor? We&apos;d love to hear about your experience.
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Write a review
              </button>
            )}
          </div>
        ) : (
          /* Review grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}

        {/* Submit form */}
        {reviews.length > 0 && !showForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Leave a review
            </button>
          </div>
        )}

        {showForm && (
          <div className="max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-navy-700 text-center mb-5">Leave a review</h3>
            <ReviewForm onSubmitted={() => { setShowForm(false); fetchReviews(); }} />
          </div>
        )}
      </div>
    </section>
  );
}
