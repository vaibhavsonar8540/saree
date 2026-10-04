"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomImage from "./customImage";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { CurvedCarouselSkeleton } from "./Skeleton";

import traditionSliderImg from "@/assets/images/tradition-slider.webp";
import banarasiSliderImg from "@/assets/images/banarasi-slider.webp";
import cottonImg from "@/assets/images/cotton.webp";

const defaultCarouselProducts = [
  {
    _id: "arc-1",
    name: "Traditional Sarees",
    title: "Traditional Sarees",
    image: traditionSliderImg,
  },
  {
    _id: "arc-2",
    name: "Banarasi Sarees",
    title: "Banarasi Sarees",
    image: banarasiSliderImg,
  },
  {
    _id: "arc-3",
    name: "Cotton Sarees",
    title: "Cotton Sarees",
    image: cottonImg,
  },
];

const normalizeProduct = (item) => {
  if (!item) return null;
  let img = item.image;
  if (!img && item.thumbnail) img = item.thumbnail;
  if (!img && item.colorMedia && item.colorMedia[0]) {
    img = item.colorMedia[0].thumbnail || (item.colorMedia[0].images && item.colorMedia[0].images[0]);
  }

  return {
    _id: item._id || item.id,
    title: item.title || item.name || "Luxury Saree",
    image: img || traditionSliderImg,
  };
};

export default function CurvedProductCarousel({ initialProducts = null, loading = false }) {
  const [products, setProducts] = useState(initialProducts || defaultCarouselProducts);
  const [activeIndex, setActiveIndex] = useState(1);
  const [windowWidth, setWindowWidth] = useState(1200);

  const containerRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (initialProducts && Array.isArray(initialProducts) && initialProducts.length > 0) {
      setProducts(initialProducts);
      setActiveIndex(Math.floor(initialProducts.length / 2));
    }
  }, [initialProducts]);

  if (loading) {
    return <CurvedCarouselSkeleton />;
  }

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const total = products.length;

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch & drag handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (!products || products.length === 0) {
    return null;
  }

  const activeProduct = normalizeProduct(products[activeIndex]) || normalizeProduct(defaultCarouselProducts[0]);

  // Responsive values for Arch geometry
  const isXxs = windowWidth < 380;
  const isXs = windowWidth < 480;
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

  const spacing = isXxs ? 60 : isXs ? 72 : isMobile ? 95 : isTablet ? 150 : 185;
  const arcCurvature = isXxs ? 14 : isXs ? 18 : isMobile ? 24 : isTablet ? 28 : 34;
  const stepRotate = isXxs ? 8 : isXs ? 10 : isMobile ? 12 : isTablet ? 14 : 16;

  return (
    <section className="w-full bg-[#0D1512] text-white py-10 sm:py-16 lg:py-20 relative overflow-hidden select-none">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[900px] h-[260px] sm:h-[400px] bg-radial from-[#1B5E3B]/25 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
        
        {/* Arc Carousel Display Container */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[250px] sm:h-[420px] md:h-[480px] flex justify-center items-start pt-6 sm:pt-14 md:pt-16"
        >
          {products.map((item, idx) => {
            const prod = normalizeProduct(item);
            if (!prod) return null;

            // Compute shortest circular distance
            let offset = idx - activeIndex;
            if (total > 2) {
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;
            }

            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= (isXs ? 1 : 3);

            if (!isVisible) return null;

            // Arch Transformations
            const baseTop = isXxs ? 10 : isXs ? 15 : isMobile ? 20 : 30;
            const translateX = offset * spacing;
            const translateY = Math.pow(absOffset, 1.65) * arcCurvature + baseTop;
            const rotate = offset * stepRotate;
            const scale = offset === 0 ? (isXxs ? 1.05 : isXs ? 1.08 : isMobile ? 1.12 : 1.20) : Math.max(0.65, 1 - absOffset * 0.14);
            const opacity = 1 - absOffset * 0.22;
            const zIndex = 50 - absOffset * 10;
            const isActive = offset === 0;

            return (
              <div
                key={prod._id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`absolute top-0 transition-all duration-500 ease-out cursor-pointer group origin-center rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl border ${
                  isActive
                    ? "border-[#C5A059] shadow-[#C5A059]/40 shadow-2xl ring-2 ring-[#C5A059]/50 z-50"
                    : "border-white/15 hover:border-[#C5A059]/60 z-10"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  width: isXxs ? "110px" : isXs ? "125px" : isMobile ? "150px" : isTablet ? "200px" : "240px",
                  height: isXxs ? "160px" : isXs ? "185px" : isMobile ? "225px" : isTablet ? "300px" : "350px",
                }}
              >
                {/* Product Image */}
                <div className="w-full h-full relative bg-zinc-900">
                  <CustomImage
                    srcAttr={prod.image}
                    altAttr={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isActive ? "from-black/80 via-black/20 to-transparent" : "from-black/70 via-black/30 to-black/10"
                    }`}
                  />

                  {/* Active Highlight Badge */}
                  {isActive && (
                    <div className="absolute top-3 left-3 bg-[#1B5E3B] text-[#F5F2EB] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-md border border-[#C5A059]/40">
                      Featured
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* MIDDLE TITLE & NAVIGATION CONTROLS */}
        <div className="flex flex-col items-center text-center mt-2 sm:mt-4 max-w-xl mx-auto px-4 z-20">
          
          {/* Main Title Row with Prev/Next Arrows */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 w-full my-2">
            {/* Left Chevron Button */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="p-2 sm:p-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
            >
              <FiChevronLeft className="text-xl sm:text-3xl" />
            </button>

            {/* Central Slide Title */}
            <h2 className="font-serif font-bold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight line-clamp-1 min-h-[40px] sm:min-h-[56px] flex items-center justify-center">
              {activeProduct.title}
            </h2>

            {/* Right Chevron Button */}
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="p-2 sm:p-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
            >
              <FiChevronRight className="text-xl sm:text-3xl" />
            </button>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center gap-2 mt-4 sm:mt-6">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex ? "w-6 bg-[#C5A059]" : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
