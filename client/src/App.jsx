import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Library, Loader2 } from 'lucide-react'
import AnalyticsDashboard from './AnalyticsDashboard'
import FlashcardManager from './FlashcardManager'
import Auth from './Auth'
import Privacy from './Privacy'
import { API_URL } from './config'
import axios from 'axios'

function App() {
  const isPrivacyPage = window.location.pathname === '/privacy';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has a valid cookie by pinging an auth route or just checking if analytics returns 401
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/recall`, { withCredentials: true });
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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#FF5A5F]" /></div>;
  }

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="App min-h-screen flex flex-col">
      <nav className="glass-panel sticky top-0 z-50 shadow-sm border-b border-gray-100/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-auto min-h-[4rem] py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] tracking-tighter cursor-default">
            Ormayundo.
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 items-center w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-[#FF5A5F]/10 text-[#FF5A5F] shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Analytics
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'manage' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Library className="w-4 h-4" /> Manage Cards
            </button>

            {/* Added Logout Button */}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button
              onClick={async () => {
                await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
                setIsAuthenticated(false);
              }}
              className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors px-2"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 animate-fade-in pb-12">
        {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <FlashcardManager />}
      </main>
    </div>
  )
}

export default App
