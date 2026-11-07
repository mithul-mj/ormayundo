export default function ScienceSection() {
  return (
    <section id="science" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            Cognitive Science
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            SuperMemo SM-2 Spaced Repetition
          </h2>
          <p className="text-muted max-w-lg mx-auto text-sm sm:text-base">
            Rote cramming fades in 48 hours. Spaced repetition recalculates the exact interval before
            memory decay occurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="p-6 rounded-3xl bg-surface border border-divider">
            <span className="text-[11px] font-bold text-brand uppercase tracking-wider block mb-1">
              Forgot
            </span>
            <span className="text-3xl font-extrabold text-ink">&lt;1 min</span>
            <p className="text-xs text-muted mt-2">
              Re-enters learning queue immediately to reset synaptic recall.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-divider">
            <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider block mb-1">
              Hard
            </span>
            <span className="text-3xl font-extrabold text-ink">2 Days</span>
            <p className="text-xs text-muted mt-2">
              Conservative interval progression (~1.2x) for difficult cards.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-divider">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block mb-1">
              Good
            </span>
            <span className="text-3xl font-extrabold text-ink">6 Days</span>
            <p className="text-xs text-muted mt-2">
              Standard SM-2 progression based on your card's Easiness Factor.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-surface border border-divider">
            <span className="text-[11px] font-bold text-success uppercase tracking-wider block mb-1">
              Easy
            </span>
            <span className="text-3xl font-extrabold text-ink">8 Days</span>
            <p className="text-xs text-muted mt-2">
              Applies a 1.3x Easy Bonus and elevates long-term card strength.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
