import { Download, ArrowRight } from 'lucide-react';

export default function CtaBanner({ isAuthenticated, onGetStarted }) {
  return (
    <section className="py-20 bg-brand text-white text-center relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 relative z-10 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Start remembering what you read.
        </h2>
        <p className="text-white/90 max-w-xl mx-auto text-base sm:text-lg">
          Download the free Chrome extension or try the web dashboard with Google login.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <a
            href="/ormayundo-extension.zip"
            download="ormayundo-extension.zip"
            className={
      [
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4',
        'rounded-full bg-white text-ink font-extrabold text-sm shadow-xl',
        'active:scale-95 transition-all hover:bg-gray-50 cursor-pointer'
      ].join(' ')
    }
          >
            <Download className="w-4 h-4 text-brand" />
            <span>Download Extension (.ZIP)</span>
          </a>

          <button
            onClick={onGetStarted}
            className={
      [
        'w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4',
        'rounded-full bg-black/20 hover:bg-black/30 text-white font-extrabold',
        'text-sm border border-white/20 active:scale-95 transition-all',
        'cursor-pointer'
      ].join(' ')
    }
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Sign in with Google'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
