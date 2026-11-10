import Skeleton from '../../../shared/components/Skeleton';

export default function AnalyticsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in" aria-busy="true" aria-label="Loading analytics">
      {/* 3 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between"
          >
            <div className="space-y-2 flex-1">
              <Skeleton variant="rounded" className="h-3.5 w-24" />
              <Skeleton variant="rounded" className="h-8 w-20" />
              <Skeleton variant="rounded" className="h-3 w-32" />
            </div>
            <Skeleton variant="circular" className="h-12 w-12 shrink-0" />
          </div>
        ))}
      </div>

      {/* 2-Column Chart Row (Mastery Donut & Retention Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <Skeleton variant="rounded" className="h-5 w-40" />
              <Skeleton variant="rounded" className="h-3 w-56" />
            </div>
            <Skeleton variant="pill" className="h-7 w-20" />
          </div>
          <div className="flex items-center justify-center py-6">
            <Skeleton variant="circular" className="h-44 w-44" />
          </div>
          <div className="flex justify-center gap-4 pt-2">
            <Skeleton variant="pill" className="h-5 w-24" />
            <Skeleton variant="pill" className="h-5 w-24" />
            <Skeleton variant="pill" className="h-5 w-24" />
          </div>
        </div>

        {/* Retention Area Chart Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <Skeleton variant="rounded" className="h-5 w-44" />
              <Skeleton variant="rounded" className="h-3 w-60" />
            </div>
            <Skeleton variant="pill" className="h-7 w-24" />
          </div>
          <div className="h-48 flex items-end justify-between gap-3 pt-4">
            <Skeleton variant="rounded" className="h-24 flex-1" />
            <Skeleton variant="rounded" className="h-32 flex-1" />
            <Skeleton variant="rounded" className="h-28 flex-1" />
            <Skeleton variant="rounded" className="h-40 flex-1" />
            <Skeleton variant="rounded" className="h-36 flex-1" />
            <Skeleton variant="rounded" className="h-44 flex-1" />
            <Skeleton variant="rounded" className="h-40 flex-1" />
          </div>
          <div className="flex justify-between pt-2">
            <Skeleton variant="text" className="w-10" />
            <Skeleton variant="text" className="w-10" />
            <Skeleton variant="text" className="w-10" />
            <Skeleton variant="text" className="w-10" />
          </div>
        </div>
      </div>

      {/* 2-Column Chart Row 2 (Workload & Sources) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Bar Chart Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <Skeleton variant="rounded" className="h-5 w-36" />
              <Skeleton variant="rounded" className="h-3 w-48" />
            </div>
          </div>
          <div className="h-44 flex items-end justify-between gap-4 pt-4">
            {[40, 65, 30, 85, 55, 90, 70].map((h, i) => (
              <Skeleton key={i} variant="rounded" className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        {/* Sources List Skeleton */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="space-y-1.5">
              <Skeleton variant="rounded" className="h-5 w-32" />
              <Skeleton variant="rounded" className="h-3 w-44" />
            </div>
          </div>
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circular" className="h-7 w-7" />
                  <Skeleton variant="rounded" className="h-4 w-36" />
                </div>
                <Skeleton variant="pill" className="h-6 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

