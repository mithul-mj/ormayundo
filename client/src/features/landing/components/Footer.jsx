import { Brain } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-divider py-12">
      <div className={
      [
        'max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between',
        'items-center gap-6'
      ].join(' ')
    }>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white">
            <Brain className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-ink tracking-tight">Ormayundo.</span>
          <span className="text-xs text-muted ml-2">© {currentYear} Active Recall</span>
        </div>

        <div className="flex items-center gap-6 text-xs font-semibold text-muted">
          <a href="/privacy" className="hover:text-ink transition-colors">
            Privacy
          </a>
          <a href="#how-it-works" className="hover:text-ink transition-colors">
            How It Works
          </a>
          <a
            href="/ormayundo-extension.zip"
            download="ormayundo-extension.zip"
            className="hover:text-ink transition-colors"
          >
            Download Extension
          </a>
        </div>
      </div>
    </footer>
  );
}
