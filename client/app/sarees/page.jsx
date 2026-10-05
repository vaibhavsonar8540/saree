"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/productCard";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { fetchSarees } from "@/service/productService";
import HeroBanner from "@/components/heroBanner";
import sareeDesktopImg from "@/assets/images/saree/saree-desktop.webp";
import sareeMobileImg from "@/assets/images/saree/saree-mobile.webp";
import axios from "axios";
import {
  FiFilter,
  FiSliders,
  FiRefreshCw,
  FiArrowLeft,
  FiX,
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiCheck,
  FiGrid,
  FiBox,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiTag,
  FiLayers,
  FiRotateCcw,
} from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function SareeCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSectionRef = useRef(null);

  const categoryParam = searchParams.get("category") || "";
  const subCategoryParam = searchParams.get("subCategory") || "";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);

  // Pagination States (10 products per page as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Active Applied Filters
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubCategory, setActiveSubCategory] = useState(subCategoryParam);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Temporary Form Inputs for Horizontal Filter Bar
  const [tempCategory, setTempCategory] = useState(categoryParam);
  const [tempSubCategory, setTempSubCategory] = useState(subCategoryParam);
  const [tempSortBy, setTempSortBy] = useState("date_desc");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  // State for Collapsible Slide Card Filter
  const [isFilterCardOpen, setIsFilterCardOpen] = useState(false);

  const activeFiltersCount = [
    activeCategory,
    activeSubCategory,
    selectedFabric,
    searchQuery,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  // Metadata Display Names
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [activeSubCategoryName, setActiveSubCategoryName] = useState("");
  const [titleName, setTitleName] = useState("Exquisite Saree Collection");
  const [subtitleName, setSubtitleName] = useState(
    "Handcrafted drapes woven by India's finest master artisans"
  );

  // Fetch categories tree from API for filter dropdowns
  useEffect(() => {
    const loadCategoriesTree = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories?includeSubcategories=true`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setCategoriesList(res.data.data);
        }
      } catch (e) {
        console.warn("Failed to load categories for catalog filter", e);
      }
    };
    loadCategoriesTree();
  }, []);

  // Sync state with URL parameters
  useEffect(() => {
    setActiveCategory(categoryParam);
    setActiveSubCategory(subCategoryParam);
    setSearchQuery(searchParam);
    setTempCategory(categoryParam);
    setTempSubCategory(subCategoryParam);
    setCurrentPage(1);
  }, [categoryParam, subCategoryParam, searchParam]);

  // Resolve Category & Subcategory Names for Title & Badges
  useEffect(() => {
    let catName = "";
    let subName = "";

    if (categoriesList.length > 0) {
      if (activeCategory) {
        const foundCat = categoriesList.find(
          (c) => c._id === activeCategory || c.name.toLowerCase() === activeCategory.toLowerCase()
        );
        if (foundCat) catName = foundCat.name;
      }

      if (activeSubCategory) {
        for (const c of categoriesList) {
          if (c.subCategories) {
            const foundSub = c.subCategories.find(
              (s) => s._id === activeSubCategory || s.name.toLowerCase() === activeSubCategory.toLowerCase()
            );
            if (foundSub) {
              subName = foundSub.name;
              if (!catName) catName = c.name;
              break;
            }
          }
        }
      }
    }

    setActiveCategoryName(catName || (activeCategory ? "Category" : ""));
    setActiveSubCategoryName(subName || (activeSubCategory ? "Subcategory" : ""));

    if (searchQuery) {
      setTitleName(`Search Results for "${searchQuery}"`);
      setSubtitleName("Showing sarees matching your search query");
    } else if (subName) {
      setTitleName(`${subName} Sarees`);
      setSubtitleName(`Curated handcrafted ${subName} collection${catName ? ` under ${catName}` : ""}`);
    } else if (catName) {
      setTitleName(`${catName}`);
      setSubtitleName(`Exquisite drapes in ${catName}`);
    } else {
      setTitleName("All Handloom Sarees");
      setSubtitleName("Explore our complete collection of handcrafted silk, organza, and Banarasi drapes.");
    }
  }, [activeCategory, activeSubCategory, searchQuery, categoriesList]);

  // Fetch Sarees from backend API with 10 items per page pagination
  useEffect(() => {
    const loadSareesData = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: 10, // Strictly 10 products per page
          sortBy: sortBy,
        };

        if (activeCategory) queryParams.category = activeCategory;
        if (activeSubCategory) queryParams.subCategory = activeSubCategory;
        if (selectedFabric) queryParams.fabric = selectedFabric;
        if (searchQuery) queryParams.search = searchQuery;
        if (minPrice) queryParams.minPrice = minPrice;
        if (maxPrice) queryParams.maxPrice = maxPrice;

        const data = await fetchSarees(queryParams);
        setProducts(data);
        setTotalProducts(data.total ?? data.length);
        setTotalPages(data.totalPages ?? 1);
      } catch (e) {
        console.error("Error fetching sarees catalog:", e);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
      setLoading(false);
    };

    loadSareesData();
  }, [
    currentPage,
    activeCategory,
    activeSubCategory,
    selectedFabric,
    sortBy,
    searchQuery,
    minPrice,
    maxPrice,
  ]);

  // Handle Apply Filters from horizontal filter bar
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setActiveCategory(tempCategory);
    setActiveSubCategory(tempSubCategory);
    setSortBy(tempSortBy);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setCurrentPage(1);
    setIsFilterCardOpen(false);

    // Sync URL if category or subcategory changed
    if (tempSubCategory) {
      router.push(`/sarees?subCategory=${tempSubCategory}`);
    } else if (tempCategory) {
      router.push(`/sarees?category=${tempCategory}`);
    } else if (searchQuery) {
      router.push(`/sarees?search=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/sarees");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setTempCategory("");
    setTempSubCategory("");
    setTempSortBy("date_desc");
    setTempMinPrice("");
    setTempMaxPrice("");
    setActiveCategory("");
    setActiveSubCategory("");
    setSelectedFabric("");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("date_desc");
    setCurrentPage(1);
    setIsFilterCardOpen(false);
    router.push("/sarees");
  };

  // Pagination Change Handler with Smooth Scroll
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (productSectionRef.current) {
        productSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    }
  };

  // Get active subcategories based on selected temp category
  const selectedCategoryObj = categoriesList.find(
    (c) => c._id === tempCategory || c.name.toLowerCase() === tempCategory.toLowerCase()
  );
  const availableSubCategories = selectedCategoryObj?.subCategories || [];

  const isFilterActive =
    activeCategory ||
    activeSubCategory ||
    selectedFabric ||
    searchQuery ||
    minPrice ||
    maxPrice;

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* HERO BANNER */}
      <HeroBanner
        src={sareeDesktopImg}
        mobileSrc={sareeMobileImg}
        align="left"
        badge="LUXURY SAREE COLLECTION"
        badgeClass="inline-block px-3.5 py-1 rounded-full border border-[#C5A059]/80 bg-black/40 text-[#C5A059] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-xs shadow-md"
        title={titleName}
        titleClass="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md"
        desc={subtitleName}
        descClass="text-xs sm:text-base text-zinc-200 max-w-xl font-normal leading-relaxed drop-shadow-xs"
        overlayClass="bg-gradient-to-r from-black/80 via-black/50 to-transparent"
        className="w-full shadow-md"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* HEADER ROW WITH TITLE, DESCRIPTION & FILTER BUTTON */}
        <div ref={productSectionRef} className="flex items-start sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#C5A059]/20">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1B5E3B] tracking-tight">
              The Saree Collection
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-0.5">
              Discover timeless sarees crafted for every occasion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFilterCardOpen(!isFilterCardOpen)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#1B5E3B] hover:bg-[#14462B] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer shrink-0"
          >
            <FiSliders className="w-4 h-4 text-white" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-[#1B5E3B] text-[10px] font-bold flex items-center justify-center ml-0.5">
                {activeFiltersCount}
              </span>
            )}
            <FiChevronDown
              className={`w-4 h-4 text-white transition-transform duration-300 ml-0.5 ${
                isFilterCardOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>

        {/* COLLAPSIBLE SLIDE FILTER CARD (SLIDES DOWN BELOW THE HEADER) */}
        {isFilterCardOpen && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-[#EFECE6] border border-[#C5A059]/40 shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/30 mb-4">
              <div className="flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-[#1B5E3B]" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#222222]">
                  Filter Sarees
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterCardOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyFilters} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. FILTER BY CATEGORY */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                    FILTER BY CATEGORY
                  </label>
                  <div className="relative">
                    <select
                      value={tempCategory}
                      onChange={(e) => {
                        setTempCategory(e.target.value);
                        setTempSubCategory("");
                      }}
                      className="w-full appearance-none bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all cursor-pointer pr-10 shadow-2xs"
                    >
                      <option value="">
                        All Categories ({categoriesList.length})
                      </option>
                      {categoriesList.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* 2. FILTER BY SUBCATEGORY */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                    FILTER BY SUBCATEGORY
                  </label>
                  <div className="relative">
                    <select
                      value={tempSubCategory}
                      onChange={(e) => setTempSubCategory(e.target.value)}
                      disabled={!tempCategory && availableSubCategories.length === 0}
                      className={`w-full appearance-none bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all pr-10 shadow-2xs ${
                        !tempCategory && availableSubCategories.length === 0
                          ? "opacity-60 cursor-not-allowed text-zinc-400"
                          : "cursor-pointer"
                      }`}
                    >
                      {!tempCategory ? (
                        <option value="">Select a category first</option>
                      ) : availableSubCategories.length === 0 ? (
                        <option value="">No subcategories</option>
                      ) : (
                        <>
                          <option value="">All Subcategories ({availableSubCategories.length})</option>
                          {availableSubCategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* 3. SORT BY */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                    SORT BY
                  </label>
                  <div className="relative">
                    <select
                      value={tempSortBy}
                      onChange={(e) => setTempSortBy(e.target.value)}
                      className="w-full appearance-none bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all cursor-pointer pr-10 shadow-2xs"
                    >
                      <option value="date_desc">Newly Uploaded</option>
                      <option value="date_asc">Oldest First</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popular">Most Popular</option>
                    </select>
                    <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* 4. PRICE RANGE (₹) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                    PRICE RANGE (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={tempMinPrice}
                      onChange={(e) => setTempMinPrice(e.target.value)}
                      className="w-full bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all shadow-2xs"
                    />
                    <span className="text-zinc-400 font-bold">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={tempMaxPrice}
                      onChange={(e) => setTempMaxPrice(e.target.value)}
                      className="w-full bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

              </div>

              {/* ACTION BUTTON ROW */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#C5A059]/30">
                <button
                  type="button"
                  onClick={() => setIsFilterCardOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  CANCEL
                </button>

                {isFilterActive && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <FiRotateCcw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1B5E3B] hover:bg-[#14462B] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  APPLY FILTERS
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ACTIVE FILTERS SUMMARY CHIPS */}
        {isFilterActive && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#EFECE6]/90 border border-[#C5A059]/30 flex flex-wrap items-center gap-2 shadow-2xs">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <FiFilter className="w-3.5 h-3.5 text-[#1B5E3B]" /> Active Filters:
            </span>

            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B5E3B]/10 text-[#1B5E3B] text-xs font-bold border border-[#1B5E3B]/20">
                Category: {activeCategoryName || "Selected"}
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory("");
                    setTempCategory("");
                    setActiveSubCategory("");
                    setTempSubCategory("");
                    router.push("/sarees");
                  }}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {activeSubCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#8B6B23] text-xs font-bold border border-[#C5A059]/30">
                Subcategory: {activeSubCategoryName || "Selected"}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubCategory("");
                    setTempSubCategory("");
                    router.push(activeCategory ? `/sarees?category=${activeCategory}` : "/sarees");
                  }}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Price: {minPrice ? `₹${Number(minPrice).toLocaleString()}` : "₹0"} -{" "}
                {maxPrice ? `₹${Number(maxPrice).toLocaleString()}` : "Any"}
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setTempMinPrice("");
                    setTempMaxPrice("");
                  }}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    router.push("/sarees");
                  }}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* PRODUCT CARDS GRID */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : products.length === 0 ? (
          <div className="bg-[#EFECE6] rounded-3xl p-10 sm:p-16 border border-[#C5A059]/30 text-center max-w-lg mx-auto my-6 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-[#1B5E3B]/10 text-[#1B5E3B] rounded-full flex items-center justify-center mx-auto">
              <FiBox className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h3 className="font-serif font-bold text-2xl text-[#222222]">
              No Sarees Found
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              We couldn't find any sarees matching your selected category, price range, or search criteria.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#14462B] transition-all shadow-md cursor-pointer"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>View All Sarees</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PAGINATION CONTROLS (ALWAYS VISIBLE WHEN PRODUCTS ARE PRESENT)             */}
        {/* ========================================================================= */}
        {!loading && totalProducts > 0 && (
          <div className="mt-12 pt-8 border-t border-[#C5A059]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 font-semibold">
              Page <span className="text-[#1B5E3B] font-bold">{currentPage}</span> of{" "}
              <span className="text-zinc-800 font-bold">{totalPages}</span> ({totalProducts} {totalProducts === 1 ? "saree" : "total sarees"})
            </p>

            <div className="flex items-center gap-1.5">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  currentPage === 1
                    ? "bg-[#EFECE6] text-zinc-400 border-stone-300/60 cursor-not-allowed"
                    : "bg-[#F5F2EB] text-zinc-800 border-[#C5A059]/40 hover:bg-[#1B5E3B] hover:text-white hover:border-[#1B5E3B] shadow-2xs cursor-pointer"
                }`}
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              {/* Page Number Buttons */}
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => {
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isActive}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center border ${
                      isActive
                        ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-md cursor-default"
                        : "bg-[#F5F2EB] text-zinc-700 border-[#C5A059]/40 hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B] cursor-pointer"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages <= 1}
                className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  currentPage === totalPages || totalPages <= 1
                    ? "bg-[#EFECE6] text-zinc-400 border-stone-300/60 cursor-not-allowed"
                    : "bg-[#F5F2EB] text-zinc-800 border-[#C5A059]/40 hover:bg-[#1B5E3B] hover:text-white hover:border-[#1B5E3B] shadow-2xs cursor-pointer"
                }`}
              >
                <span>Next</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

export default function SareesCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center">
          <FiRefreshCw className="w-10 h-10 text-[#1B5E3B] animate-spin mb-4" />
          <p className="font-serif font-bold text-[#1B5E3B] text-lg">
            Loading Saree Catalog...
          </p>
        </div>
      }
    >
      <SareeCatalogContent />
    </Suspense>
  );
}
