import { Brain, LayoutDashboard, Library, ShieldCheck, LogOut } from 'lucide-react';

export default function DashboardNavbar({
  activeTab,
  onSelectTab,
  onNavigateHome,
  onLogout,
  user,
}) {
  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Return Link */}
        <div
          className="flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={onNavigateHome}
          title="Return to Landing Page"
        >
          <Brain className="w-5 h-5 text-brand transition-transform group-hover:scale-105" />
          <span className="font-extrabold text-lg sm:text-xl tracking-tight text-neutral-900 hidden min-[380px]:inline">
            Ormayundo<span className="text-brand">.</span>
          </span>
        </div>

        {/* Tab Controls & User Area */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer',
              activeTab === 'dashboard'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
            ].join(' ')}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('manage')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer',
              activeTab === 'manage'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100',
            ].join(' ')}
          >
            <Library className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Flashcards</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-xs transition-all cursor-pointer',
                activeTab === 'admin'
                  ? 'bg-brand text-white'
                  : 'text-brand bg-rose-50 hover:bg-rose-100 border border-rose-200/50',
              ].join(' ')}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          <div className="w-px h-4 bg-gray-200 mx-1 sm:mx-2" />

          <button
            onClick={onLogout}
            title="Log Out"
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-red-600 transition-colors px-2.5 py-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
