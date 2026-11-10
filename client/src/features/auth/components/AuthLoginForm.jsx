import { ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthLoginForm({ error, onLoginSuccess, onError, onBack }) {
  return (
    <div className="flex-1 lg:flex-none lg:w-[480px] bg-white flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="self-start mb-6 lg:mb-0 lg:absolute lg:top-6 lg:left-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500">Sign in to sync your study decks &amp; analytics.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-semibold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="w-full flex justify-center pb-6 border-b border-gray-100 mb-6 min-h-[44px]">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onError}
            useOneTap
            theme="outline"
            shape="pill"
            size="large"
            text="continue_with"
            width="280"
          />
        </div>

        <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed px-2">
          By signing in, you agree to Ormayundo's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
