import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './index.css';
import { API_URL } from './config';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupEnabled, setPopupEnabled] = useState(true);

  // VAPID KEY
  const VAPID_KEY = "BH-3PZlKBc-8yvnygadCUQitn85ECyWa_iFrniI8YP1KHU1tX3X7kbc8fxw5q12NQiRhWUd2GeuX7M1JJdGgpXg";

  // 1. Check if we are already logged in when the popup opens!
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['ormayundo_user', 'ormayundo_popup_enabled'], (result) => {
        if (result.ormayundo_user) {
          setUser(result.ormayundo_user);
          // Try to get and sync FCM token whenever popup opens while logged in
          syncFcmToken();
        }
        if (result.ormayundo_popup_enabled !== undefined) {
          setPopupEnabled(result.ormayundo_popup_enabled);
        }
        setIsLoading(false);
      });
    } else {
      const savedUser = localStorage.getItem('ormayundo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        syncFcmToken();
      }
      setIsLoading(false);
    }
  }, []);

  const syncFcmToken = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'SYNC_FCM_TOKEN' });
    }
  };

  // 2. Save the user data locally when they log in successfully
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    syncFcmToken(); // Sync token on fresh login

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ ormayundo_user: userData });
      chrome.runtime.sendMessage({ action: 'USER_LOGIN' });
    } else {
      localStorage.setItem('ormayundo_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['ormayundo_user']);
      chrome.runtime.sendMessage({ action: 'USER_LOGOUT' });
    } else {
      localStorage.removeItem('ormayundo_user');
    }
    // Note: To be 100% secure, we should also call the backend /logout here to clear the HTTP-only cookies.
  };

  const togglePopup = () => {
    const newVal = !popupEnabled;
    setPopupEnabled(newVal);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ ormayundo_popup_enabled: newVal });
    }
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-white"><p className="text-gray-400">Loading...</p></div>;
  }

  return (
    <div className="relative w-full h-full flex flex-col box-border bg-white text-gray-800">

      {/* Minimalist Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-100">
        <a
          href="https://ormayundo-woad.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-xl tracking-tight text-brand hover:opacity-80 transition-opacity cursor-pointer"
        >
          Ormayundo.
        </a>
        {user && (
          <div className="flex items-center gap-3.5">
            {/* Airbnb-style Smooth Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={popupEnabled}
              onClick={togglePopup}
              className="flex items-center gap-2 text-xs font-medium text-[#717171] hover:text-[#222222] transition-colors cursor-pointer select-none"
            >
              <span>Auto-Popup</span>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  popupEnabled ? 'bg-[#FF385C]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                    popupEnabled ? 'translate-x-3.5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            {/* Airbnb-style subtle dot divider */}
            <span className="text-gray-300 text-xs font-bold leading-none select-none">·</span>

            {/* Airbnb-style Logout Button */}
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[#717171] hover:text-[#222222] transition-colors cursor-pointer"
              title="Logout"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto">
        {!user ? (
          <Auth onLoginSuccess={handleLoginSuccess} />
        ) : (
          <Dashboard user={user} />
        )}
      </main>

    </div>
  );
}

export default App;
