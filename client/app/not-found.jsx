"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiHome,
  FiStar,
  FiLayers,
  FiHeadphones,
  FiArrowRight,
  FiCompass,
} from "react-icons/fi";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      router.push(`/sarees?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="relative min-h-[80vh] w-full bg-[#F5F2EB] text-[#222222] font-sans flex flex-col justify-center items-center px-4 py-12 sm:py-16 overflow-hidden">
      {/* BACKGROUND MANDALA & PAISLEY WATERMARK PATTERN */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
        {/* Glowing Background Aura */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(212,175,55,0.18)_0%,_rgba(245,242,235,0)_70%)] animate-pulse" />

        {/* Central Rotating Traditional Mandala SVG Watermark */}
        <svg
          className="w-[750px] h-[750px] text-[#D4AF37]/[0.09] animate-[spin_100s_linear_infinite]"
          viewBox="0 0 500 500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <circle cx="250" cy="250" r="230" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="200" />
          <circle cx="250" cy="250" r="170" strokeDasharray="2 2" />
          <circle cx="250" cy="250" r="140" />
          <circle cx="250" cy="250" r="90" />
          <circle cx="250" cy="250" r="40" />

          <g opacity="0.85">
            <path d="M250 50 Q230 140 250 160 Q270 140 250 50 Z" />
            <path d="M250 450 Q230 360 250 340 Q270 360 250 450 Z" />
            <path d="M50 250 Q140 230 160 250 Q140 270 50 250 Z" />
            <path d="M450 250 Q360 230 340 250 Q360 270 450 250 Z" />

            <path d="M108 108 Q172 160 186 186 Q160 172 108 108 Z" />
            <path d="M392 108 Q328 160 314 186 Q340 172 392 108 Z" />
            <path d="M108 392 Q172 340 186 314 Q160 328 108 392 Z" />
            <path d="M392 392 Q328 340 314 314 Q340 328 392 392 Z" />
          </g>
        </svg>

        {/* Floating Paisley Motifs */}
        <div className="absolute top-12 left-8 lg:left-24 text-[#D4AF37]/25 animate-bounce">
          <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C30 10 15 25 15 45 C15 65 35 85 50 90 C40 75 35 60 40 45 C45 30 65 20 50 10 Z" />
          </svg>
        </div>

        <div className="absolute bottom-16 right-8 lg:right-24 text-[#D4AF37]/25 animate-bounce">
          <svg className="w-28 h-28" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 10 C70 10 85 25 85 45 C85 65 65 85 50 90 C60 75 65 60 60 45 C55 30 35 20 50 10 Z" />
          </svg>
        </div>
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10 max-w-4xl w-full text-center flex flex-col justify-center items-center">
        {/* LOOM & ETHNIC ARTWORK BADGE */}
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[#D4AF37]/30 via-[#F5F2EB] to-[#1B5E3B]/30 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#F5F2EB] border border-[#D4AF37]/40 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-25 pointer-events-none flex items-center justify-center">
                <svg
                  className="w-full h-full text-[#D4AF37]"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path d="M0,50 Q25,20 50,50 T100,50" />
                  <path d="M0,30 Q25,60 50,30 T100,30" />
                  <path d="M0,70 Q25,40 50,70 T100,70" />
                </svg>
              </div>

              <FiCompass className="w-12 h-12 sm:w-16 sm:h-16 text-[#1B5E3B]" />

              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-semibold mt-1">
                Royal Weave
              </span>
            </div>
          </div>

          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1B5E3B] text-[#F3E5AB] border border-[#D4AF37] px-3.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-md whitespace-nowrap">
            Error 404
          </span>
        </div>

        {/* MAIN HEADING */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#222222] mb-4">
          404 — Page Lost in the{" "}
          <span className="bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#8A6D3B] bg-clip-text text-transparent italic font-normal">
            Loom
          </span>
        </h1>

        {/* SUBTEXT COPY */}
        <p className="text-stone-600 max-w-xl text-base sm:text-lg leading-relaxed mb-8">
          Oops! The drape or collection you are looking for seems to have slipped away from our royal loom or is no longer available.
        </p>

        {/* STYLISH SEARCH BAR */}
        <div className="w-full max-w-lg mb-12">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full border border-[#D4AF37]/50 shadow-lg hover:border-[#D4AF37] focus-within:border-[#1B5E3B] focus-within:ring-2 focus-within:ring-[#1B5E3B]/20 transition-all p-1.5">
              <FiSearch className="w-5 h-5 text-[#D4AF37] ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Kanchipuram, Banarasi, Silk Sarees..."
                className="w-full bg-transparent px-3 py-2 text-sm text-[#222222] placeholder-stone-400 focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-[#1B5E3B] hover:bg-[#14462B] text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Search</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* QUICK NAVIGATION CARDS GRID */}
        <div className="w-full max-w-3xl">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-6">
            Explore Royal Collections
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Return to Homepage */}
            <Link
              href="/"
              className="bg-white/70 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:bg-white/95 hover:shadow-xl rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1B5E3B]/10 text-[#1B5E3B] group-hover:bg-[#1B5E3B] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <FiHome className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#222222] group-hover:text-[#1B5E3B] transition-colors mb-1">
                Return to Homepage
              </h3>
              <p className="text-xs text-stone-500 leading-snug">
                Return to our main royal store entrance
              </p>
            </Link>

            {/* Card 2: Browse New Arrivals */}
            <Link
              href="/sarees?sort=newest"
              className="bg-white/70 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:bg-white/95 hover:shadow-xl rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <FiStar className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#222222] group-hover:text-[#1B5E3B] transition-colors mb-1">
                Browse New Arrivals
              </h3>
              <p className="text-xs text-stone-500 leading-snug">
                Freshly woven ethnic masterpieces
              </p>
            </Link>

            {/* Card 3: Explore Silk Sarees Collection */}
            <Link
              href="/sarees"
              className="bg-white/70 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:bg-white/95 hover:shadow-xl rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1B5E3B]/10 text-[#1B5E3B] group-hover:bg-[#1B5E3B] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <FiLayers className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#222222] group-hover:text-[#1B5E3B] transition-colors mb-1">
                Explore Silk Sarees
              </h3>
              <p className="text-xs text-stone-500 leading-snug">
                Kanchipuram, Banarasi & Paithani
              </p>
            </Link>

            {/* Card 4: Contact Customer Support */}
            <Link
              href="/contact"
              className="bg-white/70 backdrop-blur-md border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 hover:bg-white/95 hover:shadow-xl rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white flex items-center justify-center mb-3 transition-colors">
                <FiHeadphones className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#222222] group-hover:text-[#1B5E3B] transition-colors mb-1">
                Contact Support
              </h3>
              <p className="text-xs text-stone-500 leading-snug">
                Assistance from our royal concierges
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
