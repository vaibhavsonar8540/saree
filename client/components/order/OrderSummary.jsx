"use client";

import React from "react";
import OrderItemCard from "./OrderItemCard";
import CouponBox from "./CouponBox";
import PriceBreakdown from "./PriceBreakdown";
import { FiShoppingBag } from "react-icons/fi";

/**
 * OrderSummary Component
 * Displays list of cart items, coupon application box, and final computed price breakdown.
 */
export default function OrderSummary({
  cartItems = [],
  couponCode = "",
  setCouponCode,
  appliedCoupon = "",
  discountPercent = 0,
  couponError = "",
  onApplyCoupon,
  onRemoveCoupon,
  subtotal = 0,
  discount = 0,
  deliveryCharge = 0,
  totalAmount = 0,
}) {
  const itemCount = cartItems.length;

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <FiShoppingBag className="w-5 h-5 text-[#1B5E3B]" />
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#222222]">
            Order Summary ({itemCount})
          </h3>
        </div>
        <span className="text-xs font-semibold text-zinc-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
          {itemCount} {itemCount === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {cartItems.map((item, index) => (
          <OrderItemCard key={item._id || item.productId || index} item={item} />
        ))}
      </div>

      {/* Promo Coupon Box */}
      <CouponBox
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedCoupon={appliedCoupon}
        discountPercent={discountPercent}
        couponError={couponError}
        onApplyCoupon={onApplyCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />

      {/* Price Breakdown */}
      <PriceBreakdown
        subtotal={subtotal}
        discount={discount}
        discountPercent={discountPercent}
        deliveryCharge={deliveryCharge}
        totalAmount={totalAmount}
      />
    </div>
  );
}
