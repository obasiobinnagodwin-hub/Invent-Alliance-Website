'use client';

/**
 * Loading States Components
 * 
 * Provides skeleton loaders for dashboard sections to improve perceived performance.
 * Gated behind FEATURE_DASHBOARD_SKELETON_LOADING feature flag.
 */

interface SkeletonLoaderProps {
  type: 'metric' | 'chart' | 'table' | 'card';
  count?: number;
}

/**
 * Skeleton loader for metric cards
 */
function MetricSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-slate-200 rounded w-24 mb-3 animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-3 bg-slate-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="h-8 w-8 bg-slate-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for charts
 */
function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
      <div className="w-full h-[250px] bg-slate-100 rounded animate-pulse"></div>
    </div>
  );
}

/**
 * Skeleton loader for tables
 */
function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex gap-4 pb-2 border-b border-slate-200">
          <div className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 py-2">
            <div className="h-4 bg-slate-100 rounded flex-1 animate-pulse"></div>
            <div className="h-4 bg-slate-100 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for generic cards
 */
function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-2 border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-32 mb-3 animate-pulse"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Main skeleton loader component
 * 
 * @param type - Type of skeleton to render ('metric', 'chart', 'table', 'card')
 * @param count - Number of skeletons to render (default: 1)
 */
export default function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const skeletons = {
    metric: MetricSkeleton,
    chart: ChartSkeleton,
    table: TableSkeleton,
    card: CardSkeleton,
  };

  const SkeletonComponent = skeletons[type];

  if (count === 1) {
    return <SkeletonComponent />;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}

/**
 * Dashboard overview skeleton (complete layout)
 */
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <SkeletonLoader type="metric" count={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonLoader type="chart" />
        <SkeletonLoader type="chart" />
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    </div>
  );
}

/**
 * Dashboard pages/sources skeleton
 */
export function DashboardTableSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <SkeletonLoader type="chart" />
      <SkeletonLoader type="table" />
    </div>
  );
}

