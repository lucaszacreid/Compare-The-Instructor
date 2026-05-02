import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white/60 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span className="text-white font-bold text-base">
                CompareThe<span className="text-orange-400">Instructor</span>
              </span>
            </div>
            <p className="text-sm max-w-xs">
              We find you the best driving instructor tailored to your needs and budget — so you don&apos;t have to.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/instructors" className="hover:text-white transition-colors">
              For Instructors
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <a href="mailto:hello@comparetheinstructor.co.uk" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} CompareTheInstructor. All rights reserved.</p>
          <p>Helping learners find the right instructor since 2024.</p>
        </div>
      </div>
    </footer>
  );
}
