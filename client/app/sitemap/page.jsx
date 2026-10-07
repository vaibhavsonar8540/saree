"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import HeroBanner from "@/components/heroBanner";
import sareeDesktopImg from "@/assets/images/saree/saree-desktop.webp";
import sareeMobileImg from "@/assets/images/saree/saree-mobile.webp";
import {
  FiGrid,
  FiLayers,
  FiHome,
  FiInfo,
  FiMail,
  FiHeart,
  FiShoppingBag,
  FiUser,
  FiHelpCircle,
  FiShield,
  FiFileText,
  FiSearch,
  FiChevronRight,
  FiTag,
  FiBox,
} from "react-icons/fi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SitemapPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to compute category name slug
  const getCategorySlug = (cat) => {
    if (!cat) return "";
    if (cat.slug) return cat.slug;
    if (cat.name) return cat.name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return cat._id || "";
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories?includeSubcategories=true&isActive=true`);
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.warn("Sitemap: Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Main Page Links Structure
  const mainPages = [
    { title: "Home Page", href: "/", icon: FiHome, desc: "Main landing page & featured collections" },
    { title: "All Sarees Catalog", href: "/sarees", icon: FiGrid, desc: "Explore entire handcrafted saree collection" },
    { title: "Category Index", href: "/category", icon: FiLayers, desc: "Browse all saree categories & weaves" },
    { title: "About Our Heritage", href: "/about", icon: FiInfo, desc: "Learn about our craftsmanship & story" },
    { title: "Contact Us", href: "/contact", icon: FiMail, desc: "Get in touch with our customer atelier" },
  ];

  const shoppingPages = [
    { title: "Shopping Cart", href: "/cart", icon: FiShoppingBag, desc: "View items added to cart" },
    { title: "My Favourites", href: "/favourites", icon: FiHeart, desc: "View saved wishlist sarees" },
    { title: "Checkout", href: "/checkout", icon: FiBox, desc: "Secure checkout and payment" },
    { title: "My Orders", href: "/order", icon: FiUser, desc: "Track past and current orders" },
  ];

  const filterStr = searchQuery.toLowerCase().trim();

  // Filter Categories by Search Query
  const filteredCategories = categories.filter((cat) => {
    if (!filterStr) return true;
    if (cat.name.toLowerCase().includes(filterStr)) return true;
    if (cat.subCategories && cat.subCategories.some((sub) => sub.name.toLowerCase().includes(filterStr))) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* HERO BANNER */}
      <HeroBanner
        src={sareeDesktopImg}
        mobileSrc={sareeMobileImg}
        align="left"
        badge="DIRECTORY & NAVIGATION"
        badgeClass="inline-block px-3.5 py-1 rounded-full border border-[#C5A059]/80 bg-black/40 text-[#C5A059] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-xs shadow-md"
        title="Store Sitemap & Directory"
        titleClass="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-md"
        desc="Explore all pages, handcrafted saree categories, subcategories, and shopping links in one structured directory."
        descClass="text-xs sm:text-base text-zinc-200 max-w-xl font-normal leading-relaxed drop-shadow-xs"
        overlayClass="bg-gradient-to-r from-black/85 via-black/55 to-transparent"
        className="w-full shadow-md"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C5A059]/20 pb-6 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              Sitemap Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1">
              Click any link below to quickly navigate to specific collections or store pages.
            </p>
          </div>

          {/* Quick Filter Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search sitemap links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#EFECE6] border border-[#C5A059]/40 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]/20 transition-all pr-10 shadow-2xs"
            />
            <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* TOP SECTION: MAIN PAGES & SHOPPING PAGES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* MAIN STORE PAGES */}
          <div className="bg-[#EFECE6] p-6 rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#C5A059]/20 pb-3">
              <div className="p-2.5 rounded-xl bg-[#1B5E3B]/10 text-[#1B5E3B]">
                <FiHome className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#222222]">Main Pages</h2>
                <p className="text-[11px] text-zinc-500">Core store navigation & brand info</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {mainPages
                .filter((p) => !filterStr || p.title.toLowerCase().includes(filterStr))
                .map((page) => {
                  const IconComp = page.icon;
                  return (
                    <Link
                      key={page.title}
                      href={page.href}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-[#F5F2EB] hover:bg-[#1B5E3B] hover:text-white transition-all duration-200 border border-[#C5A059]/20"
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4 text-[#1B5E3B] group-hover:text-[#C5A059] transition-colors" />
                        <div>
                          <span className="font-serif font-bold text-xs sm:text-sm group-hover:text-white transition-colors">
                            {page.title}
                          </span>
                          <p className="text-[10px] text-zinc-500 group-hover:text-zinc-200 transition-colors">
                            {page.desc}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* SHOPPING & USER ACCOUNT */}
          <div className="bg-[#EFECE6] p-6 rounded-3xl border border-[#C5A059]/30 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#C5A059]/20 pb-3">
              <div className="p-2.5 rounded-xl bg-[#1B5E3B]/10 text-[#1B5E3B]">
                <FiShoppingBag className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg text-[#222222]">Shopping & Account</h2>
                <p className="text-[11px] text-zinc-500">Cart, wishlist & order tracking</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {shoppingPages
                .filter((p) => !filterStr || p.title.toLowerCase().includes(filterStr))
                .map((page) => {
                  const IconComp = page.icon;
                  return (
                    <Link
                      key={page.title}
                      href={page.href}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-[#F5F2EB] hover:bg-[#1B5E3B] hover:text-white transition-all duration-200 border border-[#C5A059]/20"
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4 text-[#1B5E3B] group-hover:text-[#C5A059] transition-colors" />
                        <div>
                          <span className="font-serif font-bold text-xs sm:text-sm group-hover:text-white transition-colors">
                            {page.title}
                          </span>
                          <p className="text-[10px] text-zinc-500 group-hover:text-zinc-200 transition-colors">
                            {page.desc}
                          </p>
                        </div>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  );
                })}
            </div>
          </div>

        </div>

        {/* DYNAMIC CATEGORIES & SUBCATEGORIES SECTION */}
        <div className="mb-12">
          <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1B5E3B]/10 text-[#1B5E3B]">
                <FiLayers className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-xl text-[#1B5E3B]">
                  Saree Categories & Subcategories
                </h2>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Handcrafted weave categories and their specific subcategory collections
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#C5A059] bg-[#C5A059]/10 px-3 py-1 rounded-full border border-[#C5A059]/30">
              {categories.length} Categories
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-[#EFECE6] rounded-2xl border border-[#C5A059]/30" />
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-[#EFECE6] rounded-2xl border border-[#C5A059]/30">
              <p className="text-xs text-zinc-500">No categories found matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => {
                const catSlug = getCategorySlug(cat);
                return (
                  <div
                    key={cat._id}
                    className="group bg-[#EFECE6] p-5 rounded-2xl border border-[#C5A059]/30 hover:border-[#1B5E3B] transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md"
                  >
                    <div>
                      {/* Category Title Link */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/20 mb-3">
                        <Link
                          href={`/saree/${catSlug}`}
                          className="font-serif font-bold text-base text-[#222222] group-hover:text-[#1B5E3B] transition-colors flex items-center gap-2"
                        >
                          <FiTag className="w-4 h-4 text-[#C5A059]" />
                          <span>{cat.name}</span>
                        </Link>
                        <span className="text-[10px] font-bold text-zinc-500 bg-[#F5F2EB] px-2 py-0.5 rounded-full border border-stone-200">
                          {cat.subCategories?.length || 0} Sub
                        </span>
                      </div>

                      {/* Subcategories List */}
                      {cat.subCategories && cat.subCategories.length > 0 ? (
                        <div className="space-y-1.5 pl-2 border-l-2 border-[#C5A059]/30">
                          {cat.subCategories.map((sub) => (
                            <Link
                              key={sub._id}
                              href={`/saree/${catSlug}?subCategory=${sub._id}`}
                              className="group/sub flex items-center justify-between py-1 text-xs text-zinc-600 hover:text-[#1B5E3B] transition-colors"
                            >
                              <span className="group-hover/sub:translate-x-1 transition-transform">
                                • {sub.name}
                              </span>
                              <FiChevronRight className="w-3 h-3 text-zinc-400 group-hover/sub:text-[#1B5E3B]" />
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic my-2">No subcategories</p>
                      )}
                    </div>

                    {/* View Category Link */}
                    <div className="pt-3 border-t border-[#C5A059]/20 mt-4 flex items-center justify-between">
                      <Link
                        href={`/saree/${catSlug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B5E3B] hover:text-[#14462B] transition-all group-hover:translate-x-1"
                      >
                        <span>Explore {cat.name} Sarees</span>
                        <FiChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
