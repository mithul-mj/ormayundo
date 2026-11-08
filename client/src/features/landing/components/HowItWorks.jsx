import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Install Extension',
    desc: 'Download the ZIP below, extract it, and click "Load unpacked" in Chrome Developer mode.',
    tag: 'Takes 30 seconds',
  },
  {
    num: '02',
    title: 'Highlight Anything',
    desc: 'Read Wikipedia, technical docs, or articles. Highlight any core sentence or formula.',
    tag: 'Preserves code & tables',
  },
  {
    num: '03',
    title: '1-Click Save',
    desc: 'Click the red "Save to Ormayundo" button. Generates an active recall question in the background.',
    tag: 'Instant background save',
  },
  {
    num: '04',
    title: 'Active Recall',
    desc: 'Review due cards via the extension popup or web dashboard using SM-2 spaced repetition intervals.',
    tag: 'Permanent retention',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            4-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            How to use Ormayundo
          </h2>
          <p className="text-muted max-w-lg mx-auto text-sm sm:text-base">
            Turn passive reading into permanent memory in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-6 sm:p-7 rounded-3xl bg-surface/50 hover:bg-surface transition-all flex flex-col justify-between"
            >
              <div>
                <span className={
      [
        'w-10 h-10 rounded-2xl bg-surface border border-divider text-ink',
        'font-extrabold text-sm flex items-center justify-center mb-5'
      ].join(' ')
    }>
                  {s.num}
                </span>
                <h3 className="font-bold text-ink text-lg mb-2">{s.title}</h3>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">{s.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-divider text-xs font-bold text-brand flex items-center gap-1">
                {s.tag} <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
