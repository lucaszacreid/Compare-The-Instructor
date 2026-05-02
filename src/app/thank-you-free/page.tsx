import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export default function ThankYouFreePage() {
  return (
    <div className="min-h-screen bg-navy-50">
      <Nav />
      <main className="px-4 py-16 pt-28">
        <div className="max-w-xl mx-auto">
          {/* Success card */}
          <div className="bg-white rounded-3xl shadow-xl p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-navy-700 mb-4">
              You&apos;re on the list! 🎉
            </h1>
            <p className="text-gray-500 leading-relaxed">
              We&apos;re finding available instructors in your area. Expect to hear from us within 48 hours.
            </p>
          </div>

          {/* Upsell card */}
          <div className="bg-navy-700 rounded-3xl p-8 text-white mt-6">
            <p className="text-orange-400 font-semibold text-xs uppercase tracking-widest mb-3">
              Want a better match?
            </p>
            <h2 className="text-2xl font-extrabold mb-4">
              Get your perfect match for £3.99
            </h2>
            <p className="text-white/70 leading-relaxed mb-0">
              For just £3.99 we&apos;ll deep search for the instructor that fits your exact confidence level,
              availability, budget and teaching style — not just your postcode.
            </p>
            <Link
              href="/#get-matched"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 mt-6"
            >
              Upgrade to Perfect Match — £3.99
            </Link>
          </div>

          {/* Back link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-400 hover:text-navy-700 text-sm transition-colors">
              ← Back to CompareTheInstructor.co.uk
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
