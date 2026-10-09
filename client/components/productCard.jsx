"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { openCartDrawer } from "@/redux/slice/headerSlice";
import { isInWishlist, toggleWishlist } from "@/utils/wishlist";
import CustomImage from "./customImage";
import { Button } from "./Buttons";
import { FiHeart, FiShoppingCart, FiStar, FiEye } from "react-icons/fi";
import { getProductImageAltTitle } from "@/app/imgAltTitle";

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

  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      try {
        const { addToCartApi } = await import("@/service/cartService");
        await addToCartApi({
          productId: _id,
          colorId: (colors && colors[0] && colors[0]._id) || null,
          quantity: 1,
        });
      } catch (err) {
        console.error("Cart save error", err);
      }
    }
    dispatch(openCartDrawer());
  };

  const imgMeta = getProductImageAltTitle(productTitle, catName);

  return (
    <div
      className={`group relative flex flex-col rounded-xl sm:rounded-2xl bg-white border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#C5A059]/40 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE CONTAINER WITH COMPACT ASPECT RATIO */}
      <div className="relative w-full aspect-square sm:aspect-3/4 bg-stone-100 overflow-hidden shrink-0">
        <Link href={`/product/${_id}`} className="block w-full h-full relative">
          <CustomImage
            srcAttr={displayImage}
            altAttr={imgMeta.alt}
            titleAttr={imgMeta.title}
            fill={true}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Sleek Compact Badges Overlay */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 flex flex-col items-start gap-1 pointer-events-none">
          {calcDiscount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#1B5E3B] text-white text-[8px] sm:text-[9px] font-extrabold tracking-wider uppercase shadow-2xs">
              {calcDiscount}% OFF
            </span>
          )}
          {fabric && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#C5A059] text-zinc-900 text-[8px] sm:text-[9px] font-extrabold tracking-wide uppercase shadow-2xs">
              {fabric}
            </span>
          )}
        </div>

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={handleWishlistClick}
            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
              isWishlisted
                ? "bg-[#9C2766] text-white"
                : "bg-white/90 text-zinc-700 hover:bg-[#1B5E3B] hover:text-white"
            }`}
            aria-label="Wishlist"
          >
            <FiHeart className={`text-[10px] sm:text-xs ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          <Link
            href={`/product/${_id}`}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/90 text-zinc-700 hover:bg-[#1B5E3B] hover:text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 shadow-xs"
            aria-label="Quick View"
          >
            <FiEye className="text-[10px] sm:text-xs" />
          </Link>
        </div>
      </div>

      {/* DETAILS CONTAINER */}
      <div className="w-full p-2.5 sm:p-3 flex flex-col justify-between bg-white flex-1 space-y-1.5 sm:space-y-2">
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

          {/* Product Title (1 line) */}
          <Link href={`/product/${_id}`}>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-[#222222] hover:text-[#1B5E3B] line-clamp-1 leading-tight transition-colors">
              {productTitle}
            </h3>
          </Link>

          {/* Short Description (Clamped to 1 line) */}
          {description && (
            <p className="text-[11px] sm:text-xs text-zinc-500 line-clamp-1 leading-snug mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Bottom Bar: Price & Add To Cart Button */}
        <div className="border-t border-stone-100 flex flex-col gap-1.5 mt-auto">
          {/* Price and Discounted/Compare Price in Flex */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif font-bold text-sm sm:text-base text-[#1B5E3B]">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
            {comparePrice > finalPrice && (
              <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
                ₹{comparePrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Full Width Add To Cart Button Below Price */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleCartClick}
            icon={FiShoppingCart}
            className="w-full rounded-lg sm:rounded-xl px-2.5 py-2 text-[10px] sm:text-[11px] font-bold bg-[#1B5E3B] hover:bg-[#15472c] justify-center"
          >
            Add To Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
