import { ArrowRight, Maximize2 } from 'lucide-react';

export default function ExtensionShowcase({ onOpenModal }) {
  return (
    <section id="showcase-extension" className="py-20 bg-surface border-y border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <span className={
      [
        'text-[11px] font-bold text-brand tracking-widest uppercase bg-brand/10',
        'px-3.5 py-1.5 rounded-full'
      ].join(' ')
    }>
            Chrome Extension Showcase
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mt-3 mb-3">
            Capture knowledge without breaking concentration
          </h2>
          <p className="text-muted max-w-xl mx-auto text-sm sm:text-base">
            See the exact workflow: highlight any sentence on the web to trigger the floating button,
            then review active-recall prompts directly in the browser popup.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Two Cropped Highlight Parts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Part 1: Highlight + Save Button */}
            <div className={
      [
        'bg-white p-6 rounded-3xl border border-border-card shadow-sm',
        'hover:shadow-md transition-all'
      ].join(' ')
    }>
              <div className="flex items-center justify-between mb-3">
                <span className={
      [
        'text-[11px] font-bold uppercase tracking-wider text-brand bg-brand/10',
        'px-2.5 py-1 rounded-full'
      ].join(' ')
    }>
                  Part 1 • Text Selection
                </span>
                <span className="text-xs text-muted">Any webpage</span>
              </div>

              <div className="rounded-2xl border border-divider overflow-hidden mb-4 shadow-inner bg-gray-50">
                <img
                  src="/images/part-save-button.png"
                  alt="Highlighted text with Save to Ormayundo floating button"
                  className={
      [
        'w-full h-auto object-contain cursor-pointer hover:scale-105',
        'transition-transform duration-300'
      ].join(' ')
    }
                  onClick={() => onOpenModal('/images/part-save-button.png')}
                />
              </div>

              <h3 className="font-extrabold text-base text-ink mb-1">
                1-Click "Save to Ormayundo" Floating Button
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Select text on Wikipedia, articles, or documentation. The distinctive red pill
                appears automatically right under your cursor. Click it to immediately create an
                active-recall card.
              </p>
            </div>

            {/* Part 2: Extension Popup & Question */}
            <div className={
      [
        'bg-white p-6 rounded-3xl border border-border-card shadow-sm',
        'hover:shadow-md transition-all'
      ].join(' ')
    }>
              <div className="flex items-center justify-between mb-3">
                <span className={
      [
        'text-[11px] font-bold uppercase tracking-wider text-success bg-emerald-50',
        'px-2.5 py-1 rounded-full border border-emerald-100'
      ].join(' ')
    }>
                  Part 2 • In-Tab Popup
                </span>
                <span className="text-xs font-semibold text-brand">94 Due Today</span>
              </div>

              <div className={
      [
        'rounded-2xl border border-divider overflow-hidden mb-4 shadow-inner',
        'bg-gray-50 max-h-56 flex items-center justify-center'
      ].join(' ')
    }>
                <img
                  src="/images/part-extension-popup.png"
                  alt="Extension popup with Active Recall question card"
                  className={
      [
        'w-full h-auto object-cover cursor-pointer hover:scale-105',
        'transition-transform duration-300'
      ].join(' ')
    }
                  onClick={() => onOpenModal('/images/part-extension-popup.png')}
                />
              </div>

              <h3 className="font-extrabold text-base text-ink mb-1">
                Active Recall Flashcards Inside Any Tab
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                No need to open separate study software. The extension popup lets you flip cards,
                test comprehension with questions, and rate difficulty.
              </p>
            </div>
          </div>

          {/* Right: Full Extension in Action */}
          <div className="lg:col-span-7">
            <div className={
      [
        'bg-white p-4 sm:p-6 rounded-3xl border border-border-card',
        'shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
      ].join(' ')
    }>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-divider">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="text-xs font-bold text-ink">Full Extension Context</span>
                </div>
                <span className="text-[11px] text-muted font-mono">en.wikipedia.org/wiki/Steve_Jobs</span>
              </div>

              <div
                className="rounded-2xl overflow-hidden border border-divider relative group cursor-pointer"
                onClick={() => onOpenModal('/images/extension-in-action.jpg')}
              >
                <img
                  src="/images/extension-in-action.jpg"
                  alt="Full Wikipedia view with Ormayundo popup"
                  className="w-full h-auto object-cover"
                />
                <div className={
      [
        'absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100',
        'transition-opacity flex items-center justify-center'
      ].join(' ')
    }>
                  <span className={
      [
        'bg-white text-ink px-4 py-2 rounded-full font-bold text-xs shadow-lg flex',
        'items-center gap-1.5'
      ].join(' ')
    }>
                    <Maximize2 className="w-3.5 h-3.5" /> Click to enlarge
                  </span>
                </div>
              </div>

              <div className={
      [
        'mt-4 pt-3 border-t border-divider flex flex-col sm:flex-row items-start',
        'sm:items-center justify-between gap-3 text-xs text-muted'
      ].join(' ')
    }>
                <span>
                  💡 Notice the highlighted sentence and the open Active Recall flashcard on the right side.
                </span>
                <a
                  href="/ormayundo-extension.zip"
                  download="ormayundo-extension.zip"
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0"
                >
                  Download Extension ZIP <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
