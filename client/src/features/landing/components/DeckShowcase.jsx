import { Maximize2, ArrowRight } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

export default function DeckShowcase({ onOpenModal, onGetStarted }) {
  return (
    <section id="showcase-manager" className="py-10 sm:py-20 md:py-24 bg-neutral-50/60 border-y border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            Smart Organization
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Organized Folders &amp; Clean Formatting
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Cards are automatically sorted into topic folders. Comparison tables, code blocks,
            and notes always keep their clean layout.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          {/* Left / Mobile Focus: Decks & Table Details */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-5">
            {/* Part: Decks Selector */}
            <ScrollReveal delay={0}>
              <ModernCard className="p-4 sm:p-6">
                <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Topic Folders
                </span>
                <div className="rounded-xl overflow-hidden border border-neutral-200/60 mb-3 sm:mb-4 bg-neutral-100 p-2 h-32 sm:h-44 flex items-center justify-center">
                  <img
                    src="/images/part-manage-decks.png"
                    alt="Subject deck filter pills"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain cursor-pointer hover:scale-103 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-manage-decks.png')}
                  />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm sm:text-base mb-1">
                  Categorized by Subject
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Cards are automatically grouped into decks like JavaScript, React, Python,
                  System Design, and General so your library stays neat.
                </p>
              </ModernCard>
            </ScrollReveal>

            {/* Part: Rich Card with Table */}
            <ScrollReveal delay={80}>
              <ModernCard className="p-4 sm:p-6">
                <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Rich Formatting
                </span>
                <div className="rounded-xl overflow-hidden border border-neutral-200/60 mb-3 sm:mb-4 bg-neutral-100 p-2 h-32 sm:h-44 flex items-center justify-center">
                  <img
                    src="/images/part-manage-card-table.png"
                    alt="MongoDB index type flashcard table"
                    loading="lazy"
                    className="max-h-full max-w-full object-contain cursor-pointer hover:scale-103 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-manage-card-table.png')}
                  />
                </div>
                <h4 className="font-bold text-neutral-950 text-sm sm:text-base mb-1">
                  Keeps Tables &amp; Code Intact
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Complex notes like comparison tables, code snippets, and structured bullet lists
                  stay formatted and easy to read.
                </p>
              </ModernCard>
            </ScrollReveal>

            {/* Mobile-Only CTA */}
            <div className="lg:hidden text-center pt-1">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline cursor-pointer"
              >
                <span>Browse sample decks in dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Full Manager Screenshot (Desktop View) */}
          <ScrollReveal direction="left" delay={120} className="hidden lg:block lg:col-span-6">
            <ModernCard hover={false} className="p-4 sm:p-6 lg:sticky lg:top-28">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-200/80">
                <span className="text-xs font-bold text-neutral-900">All Your Cards</span>
                <span className="text-[11px] text-neutral-500 font-mono">96 Cards Created</span>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-neutral-200/80 relative group cursor-pointer"
                onClick={() => onOpenModal('/images/dashboard-manage-cards.png')}
              >
                <img
                  src="/images/dashboard-manage-cards.png"
                  alt="Full Flashcard Manager Screenshot"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-neutral-900 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-md flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> Enlarge full manager
                  </span>
                </div>
              </div>
            </ModernCard>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
