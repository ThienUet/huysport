"use client";

import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full animate-pulse shadow-xs">
      {/* Product Image Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-slate-100/90 overflow-hidden rounded-t-xl flex items-center justify-center">
        {/* Shimmer / Skeleton icon */}
        <div className="w-12 h-12 rounded-full bg-slate-200/70" />
        
        {/* Top Badges Skeleton */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          <div className="h-4 w-12 bg-slate-200 rounded-md" />
        </div>

        <div className="absolute top-2.5 right-2.5">
          <div className="h-4 w-16 bg-slate-200 rounded-md" />
        </div>
      </div>

      {/* Product Info Placeholder */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-3 bg-white">
        <div className="space-y-2">
          {/* Brand & Rating line */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-200 rounded" />
          </div>

          {/* Title line 1 & 2 */}
          <div className="h-4 w-5/6 bg-slate-200 rounded" />
          <div className="h-4 w-2/3 bg-slate-100 rounded" />
        </div>

        {/* Price & Action line */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-4 w-20 bg-emerald-100/80 rounded" />
            <div className="h-3 w-14 bg-slate-100 rounded" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
