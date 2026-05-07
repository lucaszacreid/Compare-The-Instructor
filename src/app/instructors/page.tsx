"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface InstructorForm {
  name: string;
  phone: string;
  email: string;
  location: string;
  areasCovered: string;
  yearsExperience: string;
  adiNumber: string;
}

const initialForm: InstructorForm = {
  name: "",
  phone: "",
  email: "",
  location: "",
  areasCovered: "",
  yearsExperience: "",
  adiNumber: "",
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
    if (!formData.location.trim()) e.location = "Please enter your base location or postcode";
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
      const res = await fetch("/api/instructor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setApiError(data.error ?? "Something went wrong. Please try again.");
      }
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
              <span className="text-orange-300 text-sm font-medium">Join our instructor network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Receive Pre-Matched Learner{" "}
              <span className="text-orange-400">Enquiries Direct</span>{" "}
              to Your Phone
            </h1>
            <p className="text-white/75 text-lg max-w-2xl mx-auto">
              Stop chasing new students. We send you pre-qualified learners who are
              ready to book &mdash; matched to your availability, location, and teaching style.
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
                  body: "Every learner has already filled in their preferences — they're serious about starting lessons.",
                },
                {
                  icon: "📍",
                  title: "Local to you",
                  body: "We only match you with learners in the areas you specify. No time wasted on out-of-range enquiries.",
                },
                {
                  icon: "💰",
                  title: "Free to apply",
                  body: "Applying to join the network is free. You only pay a small fee when you choose to purchase a lead.",
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
                { step: "1", title: "Apply to join", body: "Fill in the form below. We review every application within 48 hours and will email you once approved." },
                { step: "2", title: "Browse available leads", body: "Log in to your personal instructor hub and see anonymised learner leads matched to your area — no personal details until you purchase." },
                { step: "3", title: "Request and purchase", body: "Request any lead you like. We set a price, you pay, and we immediately send you the learner&apos;s full contact details." },
              ].map((item) => (
                <div key={item.step} className="flex gap-5 bg-white rounded-2xl p-6 border border-navy-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-700 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.body }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sign-up form */}
        <section id="join" className="py-16 px-4 bg-white">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-navy-700 mb-3">
                Apply to Join the Instructor Hub
              </h2>
              <p className="text-gray-500">
                We&apos;ll review your application and email you within 48 hours.
                Your login details arrive with your approval email.
              </p>
            </div>

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-navy-700 mb-2">Application received!</h3>
                <p className="text-gray-500 mb-2">
                  Thanks for applying. We&apos;ll review your details and email you within 48 hours.
                </p>
                <p className="text-gray-400 text-sm">
                  Your access code and login link will be in the approval email &mdash; keep an eye on your inbox.
                </p>
                <Link href="/" className="inline-block mt-6 text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                  &larr; Back to home
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
                  { key: "location" as const, label: "Your base location / postcode", type: "text", placeholder: "e.g. Manchester M1" },
                  { key: "areasCovered" as const, label: "Areas covered", type: "text", placeholder: "e.g. Manchester, Salford, Trafford" },
                  { key: "yearsExperience" as const, label: "Years of experience (optional)", type: "text", placeholder: "e.g. 5" },
                  { key: "adiNumber" as const, label: "ADI number (optional)", type: "text", placeholder: "Your ADI registration number" },
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
                  {loading ? "Submitting…" : "Apply to Join the Network"}
                </button>

                <p className="text-center text-gray-400 text-xs">
                  Free to apply. Your login details will be emailed to you once approved.
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
