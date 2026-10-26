import React from "react";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-32 bg-slate-100 rounded-md animate-pulse" />
      </div>

      {/* Search & Sort Bar Skeleton */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3 animate-pulse">
        <div className="h-9 w-64 max-w-md bg-slate-100 rounded-lg" />
        <div className="h-9 w-36 bg-slate-100 rounded-lg" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden lg:block bg-white p-5 rounded-xl border border-gray-200 space-y-6 animate-pulse">
          <div className="h-5 w-24 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-full bg-slate-100 rounded-lg" />
            ))}
          </div>
          <div className="h-5 w-28 bg-slate-200 rounded pt-2" />
          <div className="h-10 w-full bg-slate-100 rounded-lg" />
          <div className="h-5 w-20 bg-slate-200 rounded pt-2" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-10 bg-slate-100 rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="lg:col-span-3 grid grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
