/**
 * 4-card KPI Skeleton for Dashboard & Analytics
 */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-5 animate-pulse`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-7 w-32 bg-slate-200 rounded-lg" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Rows Skeleton - renders directly inside <tbody> with realistic cell placeholders
 */
export function TableSkeletonRows({
  cols = 7,
  rows = 5,
}: {
  cols?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="animate-pulse border-b border-slate-100">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-5">
              {cIdx === 0 ? (
                // First column: ID or Checkbox
                <div className="h-4 w-16 bg-slate-200 rounded font-mono" />
              ) : cIdx === 1 ? (
                // Second column: Customer or Product info with avatar
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-1.5 flex-1 max-w-[160px]">
                    <div className="h-3.5 w-full bg-slate-200 rounded" />
                    <div className="h-2.5 w-3/4 bg-slate-100 rounded" />
                  </div>
                </div>
              ) : cIdx === cols - 1 ? (
                // Last column: Action buttons
                <div className="flex justify-end gap-1.5">
                  <div className="h-7 w-16 bg-slate-100 rounded-lg" />
                </div>
              ) : cIdx % 2 === 0 ? (
                // Badge or short text
                <div className="h-5 w-20 bg-slate-100 rounded-full" />
              ) : (
                // Amount or date text
                <div className="h-4 w-24 bg-slate-200 rounded" />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * Full Table Container Skeleton
 */
export function TableSkeleton({
  cols = 7,
  rows = 5,
  headerTitle = "Đang tải dữ liệu...",
}: {
  cols?: number;
  rows?: number;
  headerTitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden animate-pulse">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="h-5 w-36 bg-slate-200 rounded">{headerTitle}</div>
        <div className="h-8 w-48 bg-slate-100 rounded-xl" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="py-3.5 px-5">
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <TableSkeletonRows cols={cols} rows={rows} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Revenue & Analytics Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-3.5 w-60 bg-slate-100 rounded" />
        </div>
        <div className="h-8 w-32 bg-slate-100 rounded-xl" />
      </div>

      {/* Metric highlights */}
      <div className="flex gap-4">
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
      </div>

      {/* SVG Chart area shimmer */}
      <div className="h-[220px] w-full bg-slate-50 border border-slate-100 rounded-xl flex items-end justify-between p-4 gap-2">
        {[40, 65, 35, 75, 50, 85, 90, 60, 95, 80, 70, 88].map((h, i) => (
          <div
            key={i}
            className="w-full bg-slate-200/70 rounded-t-md transition-all"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Top Products / List Items Skeleton
 */
export function ListCardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
              <div className="h-2.5 w-1/2 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
