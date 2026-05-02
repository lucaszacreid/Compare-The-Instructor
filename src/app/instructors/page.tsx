"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface InstructorForm {
  name: string;
  phone: string;
  email: string;
  areasCovered: string;
  yearsExperience: string;
  hourlyRate: string;
}

const initialForm: InstructorForm = {
  name: "",
  phone: "",
  email: "",
  areasCovered: "",
  yearsExperience: "",
  hourlyRate: "",
};

export default function InstructorsPage() {
  const [formData, setFormData] = useState<InstructorForm>(initialForm);
  const [errors, setErrors] = useState<Partial<InstructorForm>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  const updateField = (key: keyof InstructorForm, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<InstructorForm> = {};
    if (!formData.name.trim()) e.name = "Please enter your name";
    if (!formData.phone.trim()) e.phone = "Please enter your phone number";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Please enter a valid email address";
    if (!formData.areasCovered.trim()) e.areasCovered = "Please list the areas you cover";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/instructor-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="bg-navy-700 pt-32 pb-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-300 text-sm font-medium">Join 500+ instructors in our network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Receive Pre-Matched Learner{" "}
              <span className="text-orange-400">Enquiries Direct</span>{" "}
              to Your Phone
            </h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Stop chasing new students. We send you pre-qualified learners who are
              ready to book — matched to your availability, location, and teaching style.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎯",
                  title: "Pre-qualified leads",
                  body: "Every learner has already filled in their preferences and paid — they're serious about starting lessons.",
                },
                {
                  icon: "📍",
                  title: "Local to you",
                  body: "We only match you with learners in the areas you specify. No time wasted on out-of-range enquiries.",
                },
                {
                  icon: "💰",
                  title: "Free to join",
                  body: "Instructors pay nothing to be listed. We make our money from learners, not from you.",
                },
              ].map((b) => (
                <div key={b.title} className="text-center p-6">
                  <div className="text-4xl mb-4">{b.icon}</div>
                  <h3 className="text-navy-700 font-bold text-lg mb-2">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works for instructors */}
        <section className="py-16 px-4 bg-navy-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-navy-700 text-center mb-10">
              How it works for instructors
            </h2>
            <div className="space-y-6">
              {[
                { step: "1", title: "Join our network", body: "Fill in the form below — it takes 2 minutes. We'll review your details and add you to our verified instructor list." },
                { step: "2", title: "We match you with learners", body: "When a learner's preferences match your profile — area, lesson type, availability — we send you their details directly." },
                { step: "3", title: "You make contact", body: "Reach out to the learner, introduce yourself, and arrange lessons. It's that simple — no platform fee on bookings." },
              ].map((item) => (
                <div key={item.step} className="flex gap-5 bg-white rounded-2xl p-6 border border-navy-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-700 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expression of interest form */}
        <section id="join" className="py-16 px-4 bg-white">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-navy-700 mb-3">
                Join Our Instructor Network
              </h2>
              <p className="text-gray-500">
                No payment required. We&apos;ll review your details and be in touch within 48 hours.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-navy-700 mb-2">Expression received!</h3>
                <p className="text-gray-500">
                  Thanks for your interest. We&apos;ll review your details and be in touch within 48 hours.
                </p>
                <Link href="/" className="inline-block mt-6 text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                  ← Back to home
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-3xl shadow-xl shadow-navy-100 border border-navy-100 p-8 space-y-5"
              >
                {[
                  { key: "name" as const, label: "Full name", type: "text", placeholder: "Your full name" },
                  { key: "phone" as const, label: "Phone number", type: "tel", placeholder: "07700 900000" },
                  { key: "email" as const, label: "Email address", type: "email", placeholder: "you@example.com" },
                  { key: "areasCovered" as const, label: "Areas covered", type: "text", placeholder: "e.g. Manchester, Salford, Trafford" },
                  { key: "yearsExperience" as const, label: "Years of experience (optional)", type: "text", placeholder: "e.g. 5" },
                  { key: "hourlyRate" as const, label: "Hourly rate (optional)", type: "text", placeholder: "e.g. £35" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-navy-700 mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={formData[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                      placeholder={placeholder}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
                        errors[key]
                          ? "border-red-400 focus:border-red-400"
                          : "border-gray-200 focus:border-orange-500"
                      }`}
                    />
                    {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
                  </div>
                ))}

                {apiError && (
                  <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{apiError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-lg"
                >
                  {loading ? "Submitting…" : "Join Our Instructor Network"}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  Free to join. No payment required from instructors.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
