"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeaderCategoriesAction } from "@/redux/action/headerAction";
import {
  setIsCardOpen,
  toggleMobileMenu,
  closeMobileMenu,
  openCartDrawer,
} from "@/redux/slice/headerSlice";
import {
  DynamicCartDrawer as CartDrawer,
  DynamicAuthModal as AuthModal,
  DynamicUserProfileModal as UserProfileModal,
} from "@/components/DynamicComponent";
import { logoutUser } from "@/service/authService";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiChevronDown,
  FiChevronRight,
  FiGrid,
  FiArrowRight,
  FiTag,
  FiLogOut,
  FiShoppingBag,
} from "react-icons/fi";

import { getWishlist } from "@/utils/wishlist";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { categories, loading, isCardOpen, isMobileMenuOpen } = useSelector(
    (state) => state.header
  );

  const [searchOpen, setSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileSareeDropdownOpen, setMobileSareeDropdownOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);

  const [cartCount, setCartCount] = useState(0);
  const [favouriteCount, setFavouriteCountState] = useState(0);
  const [user, setUser] = useState(null);

  const leaveTimeoutRef = useRef(null);
  const searchPanelRef = useRef(null);
  const desktopSearchBtnRef = useRef(null);
  const mobileSearchBtnRef = useRef(null);

  const checkUserAuth = () => {
    try {
      const savedUser = localStorage.getItem("anjali_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout API warning:", e.message);
    } finally {
      localStorage.removeItem("anjali_user");
      localStorage.removeItem("anjali_token");
      setUser(null);
      setUserDropdownOpen(false);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userAuthUpdated"));
      }
    }
  };

  const handleMouseEnterMegaMenu = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    dispatch(setIsCardOpen(true));
  };

  const handleMouseLeaveMegaMenu = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      dispatch(setIsCardOpen(false));
    }, 800);
  };

  const handleCloseMegaMenuImmediate = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    dispatch(setIsCardOpen(false));
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
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
  }, [isMobileMenuOpen]);

  const updateCartCount = () => {
    try {
      const saved = localStorage.getItem("anjali_cart");
      if (saved) {
        const items = JSON.parse(saved);
        const total = Array.isArray(items) ? items.length : 0;
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      setCartCount(0);
    }
  };

  const updateFavouriteCount = () => {
    try {
      const items = getWishlist();
      setFavouriteCountState(Array.isArray(items) ? items.length : 0);
    } catch (e) {
      setFavouriteCountState(0);
    }
  };

  // Close search bar on outside click or icon re-click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchOpen &&
        searchPanelRef.current &&
        !searchPanelRef.current.contains(event.target) &&
        (!desktopSearchBtnRef.current || !desktopSearchBtnRef.current.contains(event.target)) &&
        (!mobileSearchBtnRef.current || !mobileSearchBtnRef.current.contains(event.target))
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      router.push(`/sarees?search=${encodeURIComponent(trimmed)}`);
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    dispatch(fetchHeaderCategoriesAction());
    updateCartCount();
    updateFavouriteCount();
    checkUserAuth();

    if (typeof window !== "undefined") {
      window.addEventListener("cartUpdated", updateCartCount);
      window.addEventListener("wishlistUpdated", updateFavouriteCount);
      window.addEventListener("userAuthUpdated", checkUserAuth);
      window.addEventListener("storage", updateCartCount);
      window.addEventListener("storage", updateFavouriteCount);
      window.addEventListener("storage", checkUserAuth);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cartUpdated", updateCartCount);
        window.removeEventListener("wishlistUpdated", updateFavouriteCount);
        window.removeEventListener("userAuthUpdated", checkUserAuth);
        window.removeEventListener("storage", updateCartCount);
        window.removeEventListener("storage", updateFavouriteCount);
        window.removeEventListener("storage", checkUserAuth);
      }
    };
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F5F2EB] border-b border-[#C5A059]/20 shadow-xs font-sans transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#0F2C24] text-[#C5A059] py-1.5 px-3 text-center text-[10px] sm:text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 border-b border-[#C5A059]/20">
        <span>✨ Free Worldwide Shipping On Orders Over ₹5,000 | Use Code: <strong>ANJALI10</strong> For 10% Off ✨</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          
          {/* LEFT SIDE: Mobile Menu Button & Search Icon (on small screens) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => dispatch(toggleMobileMenu())}
              className="p-2 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full lg:hidden transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>

            {/* Search Icon on Small Screens (right next to Hamburger menu button) */}
            <div className="relative lg:hidden">
              <button
                ref={mobileSearchBtnRef}
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* CENTER: Brand Logo (Centered on small screens, static left-aligned on large screens) */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center group absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:items-start"
          >
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#1B5E3B] group-hover:text-[#14462B] transition-colors">
              ANJALI
            </span>
            <span className="text-[10px] tracking-[0.25em] font-semibold text-[#C5A059] uppercase -mt-1">
              CREATION
            </span>
          </Link>

          {/* MIDDLE: Static Links & Saree Mega Menu (Desktop only) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 text-xs sm:text-sm font-semibold text-[#222222]">
            <Link
              href="/"
              className="px-4 py-2 rounded-full hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 transition-all"
            >
              Home
            </Link>

            {/* Saree Link with Mega Dropdown Trigger */}
            <div
              className="py-2"
              onMouseEnter={handleMouseEnterMegaMenu}
              onMouseLeave={handleMouseLeaveMegaMenu}
            >
              <Link
                href="/sarees"
                onClick={handleCloseMegaMenuImmediate}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
                  isCardOpen
                    ? "bg-[#1B5E3B]/10 text-[#1B5E3B]"
                    : "hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10"
                }`}
              >
                <span>Saree</span>
                <span className="bg-[#1B5E3B]/10 text-[#1B5E3B] text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                  Shop
                </span>
                <FiChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isCardOpen ? "rotate-180 text-[#1B5E3B]" : "text-zinc-400"
                  }`}
                />
              </Link>
            </div>

            <Link
              href="/about"
              className="px-4 py-2 rounded-full hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 transition-all"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="px-4 py-2 rounded-full hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 transition-all"
            >
              Contact
            </Link>
          </nav>

          {/* RIGHT SIDE: Action Icons */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Search Icon on Big Screens Only */}
            <div className="relative hidden lg:block">
              <button
                ref={desktopSearchBtnRef}
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="Search"
              >
                <FiSearch className="h-5 w-5" />
              </button>
            </div>

            {/* Wishlist Icon (Visible on Desktop, Hidden on Mobile Header) */}
            <Link
              href="/wishlist"
              className="relative hidden lg:flex p-2.5 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full transition-colors"
              aria-label="Wishlist"
            >
              <FiHeart className="h-5 w-5" />
              {favouriteCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1B5E3B] text-[10px] font-bold text-white shadow-xs">
                  {favouriteCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <button
              type="button"
              onClick={() => dispatch(openCartDrawer())}
              className="relative p-2 sm:p-2.5 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full transition-colors focus:outline-none"
              aria-label="Open Cart Drawer"
            >
              <FiShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1B5E3B] text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account Icon & Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => user && setUserDropdownOpen(true)}
              onMouseLeave={() => user && setUserDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setUserDropdownOpen(!userDropdownOpen);
                  } else {
                    setAuthModalTab("login");
                    setAuthModalOpen(true);
                    setUserDropdownOpen(false);
                  }
                }}
                className="flex items-center gap-1 p-2 sm:p-2.5 text-[#222222] hover:text-[#1B5E3B] hover:bg-[#1B5E3B]/10 rounded-full transition-colors focus:outline-none cursor-pointer"
                aria-label="User Account"
              >
                <FiUser className="h-5 w-5" />
                {user && (
                  <FiChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180 text-[#181818]" : "text-zinc-500"
                    }`}
                  />
                )}
              </button>

              {/* Logged-In User Account Card Dropdown */}
              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-2xl bg-[#F5F2EB] border border-[#C5A059]/40 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Warm Cream Header */}
                  <div className="px-4 py-3 bg-[#E8DFD1] text-[#181818] border-b border-[#C5A059]/30">
                    <p className="text-xs font-bold truncate text-[#181818]">
                      {user.name || "Valued Patron"}
                    </p>
                    <p className="text-[10px] text-[#8A6D3B] font-medium truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    {/* My Account */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileModalOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-zinc-800 hover:bg-[#E8DFD1]/60 hover:text-black font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FiUser className="text-sm text-[#C5A059]" />
                      <span>My Account</span>
                    </button>

                    {/* My Orders */}
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="w-full text-left px-4 py-2.5 text-xs text-zinc-800 hover:bg-[#E8DFD1]/60 hover:text-black font-semibold flex items-center gap-2.5 transition-colors"
                    >
                      <FiShoppingBag className="text-sm text-[#C5A059]" />
                      <span>My Orders</span>
                    </Link>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2.5 transition-colors border-t border-zinc-200 cursor-pointer"
                    >
                      <FiLogOut className="text-sm" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH SLIDING SEARCH BAR (SLIDES DOWN FROM HEADER) */}
      <div
        ref={searchPanelRef}
        className={`w-full bg-[#F5F2EB] border-b border-[#C5A059]/30 shadow-lg transition-all duration-300 ease-out origin-top z-40 overflow-hidden ${
          searchOpen
            ? "opacity-100 translate-y-0 max-h-48 py-4 sm:py-5 pointer-events-auto visible"
            : "opacity-0 -translate-y-4 max-h-0 py-0 pointer-events-none invisible"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            {/* Pill Search Container */}
            <div className="relative flex items-center w-full bg-white rounded-full border border-stone-300 focus-within:border-[#1B5E3B] focus-within:ring-2 focus-within:ring-[#1B5E3B]/20 shadow-xs transition-all overflow-hidden px-4 sm:px-6 py-2 sm:py-2.5">
              <FiSearch className="text-zinc-400 h-4 w-4 sm:h-5 sm:w-5 shrink-0 mr-3" />
              
              <input
                type="text"
                placeholder="Search products by collection, category, subcategory, fabric..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 bg-transparent focus:outline-none py-1"
                autoFocus={searchOpen}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors mr-2 cursor-pointer"
                  aria-label="Clear search"
                >
                  <FiX className="h-4 w-4" />
                </button>
              )}

              <button
                type="submit"
                className="shrink-0 px-5 sm:px-7 py-2 bg-black hover:bg-[#1B5E3B] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full shadow-md transition-all cursor-pointer"
              >
                SEARCH
              </button>
            </div>
          </form>

          {/* Quick Popular Searches Tags */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 mt-3 flex-wrap text-[10px] sm:text-xs text-zinc-500">
            <span className="font-semibold text-zinc-400">Popular Searches:</span>
            {["Banarasi", "Kanchipuram", "Organza", "Silk", "Chanderi", "Bridal"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchTerm(tag);
                  router.push(`/sarees?search=${encodeURIComponent(tag)}`);
                  setSearchOpen(false);
                }}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#1B5E3B] hover:text-white border border-stone-200 text-zinc-600 transition-all font-medium cursor-pointer shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FULL WIDTH SAREE MEGA DROPDOWN WITH SMOOTH HOVER TRANSITION */}
      <div
        onMouseEnter={handleMouseEnterMegaMenu}
        onMouseLeave={handleMouseLeaveMegaMenu}
        className={`absolute top-full left-0 right-0 w-full bg-[#F5F2EB] border-b border-t border-[#C5A059]/30 shadow-2xl z-50 transition-all duration-300 ease-out origin-top ${
          isCardOpen
            ? "opacity-100 translate-y-0 pointer-events-auto visible scale-y-100"
            : "opacity-0 -translate-y-2 pointer-events-none invisible scale-y-98"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#222222]">
          {/* Columns grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 xl:gap-12 min-h-40">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col space-y-3 animate-pulse">
                  <div className="h-5 bg-[#1B5E3B]/10 rounded-md w-3/4 mb-1 border-b border-[#C5A059]/20 pb-2" />
                  <div className="h-3.5 bg-stone-300/50 rounded w-1/2" />
                  <div className="h-3.5 bg-stone-300/50 rounded w-2/3" />
                  <div className="h-3.5 bg-stone-300/50 rounded w-3/5" />
                  <div className="h-3.5 bg-stone-300/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 xl:gap-12 min-h-40">
              {categories.map((cat) => (
                <div key={cat._id} className="flex flex-col space-y-3">
                  {/* Category Header */}
                  <Link
                    href={`/sarees?category=${cat._id}`}
                    onClick={handleCloseMegaMenuImmediate}
                    className="font-serif font-bold text-sm text-[#222222] hover:text-[#1B5E3B] border-b border-[#C5A059]/20 pb-2 flex items-center justify-between group/cat transition-colors"
                  >
                    <span>{cat.name}</span>
                    <FiArrowRight className="text-xs text-zinc-400 group-hover/cat:text-[#1B5E3B] group-hover/cat:translate-x-0.5 transition-all" />
                  </Link>

                  {/* Vertical Subcategories Column */}
                  <div className="flex flex-col space-y-2">
                    {cat.subCategories && cat.subCategories.length > 0 ? (
                      cat.subCategories.map((sub) => (
                        <Link
                          key={sub._id}
                          href={`/sarees?subCategory=${sub._id}`}
                          onClick={handleCloseMegaMenuImmediate}
                          className="text-xs text-zinc-600 hover:text-[#1B5E3B] hover:translate-x-1 transition-all py-0.5"
                        >
                          {sub.name}
                        </Link>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 italic">No subcategories</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">No categories found</div>
          )}

          {/* Bottom bar */}
          <div className="mt-8 pt-4 border-t border-[#C5A059]/20 flex items-center justify-end text-xs text-zinc-500">
            <Link
              href="/sarees"
              onClick={handleCloseMegaMenuImmediate}
              className="font-semibold text-[#1B5E3B] hover:text-[#14462B] hover:underline"
            >
              View Full Saree Catalog &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* FULLY RESPONSIVE MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 w-full h-[calc(100dvh-100%)] z-40 lg:hidden flex flex-col bg-[#F5F2EB] border-t border-[#C5A059]/20 overflow-y-auto animate-in slide-in-from-top-2 duration-200 no-lenis shadow-2xl">
          <div className="p-4 space-y-2 max-w-lg w-full mx-auto pb-28">
            {/* Home */}
            <Link
              href="/"
              onClick={() => dispatch(closeMobileMenu())}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-base text-[#222222] hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B] transition-colors border-b border-stone-200/60"
            >
              <span>Home</span>
            </Link>

            {/* Saree with Arrow Toggle for Categories Dropdown */}
            <div className="rounded-xl border border-stone-200/80 bg-white/60 overflow-hidden shadow-xs">
              <div className="flex items-center justify-between px-4 py-3.5 font-semibold text-base text-[#1B5E3B]">
                <Link
                  href="/sarees"
                  onClick={() => dispatch(closeMobileMenu())}
                  className="flex items-center gap-2 flex-1 hover:underline"
                >
                  <span>Saree</span>
                  <span className="bg-[#1B5E3B] text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Shop
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileSareeDropdownOpen(!mobileSareeDropdownOpen);
                  }}
                  className="p-1.5 rounded-lg text-[#1B5E3B] hover:bg-[#1B5E3B]/10 transition-colors cursor-pointer"
                  aria-label="Toggle Saree Categories"
                >
                  <FiChevronDown
                    className={`w-5 h-5 transition-transform duration-300 ${
                      mobileSareeDropdownOpen ? "rotate-180 text-[#1B5E3B]" : "text-zinc-500"
                    }`}
                  />
                </button>
              </div>

              {/* Saree Categories & Subcategories Dropdown Panel */}
              {mobileSareeDropdownOpen && (
                <div className="px-4 pb-4 pt-2 border-t border-stone-200/70 space-y-3 bg-[#F5F2EB]/90 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Link
                    href="/sarees"
                    onClick={() => dispatch(closeMobileMenu())}
                    className="font-bold text-xs text-[#1B5E3B] hover:underline block pb-1 border-b border-stone-200"
                  >
                    View All Sarees &rarr;
                  </Link>

                  {categories && categories.length > 0 ? (
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <div key={cat._id} className="space-y-1">
                          <Link
                            href={`/sarees?category=${cat._id}`}
                            onClick={() => dispatch(closeMobileMenu())}
                            className="font-serif font-bold text-xs text-[#222222] hover:text-[#1B5E3B] flex items-center justify-between"
                          >
                            <span>{cat.name}</span>
                            <FiArrowRight className="text-[10px] text-zinc-400" />
                          </Link>
                          {cat.subCategories && cat.subCategories.length > 0 && (
                            <div className="pl-3 space-y-1 border-l-2 border-[#C5A059]/30">
                              {cat.subCategories.map((sub) => (
                                <Link
                                  key={sub._id}
                                  href={`/sarees?subCategory=${sub._id}`}
                                  onClick={() => dispatch(closeMobileMenu())}
                                  className="block text-[11px] text-zinc-600 hover:text-[#1B5E3B] py-0.5"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic">Loading categories...</div>
                  )}
                </div>
              )}
            </div>

            {/* About Us */}
            <Link
              href="/about"
              onClick={() => dispatch(closeMobileMenu())}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-base text-[#222222] hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B] transition-colors border-b border-stone-200/60"
            >
              <span>About Us</span>
            </Link>

            {/* Contact Us */}
            <Link
              href="/contact"
              onClick={() => dispatch(closeMobileMenu())}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-base text-[#222222] hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B] transition-colors border-b border-stone-200/60"
            >
              <span>Contact Us</span>
            </Link>

            {/* My Favourites (AT THE LAST BELOW CONTACT US) */}
            <Link
              href="/wishlist"
              onClick={() => dispatch(closeMobileMenu())}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl font-semibold text-base text-[#222222] hover:bg-[#1B5E3B]/10 hover:text-[#1B5E3B] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FiHeart className="text-rose-500 fill-rose-500 text-lg" />
                <span>My Favourites</span>
              </div>
              {favouriteCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  {favouriteCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
      {/* RIGHT SIDE SLIDING CART DRAWER */}
      <CartDrawer />

      {/* CENTERED LOGIN / REGISTER AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />

      {/* USER PROFILE MODAL */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
