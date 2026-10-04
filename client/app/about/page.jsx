"use client";

import React from "react";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import {
  FiAward,
  FiShield,
  FiUserCheck,
  FiFeather,
  FiHeart,
  FiArrowRight,
  FiCheckCircle,
  FiHelpCircle,
  FiStar,
} from "react-icons/fi";

export default function AboutPage() {
  const collectionShowcase = [
    {
      id: 1,
      title: "Kanchipuram Royal Silk",
      subtitle: "Pure Mulberry Silk & Heavy Gold Zari",
      image: "/images/about/hero_banner.png",
      tag: "Bridal Signature",
    },
    {
      id: 2,
      title: "Banarasi Handloom Brocade",
      subtitle: "Generational Weaver Heritage",
      image: "/images/about/artisan_craft.png",
      tag: "Heritage Craft",
    },
    {
      id: 3,
      title: "Paithani & Organza Silks",
      subtitle: "Lightweight Elegance & Peacock Motifs",
      image: "/images/about/heritage_gallery.png",
      tag: "Royal Splendor",
    },
  ];

  const corePillars = [
    {
      icon: FiAward,
      title: "100% Pure Silk Mark Certified",
      desc: "Every drape bears the official Silk Mark Organisation of India (SMOI) hologram tag guaranteeing authentic pure silk.",
    },
    {
      icon: FiUserCheck,
      title: "Generational Master Weavers",
      desc: "Crafted by handloom artisans from Kanchipuram, Varanasi, and Surat whose families have perfected weaving for generations.",
    },
    {
      icon: FiFeather,
      title: "Sustainable & Natural Dyes",
      desc: "Woven using eco-conscious natural dyes and pure metallic gold & silver zari threads for lasting vibrancy.",
    },
    {
      icon: FiHeart,
      title: "Bespoke Concierge & Stitching",
      desc: "Complementary fall & pico work with custom blouse tailoring tailored precisely to your personal measurements.",
    },
  ];

  return (
    <main className="w-full bg-[#F5F2EB] min-h-screen text-[#222222] pb-16 lg:pb-24">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative w-full overflow-hidden bg-[#1B5E3B]">
        {/* Background Image Container with Space for Hero Banner */}
        <div className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay">
          <CustomImage
            src="/images/about/hero_banner.png"
            alt="Anjali Creation Hero Banner - Luxury Saree Heritage"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#1B5E3B] via-[#1B5E3B]/70 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#C5A059]/50 shadow-md mb-4 text-[#C5A059]">
            <FiSparkles className="text-xs" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em]">
              ESTABLISHED 1994 • HERITAGE SAREE HOUSE
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Weaving Stories of Royal Indian Elegance
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100 max-w-2xl mx-auto mt-4 font-normal leading-relaxed">
            Discover the artistry behind Anjali Creation. Preserving centuries of handloom weaving mastery, pure silk mark drapes, and timeless bridal heirlooms.
          </p>

          <div className="w-20 h-0.5 bg-[#C5A059] mx-auto mt-6 rounded-full" />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/sarees"
              className="px-8 py-3.5 rounded-full bg-[#C5A059] text-zinc-950 hover:bg-[#b08d4b] font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Explore Saree Collection</span>
              <FiArrowRight className="text-sm" />
            </Link>
            <a
              href="#our-story"
              className="px-8 py-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/30 font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-sm"
            >
              Our Handloom Story
            </a>
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex items-center text-xs font-semibold text-zinc-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
            Home
          </Link>
          <span className="mx-2 text-[#C5A059]">•</span>
          <span className="text-[#1B5E3B] font-bold">About Our Brand</span>
        </nav>
      </div>

      {/* 2. OUR STORY & BRAND LEGACY (Text Left | Saree Image Grid Right) */}
      <section id="our-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* LEFT: TEXT CONTENT */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C5A059]/40 shadow-2xs">
              <FiHelpCircle className="text-[#C5A059] text-xs" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]">
                OUR LEGACY & PASSION
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1B5E3B] leading-tight">
              Three Decades of Handloom Mastery & Uncompromising Quality
            </h2>

            <p className="text-xs sm:text-base text-zinc-700 leading-relaxed font-normal">
              Founded in 1994, Anjali Creation began with a simple yet passionate vision: to honor the golden handloom traditions of Indian royalty and bring pure, authentic silk drapes to women across the globe.
            </p>

            <p className="text-xs sm:text-base text-zinc-600 leading-relaxed font-normal">
              Each saree in our collection is an ode to generational craftsmanship. From the intricate zari motifs of Varanasi to the heavy mulberry silk of Kanchipuram and the delicate drapes of Paithani, every single thread is carefully inspected for purity and perfection.
            </p>

            {/* Checklist Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1B5E3B]">
                <FiCheckCircle className="text-[#C5A059] shrink-0 text-base" />
                <span>100% Pure Mulberry Silk</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1B5E3B]">
                <FiCheckCircle className="text-[#C5A059] shrink-0 text-base" />
                <span>Real Metallic Zari Borders</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1B5E3B]">
                <FiCheckCircle className="text-[#C5A059] shrink-0 text-base" />
                <span>Hand-Inspected Silk Mark Tags</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-[#1B5E3B]">
                <FiCheckCircle className="text-[#C5A059] shrink-0 text-base" />
                <span>Global Express Insured Shipping</span>
              </div>
            </div>
          </div>

          {/* RIGHT: MASONRY SAREE IMAGE SHOWCASE GRID */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4 relative">
            <div className="space-y-4">
              {/* Image Box 1 */}
              <div className="rounded-3xl overflow-hidden shadow-md border-2 border-[#C5A059]/30 group relative aspect-[4/5]">
                <CustomImage
                  src="/images/about/artisan_craft.png"
                  alt="Master Handloom Artisan Weaving Pure Silk"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">
                    Hand Loom Craft
                  </span>
                  <p className="font-serif font-bold text-xs sm:text-sm">
                    Master Artisan at Loom
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              {/* Image Box 2 */}
              <div className="rounded-3xl overflow-hidden shadow-md border-2 border-[#C5A059]/30 group relative aspect-[4/5]">
                <CustomImage
                  src="/images/about/heritage_gallery.png"
                  alt="Handcrafted Pure Silk Sarees Showcase"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] tracking-wider block">
                    Silk Mark Heritage
                  </span>
                  <p className="font-serif font-bold text-xs sm:text-sm">
                    Curated Royal Palette
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle Center Emblem */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1B5E3B] text-[#C5A059] border-2 border-[#C5A059] flex items-center justify-center shadow-xl z-20 pointer-events-none">
              <FiSparkles className="text-xl" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE BRAND PILLARS */}
      <section className="bg-white py-14 sm:py-20 border-y border-[#C5A059]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
              THE ANJALI PROMISE
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              Our Four Pillars of Authenticity
            </h2>
            <div className="w-12 h-0.5 bg-[#C5A059] mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {corePillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F5F2EB]/60 rounded-2xl p-6 border border-stone-200 hover:border-[#C5A059] shadow-2xs hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1B5E3B] text-[#C5A059] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs">
                    <IconComp className="text-xl" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#1B5E3B] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed font-normal">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. CURATED SAREE COLLECTIONS SHOWCASE (Spaces for Saree Imagery) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
            EXPLORE OUR WEAVES
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1B5E3B]">
            Signature Handloom Collections
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 mt-2 font-normal">
            Each piece is individually handcrafted by master weavers to deliver unmatched brilliance.
          </p>
          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-3 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {collectionShowcase.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:border-[#C5A059] shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* IMAGE HOLDER SPACE */}
              <div className="relative w-full h-64 sm:h-72 overflow-hidden bg-stone-100">
                <CustomImage
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-[#1B5E3B] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider border border-[#C5A059]/50 shadow-xs">
                  {item.tag}
                </div>
              </div>

              {/* CARD DETAILS */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1B5E3B] group-hover:text-[#C5A059] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 font-normal leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                <Link
                  href="/sarees"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#1B5E3B] hover:text-[#C5A059] uppercase tracking-wider transition-colors"
                >
                  <span>Discover Collection</span>
                  <FiArrowRight className="text-xs" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ARTISAN STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1B5E3B] text-white rounded-3xl p-8 sm:p-12 lg:p-14 border border-[#C5A059]/40 shadow-xl relative overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">
              HERITAGE HANDLOOM ARTISANS
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-white">
              Experience the Timeless Drape of Pure Silk Mark Royalty
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-normal leading-relaxed">
              Join thousands of patrons across India and worldwide who trust Anjali Creation for their bridal, festive, and heritage saree heirlooms.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 shrink-0">
            <div className="text-center px-4">
              <span className="font-serif font-bold text-3xl sm:text-4xl text-[#C5A059] block">
                30+
              </span>
              <span className="text-[11px] text-zinc-200 font-medium uppercase tracking-wider">
                Years Legacy
              </span>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block" />
            <div className="text-center px-4">
              <span className="font-serif font-bold text-3xl sm:text-4xl text-[#C5A059] block">
                100%
              </span>
              <span className="text-[11px] text-zinc-200 font-medium uppercase tracking-wider">
                Silk Mark Pure
              </span>
            </div>
            <div className="h-10 w-px bg-white/20 hidden sm:block" />
            <div className="text-center px-4">
              <span className="font-serif font-bold text-3xl sm:text-4xl text-[#C5A059] block">
                15K+
              </span>
              <span className="text-[11px] text-zinc-200 font-medium uppercase tracking-wider">
                Happy Patrons
              </span>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
