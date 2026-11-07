import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-6 mt-8 mb-4">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={[
          'flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300',
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : [
                'text-gray-700 bg-white shadow-sm border border-gray-100',
                'hover:shadow-md hover:text-brand-light hover:-translate-x-0.5',
              ].join(' '),
        ].join(' ')}
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-400">Page</span>
        <span className={
      [
        'w-8 h-8 flex items-center justify-center bg-gray-900 text-white',
        'rounded-full font-bold text-sm shadow-md'
      ].join(' ')
    }>
          {currentPage}
        </span>
        <span className="text-sm font-semibold text-gray-400">of {totalPages}</span>
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={[
          'flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300',
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : [
                'text-gray-700 bg-white shadow-sm border border-gray-100',
                'hover:shadow-md hover:text-brand-light hover:translate-x-0.5',
              ].join(' '),
        ].join(' ')}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
