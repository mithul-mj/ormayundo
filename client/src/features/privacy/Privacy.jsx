import { ArrowLeft } from 'lucide-react';

export default function Privacy({ onGoHome }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900 selection:bg-brand/15 selection:text-brand">
      {/* Full-Width Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Back Button */}
        <div className="mb-8">
          {onGoHome ? (
            <button
              onClick={onGoHome}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </button>
          ) : (
            <a
              href="/"
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Home</span>
            </a>
          )}
        </div>

        {/* Header */}
        <div className="mb-10 sm:mb-14 pb-8 border-b border-neutral-100">
          <span className="block text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand mb-2">
            Legal &amp; Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight mb-3">
            Ormayundo Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Effective Date: August 2026 · We believe privacy should be simple, transparent, and built into every feature.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 sm:space-y-12 leading-relaxed text-sm sm:text-base text-neutral-600">
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-neutral-950">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use the Ormayundo browser extension and web application, we collect the minimum
              necessary data to provide our active-recall services:
            </p>
            <ul className="list-disc pl-5 sm:pl-6 space-y-2">
              <li>
                <strong className="text-neutral-900 font-semibold">Personal Information:</strong> We collect your email
                address via Google OAuth strictly to authenticate your account and securely sync your study decks.
              </li>
              <li>
                <strong className="text-neutral-900 font-semibold">Content Data:</strong> We collect only the specific text
                snippets you highlight and intentionally choose to save. We <strong className="text-neutral-900">do not</strong> track
                your general browsing history, search queries, or background web activity.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-neutral-950">
              2. How We Use Information
            </h2>
            <p>Your information is used strictly to provide the core functionalities of Ormayundo:</p>
            <ul className="list-disc pl-5 sm:pl-6 mt-3 space-y-2">
              <li>To synchronize your flashcards and review schedule seamlessly across your devices.</li>
              <li>To process highlighted text through AI models to generate active-recall question pairs.</li>
              <li>To compute spaced repetition review dates so you retain knowledge permanently.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-neutral-950">
              3. Third-Party Services
            </h2>
            <p>
              We do not sell, rent, monetize, or trade your personal information. Text snippets you submit are
              securely transmitted to our backend servers and third-party AI providers (e.g., Groq)
              strictly for the purpose of generating test flashcards. We do not allow third parties to use
              your personal notes to train public models.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-neutral-950">
              4. Data Security
            </h2>
            <p>
              We implement industry-standard security measures, including end-to-end HTTPS encryption,
              secure JWT token rotation, and restricted database access, to protect your data from
              unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 text-neutral-950">
              5. Your Rights &amp; Data Deletion
            </h2>
            <p>
              You have full ownership of your data. You can export, modify, or permanently delete any flashcard
              or your entire account library at any time directly through your dashboard settings.
              You may also revoke Google OAuth permissions at any moment via your Google Account settings.
            </p>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-14 pt-8 border-t border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs text-neutral-500">
            Questions? Contact us at support@ormayundo.app
          </span>

          {onGoHome ? (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          ) : (
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
