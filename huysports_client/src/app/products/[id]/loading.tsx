import React from "react";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-slate-200 rounded" />
        <div className="h-4 w-4 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-4 w-4 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>

      {/* Main 2-Column Detail Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-200/80" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-slate-100 border border-slate-200" />
            ))}
          </div>
        </div>

        {/* Right: Info & Actions Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-emerald-100 rounded-md" />
              <div className="h-5 w-28 bg-slate-100 rounded-md" />
            </div>
            <div className="h-8 w-4/5 bg-slate-200 rounded-lg" />
            <div className="h-4 w-36 bg-slate-100 rounded" />
          </div>

          {/* Price Card Skeleton */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="h-7 w-36 bg-emerald-200/70 rounded-md" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </div>

          {/* Size Options Skeleton */}
          <div className="space-y-2.5">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="flex gap-2">
              {["S", "M", "L", "XL", "2XL"].map((s) => (
                <div key={s} className="h-10 w-14 rounded-lg bg-slate-100 border border-slate-200" />
              ))}
            </div>
          </div>

          {/* Color Options Skeleton */}
          <div className="space-y-2.5">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3].map((c) => (
                <div key={c} className="h-8 w-20 rounded-full bg-slate-100 border border-slate-200" />
              ))}
            </div>
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="h-12 flex-1 rounded-full bg-slate-200" />
            <div className="h-12 flex-1 rounded-full bg-emerald-200/70" />
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-50 border border-slate-100" />
            ))}
          </div>
        </div>
      </div>

      {/* Related Products Strip */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
