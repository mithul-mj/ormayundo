import { Search, Bomb } from 'lucide-react';

export default function SearchBar({ searchQuery, onSearchChange, onWipeAll }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Flashcards</h1>
        <p className="text-gray-500 mt-1">
          View, filter by deck, edit, or delete your knowledge base.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            className={
      [
        'w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none',
        'focus:ring-2 focus:ring-brand-light'
      ].join(' ')
    }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          onClick={onWipeAll}
          className={
      [
        'flex items-center justify-center gap-2 px-5 py-2 bg-red-50 text-red-600',
        'rounded-xl font-bold hover:bg-red-100 transition-colors w-full sm:w-auto',
        'shadow-sm cursor-pointer'
      ].join(' ')
    }
        >
          <Bomb className="w-4 h-4" /> Wipe All
        </button>
      </div>
    </div>
  );
}
