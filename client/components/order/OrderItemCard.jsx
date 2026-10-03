"use client";

import React from "react";
import CustomImage from "@/components/customImage";

/**
 * OrderItemCard Component
 * Renders individual product thumbnail, name, color/variant, quantity, and formatted price.
 */
export default function OrderItemCard({ item }) {
  if (!item) return null;

  const price = item.price || 0;
  const quantity = item.quantity || 1;
  const itemTotal = price * quantity;
  const formattedPrice = `₹${itemTotal.toLocaleString("en-IN")}`;

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex items-center justify-between gap-3 sm:gap-4 transition-all hover:bg-stone-50">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Product Thumbnail */}
        <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden bg-white shrink-0 border border-stone-200 shadow-2xs">
          <CustomImage
            srcAttr={item.image || item.thumbnail}
            altAttr={item.name || "Product image"}
            fill={true}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="min-w-0 space-y-1">
          <h4 className="font-serif font-bold text-xs sm:text-sm text-[#222222] line-clamp-2 leading-snug">
            {item.name}
          </h4>

          {/* Color / Variant */}
          {item.colorName && (
            <div className="flex items-center gap-1.5 pt-0.5">
              {item.colorHex && (
                <span
                  className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: item.colorHex }}
                />
              )}
              <span className="text-[11px] text-zinc-500 font-medium truncate">
                {item.colorName}
              </span>
            </div>
          )}

          {/* Quantity Tag */}
          <div className="text-[11px] text-zinc-500 font-semibold pt-0.5">
            Qty: <span className="text-zinc-800 font-bold">{quantity}</span>
          </div>
        </div>
      </div>

      {/* Price at Right */}
      <div className="text-right shrink-0">
        <span className="font-serif font-bold text-sm sm:text-base text-[#1B5E3B]">
          {formattedPrice}
        </span>
      </div>
    </div>
  );
}
