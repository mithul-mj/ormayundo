import { BookOpen, Tag, BarChart3, Layers, Flame, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    color: 'bg-brand/10 text-brand',
    title: 'Active Recall Prompts',
    desc: 'Rather than memorizing verbatim text, Ormayundo formulates questions that test conceptual mechanics.',
  },
  {
    icon: Tag,
    color: 'bg-amber-50 text-amber-600',
    title: 'Smart Deck Categorization',
    desc: 'Automatically organizes flashcards into fitting subject decks like Node.js, JavaScript, NoSQL, or DSA.',
  },
  {
    icon: BarChart3,
    color: 'bg-emerald-50 text-success',
    title: 'Retention & Heatmap Analytics',
    desc: 'Track study streaks, retention rates, and card mastery breakdowns with GitHub-style activity heatmaps.',
  },
  {
    icon: Layers,
    color: 'bg-blue-50 text-blue-600',
    title: 'Table & Code Structure',
    desc:
      'HTML tables and code fragments are extracted cleanly into markdown format without formatting loss.',
  },
  {
    icon: Flame,
    color: 'bg-rose-50 text-brand',
    title: 'Streak Habit Building',
    desc: 'Build a daily learning ritual. Celebrate study milestones with streak tracking and confetti rewards.',
  },
  {
    icon: ShieldCheck,
    color: 'bg-purple-50 text-purple-600',
    title: 'Privacy by Architecture',
    desc: 'We never monitor or log browsing history. Only text you deliberately highlight and save is transmitted.',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-surface border-t border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            Engineered for Mastery
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            Built for serious learners & developers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={
      [
        'p-7 rounded-3xl bg-white border border-divider hover:border-border-card',
        'transition-all space-y-3'
      ].join(' ')
    }
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-ink text-base">{f.title}</h4>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
