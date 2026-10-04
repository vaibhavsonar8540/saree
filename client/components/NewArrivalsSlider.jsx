"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "./productCard";
import { ProductCardSkeleton } from "./Skeleton";
import { fetchNewArrivals } from "@/service/productService";
import { FiChevronLeft, FiChevronRight, FiStar, FiArrowRight } from "react-icons/fi";

const sampleNewArrivals = [
  {
    _id: "new-1",
    name: "Royal Kanjeevaram Pure Silk Saree",
    description: "Traditional gold zari woven border with intricate peacock motifs in pure Kanchipuram silk.",
    price: 18499,
    originalPrice: 22999,
    discount: 20,
    rating: 4.9,
    reviewsCount: 56,
    image: "/assets/images/heroBanner.png",
    category: "Silk Sarees",
    fabric: "Pure Kanjeevaram",
    colors: ["#1B5E3B", "#C5A059", "#9C2766"],
    inStock: true,
  },
  {
    _id: "new-2",
    name: "Handspun Organza Floral Print Saree",
    description: "Lightweight sheer organza saree with delicate pastel floral prints & scalloped embroidery.",
    price: 8999,
    originalPrice: 11999,
    discount: 25,
    rating: 4.8,
    reviewsCount: 38,
    image: "/assets/images/oraganza.png",
    category: "Organza Sarees",
    fabric: "Pure Organza",
    colors: ["#6C8496", "#7A8B73", "#F5F2EB"],
    inStock: true,
  },
  {
    _id: "new-3",
    name: "Banarasi Royal Brocade Silk Saree",
    description: "Opulent royal blue Banarasi silk saree with kadwa weaving and antique silver zari.",
    price: 24500,
    originalPrice: 29999,
    discount: 18,
    rating: 5.0,
    reviewsCount: 74,
    image: "/assets/images/banarasi.png",
    category: "Banarasi Silk",
    fabric: "Pure Banarasi Silk",
    colors: ["#2C405E", "#D4AF37", "#D37053"],
    inStock: true,
  },
  {
    _id: "new-4",
    name: "Heritage Chanderi Cotton Silk Saree",
    description: "Breathable fine Chanderi weave with gold tissue border for festive celebrations.",
    price: 6499,
    originalPrice: 7999,
    discount: 19,
    rating: 4.7,
    reviewsCount: 29,
    image: "/assets/images/traditional.png",
    category: "Cotton Silk",
    fabric: "Chanderi Weave",
    colors: ["#D37053", "#C5A059", "#222222"],
    inStock: true,
  },
  {
    _id: "new-5",
    name: "Pastel Pink Tissue Silk Festive Saree",
    description: "Shimmering tissue silk saree with hand-embellished zari border & intricate meenakari work.",
    price: 14200,
    originalPrice: 17500,
    discount: 19,
    rating: 4.9,
    reviewsCount: 41,
    image: "/assets/images/bridal.png",
    category: "Festive Sarees",
    fabric: "Tissue Silk",
    colors: ["#E8C5C8", "#D4AF37", "#C5A059"],
    inStock: true,
  },
  {
    _id: "new-6",
    name: "Maharashtrian Paithani Silk Saree",
    description: "Authentic handloom Paithani saree with traditional peacock pallu & pure gold zari motifs.",
    price: 21999,
    originalPrice: 26999,
    discount: 18,
    rating: 5.0,
    reviewsCount: 63,
    image: "/assets/images/banner2.png",
    category: "Paithani Sarees",
    fabric: "Pure Silk",
    colors: ["#9C2766", "#1B5E3B", "#D4AF37"],
    inStock: true,
  },
  {
    _id: "new-7",
    name: "Ethereal Georgette Zari Work Saree",
    description: "Fluid pure georgette saree featuring all-over sequin highlights and velvet border accent.",
    price: 11499,
    originalPrice: 14999,
    discount: 23,
    rating: 4.8,
    reviewsCount: 32,
    image: "/assets/images/heroBanner.png",
    category: "Designer Sarees",
    fabric: "Pure Georgette",
    colors: ["#1B5E3B", "#2C405E"],
    inStock: true,
  },
  {
    _id: "new-8",
    name: "Traditional Bandhani Tie & Dye Saree",
    description: "Vibrant Gujarati Bandhej saree on pure gaji silk with intricate hand tie and dye patterns.",
    price: 9800,
    originalPrice: 12500,
    discount: 21,
    rating: 4.7,
    reviewsCount: 25,
    image: "/assets/images/traditional.png",
    category: "Bandhani Sarees",
    fabric: "Gaji Silk",
    colors: ["#C5283D", "#E9C46A", "#1B5E3B"],
    inStock: true,
  },
];

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

  let colorsHex = [];
  if (Array.isArray(item.colors)) {
    colorsHex = item.colors.map((c) => (typeof c === "object" ? c.hexCode || "#C5A059" : c));
  } else if (item.colorMedia && Array.isArray(item.colorMedia)) {
    colorsHex = item.colorMedia
      .map((cm) => (cm.colorId && cm.colorId.hexCode ? cm.colorId.hexCode : null))
      .filter(Boolean);
  }

  const mainPrice = item.discountedPrice && item.discountedPrice > 0 ? item.discountedPrice : item.price || 0;
  const originalPrice = item.discountedPrice && item.discountedPrice > 0 ? item.price : item.originalPrice || 0;
  const discount =
    originalPrice > mainPrice ? Math.round(((originalPrice - mainPrice) / originalPrice) * 100) : item.discount || 0;

  return {
    _id: item._id || item.id,
    title: item.name || item.title || "Exquisite Saree",
    description: item.description || "",
    price: mainPrice,
    originalPrice: originalPrice,
    discount: discount,
    rating: item.rating || 4.9,
    reviewsCount: item.reviewsCount || 24,
    images: images,
    image: images[0] || item.image || item.thumbnail || "/assets/images/heroBanner.png",
    categoryName: item.subCategory || item.category || item.categoryName || "Pure Silk",
    fabric: item.fabric || "Handloom Silk",
    colors: colorsHex.length > 0 ? colorsHex : ["#1B5E3B", "#C5A059"],
    inStock: item.stock !== undefined ? item.stock > 0 : item.inStock ?? true,
  };
};

export default function NewArrivalsSlider({ initialProducts = null }) {
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
      const apiData = await fetchNewArrivals(8);

      if (!isMounted) return;

      if (Array.isArray(apiData) && apiData.length > 0) {
        setProducts(apiData.slice(0, 8));
      } else {
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

  // Display a max of 8 products
  const displayProducts = (products || []).slice(0, 8);

  return (
    <section className="w-full pt-4 pb-12 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20 bg-[#F5F2EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FiStar className="text-[#C5A059] text-sm animate-pulse fill-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                Fresh Arrivals
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-3xl md:text-4xl text-[#1B5E3B]">
              Newly Arrived Products
            </h2>
            <div className="w-16 h-0.5 bg-[#C5A059]/60 mt-2.5 rounded-full" />
          </div>

          {/* Navigation Arrows & View All */}
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
            <Link
              href="/sarees?sortBy=newest"
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
              <ProductCardSkeleton key={i} />
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
