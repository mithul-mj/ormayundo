import { Download, Laptop, Check, Copy, CheckCircle2 } from 'lucide-react';
import ModernCard from './ModernCard';
import ScrollReveal from './ScrollReveal';

export default function DownloadSection({ copiedStep, onCopyChromeUrl }) {
  return (
    <section id="download" className="py-10 sm:py-20 md:py-24 bg-neutral-50/60 border-y border-neutral-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <ScrollReveal>
          <ModernCard hover={false} className="p-5 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              {/* Left Column: Heading, Value Prop & Download Button */}
              <div className="lg:col-span-6 space-y-3.5 sm:space-y-4">
                <div>
                  <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-1.5">
                    Free Browser Extension
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-neutral-950 tracking-tight">
                    Download the Extension
                  </h2>
                </div>

                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                  Capture highlights and review flashcards without ever leaving your active browser tab.
                  Lightweight, 100% private, and works seamlessly across all Chromium browsers.
                </p>

                <div className="pt-1">
                  <a
                    href="/ormayundo-extension.zip"
                    download="ormayundo-extension.zip"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Download ormayundo-extension.zip</span>
                    <span className="sm:hidden whitespace-nowrap">Download Extension (.ZIP)</span>
                  </a>
                </div>

                {/* Supported Browsers */}
                <div className="pt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-neutral-500">Works on</span>
                  <span className="font-semibold text-neutral-900">Chrome</span>
                  <span className="text-neutral-300">·</span>
                  <span className="font-semibold text-neutral-900">Brave</span>
                  <span className="text-neutral-300">·</span>
                  <span className="font-semibold text-neutral-900">Edge</span>
                  <span className="text-neutral-300">·</span>
                  <span className="font-semibold text-neutral-900">Opera</span>
                  <span className="text-neutral-400 text-[11px] hidden sm:inline">(all Chromium browsers)</span>
                </div>
              </div>

              {/* Right Column: Step-by-Step Installation Box */}
              <div className="lg:col-span-6 bg-neutral-50/80 border border-neutral-200/90 rounded-2xl p-5 sm:p-6 space-y-4 text-xs text-neutral-600">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-200/80">
                  <Laptop className="w-4 h-4 text-neutral-700 shrink-0" />
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-neutral-900">
                    Quick 30-Second Setup:
                  </h4>
                </div>

                {/* Step 1 */}
                <div className="flex gap-2.5 items-baseline">
                  <span className="font-mono font-bold text-neutral-900 text-xs shrink-0">
                    1.
                  </span>
                  <p>
                    <strong className="text-neutral-900 font-semibold">Extract</strong> the downloaded{' '}
                    <code className="bg-neutral-200/70 px-1.5 py-0.5 rounded text-neutral-900 font-mono text-[11px] whitespace-nowrap">
                      ormayundo-extension.zip
                    </code>
                  </p>
                </div>

                {/* Step 2 */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-mono font-bold text-neutral-900 text-xs shrink-0">
                    2.
                  </span>
                  <div className="flex-1 min-w-0">
                    <span>
                      Open{' '}
                      <code className="bg-neutral-200/70 px-1.5 py-0.5 rounded text-neutral-900 font-mono text-[11px] whitespace-nowrap">
                        chrome://extensions
                      </code>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onCopyChromeUrl}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-[10px] border border-neutral-200 flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    {copiedStep ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedStep ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>

                {/* Step 3 */}
                <div className="flex gap-2.5 items-baseline">
                  <span className="font-mono font-bold text-neutral-900 text-xs shrink-0">
                    3.
                  </span>
                  <p>
                    Turn on{' '}
                    <span className="font-semibold text-neutral-900">Developer mode</span> (top right toggle).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="flex gap-2.5 items-baseline">
                  <span className="font-mono font-bold text-neutral-900 text-xs shrink-0">
                    4.
                  </span>
                  <p>
                    Click{' '}
                    <span className="font-semibold text-neutral-900">Load unpacked</span> and select the extracted folder.
                  </p>
                </div>
              </div>
            </div>
          </ModernCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
