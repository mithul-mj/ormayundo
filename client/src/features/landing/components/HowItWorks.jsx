import { ArrowRight } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

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
  return (
    <section id="how-it-works" className="py-10 sm:py-20 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            How It Works
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Turn what you read into long-term memory
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
            Four simple steps to remember ideas, facts, and code forever.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {steps.map((s, idx) => (
            <ScrollReveal key={s.num} delay={idx * 75}>
              <ModernCard className="p-4 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-brand-50 text-brand font-mono font-bold text-[10px] sm:text-xs mb-2.5 sm:mb-3">
                    Step {s.num}
                  </span>
                  <h3 className="font-bold text-neutral-950 text-sm sm:text-base mb-1.5 sm:mb-2">{s.title}</h3>
                  <p className="text-neutral-600 text-[11px] sm:text-sm leading-relaxed">{s.desc}</p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-neutral-100 text-[11px] sm:text-xs font-semibold text-neutral-900 flex items-center justify-between">
                  <span className="truncate">{s.tag}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:inline group-hover:translate-x-1 group-hover:text-neutral-900 transition-all duration-200" />
                </div>
              </ModernCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
