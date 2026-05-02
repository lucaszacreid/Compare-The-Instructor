import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-700/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg hidden sm:block">
            CompareThe<span className="text-orange-400">Instructor</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/instructors"
            className="text-white/70 hover:text-white text-sm font-medium transition-colors hidden sm:block"
          >
            Are you an instructor?
          </Link>
          <a
            href="#get-matched"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Get Matched
          </a>
        </div>
      </div>
    </nav>
  );
}
