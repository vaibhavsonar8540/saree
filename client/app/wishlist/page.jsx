"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import { useDispatch } from "react-redux";
import { openCartDrawer } from "@/redux/slice/headerSlice";
import { fetchProductById } from "@/service/productService";
import { getWishlist, removeFromWishlist, clearWishlist } from "@/utils/wishlist";
import {
  FiHeart,
  FiTrash2,
  FiShoppingCart,
  FiArrowRight,
  FiStar,
  FiArrowLeft,
  FiCheck,
  FiShoppingBag,
} from "react-icons/fi";

import { ProductGridSkeleton } from "@/components/Skeleton";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const loadWishlistItems = async () => {
    try {
      const rawList = getWishlist();

      // Hydrate items with fresh backend data if valid product ID exists
      const hydrated = await Promise.all(
        rawList.map(async (item) => {
          const prodId = item.productId || item._id;
          if (typeof prodId === "string" && prodId.length === 24) {
            const freshProduct = await fetchProductById(prodId);
            if (freshProduct) {
              const firstColorMedia = freshProduct.colorMedia?.[0];
              return {
                ...item,
                _id: item._id || freshProduct._id,
                productId: freshProduct._id,
                name: freshProduct.name || freshProduct.title || item.name,
                title: freshProduct.name || freshProduct.title || item.title,
                fabric: freshProduct.fabric || item.fabric,
                price: freshProduct.discountedPrice > 0 ? freshProduct.discountedPrice : (freshProduct.price || item.price),
                originalPrice: freshProduct.price || item.originalPrice,
                image: freshProduct.thumbnail || firstColorMedia?.thumbnail || item.image,
                thumbnail: freshProduct.thumbnail || item.thumbnail,
                category: freshProduct.category || item.category,
                inStock: freshProduct.stock !== undefined ? freshProduct.stock > 0 : true,
              };
            }
          }
          return item;
        })
      );

      setItems(hydrated);
    } catch (e) {
      setItems(getWishlist());
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadWishlistItems();

    if (typeof window !== "undefined") {
      window.addEventListener("wishlistUpdated", loadWishlistItems);
      window.addEventListener("storage", loadWishlistItems);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("wishlistUpdated", loadWishlistItems);
        window.removeEventListener("storage", loadWishlistItems);
      }
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
    setItems((prev) => prev.filter((item) => item._id !== id && item.productId !== id));
    showToast("Removed item from your Favourites.");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all items from your Favourites?")) {
      clearWishlist();
      setItems([]);
      showToast("Cleared all items from your Favourites.");
    }
  };

  const handleAddToCart = (item) => {
    try {
      const existing = JSON.parse(localStorage.getItem("anjali_cart") || "[]");
      const prodId = item.productId || item._id;
      const foundIdx = existing.findIndex((i) => i.productId === prodId || i._id === prodId);

      if (foundIdx > -1) {
        showToast(`"${item.name || item.title}" is already in your Cart!`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("showCartNotice", {
              detail: { message: `"${item.name || item.title}" is already added to your cart!` },
            })
          );
        }
      } else {
        const newItem = {
          _id: `cart-${Date.now()}`,
          productId: prodId,
          name: item.name || item.title || "Handcrafted Saree",
          fabric: item.fabric || "Pure Silk",
          price: item.price || 1999,
          originalPrice: item.originalPrice || item.price || 2499,
          quantity: 1,
          image: item.image || item.thumbnail || "/assets/images/heroBanner.png",
          inStock: true,
        };
        existing.unshift(newItem);
        localStorage.setItem("anjali_cart", JSON.stringify(existing));
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cartUpdated"));
        }
        showToast(`Added "${newItem.name}" to your Cart!`);
      }
      dispatch(openCartDrawer());
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  };

  const handleMoveAllToCart = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("anjali_cart") || "[]");

      items.forEach((item) => {
        const prodId = item.productId || item._id;
        const foundIdx = existing.findIndex((i) => i.productId === prodId);
        if (foundIdx > -1) {
          existing[foundIdx].quantity += 1;
        } else {
          existing.unshift({
            _id: `cart-${Date.now()}-${Math.random()}`,
            productId: prodId,
            name: item.name || item.title || "Handcrafted Saree",
            fabric: item.fabric || "Pure Silk",
            price: item.price || 1999,
            originalPrice: item.originalPrice || item.price || 2499,
            quantity: 1,
            image: item.image || item.thumbnail || "/assets/images/heroBanner.png",
            inStock: true,
          });
        }
      });

      localStorage.setItem("anjali_cart", JSON.stringify(existing));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }
      dispatch(openCartDrawer());
      showToast("Moved all favourite items to your Shopping Cart!");
    } catch (e) {
      console.error("Failed to move all to cart", e);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] py-12 px-4 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-stone-200 rounded-md w-48 animate-pulse" />
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1B5E3B] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#C5A059]/40 animate-slideDown">
          <FiCheck className="w-5 h-5 text-[#C5A059]" />
          <span className="font-medium text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="bg-[#EFECE6] border-b border-[#C5A059]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#1B5E3B] font-semibold">My Favourites</span>
          </div>

          <Link
            href="/sarees"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Explore Saree Catalog
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* PAGE TITLE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-stone-200/90 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiHeart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#C5A059]">
                Saved Drapes
              </span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-[#1B5E3B]">
              My Favourites
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Keep track of your favorite handcrafted drapes and move them to your bag anytime.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleClearAll}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-zinc-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <FiTrash2 className="w-3.5 h-3.5" />
                Clear All
              </button>

              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="px-5 py-2.5 rounded-xl bg-[#1B5E3B] text-white hover:bg-[#14462B] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
              >
                <FiShoppingCart className="w-4 h-4" />
                Add All To Cart
              </button>
            </div>
          )}
        </div>

        {/* MAIN FAVOURITES CONTENT */}
        {items.length === 0 ? (
          /* EMPTY FAVOURITES STATE */
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-stone-200 text-center max-w-xl mx-auto my-12 shadow-xs space-y-5">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner border border-rose-100">
              <FiHeart className="w-9 h-9 fill-rose-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl text-[#222222]">
                Your Favourites List is Empty
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Save your favorite handwoven Kanjeevaram, Organza, and Banarasi sarees by tapping the heart icon on any product.
              </p>
            </div>
            <Link
              href="/sarees"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#14462B] transition-all shadow-md"
            >
              <span>Discover Sarees</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* FAVOURITES GRID */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {items.map((item) => {
              const prodId = item.productId || item._id;
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const discountPercent = hasDiscount
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : 0;

              return (
                <div
                  key={item._id}
                  className="group relative bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C5A059]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* PRODUCT IMAGE & BADGES */}
                  <div className="relative w-full aspect-[4/5] sm:aspect-3/4 bg-stone-100 overflow-hidden shrink-0">
                    <Link href={`/product/${prodId}`} className="block w-full h-full">
                      <CustomImage
                        srcAttr={item.image || item.thumbnail}
                        altAttr={item.name || item.title}
                        fill={true}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Discount & Fabric Badges */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none">
                      {discountPercent > 0 && (
                        <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#1B5E3B] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
                          {discountPercent}% OFF
                        </span>
                      )}
                      {item.fabric && (
                        <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#C5A059] text-zinc-900 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase shadow-xs">
                          {item.fabric}
                        </span>
                      )}
                    </div>

                    {/* Delete / Remove Favourite Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item._id)}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-300 shadow-md"
                      title="Remove from Favourites"
                      aria-label="Remove from Favourites"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="p-2.5 sm:p-4 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#C5A059] font-bold tracking-wider uppercase text-[9px] sm:text-[10px]">
                          {item.category || "Saree"}
                        </span>
                      </div>

                      <Link href={`/product/${prodId}`}>
                        <h3 className="font-serif font-bold text-xs sm:text-sm text-[#222222] hover:text-[#1B5E3B] line-clamp-2 leading-snug transition-colors">
                          {item.name || item.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="space-y-2 sm:space-y-3 pt-2 border-t border-stone-100 mt-auto">
                      {/* Price Row */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif font-bold text-sm sm:text-base text-[#1B5E3B]">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                            ₹{item.originalPrice?.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart CTA */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="w-full py-2 sm:py-3 bg-[#1B5E3B] hover:bg-[#14462B] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Add To Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
