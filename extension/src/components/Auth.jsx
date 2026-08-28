import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../api';
import { GOOGLE_WEB_CLIENT_ID } from '../config';

export default function Auth({ onLoginSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);

    // Fallback method for Edge, Brave, or Chrome without profile sync
    const fallbackToWebAuthFlow = () => {
      const manifest = chrome.runtime.getManifest();
      // Use the Web Application Client ID for the cross-browser fallback, NOT the Chrome Extension Client ID
      const clientId = GOOGLE_WEB_CLIENT_ID;
      const scopes = encodeURIComponent(manifest.oauth2.scopes.join(' '));
      const redirectUri = chrome.identity.getRedirectURL();

      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}`;

      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError || !redirectUrl) {
            setError(chrome.runtime.lastError?.message || 'Google Login failed');
            setLoading(false);
            return;
          }

          try {
            const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
            const token = urlParams.get('access_token');

            if (!token) {
              setError('Failed to extract access token');
              setLoading(false);
              return;
            }

            const { data } = await api.post('/auth/google', { token });
            onLoginSuccess(data);
          } catch (err) {
            setError(err.response?.data?.message || 'Backend authentication failed');
            setLoading(false);
          }
        }
      );
    };

    // First try the native Chrome shortcut silently (interactive: false)
    // If we use interactive: true, Brave tries to open a broken native window first.
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        console.warn('Native getAuthToken failed, falling back to launchWebAuthFlow...', chrome.runtime.lastError);
        // If it fails (e.g., on Microsoft Edge), instantly trigger the fallback popup
        fallbackToWebAuthFlow();
        return;
      }

      try {
        // Send the Google Access Token to our backend
        const { data } = await api.post('/auth/google', { token });
        onLoginSuccess(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Backend authentication failed');
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col p-6 items-center justify-center h-full text-center mt-12">

      <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
        <svg viewBox="0 0 24 24" width="32" height="32" className="text-brand">
          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold mb-2 text-gray-900">
        Welcome to Ormayundo
      </h2>
      <p className="text-gray-500 mb-8 text-sm px-4">
        Sign in with Google to start saving tables and retaining knowledge forever.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-6 w-full text-left">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        className="bg-white border border-gray-200 hover:bg-gray-50 py-3 px-4 rounded-xl text-gray-700 font-semibold text-sm cursor-pointer transition-colors w-full flex justify-center items-center gap-3 shadow-sm"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin text-brand" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <p className="mt-8 text-xs text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
