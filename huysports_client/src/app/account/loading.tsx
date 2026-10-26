import React from "react";

export default function AccountLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-pulse">
      {/* Profile Header Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-52 bg-slate-100 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-24 bg-amber-100 rounded-full" />
              <div className="h-5 w-20 bg-emerald-100 rounded-full" />
            </div>
          </div>
        </div>

        <div className="h-10 w-28 bg-slate-100 rounded-xl" />
      </div>

      {/* Tabs Bar Skeleton */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <div className="h-9 w-28 bg-emerald-100 rounded-lg" />
        <div className="h-9 w-28 bg-slate-100 rounded-lg" />
        <div className="h-9 w-28 bg-slate-100 rounded-lg" />
      </div>

      {/* Content Card Skeleton */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-xs">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
