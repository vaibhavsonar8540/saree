"use client";

import React from "react";

// Product Card Skeleton Loader
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl sm:rounded-2xl bg-white border border-stone-200/80 overflow-hidden shadow-xs animate-pulse">
      {/* Aspect ratio image container */}
      <div className="w-full aspect-[4/5] sm:aspect-3/4 bg-stone-200/80 relative" />

      {/* Details Section */}
      <div className="p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Category & color swatches placeholder */}
          <div className="flex items-center justify-between">
            <div className="h-2.5 bg-stone-200/80 rounded-md w-1/3" />
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-stone-200/80" />
              <div className="w-3 h-3 rounded-full bg-stone-200/80" />
            </div>
          </div>

          {/* Title lines */}
          <div className="h-3.5 bg-stone-200/80 rounded-md w-11/12" />
          <div className="h-3.5 bg-stone-200/80 rounded-md w-3/4" />

          {/* Description line */}
          <div className="h-2.5 bg-stone-200/60 rounded-md w-full" />
        </div>

        {/* Price & CTA row */}
        <div className="pt-2 sm:pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
          <div className="space-y-1">
            <div className="h-4 bg-stone-200/80 rounded-md w-16" />
            <div className="h-2 bg-stone-200/50 rounded-md w-12" />
          </div>
          <div className="h-8 bg-stone-200/80 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

// Product Grid Skeleton Loader (for catalog/wishlist)
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}

// Product Detail Page Skeleton Loader
export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs">
        {/* Left 7 Cols: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="w-full h-[450px] sm:h-[580px] bg-stone-200/80 rounded-2xl" />
          <div className="flex items-center gap-3 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-24 rounded-xl bg-stone-200/80 shrink-0" />
            ))}
          </div>
        </div>

        {/* Right 5 Cols: Spec & Price details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="h-3 bg-stone-200/80 rounded-md w-1/4" />
            <div className="h-7 bg-stone-200/80 rounded-md w-11/12" />
            <div className="h-4 bg-stone-200/80 rounded-md w-3/4" />
            <div className="flex items-center gap-3 pt-2">
              <div className="h-6 bg-stone-200/80 rounded-md w-16" />
              <div className="h-4 bg-stone-200/60 rounded-md w-32" />
            </div>
          </div>

          <div className="space-y-2 py-3 border-t border-b border-stone-100">
            <div className="h-8 bg-stone-200/80 rounded-md w-40" />
            <div className="h-3 bg-stone-200/60 rounded-md w-56" />
          </div>

          {/* Color variants placeholder */}
          <div className="space-y-2">
            <div className="h-3 bg-stone-200/80 rounded-md w-28" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24 rounded-full bg-stone-200/80" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="h-12 bg-stone-200/80 rounded-xl" />
            <div className="h-12 bg-stone-200/80 rounded-xl" />
          </div>

          {/* Specs Accordions placeholder */}
          <div className="space-y-2 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-stone-100 rounded-xl border border-stone-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Drawer / Cart Page Skeleton Loader
export function CartSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="p-4 rounded-2xl border border-stone-200 bg-white flex gap-4">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-stone-200/80 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-stone-200/80 rounded-md w-3/4" />
            <div className="h-3 bg-stone-200/60 rounded-md w-1/3" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-7 bg-stone-200/80 rounded-full w-24" />
              <div className="w-8 h-8 rounded-full bg-stone-200/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Arch / Curved Carousel Skeleton
export function CurvedCarouselSkeleton() {
  return (
    <div className="w-full bg-[#0D1512] text-white py-12 relative overflow-hidden animate-pulse">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <div className="relative w-full h-[320px] flex justify-center items-center gap-6">
          <div className="w-[180px] h-[260px] bg-stone-800/60 rounded-2xl border border-white/10 scale-90 opacity-60" />
          <div className="w-[240px] h-[330px] bg-stone-800 rounded-3xl border border-[#C5A059]/40 z-20 shadow-2xl" />
          <div className="w-[180px] h-[260px] bg-stone-800/60 rounded-2xl border border-white/10 scale-90 opacity-60" />
        </div>
        <div className="h-6 bg-stone-800 rounded-md w-48 mt-4" />
      </div>
    </div>
  );
}
