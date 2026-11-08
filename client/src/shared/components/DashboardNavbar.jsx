import { Brain, LayoutDashboard, Library, ShieldCheck, LogOut } from 'lucide-react';

export default function DashboardNavbar({
  activeTab,
  onSelectTab,
  onNavigateHome,
  onLogout,
  user,
}) {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand Return Link */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={onNavigateHome}
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow-sm shadow-brand/20 group-hover:scale-105 transition-transform">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-ink">
            Ormayundo<span className="text-brand">.</span>
          </span>
        </div>

        {/* Tab Controls & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={[
              'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer',
              activeTab === 'dashboard'
                ? 'bg-ink text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-surface',
            ].join(' ')}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('manage')}
            className={[
              'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer',
              activeTab === 'manage'
                ? 'bg-ink text-white shadow-xs'
                : 'text-muted hover:text-ink hover:bg-surface',
            ].join(' ')}
          >
            <Library className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Cards</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => onSelectTab('admin')}
              className={[
                'flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-full font-bold text-xs transition-all cursor-pointer',
                activeTab === 'admin'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-brand bg-rose-50 hover:bg-rose-100 border border-rose-200/60',
              ].join(' ')}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          <div className="w-px h-5 bg-divider mx-1 sm:mx-2" />

          <button
            onClick={onLogout}
            title="Log Out"
            className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand transition-colors px-2 py-1.5 rounded-full hover:bg-surface cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 sm:hidden" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
