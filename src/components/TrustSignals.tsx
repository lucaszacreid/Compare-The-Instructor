const badges = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Verified Instructors Only",
    body: "Every instructor in our network is DBS-checked, DVSA-approved, and reviewed by our team before being listed.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "24-Hour Matching Promise",
    body: "Your matched instructor will reach out within 24 hours of your submission — or you get a full refund, no questions asked.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "100% Satisfaction Guarantee",
    body: "If we can't find you a match, we refund your £3.99 in full. No commitment, no pressure, no risk to you.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "No Commitment",
    body: "After your match you're free to choose to proceed — or not. We simply introduce you to the right person.",
  },
];

export default function TrustSignals() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Our promise to you
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 text-balance">
            Why learners choose CompareTheInstructor
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-navy-50 border border-navy-100 hover:border-orange-200 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4">
                {badge.icon}
              </div>
              <h3 className="font-bold text-navy-700 mb-2">{badge.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{badge.body}</p>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-14 bg-navy-700 rounded-2xl p-8 text-center">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
            <div>
              <div className="text-4xl font-black text-orange-400">Free</div>
              <div className="text-white/60 text-sm mt-1">General match — no card needed</div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div>
              <div className="text-4xl font-black text-white">£3.99</div>
              <div className="text-white/60 text-sm mt-1">One-time perfect match fee</div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div>
              <div className="text-4xl font-black text-orange-400">24hr</div>
              <div className="text-white/60 text-sm mt-1">Response guarantee</div>
            </div>
            <div className="hidden sm:block w-px bg-white/10" />
            <div>
              <div className="text-4xl font-black text-white">100%</div>
              <div className="text-white/60 text-sm mt-1">Refund if we can&apos;t match you</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
