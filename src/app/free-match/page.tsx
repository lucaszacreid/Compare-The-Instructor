"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PostcodeAutocomplete from "@/components/PostcodeAutocomplete";

const CONFIDENCE_OPTIONS = [
  { value: "very_nervous",      label: "Very nervous",      emoji: "😰" },
  { value: "somewhat_nervous",  label: "Somewhat nervous",  emoji: "😟" },
  { value: "fairly_confident",  label: "Fairly confident",  emoji: "🙂" },
  { value: "very_confident",    label: "Very confident",    emoji: "😄" },
] as const;

type Confidence = typeof CONFIDENCE_OPTIONS[number]["value"] | "";

interface FieldErrors {
  [key: string]: string;
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 rounded-xl border-2 text-navy-700 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-gray-200 focus:border-orange-500"
  }`;
}

function toggleBtn(active: boolean) {
  return `flex flex-col items-center justify-center gap-1 py-4 rounded-xl border-2 text-sm transition-all ${
    active
      ? "border-orange-500 bg-orange-50 text-orange-700"
      : "border-gray-200 text-gray-600 hover:border-gray-300"
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function FreeMatchPage() {
  const router = useRouter();

  const [fullName, setFullName]   = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [postcode, setPostcode]   = useState("");
  const [lessonType, setLessonType] = useState<"manual" | "automatic" | "">("");
  const [confidence, setConfidence] = useState<Confidence>("");
  const [budget, setBudget] = useState(35);

  const [errors, setErrors]   = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!fullName.trim()) e.fullName = "Please enter your full name";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address";
    if (!phone.trim() || !/^[\d\s+\-()]{10,}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Please enter a valid phone number";
    if (!postcode.trim()) e.postcode = "Please enter your postcode or city";
    if (!lessonType) e.lessonType = "Please choose Manual or Automatic";
    if (!confidence) e.confidence = "Please select your confidence level";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/save-free-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, postcode, lessonType, confidence, budget }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/thank-you-free");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Nav />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
              Free Match
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-4 text-balance">
              Find Your Instructor — Free
            </h1>
            <p className="text-gray-500">
              Tell us the basics and we&apos;ll find available instructors in your area. No payment needed.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-3xl shadow-xl border border-navy-100 p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <Field label="Full name" error={errors.fullName}>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                  placeholder="e.g. Sarah Johnson"
                  className={inputClass(!!errors.fullName)}
                />
              </Field>

              <Field label="Email address" error={errors.email}>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="you@example.com"
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <Field label="Phone number" error={errors.phone}>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                  placeholder="07700 900000"
                  className={inputClass(!!errors.phone)}
                />
              </Field>

              <Field label="Where are you based?" error={errors.postcode}>
                <PostcodeAutocomplete
                  value={postcode}
                  onChange={(v) => { setPostcode(v); setErrors((p) => ({ ...p, postcode: "" })); }}
                  hasError={!!errors.postcode}
                  placeholder="Postcode or city, e.g. M1 1AE or Manchester"
                />
              </Field>

              <Field label="Lesson type" error={errors.lessonType}>
                <div className="grid grid-cols-2 gap-3">
                  {(["manual", "automatic"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setLessonType(type); setErrors((p) => ({ ...p, lessonType: "" })); }}
                      className={toggleBtn(lessonType === type)}
                    >
                      <span className="text-2xl mb-1">{type === "manual" ? "🚗" : "⚙️"}</span>
                      <span className="font-semibold capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Confidence level bar */}
              <Field label="How confident do you feel?" error={errors.confidence}>
                <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 divide-x divide-gray-200">
                  {CONFIDENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setConfidence(opt.value); setErrors((p) => ({ ...p, confidence: "" })); }}
                      className={`flex-1 py-3 px-1 text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        confidence === opt.value
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-500 hover:bg-orange-50"
                      } ${errors.confidence ? "border-red-400" : ""}`}
                    >
                      <span className="text-lg leading-none">{opt.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {confidence && (
                  <p className="text-xs text-orange-600 mt-1.5">
                    {confidence === "very_nervous" || confidence === "somewhat_nervous"
                      ? "Don't worry — we'll match you with an instructor who specialises in nervous learners."
                      : "Great — we'll find an instructor who matches your pace."}
                  </p>
                )}
              </Field>

              {/* Budget slider */}
              <Field label={`Budget per hour: £${budget}`}>
                <div className="px-1">
                  <input
                    type="range"
                    min={20}
                    max={60}
                    step={5}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full"
                    style={{
                      background: `linear-gradient(to right, #f97316 0%, #f97316 ${((budget - 20) / 40) * 100}%, #e5e7eb ${((budget - 20) / 40) * 100}%, #e5e7eb 100%)`,
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>£20/hr</span>
                    <span>£60/hr</span>
                  </div>
                </div>
              </Field>

              {apiError && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{apiError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy-700 hover:bg-navy-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors mt-2"
              >
                {loading ? "Submitting…" : "Find My Instructor — Free"}
              </button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link href="/#pricing" className="text-gray-400 hover:text-navy-700 text-sm transition-colors">
              ← Back to pricing
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
