import { Brain, Download, ArrowRight } from 'lucide-react';

export default function Navbar({ isAuthenticated, onGetStarted }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={scrollToTop}
        >
          <div className={
      [
        'w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white',
        'shadow-sm shadow-brand/20 group-hover:scale-105 transition-transform'
      ].join(' ')
    }>
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-brand">
            Ormayundo.
          </span>
        </div>

        {/* Navigation Links */}
        <nav className={
      [
        'hidden md:flex items-center gap-1 bg-surface p-1.5 rounded-full border',
        'border-divider text-xs font-semibold text-muted'
      ].join(' ')
    }>
          <a
            href="#showcase-extension"
            className="px-4 py-1.5 rounded-full hover:text-ink hover:bg-white transition-all"
          >
            Extension in Action
          </a>
          <a
            href="#showcase-dashboard"
            className="px-4 py-1.5 rounded-full hover:text-ink hover:bg-white transition-all"
          >
            Brain Dashboard
          </a>
          <a
            href="#showcase-manager"
            className="px-4 py-1.5 rounded-full hover:text-ink hover:bg-white transition-all"
          >
            Manage Decks
          </a>
          <a
            href="#how-it-works"
            className="px-4 py-1.5 rounded-full hover:text-ink hover:bg-white transition-all"
          >
            How It Works
          </a>
          <a
            href="#download"
            className="px-4 py-1.5 rounded-full hover:text-ink hover:bg-white transition-all"
          >
            Download ZIP
          </a>
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="/ormayundo-extension.zip"
            download="ormayundo-extension.zip"
            className={
      [
        'hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold',
        'text-ink bg-white border border-border-card rounded-full hover:border-ink',
        'transition-all shadow-xs active:scale-95'
      ].join(' ')
    }
          >
            <Download className="w-3.5 h-3.5 text-brand" />
            <span>Download ZIP</span>
          </a>

          <button
            onClick={onGetStarted}
            className={
      [
        'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-xs',
        'text-white bg-brand hover:bg-brand-hover shadow-sm shadow-brand/20',
        'active:scale-95 transition-all cursor-pointer'
      ].join(' ')
    }
          >
            {isAuthenticated ? 'Dashboard' : 'Sign in'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
