import { Download, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function CtaBanner({ isAuthenticated, onGetStarted }) {
  return (
    <section className="py-10 sm:py-20 px-4 sm:px-8 bg-white">
      <ScrollReveal className="max-w-5xl mx-auto bg-neutral-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-14 md:p-16 text-center border border-neutral-800 shadow-xl relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3 sm:space-y-4">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand">
            Get Started
          </span>

          <h2 className="text-xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Start remembering what you read.
          </h2>

          <p className="text-neutral-400 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
            Create an account in seconds or install the browser extension to start capturing knowledge immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-2 sm:pt-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-7 sm:py-3.5 rounded-full bg-brand hover:bg-brand-hover text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#download"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs sm:text-sm border border-neutral-800 active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-neutral-400" />
              <span>Get Extension</span>
            </a>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
