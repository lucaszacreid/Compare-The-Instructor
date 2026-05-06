"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Form {
  name: string;
  email: string;
  phone: string;
  location: string;
  areasCovered: string;
  yearsExperience: string;
  adiNumber: string;
}

const empty: Form = { name: "", email: "", phone: "", location: "", areasCovered: "", yearsExperience: "", adiNumber: "" };

export default function InstructorRegisterPage() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [apiError, setApiError] = useState("");

  const set = (k: keyof Form, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.location.trim()) e.location = "Required";
    if (!form.areasCovered.trim()) e.areasCovered = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setState("loading");
    setApiError("");
    try {
      const res = await fetch("/api/instructor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setState("done"); }
      else { setApiError(data.error ?? `Error ${res.status}`); setState("error"); }
    } catch {
      setApiError("Network error. Please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <>
        <Nav />
        <main className="min-h-screen bg-navy-50 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-navy-100 p-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy-700 mb-3">Application received!</h2>
            <p className="text-gray-500 mb-6">
              We&apos;ll review your details and email you within 48 hours. Once approved, you&apos;ll receive a link to access your instructor hub.
            </p>
            <Link href="/" className="text-orange-500 hover:text-orange-600 font-semibold">← Back to home</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const field = (key: keyof Form, label: string, type = "text", placeholder = "") => (
    <div key={key}>
      <label className="block text-sm font-semibold text-navy-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${
          errors[key] ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-orange-500"
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <Nav />
      <main>
        <section className="bg-navy-700 pt-32 pb-20 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-orange-300 text-sm font-medium">Join the instructor hub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Apply to Join the <span className="text-orange-400">Instructor Hub</span>
            </h1>
            <p className="text-white/70 text-lg mb-6">
              Get access to pre-matched learner leads in your area. We review every application within 48 hours.
            </p>
            <p className="text-white/50 text-sm">
              Already approved?{" "}
              <Link href="/instructor/login" className="text-orange-400 hover:text-orange-300 underline">
                Log in to your hub →
              </Link>
            </p>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-navy-100 border border-navy-100 p-8 space-y-5">
              {field("name", "Full name", "text", "Your full name")}
              {field("email", "Email address", "email", "you@example.com")}
              {field("phone", "Phone number", "tel", "07700 900000")}
              {field("location", "Your base location / postcode", "text", "e.g. Manchester M1")}
              {field("areasCovered", "Areas you cover", "text", "e.g. Manchester, Salford, Trafford")}
              {field("yearsExperience", "Years of experience (optional)", "text", "e.g. 5")}
              {field("adiNumber", "ADI number (optional)", "text", "Your ADI registration number")}

              {(state === "error" || apiError) && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{apiError}</p>
              )}

              <button
                type="submit"
                disabled={state === "loading"}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 text-lg"
              >
                {state === "loading" ? "Submitting…" : "Submit Application"}
              </button>
              <p className="text-center text-gray-400 text-xs">
                Your application will be reviewed within 48 hours. Free to join.
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
