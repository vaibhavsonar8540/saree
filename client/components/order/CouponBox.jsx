"use client";

import React, { useState } from "react";
import { FiTag, FiCheck, FiX } from "react-icons/fi";

/**
 * CouponBox Component
 * Prompts user for a discount promo code, validates code, shows feedback, and supports removal.
 */
export default function CouponBox({
  couponCode,
  setCouponCode,
  appliedCoupon,
  discountPercent,
  onApplyCoupon,
  onRemoveCoupon,
  couponError,
}) {
  const [localInput, setLocalInput] = useState(couponCode || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyCoupon(localInput);
  };

  const handleRemove = () => {
    setLocalInput("");
    onRemoveCoupon();
  };

  return (
    <div className="bg-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#C5A059]/30 space-y-3">
      <div className="flex items-center gap-2">
        <FiTag className="text-[#C5A059] w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
          Have a promo coupon code?
        </span>
      </div>

      {!appliedCoupon ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ENTER COUPON"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-stone-300 text-zinc-800 focus:outline-none focus:border-[#1B5E3B] uppercase tracking-wider font-semibold placeholder:normal-case placeholder:font-normal"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          >
            Apply
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-bold">
            <FiCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Coupon &quot;{appliedCoupon.toUpperCase()}&quot; Applied ({discountPercent}% OFF)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[11px] text-rose-600 hover:text-rose-800 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <FiX className="w-3 h-3" />
            Remove
          </button>
        </div>
      )}

      {couponError && (
        <p className="text-xs text-rose-600 font-medium pt-0.5">
          {couponError}
        </p>
      )}
    </div>
  );
}
