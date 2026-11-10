import { useState, useEffect, useRef } from 'react';
import { Brain, Download, ArrowRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#showcase-extension', label: 'Extension' },
  { href: '#showcase-dashboard', label: 'Analytics' },
  { href: '#showcase-manager', label: 'Decks' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#download', label: 'Download' },
];

export default function Navbar({ isAuthenticated, onGetStarted }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  // Auto-hide on scroll down, reveal on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const previousScrollY = lastScrollYRef.current;
          const diff = currentScrollY - previousScrollY;

          // Always visible near top of page
          if (currentScrollY < 50) {
            setIsVisible(true);
          } else if (diff > 8) {
            // Scrolling down -> hide navbar & close mobile drawer
            setIsVisible(false);
            setMobileMenuOpen(false);
          } else if (diff < -8) {
            // Scrolling up -> show navbar
            setIsVisible(true);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={[
        'fixed top-3 sm:top-5 inset-x-0 z-50 pointer-events-none px-3 sm:px-6 transition-all duration-300 ease-in-out',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0',
      ].join(' ')}
    >
      <div className="max-w-4xl lg:max-w-5xl mx-auto">
        {/* Floating Capsule Bar */}
        <div className="pointer-events-auto bg-white/85 backdrop-blur-xl border border-neutral-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-3.5 sm:px-4 py-2 flex items-center justify-between gap-3 transition-all">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer group shrink-0"
            onClick={scrollToTop}
            title="Ormayundo"
          >
            <Brain className="w-5 h-5 text-brand transition-transform group-hover:scale-105" />
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-neutral-900">
              Ormayundo<span className="text-brand">.</span>
            </span>
          </div>

          {/* Desktop Navigation Link Pills */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="/ormayundo-extension.zip"
              download="ormayundo-extension.zip"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70 rounded-full transition-all"
            >
              <Download className="w-3.5 h-3.5 text-neutral-500" />
              <span>Extension</span>
            </a>

            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:py-2 rounded-full font-semibold text-xs text-white bg-neutral-900 hover:bg-black active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span>{isAuthenticated ? 'Dashboard' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-1.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Floating Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto mt-2 max-w-sm mx-auto bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-2xl shadow-xl p-3 space-y-1 animate-fade-in md:hidden">
            <nav className="flex flex-col space-y-0.5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t border-gray-100">
              <a
                href="/ormayundo-extension.zip"
                download="ormayundo-extension.zip"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-neutral-500" />
                <span>Download Extension (.ZIP)</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
