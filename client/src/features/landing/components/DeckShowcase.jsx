import { Maximize2 } from 'lucide-react';

export default function DeckShowcase({ onOpenModal, onGetStarted }) {
  return (
    <section id="showcase-manager" className="py-20 bg-surface border-y border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            Flashcard Knowledge Base
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            Multi-Deck Organization & Structured Tables
          </h2>
          <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
            Organize cards by technical subject. Tables, code syntax, and multi-field data are
            parsed cleanly without breaking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Decks & Table Details */}
          <div className="lg:col-span-6 space-y-6">
            {/* Part: Decks Selector */}
            <div className="bg-white p-6 rounded-3xl border border-border-card shadow-sm">
              <span className={
      [
        'text-[10px] font-bold uppercase tracking-wider text-ink bg-surface px-2.5',
        'py-1 rounded-full border border-divider inline-block mb-3'
      ].join(' ')
    }>
                Automatic Tagging
              </span>
              <div className="rounded-2xl overflow-hidden border border-divider mb-4 bg-gray-50">
                <img
                  src="/images/part-manage-decks.png"
                  alt="Subject deck filter pills"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => onOpenModal('/images/part-manage-decks.png')}
                />
              </div>
              <h4 className="font-extrabold text-base text-ink mb-1">
                Categorized Subject Decks
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Automatic deck categorization organizes cards into decks: Nodejs & express,
                javascript, noSql, dsa, sql, and wikipedia.
              </p>
            </div>

            {/* Part: Rich Card with Table */}
            <div className="bg-white p-6 rounded-3xl border border-border-card shadow-sm">
              <span className={
      [
        'text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10',
        'px-2.5 py-1 rounded-full inline-block mb-3'
      ].join(' ')
    }>
                Table & Markdown Support
              </span>
              <div className="rounded-2xl overflow-hidden border border-divider mb-4 bg-gray-50">
                <img
                  src="/images/part-manage-card-table.png"
                  alt="MongoDB index type flashcard table"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => onOpenModal('/images/part-manage-card-table.png')}
                />
              </div>
              <h4 className="font-extrabold text-base text-ink mb-1">
                Preserves Tables, Code & Structure
              </h4>
              <p className="text-xs text-muted leading-relaxed">
                Technical cards retain table comparisons (such as MongoDB Single Field, Compound,
                Multikey, and Text indexes) for crystal-clear revision.
              </p>
            </div>
          </div>

          {/* Right: Full Manager Screenshot */}
          <div className="lg:col-span-6">
            <div className={
      [
        'bg-white p-4 sm:p-6 rounded-3xl border border-border-card',
        'shadow-[0_10px_30px_rgba(0,0,0,0.06)] sticky top-28'
      ].join(' ')
    }>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-divider">
                <span className="text-xs font-bold text-ink">Full Flashcard Manager</span>
                <span className="text-[11px] text-muted font-mono">96 Total Flashcards</span>
              </div>

              <div
                className="rounded-2xl overflow-hidden border border-divider relative group cursor-pointer"
                onClick={() => onOpenModal('/images/dashboard-manage-cards.png')}
              >
                <img
                  src="/images/dashboard-manage-cards.png"
                  alt="Full Flashcard Manager Screenshot"
                  className="w-full h-auto object-cover"
                />
                <div className={
      [
        'absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100',
        'transition-opacity flex items-center justify-center'
      ].join(' ')
    }>
                  <span className={
      [
        'bg-white text-ink px-4 py-2 rounded-full font-bold text-xs shadow-lg flex',
        'items-center gap-1.5'
      ].join(' ')
    }>
                    <Maximize2 className="w-3.5 h-3.5" /> Enlarge full manager
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-divider flex items-center justify-between text-xs text-muted">
                <span>Filter by deck, search by concept, or wipe all with 1 click.</span>
                <button
                  onClick={onGetStarted}
                  className="font-bold text-brand hover:underline cursor-pointer"
                >
                  Try it live →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
