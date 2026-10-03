"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "./productCard";
import { fetchMostLovedProducts } from "@/service/productService";
import { FiChevronLeft, FiChevronRight, FiHeart, FiArrowRight, FiFlame } from "react-icons/fi";

const normalizeProduct = (item) => {
  if (!item) return null;

  let images = [];
  if (item.colorMedia && Array.isArray(item.colorMedia)) {
    item.colorMedia.forEach((cm) => {
      if (cm.thumbnail) images.push(cm.thumbnail);
      if (Array.isArray(cm.images)) images.push(...cm.images);
    });
  }
  if (images.length === 0 && item.thumbnail) images.push(item.thumbnail);
  if (images.length === 0 && item.image) images.push(item.image);
  if (images.length === 0 && Array.isArray(item.images)) images.push(...item.images);

  let colorsHex = [];
  if (Array.isArray(item.colors)) {
    colorsHex = item.colors.map((c) => (typeof c === "object" ? c.hexCode || "" : c)).filter(Boolean);
  } else if (item.colorMedia && Array.isArray(item.colorMedia)) {
    colorsHex = item.colorMedia
      .map((cm) => (cm.colorId && cm.colorId.hexCode ? cm.colorId.hexCode : cm.hexCode || null))
      .filter(Boolean);
  }

  const mainPrice = item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.price || 0;
  const originalPrice = item.discountedPrice && item.discountedPrice > 0 ? item.price : item.originalPrice || 0;
  const discount =
    originalPrice > mainPrice ? Math.round(((originalPrice - mainPrice) / originalPrice) * 100) : item.discount || 0;

  return {
    _id: item._id || item.id,
    name: item.name || item.title || "",
    title: item.name || item.title || "",
    description: item.description || "",
    price: mainPrice,
    originalPrice: originalPrice,
    discount: discount,
    rating: item.rating || 0,
    reviewsCount: item.reviewsCount || 0,
    images: images,
    image: images[0] || item.thumbnail || item.image || "",
    thumbnail: item.thumbnail || images[0] || item.image || "",
    category: item.category || "",
    categoryName: item.subCategory || item.category || item.categoryName || "",
    fabric: item.fabric || "",
    colors: colorsHex,
    inStock: item.stock !== undefined ? item.stock > 0 : item.inStock ?? true,
    isBestseller: true,
  };
};

export default function MostLovedSlider({ initialProducts = null }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (initialProducts && Array.isArray(initialProducts) && initialProducts.length > 0) {
        setProducts(initialProducts.slice(0, 8));
        setLoading(false);
        return;
      }

      setLoading(true);
      const apiData = await fetchMostLovedProducts(8);

      if (!isMounted) return;

      if (Array.isArray(apiData) && apiData.length > 0) {
        setProducts(apiData.slice(0, 8));
      } else {
        // Only real backend data - no dummy fallback
        setProducts([]);
      }
      setLoading(false);
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [initialProducts]);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScrollButtons();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScrollButtons);
      }
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [products, loading]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // IF EMPTY (no products after loading completes), DO NOT SHOW ANYTHING
  if (!loading && (!products || products.length === 0)) {
    return null;
  }

  const displayProducts = (products || []).slice(0, 8);

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-[#F5F2EB] border-t border-[#C5A059]/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiHeart className="text-[#C5A059] text-sm fill-[#C5A059] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                Patrons' Favorites
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-3xl md:text-4xl text-[#1B5E3B]">
              Most Loved Products
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A059]/60 mt-2.5 rounded-full" />
          </div>

          {/* Navigation Arrows & View All */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
            <Link
              href="/sarees?sortBy=popular"
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#1B5E3B] hover:text-[#C5A059] transition-colors group"
            >
              <span>View All ({displayProducts.length})</span>
              <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous Slide"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  canScrollLeft
                    ? "border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white shadow-xs active:scale-95 cursor-pointer"
                    : "border-zinc-300 text-zinc-300 cursor-not-allowed opacity-50"
                }`}
              >
                <FiChevronLeft className="text-lg" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Next Slide"
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  canScrollRight
                    ? "border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white shadow-xs active:scale-95 cursor-pointer"
                    : "border-zinc-300 text-zinc-300 cursor-not-allowed opacity-50"
                }`}
              >
                <FiChevronRight className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[550px] bg-zinc-200/50 rounded-2xl animate-pulse border border-zinc-200"
              />
            ))}
          </div>
        ) : (
          /* Slider Track Container */
          <div className="relative group">
            <div
              ref={scrollRef}
              className="flex items-stretch overflow-x-auto scroll-smooth no-scrollbar gap-5 py-2 -mx-2 px-2 select-none"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {displayProducts.map((rawItem, idx) => {
                const product = normalizeProduct(rawItem);
                if (!product) return null;
                return (
                  <div
                    key={product._id || idx}
                    className="w-[180px] xs:w-[210px] sm:w-[280px] md:w-[310px] lg:w-[330px] shrink-0 scroll-snap-align-start transition-all"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    <ProductCard product={product} className="h-full" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
