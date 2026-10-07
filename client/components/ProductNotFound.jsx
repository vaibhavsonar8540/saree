"use client";

import React from "react";
import Link from "next/link";
import { FiGrid, FiRefreshCw, FiArrowRight, FiSearch, FiSliders } from "react-icons/fi";
import { GiEmerald } from "react-icons/gi";

export default function ProductNotFound({
  title,
  categoryName,
  description,
  isFilterActive = false,
  onResetFilters,
  showQuickLinks = true,
  actionText = "Show All Sarees",
  actionHref = "/sarees",
}) {
  const displayTitle =
    title ||
    (categoryName
      ? `No Sarees Found in ${categoryName}`
      : "No Sarees Match Your Search");

  const displayDescription =
    description ||
    (categoryName
      ? `We currently don't have sarees matching this specific criteria under ${categoryName}. Try adjusting your filters or explore our other handcrafted collections.`
      : "We couldn't find any saree designs matching your selected filters. Try broadening your criteria or view our complete collection.");

  const popularCollections = [
    { name: "Organza Sarees", href: "/saree/organza" },
    { name: "Banarasi Silk", href: "/saree/banarasi" },
    { name: "Bridal Finery", href: "/saree/bridal" },
    { name: "Traditional Classics", href: "/saree/traditional" },
    { name: "Pure Silk", href: "/saree/silk" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#FAF8F5] via-[#F5F2EB] to-[#EFECE6] border border-[#C5A059]/40 shadow-lg text-center relative overflow-hidden">
      {/* Background Decorative Flourish Circles */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#1B5E3B]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main Luxury Icon Badge */}
      <div className="relative z-10 mx-auto mb-6 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#F5F2EB] to-[#EFECE6] border-2 border-[#C5A059]/50 shadow-md flex items-center justify-center group">
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#1B5E3B]/10 border border-[#1B5E3B]/20 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <FiSearch className="w-8 h-8 text-[#C5A059] group-hover:rotate-12 transition-transform duration-300" />
        </div>
      </div>

      {/* Title with Gold Flourish */}
      <div className="relative z-10 space-y-2">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#222222] tracking-tight leading-snug">
          {displayTitle}
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent mx-auto rounded-full my-3" />
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
          {displayDescription}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-8">
        {isFilterActive && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#EFECE6] hover:bg-stone-300/70 text-[#222222] text-xs font-bold uppercase tracking-wider border border-[#C5A059]/40 shadow-xs transition-all cursor-pointer"
          >
            <FiRefreshCw className="w-4 h-4 text-[#1B5E3B]" />
            <span>Reset Filters</span>
          </button>
        )}

        <Link
          href={actionHref}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#1B5E3B] hover:bg-[#14462B] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer group"
        >
          <FiGrid className="w-4 h-4 text-[#C5A059]" />
          <span>{actionText}</span>
          <FiArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Popular Collections Quick Links */}
      {showQuickLinks && (
        <div className="relative z-10 mt-10 pt-8 border-t border-[#C5A059]/20">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
            Explore Popular Collections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {popularCollections.map((col) => (
              <Link
                key={col.name}
                href={col.href}
                className="text-xs px-3.5 py-1.5 rounded-full bg-[#F5F2EB] hover:bg-[#1B5E3B] text-zinc-700 hover:text-white font-medium border border-[#C5A059]/30 hover:border-[#1B5E3B] transition-all duration-200 shadow-2xs"
              >
                {col.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
