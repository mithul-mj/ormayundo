import { Brain } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-200/80 py-10 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand" />
            <span className="font-bold text-base text-neutral-950 tracking-tight">Ormayundo.</span>
          </div>
          <span className="text-xs text-neutral-400">© {currentYear} Ormayundo. All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-6 gap-y-2 text-xs font-medium text-neutral-600">
          <a href="/privacy" className="hover:text-neutral-950 transition-colors">
            Privacy Policy
          </a>
          <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
            How It Works
          </a>
          <a href="#science" className="hover:text-neutral-950 transition-colors">
            The Science
          </a>
          <a
            href="/ormayundo-extension.zip"
            download="ormayundo-extension.zip"
            className="hover:text-neutral-950 transition-colors"
          >
            Download Extension
          </a>
        </div>
      </div>
    </footer>
  );
}
