"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/productCard";
import { fetchSarees } from "@/service/productService";
import axios from "axios";
import {
  FiFilter,
  FiSliders,
  FiRefreshCw,
  FiArrowLeft,
  FiX,
  FiSearch,
  FiChevronRight,
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

  const categoryParam = searchParams.get("category") || "";
  const subCategoryParam = searchParams.get("subCategory") || "";
  const searchParam = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState([]);

  // Accordion Toggle States for Sidebar Sections
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [fabricOpen, setFabricOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeSubCategory, setActiveSubCategory] = useState(subCategoryParam);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState(searchParam);

  // Price Range Filter State
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [activePriceRange, setActivePriceRange] = useState("");

  // Metadata Display Names
  const [activeCategoryName, setActiveCategoryName] = useState("");
  const [activeSubCategoryName, setActiveSubCategoryName] = useState("");
  const [titleName, setTitleName] = useState("Exquisite Saree Collection");
  const [subtitleName, setSubtitleName] = useState(
    "Handcrafted drapes woven by India's finest master artisans"
  );

  // Fetch categories tree from API for sidebar & filter pills
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
  }, [categoryParam, subCategoryParam, searchParam]);

  // Resolve Category & Subcategory Names for Header & Badges
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

  // Fetch Sarees from backend API
  useEffect(() => {
    const loadSareesData = async () => {
      setLoading(true);
      try {
        const queryParams = {
          limit: 50,
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
      } catch (e) {
        console.error("Error fetching sarees catalog:", e);
        setProducts([]);
      }
      setLoading(false);
    };

    loadSareesData();
  }, [
    activeCategory,
    activeSubCategory,
    selectedFabric,
    sortBy,
    searchQuery,
    minPrice,
    maxPrice,
  ]);

  // Control scroll lock when mobile filter drawer is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && window.lenis) window.lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.lenis) window.lenis.start();
    }
    return () => {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.lenis) window.lenis.start();
    };
  }, [mobileFilterOpen]);

  // Recalculate Lenis scroll bounds when products or accordions toggle
  useEffect(() => {
    if (typeof window !== "undefined" && window.lenis) {
      setTimeout(() => {
        if (window.lenis) window.lenis.resize();
      }, 150);
    }
  }, [products, categoriesOpen, priceOpen, fabricOpen]);

  const handleCategorySelect = (catId) => {
    if (activeCategory === catId) {
      setActiveCategory("");
      setActiveSubCategory("");
      router.push("/sarees");
    } else {
      setActiveCategory(catId);
      setActiveSubCategory("");
      router.push(`/sarees?category=${catId}`);
    }
  };

  const handleSubCategorySelect = (subId, parentCatId) => {
    if (activeSubCategory === subId) {
      setActiveSubCategory("");
      router.push(parentCatId ? `/sarees?category=${parentCatId}` : "/sarees");
    } else {
      if (parentCatId) setActiveCategory(parentCatId);
      setActiveSubCategory(subId);
      router.push(`/sarees?subCategory=${subId}`);
    }
  };

  const handlePricePreset = (presetKey, minVal, maxVal) => {
    if (activePriceRange === presetKey) {
      setActivePriceRange("");
      setMinPrice("");
      setMaxPrice("");
    } else {
      setActivePriceRange(presetKey);
      setMinPrice(minVal ? String(minVal) : "");
      setMaxPrice(maxVal ? String(maxVal) : "");
    }
  };

  const handleResetFilters = () => {
    setActiveCategory("");
    setActiveSubCategory("");
    setSelectedFabric("");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setActivePriceRange("");
    setSortBy("newest");
    router.push("/sarees");
  };

  const fabricOptions = [
    "Organza",
    "Silk",
    "Banarasi",
    "Kanjivaram",
    "Chiffon",
    "Georgette",
    "Cotton",
  ];

  const pricePresets = [
    { key: "under5k", label: "Under ₹5,000", min: null, max: 5000 },
    { key: "5k-10k", label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { key: "10k-20k", label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
    { key: "above20k", label: "₹20,000+", min: 20000, max: null },
  ];

  const isFilterActive =
    activeCategory ||
    activeSubCategory ||
    selectedFabric ||
    searchQuery ||
    minPrice ||
    maxPrice;

  // Render the Sidebar Filter Content (reusable for desktop & mobile drawer)
  const renderSidebarFilters = () => (
    <div className="bg-white rounded-3xl border border-[#C5A059]/30 shadow-sm overflow-hidden divide-y divide-stone-100">
      {/* FILTER PANEL HEADER */}
      <div className="bg-[#0F2C24] text-[#F5F2EB] p-4 sm:p-5 flex items-center justify-between border-b border-[#C5A059]/30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center">
            <FiSliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#F5F2EB] tracking-wide">
              Refine Selection
            </h3>
            <p className="text-[10px] text-stone-300">Filter by category, price & fabric</p>
          </div>
        </div>

        {isFilterActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] font-bold text-[#C5A059] hover:text-white transition-colors bg-white/10 px-2.5 py-1 rounded-lg border border-[#C5A059]/30 cursor-pointer"
          >
            <FiRotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. CATEGORIES & SUBCATEGORIES ACCORDION */}
      <div className="p-4 sm:p-5 space-y-3">
        <button
          type="button"
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <span className="font-serif font-bold text-sm text-[#1B5E3B] flex items-center gap-2 group-hover:text-[#14462B] transition-colors">
            <FiLayers className="w-4 h-4 text-[#C5A059]" />
            Categories & Subcategories
          </span>
          <FiChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
              categoriesOpen ? "rotate-180 text-[#1B5E3B]" : ""
            }`}
          />
        </button>

        {categoriesOpen && (
          <div className="pt-2 space-y-2 animate-fadeIn">
            {categoriesList.length === 0 ? (
              <div className="space-y-2 py-2">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-stone-100 rounded animate-pulse w-1/2" />
              </div>
            ) : (
              categoriesList.map((cat) => {
                const isCatActive =
                  activeCategory === cat._id ||
                  activeCategory.toLowerCase() === cat.name.toLowerCase();

                return (
                  <div key={cat._id} className="space-y-1">
                    {/* Category Item */}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat._id)}
                      className={`w-full flex items-center justify-between text-left text-xs font-serif font-bold py-2 px-3 rounded-xl transition-all cursor-pointer ${
                        isCatActive
                          ? "bg-[#1B5E3B] text-white shadow-xs"
                          : "text-zinc-800 hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B]"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isCatActive ? (
                        <FiCheck className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : (
                        <FiChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}
                    </button>

                    {/* Subcategories Tree */}
                    {cat.subCategories && cat.subCategories.length > 0 && (
                      <div className="pl-3 ml-3 border-l-2 border-[#C5A059]/30 space-y-1 py-1">
                        {cat.subCategories.map((sub) => {
                          const isSubActive =
                            activeSubCategory === sub._id ||
                            activeSubCategory.toLowerCase() === sub.name.toLowerCase();

                          return (
                            <button
                              key={sub._id}
                              type="button"
                              onClick={() => handleSubCategorySelect(sub._id, cat._id)}
                              className={`w-full text-left text-[11px] py-1.5 px-2.5 rounded-lg font-semibold transition-all flex items-center justify-between cursor-pointer ${
                                isSubActive
                                  ? "bg-[#C5A059]/20 text-[#8B6B23] font-bold border border-[#C5A059]/40"
                                  : "text-zinc-600 hover:text-[#1B5E3B] hover:translate-x-0.5 hover:bg-stone-50"
                              }`}
                            >
                              <span className="truncate">{sub.name}</span>
                              {isSubActive && (
                                <FiCheck className="w-3 h-3 text-[#1B5E3B] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 2. PRICE RANGE FILTER ACCORDION */}
      <div className="p-4 sm:p-5 space-y-3">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <span className="font-serif font-bold text-sm text-[#1B5E3B] flex items-center gap-2 group-hover:text-[#14462B] transition-colors">
            <FiDollarSign className="w-4 h-4 text-[#C5A059]" />
            Filter By Price
          </span>
          <FiChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
              priceOpen ? "rotate-180 text-[#1B5E3B]" : ""
            }`}
          />
        </button>

        {priceOpen && (
          <div className="pt-2 space-y-3 animate-fadeIn">
            {/* Price Preset Grid Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {pricePresets.map((preset) => {
                const isSelected = activePriceRange === preset.key;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePricePreset(preset.key, preset.min, preset.max)}
                    className={`text-center text-[11px] py-2 px-2.5 rounded-xl font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-2xs"
                        : "bg-stone-50 text-zinc-700 border-stone-200 hover:bg-stone-100 hover:text-[#1B5E3B]"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Min/Max Input Box */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Enter Custom Range (₹)
              </span>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setActivePriceRange("");
                    }}
                    className="w-full pl-6 pr-2 py-1.5 bg-[#F5F2EB] border border-stone-300 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[#1B5E3B]"
                  />
                </div>
                <span className="text-zinc-400 font-bold text-xs">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs text-zinc-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setActivePriceRange("");
                    }}
                    className="w-full pl-6 pr-2 py-1.5 bg-[#F5F2EB] border border-stone-300 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:border-[#1B5E3B]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. FABRIC TYPE ACCORDION */}
      <div className="p-4 sm:p-5 space-y-3">
        <button
          type="button"
          onClick={() => setFabricOpen(!fabricOpen)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <span className="font-serif font-bold text-sm text-[#1B5E3B] flex items-center gap-2 group-hover:text-[#14462B] transition-colors">
            <FiTag className="w-4 h-4 text-[#C5A059]" />
            Fabric Type
          </span>
          <FiChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
              fabricOpen ? "rotate-180 text-[#1B5E3B]" : ""
            }`}
          />
        </button>

        {fabricOpen && (
          <div className="pt-2 flex flex-wrap gap-1.5 animate-fadeIn">
            {fabricOptions.map((fab) => {
              const isSelected = selectedFabric === fab;
              return (
                <button
                  key={fab}
                  type="button"
                  onClick={() => setSelectedFabric(isSelected ? "" : fab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    isSelected
                      ? "bg-[#1B5E3B] text-white border-[#1B5E3B] shadow-2xs"
                      : "bg-stone-50 text-zinc-700 border-stone-200 hover:bg-stone-100 hover:text-[#1B5E3B]"
                  }`}
                >
                  {fab}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* BREADCRUMB NAVIGATION */}
      <div className="bg-[#EFECE6] border-b border-[#C5A059]/20 py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
              Home
            </Link>
            <FiChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
            <Link href="/sarees" onClick={handleResetFilters} className="hover:text-[#1B5E3B] transition-colors">
              Sarees Catalog
            </Link>
            {(activeCategory || activeSubCategory || searchQuery) && (
              <>
                <FiChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="text-[#1B5E3B] font-bold">{titleName}</span>
              </>
            )}
          </div>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* HERO BANNER */}
      <div className="bg-[#0F2C24] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A059_1px,transparent_1px)] bg-size-[16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#C5A059] text-[10px] font-bold uppercase tracking-widest">
            <FiGrid className="w-3 h-3" />
            <span>Luxury Saree Collection</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-[#F5F2EB] tracking-tight">
            {titleName}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl font-light leading-relaxed">
            {subtitleName}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ACTIVE FILTERS SUMMARY BAR */}
        {isFilterActive && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-[#C5A059]/30 flex flex-wrap items-center gap-2.5 shadow-xs">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <FiFilter className="w-3.5 h-3.5 text-[#1B5E3B]" /> Active Filters:
            </span>

            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1B5E3B]/10 text-[#1B5E3B] text-xs font-bold border border-[#1B5E3B]/20">
                Category: {activeCategoryName || "Selected"}
                <button
                  type="button"
                  onClick={() => handleCategorySelect(activeCategory)}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {activeSubCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#8B6B23] text-xs font-bold border border-[#C5A059]/30">
                SubCategory: {activeSubCategoryName || "Selected"}
                <button
                  type="button"
                  onClick={() => handleSubCategorySelect(activeSubCategory)}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedFabric && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-zinc-800 text-xs font-bold border border-stone-300">
                Fabric: {selectedFabric}
                <button
                  type="button"
                  onClick={() => setSelectedFabric("")}
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
                    setActivePriceRange("");
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
                  onClick={() => setSearchQuery("")}
                  className="hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-bold underline ml-auto cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* TOP CONTROL BAR & SORT OPTIONS */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <span className="font-serif font-bold text-base text-[#1B5E3B]">
              {products.length} {products.length === 1 ? "Saree" : "Sarees"} Found
            </span>

            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 bg-[#0F2C24] text-[#C5A059] rounded-xl text-xs font-bold cursor-pointer"
            >
              <FiFilter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Sort Buttons */}
            <div className="flex items-center gap-1 bg-[#F5F2EB] p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setSortBy("price_asc")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === "price_asc"
                    ? "bg-[#1B5E3B] text-white shadow-xs"
                    : "text-zinc-700 hover:text-[#1B5E3B]"
                }`}
              >
                <FiTrendingUp className="w-3.5 h-3.5" />
                <span>Price: Low to High</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("price_desc")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === "price_desc"
                    ? "bg-[#1B5E3B] text-white shadow-xs"
                    : "text-zinc-700 hover:text-[#1B5E3B]"
                }`}
              >
                <FiTrendingDown className="w-3.5 h-3.5" />
                <span>Price: High to Low</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("newest")}
                className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === "newest"
                    ? "bg-[#1B5E3B] text-white shadow-xs"
                    : "text-zinc-700 hover:text-[#1B5E3B]"
                }`}
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Newest</span>
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#F5F2EB] border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-[#222222] focus:outline-none focus:border-[#1B5E3B]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* MAIN LAYOUT: SIDEBAR + PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* DESKTOP SIDEBAR FILTERS */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            {renderSidebarFilters()}
          </div>

          {/* MOBILE FILTER OVERLAY DRAWER */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs">
              <div className="bg-[#F5F2EB] rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto space-y-4 no-lenis">
                <div className="flex items-center justify-between pb-2 border-b border-stone-300">
                  <h3 className="font-serif font-bold text-lg text-[#1B5E3B]">Filter Products</h3>
                  <button
                    type="button"
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-2 text-zinc-600 hover:text-zinc-900"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>

                {renderSidebarFilters()}

                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  Apply Filters ({products.length} Products)
                </button>
              </div>
            </div>
          )}

          {/* PRODUCT CARDS GRID */}
          <div className="lg:col-span-3">
            {loading ? (
              /* LOADING SKELETON GRID */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-3 space-y-2 border border-stone-200 animate-pulse"
                  >
                    <div className="w-full aspect-[4/5] bg-stone-200 rounded-lg" />
                    <div className="h-3 bg-stone-200 rounded w-1/3" />
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* EMPTY CATALOG STATE */
              <div className="bg-white rounded-3xl p-10 sm:p-16 border border-stone-200 text-center max-w-lg mx-auto my-6 shadow-xs space-y-4">
                <div className="w-16 h-16 bg-[#1B5E3B]/10 text-[#1B5E3B] rounded-full flex items-center justify-center mx-auto">
                  <FiBox className="w-8 h-8 text-[#C5A059]" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#222222]">
                  No Sarees Found
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  We couldn't find any sarees matching your selected filters or price range.
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
              /* PRODUCT CARDS GRID */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
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
