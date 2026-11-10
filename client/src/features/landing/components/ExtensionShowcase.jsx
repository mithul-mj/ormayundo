import { ArrowRight, Maximize2 } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

export default function ExtensionShowcase({ onOpenModal }) {
  return (
    <section id="showcase-extension" className="py-10 sm:py-20 md:py-24 bg-neutral-50/60 border-y border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            Browser Extension
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Capture knowledge without breaking concentration
          </h2>
          <p className="text-neutral-600 max-w-xl mx-auto text-xs sm:text-base leading-relaxed">
            Highlight any sentence on the web to trigger the floating button, then review
            smart flashcards directly in your browser.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
          {/* Left / Mobile Focus: Two High-Resolution Detail Cards */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            {/* Part 1: Highlight + Save Button */}
            <ScrollReveal delay={0}>
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Step 1 · Highlight Text
                  </span>
                  <span className="text-[11px] sm:text-xs text-neutral-400 font-mono">Any webpage</span>
                </div>

                <div className="rounded-xl overflow-hidden mb-3.5 bg-neutral-100 border border-neutral-200/60 p-1">
                  <img
                    src="/images/part-save-button.png"
                    alt="Highlighted text with Save to Ormayundo floating button"
                    loading="lazy"
                    className="w-full h-auto object-contain cursor-pointer hover:scale-102 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-save-button.png')}
                  />
                </div>

                <h3 className="font-bold text-sm sm:text-base text-neutral-950 mb-1">
                  1-Click Save Button
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Select any sentence on any webpage. A floating red button appears right at your cursor
                  so you can turn it into a flashcard instantly.
                </p>
              </ModernCard>
            </ScrollReveal>

            {/* Part 2: Extension Popup & Question */}
            <ScrollReveal delay={80}>
              <ModernCard className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Step 2 · Review in Tab
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-brand">94 Due Today</span>
                </div>

                <div className="rounded-xl overflow-hidden mb-3.5 bg-neutral-100 border border-neutral-200/60 p-1">
                  <img
                    src="/images/part-extension-popup.png"
                    alt="Extension popup with Active Recall question card"
                    loading="lazy"
                    className="w-full h-auto object-contain cursor-pointer hover:scale-102 transition-transform duration-200"
                    onClick={() => onOpenModal('/images/part-extension-popup.png')}
                  />
                </div>

                <h3 className="font-bold text-sm sm:text-base text-neutral-950 mb-1">
                  Quick Review in Any Tab
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Review your flashcards without leaving what you are doing. The extension popup lets you
                  test yourself and rate how well you remembered.
                </p>
              </ModernCard>
            </ScrollReveal>

            {/* Mobile-Only Quick Link */}
            <div className="lg:hidden text-center pt-1">
              <a
                href="#download"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
              >
                <span>Download free Chrome extension</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right: Full Extension in Action Screenshot (Desktop View) */}
          <ScrollReveal direction="left" delay={120} className="hidden lg:block lg:col-span-7">
            <ModernCard hover={false} className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-neutral-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-neutral-900">See It in Action</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono truncate max-w-full">
                  en.wikipedia.org/wiki/Steve_Jobs
                </span>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-neutral-200/80 relative group cursor-pointer"
                onClick={() => onOpenModal('/images/extension-in-action.jpg')}
              >
                <img
                  src="/images/extension-in-action.jpg"
                  alt="Steve Jobs Wikipedia page with Ormayundo floating button and extension popup in action"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-neutral-900 px-3.5 py-1.5 rounded-full font-semibold text-xs shadow-md flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> View full resolution
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
