import { useState, useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { API_URL } from './shared/config';
import { queryKeys } from './shared/lib/queryKeys';
import { initWebPush } from './shared/services/firebase';
import { DashboardNavbar } from './shared/components';
import { ROUTES, APP_TABS } from './shared/constants';
import { AnalyticsSkeleton } from './features/analytics/components';
import { FlashcardsSkeleton } from './features/flashcards/components';
import { useCurrentUserQuery, useLogoutMutation } from './features/auth/api/authApi';

// Code-split feature domains for scalability and fast initial load
const LandingPage = lazy(() => import('./features/landing'));
const AnalyticsDashboard = lazy(() => import('./features/analytics'));
const FlashcardManager = lazy(() => import('./features/flashcards'));
const FlashcardStudySession = lazy(() => import('./features/flashcards/components/FlashcardStudySession'));
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
  const queryClient = useQueryClient();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isStudySessionOpen, setIsStudySessionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => (
    window.location.pathname === ROUTES.ADMIN ? APP_TABS.ADMIN : APP_TABS.DASHBOARD
  ));

  // Client-side navigation helper with browser history support
  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    if (path === ROUTES.ADMIN) {
      setActiveTab(APP_TABS.ADMIN);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      if (window.location.pathname === ROUTES.ADMIN) {
        setActiveTab(APP_TABS.ADMIN);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // TanStack Query for session & bundled announcement state
  const { data: user, isLoading: authLoading } = useCurrentUserQuery({
    enabled: currentPath !== ROUTES.PRIVACY,
  });

  const isAuthenticated = Boolean(user);

  const logoutMutation = useLogoutMutation({
    onSuccess: () => {
      navigate('/');
    },
  });

  // Sync web push notification token when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      initWebPush(API_URL);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLoginSuccess = (userData) => {
    if (userData) {
      queryClient.setQueryData(queryKeys.auth.me(), userData);
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    }
    navigate(ROUTES.APP);
  };

  if (authLoading && currentPath !== ROUTES.PRIVACY) {
    return <PageLoader />;
  }

  // 1. Standalone Page: Privacy Policy (/privacy)
  if (currentPath === ROUTES.PRIVACY) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Privacy onGoHome={() => navigate(ROUTES.HOME)} />
      </Suspense>
    );
  }

  // 2. Standalone Page: Login / Auth (/login)
  if (currentPath === ROUTES.LOGIN && !isAuthenticated) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Auth
          onLoginSuccess={handleLoginSuccess}
          onBack={() => navigate(ROUTES.HOME)}
        />
      </Suspense>
    );
  }

  // 3. Standalone Page: Dedicated Administrator Portal (/admin)
  if (currentPath === ROUTES.ADMIN) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPortal
          user={user}
          onLoginSuccess={(adminUser) => {
            queryClient.setQueryData(queryKeys.auth.me(), adminUser);
          }}
          onLogout={handleLogout}
          onNavigateHome={() => navigate(ROUTES.HOME)}
        />
      </Suspense>
    );
  }

  // 4. Standalone Page: App Dashboard (/app or /dashboard)
  if (currentPath === ROUTES.APP || currentPath === ROUTES.DASHBOARD) {
    if (!isAuthenticated) {
      return (
        <Suspense fallback={<PageLoader />}>
          <Auth
            onLoginSuccess={handleLoginSuccess}
            onBack={() => navigate(ROUTES.HOME)}
          />
        </Suspense>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAFAFA] text-ink flex flex-col font-sans">
        <DashboardNavbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === APP_TABS.ADMIN) {
              navigate(ROUTES.ADMIN);
            } else {
              setActiveTab(tab);
            }
          }}
          onNavigateHome={() => navigate(ROUTES.HOME)}
          onLogout={handleLogout}
          user={user}
        />

        {user?.announcement?.announcementActive && user?.announcement?.announcementBanner && (
          <aside
            aria-label="Platform Announcement"
            className="bg-brand text-white text-xs sm:text-[13px] font-medium shadow-xs animate-fade-in border-b border-brand-dark/20"
          >
            <div className="max-w-6xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-center gap-2 flex-wrap text-center leading-relaxed">
              <span className="inline-flex items-center gap-1 font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider shrink-0">
                📢 Announcement
              </span>
              <span className="break-words max-w-4xl font-semibold">
                {user.announcement.announcementBanner}
              </span>
            </div>
          </aside>
        )}

        <main className="flex-1 animate-fade-in pb-12">
          {activeTab === APP_TABS.DASHBOARD ? (
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsDashboard onNavigateToReview={() => setIsStudySessionOpen(true)} />
            </Suspense>
          ) : activeTab === APP_TABS.MANAGE ? (
            <Suspense
              fallback={
                <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
                  <FlashcardsSkeleton />
                </div>
              }
            >
              <FlashcardManager onOpenStudySession={() => setIsStudySessionOpen(true)} />
            </Suspense>
          ) : (
            <Suspense fallback={<AnalyticsSkeleton />}>
              <AnalyticsDashboard onNavigateToReview={() => setIsStudySessionOpen(true)} />
            </Suspense>
          )}
        </main>

        {/* Global Interactive Flashcard Study Session Modal */}
        {isStudySessionOpen && (
          <Suspense fallback={null}>
            <FlashcardStudySession onClose={() => setIsStudySessionOpen(false)} />
          </Suspense>
        )}
      </div>
    );
  }

  // 5. Standalone Page: Landing Page (/)
  return (
    <Suspense fallback={<PageLoader />}>
      <LandingPage
        onGetStarted={() => {
          if (isAuthenticated) {
            navigate(ROUTES.APP);
          } else {
            navigate(ROUTES.LOGIN);
          }
        }}
        isAuthenticated={isAuthenticated}
      />
    </Suspense>
  );
}
