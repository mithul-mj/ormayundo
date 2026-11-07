import { Brain, Download, Star, CheckCircle2, Maximize2 } from 'lucide-react';

export default function HeroSection({ onOpenModal }) {
  return (
    <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
        {/* Headline */}
        <h1 className={
      [
        'text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-ink',
        'leading-[1.08] mb-6'
      ].join(' ')
    }>
          Remember everything <br className="hidden sm:inline" />
          you <span className="text-brand">read on the web.</span>
        </h1>

        {/* Subtitle */}
        <p className={
      [
        'max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted font-normal',
        'leading-relaxed mb-10'
      ].join(' ')
    }>
          Highlight any sentence or code block on any website. Ormayundo turns it into high-yield
          active-recall flashcards with mathematically scheduled spaced repetition.
        </p>

        {/* Iconic Action Pill Bar */}
        <div className={
      [
        'max-w-3xl mx-auto mb-10 sm:mb-14 p-2 sm:p-2.5 bg-white border',
        'border-border-card rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
        'hover:shadow-[0_6px_22px_rgba(0,0,0,0.09)] transition-all flex flex-col',
        'sm:flex-row items-center justify-between gap-3 text-left'
      ].join(' ')
    }>
          <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-divider w-full sm:w-auto">
            <span className="block text-[11px] font-bold text-ink uppercase tracking-wider">
              Highlight
            </span>
            <span className="text-xs text-muted font-medium truncate block">
              Select text on Wikipedia, MDN, blogs
            </span>
          </div>

          <div className="flex-1 px-4 sm:px-6 py-1.5 sm:border-r border-divider w-full sm:w-auto">
            <span className="block text-[11px] font-bold text-ink uppercase tracking-wider">
              Recall Card
            </span>
            <span className="text-xs text-muted font-medium truncate block">
              Generates active recall cards
            </span>
          </div>

          <div className="flex-1 px-4 sm:px-6 py-1.5 w-full sm:w-auto">
            <span className="block text-[11px] font-bold text-ink uppercase tracking-wider">
              Spaced Recall
            </span>
            <span className="text-xs text-muted font-medium truncate block">
              &lt;1m, 2d, 6d, 8d intervals
            </span>
          </div>

          {/* Action Button */}
          <a
            href="/ormayundo-extension.zip"
            download="ormayundo-extension.zip"
            className={
      [
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3',
        'rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-xs',
        'shadow-sm shadow-brand/25 active:scale-95 transition-all shrink-0',
        'cursor-pointer'
      ].join(' ')
    }
          >
            <Download className="w-4 h-4" />
            <span>Get Extension (.ZIP)</span>
          </a>
        </div>

        {/* Real In-Action Hero Screenshot */}
        <div className="relative max-w-5xl mx-auto">
          {/* Browser Frame */}
          <div className={
      [
        'bg-white rounded-2xl sm:rounded-3xl border border-border-card',
        'shadow-[0_12px_36px_rgba(0,0,0,0.08)] overflow-hidden'
      ].join(' ')
    }>
            {/* Address Bar Header */}
            <div className="bg-surface px-4 py-3 border-b border-divider flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
              </div>

              <div className={
      [
        'flex-1 max-w-md bg-white border border-divider rounded-full px-4 py-1',
        'text-xs text-muted font-mono flex items-center gap-2 shadow-xs'
      ].join(' ')
    }>
                <span className="text-success">https://</span>
                <span className="text-ink font-semibold truncate">en.wikipedia.org/wiki/Steve_Jobs</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={
      [
        'text-[11px] font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full',
        'flex items-center gap-1.5'
      ].join(' ')
    }>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" /> Live Capture
                </span>
              </div>
            </div>

            {/* Image with Annotation Overlays */}
            <div
              className="relative group cursor-pointer"
              onClick={() => onOpenModal('/images/extension-in-action.jpg')}
            >
              <img
                src="/images/extension-in-action.jpg"
                alt="Ormayundo Chrome Extension in action on Wikipedia"
                className="w-full h-auto block object-cover"
              />

              {/* Annotation Pin 1: Text Highlight & Save Button */}
              <div className={
      [
        'absolute top-[42%] left-[24%] -translate-y-1/2 hidden md:flex items-center',
        'gap-2 bg-ink/90 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full',
        'text-xs font-bold shadow-xl border border-white/20 animate-bounce',
        'duration-1000'
      ].join(' ')
    }>
                <span className="w-2 h-2 rounded-full bg-brand" />
                <span>Highlight & Click "Save to Ormayundo"</span>
              </div>

              {/* Annotation Pin 2: Extension Popup & Question */}
              <div className={
      [
        'absolute top-[28%] right-[8%] hidden md:flex items-center gap-2 bg-brand',
        'text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border',
        'border-white/30'
      ].join(' ')
    }>
                <Brain className="w-3.5 h-3.5" />
                <span>Flashcard with Spaced Repetition</span>
              </div>

              {/* Hover to Expand Pill */}
              <div className={
      [
        'absolute bottom-4 right-4 bg-black/75 hover:bg-black text-white px-3.5',
        'py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5',
        'backdrop-blur-md opacity-90 group-hover:opacity-100 transition-opacity'
      ].join(' ')
    }>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Click to view full screenshot</span>
              </div>
            </div>
          </div>

          {/* Sub-bar Social Proof */}
          <div className={
      [
        'flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs',
        'font-semibold text-muted mt-8'
      ].join(' ')
    }>
            <div className="flex items-center gap-1.5 text-ink">
              <Star className="w-4 h-4 fill-brand text-brand" />
              <span className="font-bold">4.98</span>
              <span className="text-muted font-normal">(Learning Retention)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Active Recall &amp; SM-2 Spaced Repetition</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-success font-semibold">100% Free Unpacked Extension</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span>Zero Browsing Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
