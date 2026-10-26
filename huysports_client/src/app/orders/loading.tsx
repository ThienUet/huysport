import React from "react";

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center space-y-2">
        <div className="h-8 w-56 bg-slate-200 rounded-lg mx-auto" />
        <div className="h-4 w-80 bg-slate-100 rounded-md mx-auto" />
      </div>

      {/* Search Input Skeleton */}
      <div className="max-w-xl mx-auto flex gap-2">
        <div className="h-11 flex-1 bg-slate-100 border border-slate-200 rounded-full" />
        <div className="h-11 w-24 bg-emerald-200/70 rounded-full" />
      </div>

      {/* Recent Chips Skeleton */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-24 bg-slate-100 rounded-lg" />
        ))}
      </div>

      {/* Order Cards Skeleton */}
      <div className="space-y-4 pt-4">
        {[1, 2].map((idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-5 shadow-xs">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                  <div className="h-5 w-24 bg-blue-100 rounded-full" />
                </div>
                <div className="h-3.5 w-40 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-28 bg-emerald-100 rounded" />
            </div>

            {/* Items row */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-slate-200 rounded shrink-0" />
            </div>

            {/* Footer timeline skeleton */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="h-4 w-48 bg-slate-100 rounded" />
              <div className="h-8 w-24 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
