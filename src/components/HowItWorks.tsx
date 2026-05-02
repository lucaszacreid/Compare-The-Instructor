const steps = [
  {
    number: "01",
    title: "Tell us your needs",
    body: "Fill in your preferences — experience level, availability, budget, lesson type. It takes under 2 minutes.",
    color: "from-orange-500 to-orange-600",
  },
  {
    number: "02",
    title: "We do the matching",
    body: "We search our network of verified, DBS-checked instructors to find the best available match for your specific needs.",
    color: "from-navy-500 to-navy-700",
  },
  {
    number: "03",
    title: "Start your lessons",
    body: "Your matched instructor contacts you directly within 24 hours. No middleman, no faff — just the right person for you.",
    color: "from-orange-500 to-orange-600",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-navy-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-widest mb-3">
            The process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-700 mb-4 text-balance">
            How it works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Three simple steps between you and the perfect instructor.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-10 left-[calc(33.33%-1px)] right-[calc(33.33%-1px)] h-px bg-gradient-to-r from-orange-300 via-navy-200 to-orange-300" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center">
              <div className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg`}>
                <span className="text-white text-3xl font-black">{i + 1}</span>
              </div>
              <h3 className="text-navy-700 text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <a
            href="#get-matched"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5"
          >
            Get Started — £3.99
          </a>
          <p className="mt-3 text-gray-400 text-sm">
            One-time fee. Full refund if we can&apos;t match you.
          </p>
        </div>
      </div>
    </section>
  );
}
