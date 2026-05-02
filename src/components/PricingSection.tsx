import Link from "next/link";

function FeatureRow({
  text,
  included,
  dark = false,
}: {
  text: string;
  included: boolean;
  dark?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={dark ? "white" : "#f97316"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d1d5db"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )}
      <span
        className={
          included
            ? dark
              ? "text-white"
              : "text-navy-700"
            : "text-gray-400 line-through"
        }
      >
        {text}
      </span>
    </li>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-4 text-balance">
            Choose your match
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Start free or get a perfect match for just £3.99.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Left — General Match (free) */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4">
              General Match
            </p>
            <div className="mb-6">
              <span className="text-4xl font-black text-navy-700">Free</span>
              <p className="text-gray-400 text-sm mt-1">No card required</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <FeatureRow text="Matched by location" included={true} />
              <FeatureRow text="Manual or automatic preference" included={true} />
              <FeatureRow text="Available instructors in your area" included={true} />
              <FeatureRow text="Confidence level matching" included={false} />
              <FeatureRow text="Availability matching" included={false} />
              <FeatureRow text="Budget filtering" included={false} />
              <FeatureRow text="24-hour response guarantee" included={false} />
            </ul>
            <Link
              href="/free-match"
              className="w-full text-center block border-2 border-navy-700 text-navy-700 font-bold px-6 py-3 rounded-xl hover:bg-navy-50 transition-colors mt-auto"
            >
              Start Free Match
            </Link>
          </div>

          {/* Right — Perfect Match (paid) */}
          <div className="bg-navy-700 border-2 border-navy-700 rounded-2xl p-8 flex flex-col relative">
            {/* Most Popular badge */}
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </span>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
              Perfect Match
            </p>
            <div className="mb-6">
              <span className="text-4xl font-black text-white">£3.99</span>
              <span className="text-base text-white/50"> one-time</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <FeatureRow text="Everything in General Match" included={true} dark={true} />
              <FeatureRow text="Confidence level matching" included={true} dark={true} />
              <FeatureRow text="Availability matching" included={true} dark={true} />
              <FeatureRow text="Budget filtering" included={true} dark={true} />
              <FeatureRow text="24-hour response guarantee" included={true} dark={true} />
              <FeatureRow text="Verified instructors only" included={true} dark={true} />
              <FeatureRow text="Full refund if we can't match you" included={true} dark={true} />
            </ul>
            <a
              href="#get-matched"
              className="w-full text-center block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-orange-500/30 mt-auto"
            >
              Get Perfect Match — £3.99
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
