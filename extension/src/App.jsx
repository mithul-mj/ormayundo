import { useState, useEffect, useCallback } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import api from './api';
import { WEB_APP_URL } from './config';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupEnabled, setPopupEnabled] = useState(true);

  // Sync token to backend via background GCM
  const syncFcmToken = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ action: 'SYNC_FCM_TOKEN' });
    }
  };

  const handleLogout = useCallback(async () => {
    setUser(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['ormayundo_user']);
      chrome.runtime.sendMessage({ action: 'USER_LOGOUT' });
    } else {
      localStorage.removeItem('ormayundo_user');
    }
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  }, []);

  // 1. Verify session with server on popup open
  useEffect(() => {
    let ignore = false;
    const initAuth = async () => {
      try {
        let savedUser = null;
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['ormayundo_user', 'ormayundo_popup_enabled']);
          savedUser = result.ormayundo_user;
          if (result.ormayundo_popup_enabled !== undefined) {
            setPopupEnabled(result.ormayundo_popup_enabled);
          }
        } else {
          const local = localStorage.getItem('ormayundo_user');
          if (local) savedUser = JSON.parse(local);
        }

        if (savedUser && !ignore) {
          setUser(savedUser); // Optimistic load
          setIsLoading(false);
          try {
            const meRes = await api.get('/auth/me');
            if (!ignore && meRes.data?.user) {
              setUser(meRes.data.user);
            }
            syncFcmToken();
          } catch (authErr) {
            if (authErr.isAuthError || authErr.response?.status === 401) {
              if (!ignore) handleLogout();
            }
          }
        } else {
          if (!ignore) setIsLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (!ignore) setIsLoading(false);
      }
    };

    initAuth();
    return () => {
      ignore = true;
    };
  }, [handleLogout]);

  // 2. Save the user data locally when they log in successfully
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    syncFcmToken();

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ ormayundo_user: userData });
      chrome.runtime.sendMessage({ action: 'USER_LOGIN' });
    } else {
      localStorage.setItem('ormayundo_user', JSON.stringify(userData));
    }
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
          href={WEB_APP_URL}
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
              className="flex items-center gap-2 text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer select-none"
            >
              <span>Auto-Popup</span>
              <div
                className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${popupEnabled ? 'bg-brand' : 'bg-gray-200'
                  }`}
              >
                <div
                  className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${popupEnabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                />
              </div>
            </button>

            {/* Airbnb-style subtle dot divider */}
            <span className="text-gray-300 text-xs font-bold leading-none select-none">·</span>

            {/* Airbnb-style Logout Button */}
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-muted hover:text-ink transition-colors cursor-pointer"
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
          <Dashboard user={user} onLogout={handleLogout} />
        )}
      </main>

    </div>
  );
}

export default App;
