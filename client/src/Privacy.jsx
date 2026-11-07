export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full p-10 bg-white shadow-xl rounded-3xl border border-gray-100 text-gray-800">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand tracking-tighter">
            Ormayundo Privacy Policy
          </h1>
          <p className="text-gray-400 font-medium">Effective Date: August 2026</p>
        </div>

        <div className="space-y-8 leading-relaxed text-gray-600">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">1. Information We Collect</h2>
            <p className="mb-2">When you use the Ormayundo Active Recall extension and website, we collect the minimum necessary data to provide our services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-gray-800">Personal Information:</strong> We collect your email address via Google OAuth to create and secure your account.</li>
              <li><strong className="text-gray-800">Content Data:</strong> We collect the specific text snippets you highlight and explicitly send to our service to generate AI flashcards. We <strong>do not</strong> track your general web browsing history or monitor other background web activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">2. How We Use Information</h2>
            <p>Your information is used strictly to provide the core functionalities of Ormayundo:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>To synchronize your flashcards and study history across multiple devices.</li>
              <li>To process highlighted text using our backend AI models for flashcard generation.</li>
              <li>To send you spaced-repetition study reminders (via optional notifications).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">3. Third-Party Services</h2>
            <p>We do not sell, rent, or trade your personal information. Text snippets you submit are securely transmitted to our backend servers and third-party AI providers (e.g., Groq) strictly for the purpose of generating flashcards. We do not allow third parties to use your data to train public AI models.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures, including HTTPS encryption and secure OAuth token handling, to protect your data from unauthorized access, alteration, or destruction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">5. Your Rights</h2>
            <p>You have the right to access, modify, or delete your personal data. You can completely revoke access to your Google account at any time via your Google Account security settings.</p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <a href="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-brand-light to-brand hover:opacity-90 transition-opacity shadow-md">
            Return to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
