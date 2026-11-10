import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

const intervals = [
  {
    rating: 'Forgot',
    time: '<1 min',
    desc: "Review right away so you don't lose the concept.",
    color: 'rose',
    textColor: 'text-rose-600',
  },
  {
    rating: 'Hard',
    time: '2 Days',
    desc: 'Shown again soon to help you master tricky ideas.',
    color: 'orange',
    textColor: 'text-orange-600',
  },
  {
    rating: 'Good',
    time: '6 Days',
    desc: 'Pushed out further as your memory gets stronger.',
    color: 'blue',
    textColor: 'text-blue-600',
  },
  {
    rating: 'Easy',
    time: '8+ Days',
    desc: 'Saved for the long term with extended review gaps.',
    color: 'emerald',
    textColor: 'text-emerald-600',
  },
];

export default function ScienceSection() {
  return (
    <section id="science" className="py-10 sm:py-20 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            The Science
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Why Spaced Repetition Works
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
            Cramming fades within 48 hours. Spaced repetition tests you right before you are about to forget, locking knowledge in permanently.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 text-center">
          {intervals.map((item, idx) => (
            <ScrollReveal key={item.rating} delay={idx * 70}>
              <ModernCard
                accentColor={item.color}
                className="p-4 sm:p-6 flex flex-col justify-between h-full text-center"
              >
                <div>
                  <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block mb-1.5 ${item.textColor}`}>
                    {item.rating}
                  </span>
                  <span className="text-xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
                    {item.time}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500 mt-2.5 sm:mt-3 leading-relaxed">
                  {item.desc}
                </p>
              </ModernCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
