import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { API_URL } from './config';

export default function Auth({ onLoginSuccess }) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">

          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
            <svg viewBox="0 0 24 24" width="32" height="32" className="text-[#FF5A5F]">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Ormayundo.</h2>
          <p className="text-gray-500 mb-8 text-sm px-4">
            Sign in to view your brain analytics and manage your knowledge base.
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
              theme="filled_black"
              shape="pill"
            />
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
