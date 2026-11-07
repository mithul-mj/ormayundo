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

function PageLoader() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="animate-spin text-brand w-8 h-8" />
    </div>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(
    () => window.location.pathname !== '/privacy'
  );

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

  // Check authentication status on startup using lightweight endpoint
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${API_URL}/auth/me`, { withCredentials: true });
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    if (window.location.pathname !== '/privacy') {
      checkAuth();
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
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            navigate('/app');
          }}
          onBack={() => navigate('/')}
        />
      </Suspense>
    );
  }

  // 3. Standalone Page: App Dashboard (/app or /dashboard)
  if (currentPath === '/app' || currentPath === '/dashboard') {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Auth
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              navigate('/app');
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
        />

        <main className="flex-1 animate-fade-in pb-12">
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'dashboard' ? (
              <AnalyticsDashboard />
            ) : (
              <FlashcardManager />
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
