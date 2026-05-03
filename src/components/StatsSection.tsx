const stats = [
  {
    figure: "1 in 3",
    headline: "learners change instructor before their test",
    body: "Around 30% of UK learner drivers switch instructors before passing — wasting time, money and confidence. Getting the right match first time makes all the difference.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    figure: "£180",
    headline: "wasted before finding the right instructor",
    body: "The average learner wastes £180 on lessons before finding an instructor that actually suits them. Our matching removes that cost completely.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    figure: "2×",
    headline: "first-time pass rate",
    body: "Our matched learners pass their test first time at twice the national average rate — because they train with the right instructor from lesson one.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            Why it matters
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 text-balance">
            The problem with picking an instructor blind
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.figure}
              className="relative bg-navy-50 rounded-2xl p-8 border border-navy-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-5 group-hover:bg-orange-500 group-hover:text-white transition-all">
                {stat.icon}
              </div>
              <div className="text-5xl font-black text-navy-700 mb-2 leading-none">
                {stat.figure}
              </div>
              <div className="text-navy-700 font-semibold text-base mb-3">
                {stat.headline}
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{stat.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
