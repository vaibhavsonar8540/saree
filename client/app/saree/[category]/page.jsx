"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/productCard";
import ProductNotFound from "@/components/ProductNotFound";
import { ProductGridSkeleton } from "@/components/Skeleton";
import { fetchSarees, fetchCategoryById } from "@/service/productService";
import HeroBanner from "@/components/heroBanner";
import sareeDesktopImg from "@/assets/images/saree/saree-desktop.webp";
import sareeMobileImg from "@/assets/images/saree/saree-mobile.webp";
import axios from "axios";
import {
  FiFilter,
  FiSliders,
  FiRefreshCw,
  FiX,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiBox,
  FiRotateCcw,
  FiGrid,
  FiTag,
} from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function DynamicCategoryContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSectionRef = useRef(null);

  // Dynamic category URL parameter from route /saree/[category] or /sarees/[category]
  const rawCategoryParam = params?.category || "";
  const subCategoryParam = searchParams.get("subCategory") || "";

  // Category State
  const [categoryData, setCategoryData] = useState(null);
  const [subCategoriesList, setSubCategoriesList] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // Products State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State (10 products per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters State
  const [activeSubCategory, setActiveSubCategory] = useState(subCategoryParam);
  const [sortBy, setSortBy] = useState("date_desc");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Temp Filter Form State
  const [tempSubCategory, setTempSubCategory] = useState(subCategoryParam);
  const [tempSortBy, setTempSortBy] = useState("date_desc");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");
  const [isFilterCardOpen, setIsFilterCardOpen] = useState(false);

  // Sync subcategory URL state
  useEffect(() => {
    setActiveSubCategory(subCategoryParam);
    setTempSubCategory(subCategoryParam);
    setCurrentPage(1);
  }, [subCategoryParam]);

  // Helper to compute category name slug
  const getCategorySlug = (catName, fallback) => {
    if (!catName) return fallback;
    return catName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // 1. Fetch Dynamic Category Details & Replace Raw ID with Name Slug in URL
  useEffect(() => {
    const loadCategoryDetails = async () => {
      if (!rawCategoryParam) return;
      setCategoryLoading(true);
      try {
        // Try fetching category by ID or name/slug from backend
        let data = await fetchCategoryById(rawCategoryParam);
        
        // Fallback: search all categories from API
        if (!data) {
          const res = await axios.get(`${API_BASE_URL}/categories?includeSubcategories=true`);
          if (res.data && res.data.success && Array.isArray(res.data.data)) {
            const list = res.data.data;
            const targetStr = decodeURIComponent(rawCategoryParam).toLowerCase().replace(/-/g, " ");
            const matched = list.find(
              (c) =>
                c._id === rawCategoryParam ||
                c.name.toLowerCase() === targetStr ||
                c.name.toLowerCase().includes(targetStr) ||
                targetStr.includes(c.name.toLowerCase())
            );
            if (matched) {
              data = matched;
            }
          }
        }

        if (data) {
          setCategoryData(data);
          setSubCategoriesList(data.subCategories || []);

          // Replace MongoDB ID in browser URL bar with clean Category Name Slug if needed
          const isMongoId = /^[0-9a-fA-F]{24}$/.test(rawCategoryParam);
          if (isMongoId && data.name) {
            const slug = getCategorySlug(data.name, rawCategoryParam);
            const search = subCategoryParam ? `?subCategory=${subCategoryParam}` : "";
            window.history.replaceState(null, "", `/saree/${slug}${search}`);
          }
        } else {
          // Construct fallback category title from URL slug
          const formattedName = decodeURIComponent(rawCategoryParam)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
          setCategoryData({
            _id: rawCategoryParam,
            name: formattedName,
            subCategories: [],
          });
        }
      } catch (err) {
        console.warn("Error loading category details:", err);
        const formattedName = decodeURIComponent(rawCategoryParam)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setCategoryData({
          _id: rawCategoryParam,
          name: formattedName,
          subCategories: [],
        });
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategoryDetails();
  }, [rawCategoryParam]);

  // Derived Category Name & Slug
  const categoryName = categoryData?.name || decodeURIComponent(rawCategoryParam).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const categorySlug = getCategorySlug(categoryData?.name, rawCategoryParam);

  // 2. Fetch Sarees strictly for THIS category
  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!rawCategoryParam) return;
      setLoading(true);
      try {
        const queryParams = {
          page: currentPage,
          limit: 10,
          sortBy: sortBy,
          // Pass category identifier (ID or name/slug)
          category: categoryData?._id || rawCategoryParam,
        };

        if (activeSubCategory) queryParams.subCategory = activeSubCategory;
        if (minPrice) queryParams.minPrice = minPrice;
        if (maxPrice) queryParams.maxPrice = maxPrice;

        const data = await fetchSarees(queryParams);
        setProducts(data);
        setTotalProducts(data.total ?? data.length);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        console.error("Error fetching category sarees:", err);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [rawCategoryParam, categoryData, currentPage, activeSubCategory, sortBy, minPrice, maxPrice]);

  // Handle Filter Application
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setActiveSubCategory(tempSubCategory);
    setSortBy(tempSortBy);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setCurrentPage(1);
    setIsFilterCardOpen(false);

    if (tempSubCategory) {
      router.push(`/saree/${categorySlug}?subCategory=${tempSubCategory}`);
    } else {
      router.push(`/saree/${categorySlug}`);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setTempSubCategory("");
    setTempSortBy("date_desc");
    setTempMinPrice("");
    setTempMaxPrice("");
    setActiveSubCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("date_desc");
    setCurrentPage(1);
    setIsFilterCardOpen(false);
    router.push(`/saree/${categorySlug}`);
  };

  // Pagination Change Handler with Smooth Scroll
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      if (productSectionRef.current) {
        productSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 350, behavior: "smooth" });
      }
    }
  };

  const activeFiltersCount = [
    activeSubCategory,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const isFilterActive = activeSubCategory || minPrice || maxPrice;

  // Subcategory Name Lookup
  let activeSubCategoryName = "";
  if (activeSubCategory && subCategoriesList.length > 0) {
    const foundSub = subCategoriesList.find(
      (s) => s._id === activeSubCategory || s.name.toLowerCase() === activeSubCategory.toLowerCase()
    );
    if (foundSub) activeSubCategoryName = foundSub.name;
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* HERO BANNER FOR CATEGORY */}
      <HeroBanner
        src={sareeDesktopImg}
        mobileSrc={sareeMobileImg}
        align="left"
        badge="CATEGORY COLLECTION"
        badgeClass="inline-block px-3.5 py-1 rounded-full border border-[#C5A059]/80 bg-black/40 text-[#C5A059] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-xs shadow-md"
        title={categoryLoading ? "Loading Collection..." : `${categoryName} Sarees`}
        titleClass="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md"
        desc={`Discover handcrafted ${categoryName} drapes, woven with generational artistry to celebrate your timeless grace.`}
        descClass="text-xs sm:text-base text-zinc-200 max-w-xl font-normal leading-relaxed drop-shadow-xs"
        overlayClass="bg-gradient-to-r from-black/85 via-black/55 to-transparent"
        className="w-full shadow-md"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* BREADCRUMBS & ALL SAREES LINK */}
        <div className="flex items-center justify-between gap-4 mb-4 text-xs">
          <div className="flex items-center gap-2 text-zinc-500 font-medium">
            <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
              Home
            </Link>
            <FiChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/sarees" className="hover:text-[#1B5E3B] transition-colors">
              All Sarees
            </Link>
            <FiChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#1B5E3B] font-bold">{categoryName}</span>
          </div>

          <Link
            href="/sarees"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B5E3B] hover:text-[#14462B] transition-colors"
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span>View All Sarees &rarr;</span>
          </Link>
        </div>

        {/* SUBCATEGORY QUICK FILTER PILLS BAR */}
        {subCategoriesList && subCategoriesList.length > 0 && (
          <div className="mb-6 overflow-x-auto no-scrollbar py-2 border-b border-[#C5A059]/20">
            <div className="flex items-center gap-2 min-w-max">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
                <FiTag className="w-3.5 h-3.5 text-[#C5A059]" /> Subcategories:
              </span>

              {/* All Subcategories Pill */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubCategory("");
                  setTempSubCategory("");
                  router.push(`/saree/${categorySlug}`);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  !activeSubCategory
                    ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-xs"
                    : "bg-[#EFECE6] text-zinc-700 border-[#C5A059]/30 hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B]"
                }`}
              >
                All {categoryName}
              </button>

              {/* Individual Subcategory Pills */}
              {subCategoriesList.map((sub) => {
                const isSelected = activeSubCategory === sub._id || activeSubCategory === sub.name;
                return (
                  <button
                    key={sub._id}
                    type="button"
                    onClick={() => {
                      const nextVal = isSelected ? "" : sub._id;
                      setActiveSubCategory(nextVal);
                      setTempSubCategory(nextVal);
                      if (nextVal) {
                        router.push(`/saree/${categorySlug}?subCategory=${nextVal}`);
                      } else {
                        router.push(`/saree/${categorySlug}`);
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-xs"
                        : "bg-[#EFECE6] text-zinc-700 border-[#C5A059]/30 hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B]"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* HEADER ROW WITH TITLE, PRODUCT COUNT & FILTER BUTTON */}
        <div ref={productSectionRef} className="flex items-start sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-[#C5A059]/20">
          <div>
            <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#1B5E3B] tracking-tight">
              {categoryName} Sarees
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-0.5">
              Showing {loading ? "..." : totalProducts} {totalProducts === 1 ? "design" : "exquisite designs"} in {categoryName}
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

        {/* COLLAPSIBLE SLIDE FILTER CARD */}
        {isFilterCardOpen && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-[#EFECE6] border border-[#C5A059]/40 shadow-md animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/30 mb-4">
              <div className="flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-[#1B5E3B]" />
                <h3 className="font-serif font-bold text-sm sm:text-base text-[#222222]">
                  Filter {categoryName} Sarees
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. SUBCATEGORY */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] sm:text-[11px] font-bold tracking-wider text-zinc-600 uppercase">
                    SUBCATEGORY
                  </label>
                  <div className="relative">
                    <select
                      value={tempSubCategory}
                      onChange={(e) => setTempSubCategory(e.target.value)}
                      disabled={subCategoriesList.length === 0}
                      className={`w-full appearance-none bg-[#F5F2EB] border border-[#C5A059]/40 hover:border-[#1B5E3B]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-800 font-medium focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all pr-10 shadow-2xs ${
                        subCategoriesList.length === 0
                          ? "opacity-60 cursor-not-allowed text-zinc-400"
                          : "cursor-pointer"
                      }`}
                    >
                      {subCategoriesList.length === 0 ? (
                        <option value="">No subcategories available</option>
                      ) : (
                        <>
                          <option value="">All {categoryName} Subcategories</option>
                          {subCategoriesList.map((sub) => (
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

                {/* 2. SORT BY */}
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

                {/* 3. PRICE RANGE */}
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

              {/* ACTION BUTTONS */}
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

        {/* ACTIVE FILTERS CHIPS */}
        {isFilterActive && (
          <div className="mb-6 p-3.5 rounded-2xl bg-[#EFECE6]/90 border border-[#C5A059]/30 flex flex-wrap items-center gap-2 shadow-2xs">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <FiFilter className="w-3.5 h-3.5 text-[#1B5E3B]" /> Active Filters:
            </span>

            {activeSubCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#8B6B23] text-xs font-bold border border-[#C5A059]/30">
                Subcategory: {activeSubCategoryName || "Selected"}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSubCategory("");
                    setTempSubCategory("");
                    router.push(`/saree/${categorySlug}`);
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
          </div>
        )}

        {/* PRODUCT CARDS GRID */}
        {loading ? (
          <ProductGridSkeleton count={10} />
        ) : products.length === 0 ? (
          <ProductNotFound
            categoryName={categoryName}
            isFilterActive={isFilterActive}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && totalProducts > 0 && (
          <div className="mt-12 pt-8 border-t border-[#C5A059]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 font-semibold">
              Page <span className="text-[#1B5E3B] font-bold">{currentPage}</span> of{" "}
              <span className="text-zinc-800 font-bold">{totalPages}</span> ({totalProducts} {totalProducts === 1 ? "saree" : "sarees"} in {categoryName})
            </p>

            <div className="flex items-center gap-1.5">
              {/* Prev */}
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

              {/* Page Numbers */}
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

              {/* Next */}
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

export default function SareeCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center">
          <FiRefreshCw className="w-10 h-10 text-[#1B5E3B] animate-spin mb-4" />
          <p className="font-serif font-bold text-[#1B5E3B] text-lg">
            Loading Category Sarees...
          </p>
        </div>
      }
    >
      <DynamicCategoryContent />
    </Suspense>
  );
}
