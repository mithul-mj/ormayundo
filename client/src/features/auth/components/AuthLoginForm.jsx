import { ArrowLeft, Globe } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthLoginForm({ error, onLoginSuccess, onError, onBack }) {
  return (
    <div className="md:w-[480px] bg-white flex flex-col justify-center items-center p-8 md:p-12 relative">
      {onBack && (
        <button
          onClick={onBack}
          className={
      [
        'absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold',
        'text-gray-500 hover:text-gray-900 transition-colors cursor-pointer'
      ].join(' ')
    }
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="w-14 h-14 bg-brand-light/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Globe className="w-7 h-7 text-brand-light" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Welcome back
          </h2>
          <p className="text-gray-500 font-medium">Log in to view your brain analytics.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
            {error}
          </div>
        )}

        <div className="w-full flex justify-center pb-8 border-b border-gray-100 mb-8">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onError}
            useOneTap
            theme="outline"
            shape="pill"
            size="large"
            text="continue_with"
            width="320"
          />
        </div>

        <p className="text-center text-xs text-gray-400 font-medium leading-relaxed px-4">
          By continuing, you agree to Ormayundo's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
