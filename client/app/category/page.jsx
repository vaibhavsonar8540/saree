"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import { FiArrowRight, FiGrid, FiLayers, FiRefreshCw } from "react-icons/fi";
import HeroBanner from "@/components/heroBanner";
import sareeDesktopImg from "@/assets/images/saree/saree-desktop.webp";
import sareeMobileImg from "@/assets/images/saree/saree-mobile.webp";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CategoryIndexPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories?includeSubcategories=true&isActive=true`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn("Failed to fetch categories index:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* HERO BANNER */}
      <HeroBanner
        src={sareeDesktopImg}
        mobileSrc={sareeMobileImg}
        align="left"
        badge="EXPLORE BY CATEGORY"
        badgeClass="inline-block px-3.5 py-1 rounded-full border border-[#C5A059]/80 bg-black/40 text-[#C5A059] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-xs shadow-md"
        title="Saree Collections & Categories"
        titleClass="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md"
        desc="Browse our handcrafted saree collections curated by fabric, weave, and heritage craft."
        descClass="text-xs sm:text-base text-zinc-200 max-w-xl font-normal leading-relaxed drop-shadow-xs"
        overlayClass="bg-gradient-to-r from-black/85 via-black/55 to-transparent"
        className="w-full shadow-md"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              All Saree Categories
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Select a category below to explore its specific handcrafted sarees.
            </p>
          </div>

          <Link
            href="/sarees"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B5E3B] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#14462B] transition-all shadow-md shrink-0"
          >
            <FiGrid className="w-4 h-4" />
            <span>View All Sarees</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-[#EFECE6] rounded-2xl border border-[#C5A059]/30" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-[#EFECE6] rounded-3xl border border-[#C5A059]/30">
            <FiLayers className="w-10 h-10 text-[#C5A059] mx-auto mb-3" />
            <h3 className="font-serif font-bold text-xl text-[#222222]">No Categories Found</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4">Explore our full saree collection directly.</p>
            <Link
              href="/sarees"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B5E3B] text-white text-xs font-bold uppercase rounded-xl"
            >
              Browse All Sarees
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="group p-6 rounded-2xl bg-[#EFECE6] border border-[#C5A059]/30 hover:border-[#1B5E3B] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-widest border border-[#C5A059]/40 px-2.5 py-0.5 rounded-full">
                      CATEGORY
                    </span>
                    <FiLayers className="w-5 h-5 text-[#1B5E3B]" />
                  </div>

                  <h2 className="font-serif font-bold text-xl text-[#222222] group-hover:text-[#1B5E3B] transition-colors mb-2">
                    {cat.name}
                  </h2>

                  {cat.subCategories && cat.subCategories.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 my-3">
                      {cat.subCategories.map((sub) => (
                        <span
                          key={sub._id}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-[#F5F2EB] text-zinc-700 font-medium border border-stone-200"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400 italic my-3">
                      Handcrafted drapes under {cat.name}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-[#C5A059]/20 flex items-center justify-between mt-2">
                  <Link
                    href={`/saree/${cat.name ? cat.name.toLowerCase().trim().replace(/\s+/g, '-') : cat._id}`}
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1B5E3B] group-hover:translate-x-1 transition-all"
                  >
                    <span>View {cat.name} Sarees</span>
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
