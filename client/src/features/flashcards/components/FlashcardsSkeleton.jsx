import Skeleton from '../../../shared/components/Skeleton';

export default function FlashcardsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in" aria-busy="true" aria-label="Loading flashcards">
      {/* Search Bar Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <Skeleton variant="rounded" className="h-7 w-48" />
          <Skeleton variant="rounded" className="h-4 w-72" />
        </div>
        <Skeleton variant="pill" className="h-10 w-full sm:w-80" />
      </div>

      {/* Deck Filter Tabs Skeleton */}
      <div className="relative">
        <div className="flex items-center gap-2 pt-2 pb-2 border-b border-gray-100 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <Skeleton variant="pill" className="h-9 w-20 shrink-0" />
          <Skeleton variant="pill" className="h-9 w-24 shrink-0" />
          <Skeleton variant="pill" className="h-9 w-28 shrink-0" />
          <Skeleton variant="pill" className="h-9 w-20 shrink-0" />
          <Skeleton variant="pill" className="h-9 w-32 shrink-0" />
          <Skeleton variant="pill" className="h-9 w-24 shrink-0" />
          <div className="w-5 shrink-0 sm:hidden" aria-hidden="true" />
        </div>
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 via-gray-50/70 to-transparent sm:hidden"
          aria-hidden="true"
        />
      </div>

      {/* Flashcard Card Skeletons */}
      <div className="grid gap-5">
        {[1, 2, 3].map((key) => (
          <div
            key={key}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4"
          >
            {/* Question Header & Deck Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton variant="rounded" className="h-5 w-3/4" />
                <Skeleton variant="rounded" className="h-3.5 w-1/3" />
              </div>
              <Skeleton variant="pill" className="h-7 w-20 shrink-0" />
            </div>

            {/* Selected Text Quote Block */}
            <div className="pl-3 border-l-2 border-gray-200 py-1 space-y-2">
              <Skeleton variant="rounded" className="h-3.5 w-full" />
              <Skeleton variant="rounded" className="h-3.5 w-4/5" />
            </div>

            {/* Card Metadata & Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton variant="pill" className="h-6 w-20" />
                <Skeleton variant="pill" className="h-6 w-16" />
                <Skeleton variant="pill" className="h-6 w-24" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton variant="circular" className="h-8 w-8" />
                <Skeleton variant="circular" className="h-8 w-8" />
                <Skeleton variant="circular" className="h-8 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

