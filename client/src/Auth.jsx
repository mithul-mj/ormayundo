import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { API_URL } from './config';

export default function Auth({ onLoginSuccess, onBack }) {
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const { data } = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential
      }, { withCredentials: true });

      onLoginSuccess(data);
    } catch (err) {
      console.error(err);
      setError('Failed to authenticate with backend.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col md:flex-row bg-white animate-fade-in">
        
        {/* Left Side: Hero Banner (Airbnb Style) */}
        <div className="md:flex-1 bg-gradient-to-br from-brand-light to-brand flex flex-col justify-center p-12 text-white relative overflow-hidden">
          {/* Decorative Pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Remember everything you read.
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90 leading-relaxed mb-8">
              Ormayundo captures key knowledge from the web and turns it into high-retention active recall flashcards.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-white flex items-center justify-center text-xs font-bold text-gray-800">A</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-800">K</div>
                <div className="w-10 h-10 rounded-full border-2 border-brand bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-800">S</div>
              </div>
              <p className="text-sm font-semibold">Join the knowledge revolution.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Panel */}
        <div className="md:w-[480px] bg-white flex flex-col justify-center items-center p-8 md:p-12 relative">
          
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
          )}

          <div className="w-full max-w-sm">
            <div className="mb-10 text-center">
              <div className="w-14 h-14 bg-brand-light/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" width="28" height="28" className="text-brand-light">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
              <p className="text-gray-500 font-medium">Log in to view your brain analytics.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold mb-6 border border-red-100">
                {error}
              </div>
            )}

            <div className="w-full flex justify-center pb-8 border-b border-gray-100 mb-8">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => setError('Google Login Failed')}
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

      </div>
    </GoogleOAuthProvider>
  );
}
