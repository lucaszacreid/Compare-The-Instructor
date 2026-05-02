"use client";

import { useState, useRef, useEffect } from "react";
import { FormData } from "@/types";

const AVAILABILITY_OPTIONS = [
  { value: "weekday_mornings", label: "Weekday Mornings" },
  { value: "weekday_afternoons", label: "Weekday Afternoons" },
  { value: "weekday_evenings", label: "Weekday Evenings" },
  { value: "weekend_mornings", label: "Weekend Mornings" },
  { value: "weekend_afternoons", label: "Weekend Afternoons" },
];

const EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Complete beginner", sub: "Never sat behind the wheel" },
  { value: "some", label: "Some experience", sub: "Under 10 hours of lessons" },
  { value: "moderate", label: "Moderate experience", sub: "10–30 hours of lessons" },
  { value: "ready", label: "Nearly test ready", sub: "30+ hours — just need a polish" },
];

const CONFIDENCE_OPTIONS = [
  { value: "very_nervous", label: "Very nervous", sub: "I need extra patience and support", highlight: true },
  { value: "somewhat_nervous", label: "Somewhat nervous", sub: "A bit anxious but ready to try", highlight: true },
  { value: "fairly_confident", label: "Fairly confident", sub: "Ready to get started", highlight: false },
  { value: "very_confident", label: "Very confident", sub: "Can't wait to get going", highlight: false },
];

const initialFormData: FormData = {
  fullName: "",
  email: "",
  phone: "",
  postcode: "",
  lessonType: "",
  experience: "",
  confidence: "",
  duration: "",
  availability: [],
  budget: 35,
  startTime: "",
};

interface FieldErrors {
  [key: string]: string;
}

