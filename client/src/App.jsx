import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Library, Loader2, Download, Home } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import FlashcardManager from './FlashcardManager';
import LandingPage from './LandingPage';
import Auth from './Auth';
import Privacy from './Privacy';
import { API_URL } from './config';
import axios from 'axios';

function App() {
  const isPrivacyPage = window.location.pathname === '/privacy';

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'manage' | 'home'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // Check if user has a valid cookie by hitting the lightweight /auth/me endpoint
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
    if (!isPrivacyPage) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [isPrivacyPage]);

  if (isPrivacyPage) {
    return <Privacy />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5A5F]" />
      </div>
    );
  }

  // Not logged in: Show Auth screen if requested, otherwise show the Landing Page!
  if (!isAuthenticated) {
    if (showAuth) {
      return (
        <Auth
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setShowAuth(false);
          }}
          onBack={() => setShowAuth(false)}
        />
      );
    }
    return (
      <LandingPage
        onGetStarted={() => setShowAuth(true)}
        isAuthenticated={false}
      />
    );
  }

  // Logged in: Render App shell with Tab navigation
  return (
    <div className="App min-h-screen flex flex-col">
      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div
            className="font-extrabold text-2xl tracking-tighter text-[#FF385C] cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            Ormayundo.
          </div>
          <div className="flex flex-wrap justify-center gap-2 items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'}`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${activeTab === 'manage' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'}`}
            >
              <Library className="w-3.5 h-3.5" /> Manage Cards
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${activeTab === 'home' ? 'bg-[#222222] text-white shadow-sm' : 'text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7]'}`}
            >
              <Home className="w-3.5 h-3.5" /> Home
            </button>

            {/* Direct extension download button in navbar */}
            <a
              href="/ormayundo-extension.zip"
              download="ormayundo-extension.zip"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#222222] bg-white border border-[#DDDDDD] rounded-full hover:border-[#222222] transition-colors shadow-xs ml-1"
              title="Download Extension ZIP"
            >
              <Download className="w-3.5 h-3.5 text-[#FF385C]" />
              <span className="hidden sm:inline">Extension</span> ZIP
            </a>

            {/* Logout Button */}
            <div className="w-px h-6 bg-[#EBEBEB] mx-1"></div>
            <button
              onClick={async () => {
                await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                setIsAuthenticated(false);
                setActiveTab('dashboard');
              }}
              className="text-xs font-bold text-[#717171] hover:text-[#222222] transition-colors px-2 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 animate-fade-in pb-12">
        {activeTab === 'dashboard' && <AnalyticsDashboard />}
        {activeTab === 'manage' && <FlashcardManager />}
        {activeTab === 'home' && (
          <LandingPage
            onGetStarted={() => setActiveTab('dashboard')}
            isAuthenticated={true}
          />
        )}
      </main>
    </div>
  );
}

export default App;
