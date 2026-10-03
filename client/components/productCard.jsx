"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { openCartDrawer } from "@/redux/slice/headerSlice";
import { isInWishlist, toggleWishlist } from "@/utils/wishlist";
import CustomImage from "./customImage";
import { Button } from "./Buttons";
import { FiHeart, FiShoppingCart, FiStar, FiEye } from "react-icons/fi";

const ProductCard = ({
  product = {},
  onAddToCart,
  onAddToWishlist,
  className = "",
}) => {
  const dispatch = useDispatch();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const {
    _id,
    name,
    title,
    description = "",
    price: rawPrice = 0,
    discountedPrice,
    originalPrice: rawOriginalPrice,
    discount: rawDiscount,
    rating = 0,
    reviewsCount = 0,
    images = [],
    image,
    thumbnail,
    category,
    categoryName,
    fabric,
    colorMedia = [],
    colors = [],
    stock,
    inStock = true,
  } = product;

  useEffect(() => {
    const checkWishlist = () => {
      setIsWishlisted(isInWishlist(_id));
    };
    checkWishlist();

    if (typeof window !== "undefined") {
      window.addEventListener("wishlistUpdated", checkWishlist);
      window.addEventListener("storage", checkWishlist);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("wishlistUpdated", checkWishlist);
        window.removeEventListener("storage", checkWishlist);
      }
    };
  }, [_id]);

  const productTitle = name || title || "Kanjeevaram Pure Silk Handloom Saree";
  const catName = category || categoryName || "Silk Sarees";
  const finalPrice = discountedPrice > 0 ? discountedPrice : rawPrice;
  const comparePrice = rawPrice > finalPrice ? rawPrice : rawOriginalPrice || 0;
  
  const calcDiscount =
    rawDiscount ||
    (comparePrice > finalPrice && comparePrice > 0
      ? Math.round(((comparePrice - finalPrice) / comparePrice) * 100)
      : 0);

  const displayImage = thumbnail || image || (images && images[0]) || (colorMedia && colorMedia[0]?.thumbnail) || "/assets/images/heroBanner.png";

  // Extract and format available colors for display
  const availableColors = React.useMemo(() => {
    let list = [];
    if (Array.isArray(colors) && colors.length > 0) {
      list = colors
        .map((c) => {
          if (typeof c === "string") return { hexCode: c, name: "" };
          if (typeof c === "object" && c !== null)
            return {
              hexCode: c.hexCode || c.hex || c.code || "#cccccc",
              name: c.name || c.colorName || "",
            };
          return null;
        })
        .filter(Boolean);
    }
    if (list.length === 0 && Array.isArray(colorMedia) && colorMedia.length > 0) {
      list = colorMedia
        .map((cm) => {
          const hex = cm.colorId?.hexCode || cm.hexCode || cm.color?.hexCode || cm.hex;
          const colorName = cm.colorId?.name || cm.name || cm.colorName || "";
          return hex ? { hexCode: hex, name: colorName } : null;
        })
        .filter(Boolean);
    }
    return list;
  }, [colors, colorMedia]);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowStatus = toggleWishlist(product);
    setIsWishlisted(nowStatus);
    if (onAddToWishlist) onAddToWishlist(product, nowStatus);
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem("anjali_cart") || "[]");
        const prodId = _id;
        const foundIdx = existing.findIndex((item) => item.productId === prodId || item._id === prodId);

        if (foundIdx > -1) {
          // Already in cart: don't add, show message
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("showCartNotice", {
                detail: { message: `"${productTitle}" is already added to your cart!` },
              })
            );
          }
        } else {
          const newItem = {
            _id: `cart-${Date.now()}`,
            productId: prodId,
            name: productTitle,
            fabric: fabric || "Handloom Silk",
            price: finalPrice,
            originalPrice: comparePrice || finalPrice,
            quantity: 1,
            image: displayImage,
            inStock: true,
          };
          existing.unshift(newItem);
          localStorage.setItem("anjali_cart", JSON.stringify(existing));
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("cartUpdated"));
          }
        }
      } catch (e) {
        console.error("Cart save error", e);
      }
    }
    dispatch(openCartDrawer());
  };

  return (
    <div
      className={`group relative flex flex-col rounded-xl sm:rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C5A059]/40 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE CONTAINER WITH COMPACT MOBILE ASPECT RATIO */}
      <div className="relative w-full aspect-[4/5] sm:aspect-3/4 bg-stone-100 overflow-hidden shrink-0">
        <Link href={`/product/${_id}`} className="block w-full h-full relative">
          <CustomImage
            srcAttr={displayImage}
            altAttr={productTitle}
            fill={true}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none">
          {calcDiscount > 0 && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#1B5E3B] text-white text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs">
              {calcDiscount}% OFF
            </span>
          )}
          {fabric && (
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#C5A059] text-zinc-900 text-[9px] sm:text-[10px] font-bold tracking-wide uppercase shadow-xs">
              {fabric}
            </span>
          )}
        </div>

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
              isWishlisted
                ? "bg-[#9C2766] text-white"
                : "bg-white/90 text-zinc-700 hover:bg-[#1B5E3B] hover:text-white"
            }`}
            aria-label="Wishlist"
          >
            <FiHeart className={`text-xs sm:text-sm ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          <Link
            href={`/product/${_id}`}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 text-zinc-700 hover:bg-[#1B5E3B] hover:text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-md"
            aria-label="Quick View"
          >
            <FiEye className="text-xs sm:text-sm" />
          </Link>
        </div>
      </div>

      {/* DETAILS CONTAINER */}
      <div className="w-full p-2.5 sm:p-4 flex flex-col justify-between bg-white flex-1 space-y-2 sm:space-y-3">
        <div className="space-y-1">
          {/* Top Header: Category Name & Available Color Swatches */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[#C5A059] font-bold tracking-wider uppercase text-[9px] sm:text-[10px] truncate">
              {catName}
            </span>

            {/* Color Swatches */}
            {availableColors.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {availableColors.slice(0, 4).map((col, idx) => (
                  <span
                    key={idx}
                    title={col.name || "Color variant"}
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-stone-300 shadow-2xs transition-transform hover:scale-110"
                    style={{ backgroundColor: col.hexCode }}
                  />
                ))}
                {availableColors.length > 4 && (
                  <span className="text-[9px] font-bold text-zinc-400 ml-0.5">
                    +{availableColors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/product/${_id}`}>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#222222] hover:text-[#1B5E3B] line-clamp-2 leading-snug transition-colors">
              {productTitle}
            </h3>
          </Link>

          {/* Short Description (Clamped to 3 lines) */}
          {description && (
            <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-3 leading-relaxed mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Price & Add To Cart Button */}
        <div className="pt-2 sm:pt-2.5 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline justify-between sm:flex-col gap-1">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-serif font-bold text-sm sm:text-base text-[#1B5E3B]">
                ₹{finalPrice.toLocaleString("en-IN")}
              </span>
              {comparePrice > finalPrice && (
                <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                  ₹{comparePrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-[8px] sm:text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Taxes Included</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCartClick}
            icon={FiShoppingCart}
            className="w-full sm:w-auto rounded-lg sm:rounded-xl px-2.5 py-2 sm:px-3 sm:py-2 text-[10px] sm:text-[11px] font-bold bg-[#1B5E3B] hover:bg-[#15472c] shrink-0"
          >
            Add To Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