export default function MatchingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const totalSteps = 3;

  // Refs for scroll-to-top and abandonment tracking
  const formCardRef = useRef<HTMLDivElement>(null);
  const leadIdRef = useRef<string>("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    leadIdRef.current = crypto.randomUUID();
  }, []);

  // Scroll to top of form card whenever step changes
  useEffect(() => {
    if (!formCardRef.current) return;
    const top = formCardRef.current.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, [step]);

  // ── Abandonment tracking ───────────────────────────────────────────────────

  const saveAbandonedNow = (data: FormData, atStep: number) => {
    if (!leadIdRef.current || !data.email.includes("@")) return;
    fetch("/api/save-abandoned", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadIdRef.current, abandonedAtStep: atStep, ...data }),
    }).catch(() => {});
  };

  const scheduleSaveAbandoned = (data: FormData, atStep: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveAbandonedNow(data, atStep), 1500);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    const next = { ...formData, [key]: value };
    setFormData(next);
    setErrors((prev) => ({ ...prev, [key]: "" }));
    if ((key === "fullName" || key === "email" || key === "phone") && next.email.includes("@")) {
      scheduleSaveAbandoned(next, step);
    }
  };

  const toggleAvailability = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.includes(value)
        ? prev.availability.filter((v) => v !== value)
        : [...prev.availability, value],
    }));
    setErrors((prev) => ({ ...prev, availability: "" }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: FieldErrors = {};
    if (!formData.fullName.trim()) e.fullName = "Please enter your full name";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Please enter a valid email address";
    if (!formData.phone.trim() || !/^[\d\s\+\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, "")))
      e.phone = "Please enter a valid phone number";
    if (!formData.postcode.trim()) e.postcode = "Please enter your postcode or city";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: FieldErrors = {};
    if (!formData.lessonType) e.lessonType = "Please choose Manual or Automatic";
    if (!formData.experience) e.experience = "Please select your experience level";
    if (!formData.confidence) e.confidence = "Please select your confidence level";
    if (!formData.duration) e.duration = "Please choose a lesson duration";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: FieldErrors = {};
    if (formData.availability.length === 0)
      e.availability = "Please select at least one availability slot";
    if (!formData.startTime) e.startTime = "Please select when you want to start";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ─────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      saveAbandonedNow(formData, 2);
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      saveAbandonedNow(formData, 3);
      setStep(3);
    }
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, leadId: leadIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const progressPct = Math.round((step / totalSteps) * 100);

  return (
    <section id="get-matched" className="py-20 px-4 bg-navy-50">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Start here
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-3">
            Get Matched Now
          </h2>
          <p className="text-gray-500">Takes 2 minutes — we&apos;ll do the rest.</p>
        </div>

        {/* Scroll target — 80px offset handled by scrollTo in useEffect */}
        <div
          ref={formCardRef}
          className="bg-white rounded-3xl shadow-xl shadow-navy-100 border border-navy-100 overflow-hidden"
        >
          {/* Progress bar */}
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-navy-700 font-semibold text-sm">
                Step {step} of {totalSteps}
              </span>
              <span className="text-gray-400 text-sm">{progressPct}% complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="p-8">
            {step === 1 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-navy-700 mb-6">About You</h3>
                <div className="space-y-4">
                  <Field label="Full name" error={errors.fullName}>
                    <input
                      type="text"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="e.g. Sarah Johnson"
                      className={inputClass(!!errors.fullName)}
                    />
                  </Field>

                  <Field label="Email address" error={errors.email}>
                    <input
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass(!!errors.email)}
                    />
                  </Field>

                  <Field label="Phone number" error={errors.phone}>
                    <input
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="07700 900000"
                      className={inputClass(!!errors.phone)}
                    />
                  </Field>

                  <Field label="Where are you based?" error={errors.postcode}>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      value={formData.postcode}
                      onChange={(e) => updateField("postcode", e.target.value)}
                      placeholder="Postcode or city, e.g. M1 1AE or Manchester"
                      className={inputClass(!!errors.postcode)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-navy-700 mb-6">Your Preferences</h3>
                <div className="space-y-6">
                  <Field label="Lesson type" error={errors.lessonType}>
                    <div className="grid grid-cols-2 gap-3">
                      {(["manual", "automatic"] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateField("lessonType", type)}
                          className={toggleBtn(formData.lessonType === type)}
                        >
                          <span className="text-2xl mb-1">{type === "manual" ? "🚗" : "⚙️"}</span>
                          <span className="font-semibold capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Current experience level" error={errors.experience}>
                    <div className="space-y-2">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <RadioCard
                          key={opt.value}
                          label={opt.label}
                          sub={opt.sub}
                          selected={formData.experience === opt.value}
                          onClick={() => updateField("experience", opt.value as FormData["experience"])}
                        />
                      ))}
                    </div>
                  </Field>

                  <Field label="How confident do you feel about getting started?" error={errors.confidence}>
                    <div className="space-y-2">
                      {CONFIDENCE_OPTIONS.map((opt) => (
                        <div key={opt.value}>
                          <RadioCard
                            label={opt.label}
                            sub={opt.sub}
                            selected={formData.confidence === opt.value}
                            onClick={() => updateField("confidence", opt.value as FormData["confidence"])}
                          />
                          {opt.highlight && (
                            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-1.5 mt-1 ml-1">
                              Don&apos;t worry — we&apos;ll match you with an instructor who specialises in nervous learners.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Field>

                  <Field label="Preferred lesson duration" error={errors.duration}>
                    <div className="grid grid-cols-3 gap-3">
                      {(["1", "1.5", "2"] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => updateField("duration", d)}
                          className={toggleBtn(formData.duration === d)}
                        >
                          <span className="font-bold text-lg">{d}</span>
                          <span className="text-xs">hour{parseFloat(d) !== 1 ? "s" : ""}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-navy-700 mb-6">Logistics &amp; Payment</h3>
                <div className="space-y-6">
                  <Field label="When are you available for lessons?" error={errors.availability}>
                    <div className="space-y-2">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleAvailability(opt.value)}
                          className={checkboxCard(formData.availability.includes(opt.value))}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            formData.availability.includes(opt.value)
                              ? "bg-orange-500 border-orange-500"
                              : "border-gray-300"
                          }`}>
                            {formData.availability.includes(opt.value) && (
                              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium text-navy-700 text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label={`Budget per hour: £${formData.budget}`}>
                    <div className="px-1">
                      <input
                        type="range"
                        min={20}
                        max={60}
                        step={5}
                        value={formData.budget}
                        onChange={(e) => updateField("budget", Number(e.target.value))}
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, #f97316 0%, #f97316 ${((formData.budget - 20) / 40) * 100}%, #e5e7eb ${((formData.budget - 20) / 40) * 100}%, #e5e7eb 100%)`,
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>£20/hr</span>
                        <span>£60/hr</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="How soon do you want to start?" error={errors.startTime}>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { value: "asap", label: "ASAP" },
                        { value: "two_weeks", label: "Within 2 weeks" },
                        { value: "month", label: "Within a month" },
                        { value: "exploring", label: "Just exploring" },
                      ] as const).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateField("startTime", opt.value)}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                            formData.startTime === opt.value
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Fee box */}
                  <div className="bg-navy-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-lg">One-time matching fee</span>
                      <span className="text-3xl font-black text-orange-400">£3.99</span>
                    </div>
                    <ul className="space-y-2 text-sm text-white/80">
                      {[
                        "Personalised instructor match",
                        "24-hour response guarantee",
                        "Verified instructors only",
                        "Full refund if we can't match you",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Error shown outside space-y-6 for explicit breathing room */}
                {apiError && (
                  <p className="mt-6 text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">
                    {apiError}
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            {step === 3 ? (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 text-gray-500 hover:text-navy-700 font-medium transition-colors py-2 order-2 sm:order-1"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full sm:w-auto order-1 sm:order-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/30 text-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.3" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      Find My Instructor — £3.99
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className={`mt-8 flex ${step > 1 ? "justify-between" : "justify-end"} items-center`}>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-navy-700 font-medium transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-navy-700 hover:bg-navy-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all"
                >
                  Next
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-4">
          Secured by Stripe. Your card details are never stored on our servers.
        </p>
      </div>
    </section>
  );
}

// ── Small helper components ──────────────────────────────────────────────────

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

function RadioCard({
  label,
  sub,
  selected,
  onClick,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
        selected
          ? "border-orange-500 bg-orange-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          selected ? "border-orange-500" : "border-gray-300"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
      </div>
      <div>
        <div className={`font-semibold text-sm ${selected ? "text-orange-700" : "text-navy-700"}`}>
          {label}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
      </div>
    </button>
  );
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

function checkboxCard(checked: boolean) {
  return `w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
    checked
      ? "border-orange-500 bg-orange-50"
      : "border-gray-200 hover:border-gray-300"
  }`;
}
