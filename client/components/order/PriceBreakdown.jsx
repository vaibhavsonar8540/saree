"use client";

import React from "react";

/**
 * PriceBreakdown Component
 * Formats subtotal, discount, delivery fee, and grand total with Indian currency formatting.
 */
export default function PriceBreakdown({
  subtotal = 0,
  discount = 0,
  discountPercent = 0,
  deliveryCharge = 0,
  totalAmount = 0,
}) {
  const formattedSubtotal = `₹${(subtotal || 0).toLocaleString("en-IN")}`;
  const formattedDiscount = `₹${(discount || 0).toLocaleString("en-IN")}`;
  const formattedDelivery = deliveryCharge === 0 ? "FREE" : `₹${(deliveryCharge || 0).toLocaleString("en-IN")}`;
  const formattedTotal = `₹${(totalAmount || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-3.5 pt-2">
      {/* Subtotal */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-600 font-medium">
        <span>Subtotal</span>
        <span className="font-semibold text-zinc-900">{formattedSubtotal}</span>
      </div>

      {/* Discount (Shown only when applied) */}
      {discount > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-700 font-medium">
          <span>Promo Coupon ({discountPercent}% OFF)</span>
          <span className="font-semibold">- {formattedDiscount}</span>
        </div>
      )}

      {/* Delivery Charge */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-600 font-medium">
        <span>Delivery Charge</span>
        {deliveryCharge === 0 ? (
          <span className="font-bold text-[#1B5E3B] text-xs tracking-wider uppercase">
            FREE
          </span>
        ) : (
          <span className="font-semibold text-zinc-900">{formattedDelivery}</span>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-stone-200 pt-3" />

      {/* Total Amount */}
      <div className="flex items-baseline justify-between">
        <span className="font-serif font-bold text-base sm:text-lg text-[#222222]">
          Total Amount
        </span>
        <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
          {formattedTotal}
        </span>
      </div>
    </div>
  );
}
