import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 md:pt-36 md:pb-24 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Subtitle, CTAs & Features */}
          <div className="lg:col-span-6 xl:col-span-6 text-center lg:text-left">
            {/* High-Level Professional Modern Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-neutral-950 leading-[1.12] mb-4 sm:mb-6">
              <span className="inline-block">Remember everything</span>{' '}
              <br className="hidden sm:inline" />
              <span className="inline-block">
                you <span className="text-brand">read on the web.</span>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-neutral-600 font-normal leading-relaxed mb-8 sm:mb-10">
              Highlight any sentence or code block on any website to create smart active-recall
              flashcards, automatically scheduled for review when you need them.
            </p>

            {/* Clean, Simple CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8 sm:mb-10">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-neutral-950 hover:bg-black text-white font-semibold text-sm shadow-md hover:shadow-lg shadow-neutral-950/10 active:scale-95 transition-all cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#download"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-neutral-900 font-semibold text-sm border border-neutral-200/90 shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <span>Get Extension</span>
              </a>
            </div>

            {/* Guarantees & Features */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2 text-xs font-medium text-neutral-600 pt-5 sm:pt-6 border-t border-neutral-100 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-neutral-900 font-medium">Free Extension</span>
              </div>
              <span className="text-neutral-300 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Spaced Repetition</span>
              </div>
              <span className="text-neutral-300 hidden sm:inline">·</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% Private</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Hero Mockup Visual */}
          <div className="lg:col-span-6 xl:col-span-6 relative mt-4 lg:mt-0 flex items-center justify-center select-none">
            {/* Subtle ambient back-light bloom */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-gradient-to-tr from-rose-100/50 via-brand/10 to-amber-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

            <div className="relative w-full max-w-lg lg:max-w-none">
              <img
                src="/images/hero-illustration.png"
                alt="Highlighting text on the web and converting it directly into active recall flashcards"
                className="w-full h-auto object-contain mx-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] pointer-events-none"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
