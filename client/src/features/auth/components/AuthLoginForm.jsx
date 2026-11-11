import { ArrowLeft, Brain, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthLoginForm({ error, onLoginSuccess, onError, onBack }) {
  return (
    <div className="flex-1 lg:flex-none lg:w-[480px] bg-white flex flex-col justify-between lg:justify-center items-center p-6 sm:p-10 lg:p-12 min-h-screen lg:min-h-0 relative">
      {/* Mobile-Only Header with Brand Identity & Back Link */}
      <div className="w-full max-w-sm flex items-center justify-between lg:hidden pt-2 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-brand" />
          <span className="font-extrabold text-base tracking-tight text-neutral-900">
            Ormayundo<span className="text-brand">.</span>
          </span>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1.5 px-3 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* Desktop-Only Back to Home Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer lg:absolute lg:top-8 lg:left-8 py-1.5 px-3 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      )}

      {/* Main Login Card */}
      <div className="w-full max-w-sm my-auto lg:my-0 flex flex-col items-center">
        {/* Subtle Feature Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-brand text-xs font-semibold mb-4 border border-rose-100/60">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart Spaced Repetition</span>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Sign in to sync your study decks &amp; analytics across all devices.
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-semibold mb-6 border border-red-100 text-center">
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

      {/* Mobile-Only Trust / Security Footer */}
      <div className="w-full max-w-sm text-center text-[11px] text-gray-400 font-medium py-3 lg:hidden">
        Free forever • 100% private &amp; secure
      </div>
    </div>
  );
}
