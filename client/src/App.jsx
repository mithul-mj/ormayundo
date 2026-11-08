import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_URL } from './shared/config';
import { initWebPush } from './shared/services/firebase';
import { DashboardNavbar } from './shared/components';

// Code-split feature domains for scalability and fast initial load
const LandingPage = lazy(() => import('./features/landing'));
const AnalyticsDashboard = lazy(() => import('./features/analytics'));
const FlashcardManager = lazy(() => import('./features/flashcards'));
const Auth = lazy(() => import('./features/auth'));
const Privacy = lazy(() => import('./features/privacy'));
const AdminPortal = lazy(() => import('./features/admin'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-brand w-8 h-8" />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState(() => (
    window.location.pathname === '/admin' ? 'admin' : 'dashboard'
  ));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(
    () => window.location.pathname !== '/privacy'
  );

  // Client-side navigation helper with browser history support
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (path === '/admin') {
      setActiveTab('admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      if (window.location.pathname === '/admin') {
        setActiveTab('admin');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check authentication status on startup using lightweight endpoint
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        setUser(res.data);
        setIsAuthenticated(true);
        if (window.location.pathname === '/admin' && res.data?.role === 'admin') {
          setActiveTab('admin');
        }
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (window.location.pathname !== '/privacy') {
      checkAuth();
      axios
        .get(`${API_URL}/announcement`)
        .then((res) => setAnnouncement(res.data))
        .catch(() => {});
    }
  }, []);

  // Sync web push notification token when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initWebPush(API_URL);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      navigate('/');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  // 1. Standalone Page: Privacy Policy (/privacy)
  if (currentPath === '/privacy') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Privacy onGoHome={() => navigate('/')} />
      </Suspense>
    );
  }

  // 2. Standalone Page: Login / Auth (/login)
  if (currentPath === '/login' && !isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Auth
          onLoginSuccess={async () => {
            try {
              const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
              setUser(res.data);
            } catch (err) {
              console.error('Failed to load user profile on login:', err);
            }
            setIsAuthenticated(true);
            navigate('/app');
          }}
          onBack={() => navigate('/')}
        />
      </Suspense>
    );
  }

  // 3. Standalone Page: App Dashboard (/app, /dashboard, or /admin)
  if (currentPath === '/app' || currentPath === '/dashboard' || currentPath === '/admin') {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Auth
            onLoginSuccess={async () => {
              try {
                const res = await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
                setUser(res.data);
              } catch (err) {
                console.error('Failed to load user profile on login:', err);
              }
              setIsAuthenticated(true);
              navigate(currentPath === '/admin' ? '/admin' : '/app');
            }}
            onBack={() => navigate('/')}
          />
        </Suspense>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 text-ink flex flex-col font-sans">
        <DashboardNavbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onNavigateHome={() => navigate('/')}
          onLogout={handleLogout}
          user={user}
        />

        {announcement?.announcementActive && announcement?.announcementBanner && (
          <div className="bg-brand text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs animate-fade-in">
            <span>📢 Announcement:</span>
            <span>{announcement.announcementBanner}</span>
          </div>
        )}

        <main className="flex-1 animate-fade-in pb-12">
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'dashboard' ? (
              <AnalyticsDashboard />
            ) : activeTab === 'manage' ? (
              <FlashcardManager />
            ) : activeTab === 'admin' && user?.role === 'admin' ? (
              <AdminPortal />
            ) : (
              <AnalyticsDashboard />
            )}
          </Suspense>
        </main>
      </div>
    );
  }

  // 4. Standalone Page: Landing Page (/)
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
