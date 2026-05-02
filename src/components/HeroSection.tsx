export default function HeroSection() {
  return (
    <section className="relative bg-navy-700 pt-32 pb-24 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-navy-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
          <span className="text-orange-300 text-sm font-medium">
            Over 1,200 successful matches this year
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-6 text-balance">
          Find Your Perfect{" "}
          <span className="text-orange-400">Driving Instructor</span>
          {" "}— First Time
        </h1>

        <p className="text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto mb-10 text-balance">
          We match you with the best local instructor tailored to your budget,
          experience and availability.{" "}
          <span className="text-white/90 font-medium">
            No guesswork. No wasted lessons.
          </span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#get-matched"
            className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5"
          >
            Find My Instructor — £3.99
          </a>
          <a
            href="#how-it-works"
            className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors"
          >
            See how it works
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>

        {/* Trust mini-row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-white/50 text-sm">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Verified instructors only
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            24-hour match guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Full refund if no match
          </span>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 60L1440 60L1440 0C1200 50 800 60 600 40C400 20 200 0 0 30V60Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
