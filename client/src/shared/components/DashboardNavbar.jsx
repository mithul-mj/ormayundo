import { Brain, LayoutDashboard, Library } from 'lucide-react';

export default function DashboardNavbar({
  activeTab,
  onSelectTab,
  onNavigateHome,
  onLogout,
}) {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-divider">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Return Link */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={onNavigateHome}
          title="Return to Landing Page"
        >
          <div className={
      [
        'w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white',
        'shadow-sm shadow-brand/20 group-hover:scale-105 transition-transform'
      ].join(' ')
    }>
            <Brain className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter text-brand">
            Ormayundo.
          </span>
        </div>

        {/* Tab Controls & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer',
              activeTab === 'dashboard'
                ? 'bg-ink text-white shadow-sm'
                : 'text-muted hover:text-ink hover:bg-surface',
            ].join(' ')}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => onSelectTab('manage')}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer',
              activeTab === 'manage'
                ? 'bg-ink text-white shadow-sm'
                : 'text-muted hover:text-ink hover:bg-surface',
            ].join(' ')}
          >
            <Library className="w-3.5 h-3.5" />
            <span>Manage Cards</span>
          </button>

          <div className="w-px h-6 bg-divider mx-2" />

          <button
            onClick={onLogout}
            className="text-xs font-bold text-muted hover:text-brand transition-colors px-2 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
