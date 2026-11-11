import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ModernCard from './ModernCard';

const steps = [
  {
    num: '01',
    title: 'Install Extension',
    desc: 'Add Ormayundo to your browser in under 30 seconds. Works with Chrome, Brave, Edge & Opera.',
    tag: 'Fast & lightweight',
  },
  {
    num: '02',
    title: 'Highlight Any Text',
    desc: 'Highlight any important sentence, idea, formula, or code snippet while you read on the web.',
    tag: 'Works everywhere',
  },
  {
    num: '03',
    title: 'Click Save',
    desc: 'Click the floating button. AI automatically turns your selection into a smart flashcard.',
    tag: '1-click save',
  },
  {
    num: '04',
    title: 'Review When Due',
    desc: 'Review cards right in your browser tab when they are due, so you remember them permanently.',
    tag: 'Long-term memory',
  },
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const rafIdRef = useRef(null);

  // Smooth, fluid physics-based RAF scroll damping
  useEffect(() => {
    const updateTarget = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalScrollable = rect.height - windowHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      targetProgressRef.current = Math.max(0, Math.min(1, currentScroll / totalScrollable));
    };

    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;

      // Smooth damped interpolation (spring-like ease)
      const diff = targetProgressRef.current - currentProgressRef.current;
      currentProgressRef.current += diff * 0.14;

      const progress = currentProgressRef.current;

      // Sequential progression across steps:
      // 0.00 - 0.23 -> Step 01
      // 0.23 - 0.48 -> Step 02
      // 0.48 - 0.73 -> Step 03
      // 0.73 - 0.94 -> Step 04
      // >= 0.94     -> Flow complete showcase
      if (progress >= 0.94) {
        setAllCompleted(true);
        setActiveStep(3);
      } else {
        setAllCompleted(false);
        const step = Math.min(3, Math.floor(progress / 0.235));
        setActiveStep(step);
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    updateTarget();
    currentProgressRef.current = targetProgressRef.current;
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="relative bg-white w-full"
      style={{ height: '250vh' }}
    >
      {/* Pinned Viewport Container: centered on screen while scrolling through steps */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 w-full py-4 sm:py-8">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-14">
            <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2.5">
              How It Works
            </span>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
              Turn what you read into long-term memory
            </h2>
            <p className="text-neutral-600 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
              Four simple steps to remember ideas, facts, and code forever.
            </p>
          </div>

          {/* Cards Grid: Sequentially illuminated by smooth scroll physics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {steps.map((s, idx) => {
              const isCurrent = activeStep === idx;
              const isPast = activeStep > idx;

              return (
                <div
                  key={s.num}
                  className="h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                  style={{
                    transform: isCurrent
                      ? 'translateY(-12px) scale(1.02)'
                      : allCompleted
                      ? 'translateY(-4px)'
                      : 'translateY(0px)',
                  }}
                >
                  <ModernCard
                    hover={false}
                    className={`p-4 sm:p-6 flex flex-col justify-between h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden select-none will-change-[box-shadow,border-color,background] ${
                      isCurrent
                        ? 'border-brand/50 ring-2 ring-brand/20 shadow-[0_22px_44px_rgba(255,90,95,0.16),0_6px_16px_rgba(0,0,0,0.04)] bg-gradient-to-b from-brand-50/30 via-white to-white'
                        : isPast || allCompleted
                        ? 'border-brand/25 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-white'
                        : 'border-neutral-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.02)] bg-neutral-50/40 opacity-60 sm:opacity-70'
                    }`}
                  >
                    {/* Glowing hairline sheen on active */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-x-0 top-0 transition-all duration-700 ${
                        isCurrent
                          ? 'h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent opacity-100'
                          : isPast || allCompleted
                          ? 'h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-60'
                          : 'h-px bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent opacity-30'
                      }`}
                    />

                    <div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono font-bold text-[10px] sm:text-xs mb-2.5 sm:mb-3 transition-all duration-500 ${
                          isCurrent
                            ? 'bg-brand text-white shadow-xs scale-105'
                            : isPast || allCompleted
                            ? 'bg-brand-50 text-brand scale-100'
                            : 'bg-neutral-100 text-neutral-400 scale-100'
                        }`}
                      >
                        Step {s.num}
                      </span>

                      <h3
                        className={`font-bold text-sm sm:text-base mb-1.5 sm:mb-2 transition-colors duration-500 ${
                          isCurrent
                            ? 'text-neutral-950 font-extrabold'
                            : isPast || allCompleted
                            ? 'text-neutral-900'
                            : 'text-neutral-500'
                        }`}
                      >
                        {s.title}
                      </h3>

                      <p
                        className={`text-[11px] sm:text-sm leading-relaxed transition-colors duration-500 ${
                          isCurrent || isPast || allCompleted
                            ? 'text-neutral-600'
                            : 'text-neutral-400'
                        }`}
                      >
                        {s.desc}
                      </p>
                    </div>

                    <div
                      className={`mt-4 sm:mt-6 pt-3 sm:pt-4 border-t text-[11px] sm:text-xs font-semibold flex items-center justify-between transition-colors duration-500 ${
                        isCurrent
                          ? 'border-brand/30 text-neutral-950'
                          : isPast || allCompleted
                          ? 'border-neutral-200 text-neutral-800'
                          : 'border-neutral-100 text-neutral-400'
                      }`}
                    >
                      <span className="truncate">{s.tag}</span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 shrink-0 hidden sm:inline transition-all duration-500 ${
                          isCurrent
                            ? 'translate-x-1.5 text-brand'
                            : isPast || allCompleted
                            ? 'translate-x-0.5 text-brand/70'
                            : 'translate-x-0 text-neutral-300'
                        }`}
                      />
                    </div>
                  </ModernCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
