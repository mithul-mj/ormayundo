import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Library, Loader2, Brain } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import FlashcardManager from './FlashcardManager';
import LandingPage from './LandingPage';
import Auth from './Auth';
import Privacy from './Privacy';
import { API_URL } from './config';
import axios from 'axios';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'manage'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Client-side navigation helper with browser history support
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check authentication status on startup using the lightweight endpoint
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (window.location.pathname !== '/privacy') {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  // Initial loader
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF385C] w-8 h-8" />
      </div>
    );
  }

  // 1. Standalone Page: Privacy Policy (/privacy)
  if (currentPath === '/privacy') {
    return <Privacy onGoHome={() => navigate('/')} />;
  }

  // 2. Standalone Page: Login / Auth (/login)
  if (currentPath === '/login' && !isAuthenticated) {
    return (
      <Auth
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          navigate('/app');
        }}
        onBack={() => navigate('/')}
      />
    );
  }

  // 3. Standalone Page: App Dashboard (/app or /dashboard)
  // Dedicated home page for registered users. Has its OWN navbar (NO download button here).
  if (currentPath === '/app' || currentPath === '/dashboard') {
    if (!isAuthenticated) {
      // If not logged in, prompt to log in, then proceed to /app
      return (
        <Auth
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            navigate('/app');
          }}
          onBack={() => navigate('/')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#222222] flex flex-col font-sans">
        {/* App Dashboard Navbar: Clean Airbnb styling, NO download button */}
        <nav className="bg-white sticky top-0 z-50 border-b border-[#EBEBEB]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate('/')}
              title="Return to Landing Page"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF385C] to-[#E61E4D] flex items-center justify-center text-white shadow-sm shadow-[#FF385C]/20 group-hover:scale-105 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-[#FF385C]">
                Ormayundo.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#222222] text-white shadow-sm'
                    : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
                  activeTab === 'manage'
                    ? 'bg-[#222222] text-white shadow-sm'
                    : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>Manage Cards</span>
              </button>

              <div className="w-px h-6 bg-[#EBEBEB] mx-2" />

              <button
                onClick={async () => {
                  await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                  setIsAuthenticated(false);
                  navigate('/');
                }}
                className="text-xs font-bold text-[#717171] hover:text-[#FF385C] transition-colors px-2 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content: Analytics or Flashcard Manager */}
        <main className="flex-1 animate-fade-in pb-12">
          {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <FlashcardManager />}
        </main>
      </div>
    );
  }

  // 4. Standalone Page: Landing Page (/)
  // Completely separate page with its OWN navbar, hero, and Extension Download buttons.
  return (
    <LandingPage
      onGetStarted={() => {
        if (isAuthenticated) {
          navigate('/app');
        } else {
          navigate('/login');
        }
      }}
      isAuthenticated={isAuthenticated}
    />
  );
}
