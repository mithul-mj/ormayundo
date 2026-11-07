import { Download, Laptop, Check, Copy } from 'lucide-react';

export default function DownloadSection({ copiedStep, onCopyChromeUrl }) {
  return (
    <section id="download" className="py-20 bg-surface border-y border-divider">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className={
      [
        'bg-white border border-border-card rounded-3xl p-8 sm:p-12',
        'shadow-[0_12px_32px_rgba(0,0,0,0.08)]'
      ].join(' ')
    }>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left Column */}
            <div className="md:col-span-7 space-y-4">
              <div className={
      [
        'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10',
        'text-brand text-xs font-bold'
      ].join(' ')
    }>
                <Download className="w-3.5 h-3.5" />
                Direct Download • Chrome, Edge, Brave, Opera
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
                Download the Extension
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Download the unpacked Chrome extension ZIP. 100% free, private,
                and compatible with all Chromium browsers.
              </p>

              <div className="pt-2">
                <a
                  href="/ormayundo-extension.zip"
                  download="ormayundo-extension.zip"
                  className={
      [
        'inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full',
        'bg-brand hover:bg-brand-hover text-white font-bold text-sm shadow-md',
        'shadow-brand/25 active:scale-95 transition-all cursor-pointer'
      ].join(' ')
    }
                >
                  <Download className="w-4 h-4" />
                  <span>Download ormayundo-extension.zip</span>
                </a>
              </div>
            </div>

            {/* Right Column: Step-by-Step Installation */}
            <div className={
      [
        'md:col-span-5 bg-surface border border-divider rounded-2xl p-5 space-y-3.5',
        'text-xs text-muted'
      ].join(' ')
    }>
              <h4 className="font-bold text-sm text-ink flex items-center gap-2 pb-2 border-b border-divider">
                <Laptop className="w-4 h-4 text-brand" />
                Installation in 3 steps:
              </h4>

              <div className="flex gap-3">
                <span className={
      [
        'w-5 h-5 rounded-full bg-ink text-white font-bold flex items-center',
        'justify-center shrink-0 text-[10px]'
      ].join(' ')
    }>
                  1
                </span>
                <p>
                  <strong className="text-ink">Extract</strong> the downloaded{' '}
                  <code className="bg-gray-200 px-1 py-0.5 rounded text-ink font-mono">
                    ormayundo-extension.zip
                  </code>{' '}
                  file.
                </p>
              </div>

              <div className="flex gap-3 items-center">
                <span className={
      [
        'w-5 h-5 rounded-full bg-ink text-white font-bold flex items-center',
        'justify-center shrink-0 text-[10px]'
      ].join(' ')
    }>
                  2
                </span>
                <div className="flex-1">
                  <span>
                    Open{' '}
                    <code className="bg-gray-200 px-1.5 py-0.5 rounded text-ink font-mono">
                      chrome://extensions
                    </code>
                  </span>
                </div>
                <button
                  onClick={onCopyChromeUrl}
                  className={
      [
        'px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-ink font-bold',
        'text-[10px] border border-border-card flex items-center gap-1',
        'transition-colors cursor-pointer shrink-0'
      ].join(' ')
    }
                >
                  {copiedStep ? (
                    <Check className="w-3 h-3 text-success" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedStep ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex gap-3">
                <span className={
      [
        'w-5 h-5 rounded-full bg-ink text-white font-bold flex items-center',
        'justify-center shrink-0 text-[10px]'
      ].join(' ')
    }>
                  3
                </span>
                <p>
                  Enable <strong className="text-ink">Developer mode</strong> (top-right), click{' '}
                  <strong className="text-ink">Load unpacked</strong>, and choose the extracted folder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
