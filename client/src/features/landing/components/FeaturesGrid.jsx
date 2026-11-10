import { BookOpen, Tag, BarChart3, Layers, Flame, ShieldCheck } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

const features = [
  {
    icon: BookOpen,
    title: 'Smart Question Generation',
    desc: 'Instead of passive re-reading, Ormayundo creates questions that challenge your recall and deepen understanding.',
  },
  {
    icon: Tag,
    title: 'Automatic Topic Folders',
    desc: 'Cards are automatically organized into folders by subject so your library stays neat without manual work.',
  },
  {
    icon: BarChart3,
    title: 'Visual Progress Charts',
    desc: 'See your daily study streaks, retention score, and upcoming reviews with simple, encouraging graphs.',
  },
  {
    icon: Layers,
    title: 'Clean Formatting',
    desc: 'Code snippets, bullet points, and tables keep their exact format so complex notes stay readable.',
  },
  {
    icon: Flame,
    title: 'Daily Study Streaks',
    desc: 'Build a rewarding daily habit with streak milestones, study celebrations, and confetti rewards.',
  },
  {
    icon: ShieldCheck,
    title: '100% Private & Safe',
    desc: 'We never monitor or track your browsing. Only the text you intentionally highlight and save is stored.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-10 sm:py-20 md:py-24 bg-neutral-50/60 border-t border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <ScrollReveal className="text-center mb-8 sm:mb-14">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            Features
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight mb-2 sm:mb-3">
            Everything you need to learn faster and remember longer
          </h2>
          <p className="text-neutral-600 max-w-lg mx-auto text-xs sm:text-base leading-relaxed">
            Built for students, developers, and avid readers who want what they learn to stick.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <ScrollReveal key={f.title} delay={idx * 60}>
                <ModernCard className="p-5 sm:p-6 space-y-2.5 sm:space-y-3 h-full">
                  <Icon className="w-5 h-5 text-neutral-900" />
                  <h4 className="font-bold text-neutral-950 text-sm sm:text-base tracking-tight">{f.title}</h4>
                  <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{f.desc}</p>
                </ModernCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
