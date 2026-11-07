import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios';
import { API_URL } from '../../shared/config';
import { AuthHeroBanner, AuthLoginForm } from './components';

export default function Auth({ onLoginSuccess, onBack }) {
  const [error, setError] = useState('');

  const handleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const { data } = await axios.post(
        `${API_URL}/auth/google`,
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      onLoginSuccess(data);
    } catch (err) {
      console.error(err);
      setError('Failed to authenticate with backend.');
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="min-h-screen flex flex-col md:flex-row bg-white animate-fade-in">
        <AuthHeroBanner />
        <AuthLoginForm
          error={error}
          onLoginSuccess={handleSuccess}
          onError={() => setError('Google Login Failed')}
          onBack={onBack}
        />
      </div>
    </GoogleOAuthProvider>
  );
}

