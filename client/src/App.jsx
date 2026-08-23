import React, { useState, useEffect } from 'react'
import { LayoutDashboard, Library, Loader2 } from 'lucide-react'
import AnalyticsDashboard from './AnalyticsDashboard'
import FlashcardManager from './FlashcardManager'
import Auth from './Auth'
import { API_URL } from './config'
import axios from 'axios'

function App() {
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
    checkAuth();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#FF5A5F]" /></div>;
  }

  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="App min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-2xl text-[#FF5A5F] tracking-tighter">Ormayundo.</div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
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

      <main className="flex-1">
        {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <FlashcardManager />}
      </main>
    </div>
  )
}

export default App
