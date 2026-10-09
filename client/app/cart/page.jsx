"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import {
  getCartApi,
  updateCartItemApi,
  removeFromCartApi,
  applyCouponApi,
  removeCouponApi,
  addToCartApi,
} from "@/service/cartService";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiShoppingBag,
  FiTag,
  FiCheck,
  FiArrowLeft,
  FiAlertCircle,
  FiRotateCcw,
} from "react-icons/fi";
import { CartSkeleton } from "@/components/Skeleton";

export default function CartPage() {
  const [cartData, setCartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [removedItemUndo, setRemovedItemUndo] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const res = await getCartApi();
      if (res?.success && res?.data) {
        setCartData(res.data);
        setWarnings(res.data.warnings || []);
        if (res.data.coupon?.code) {
          setCouponInput(res.data.coupon.code);
        }
      }
    } catch (e) {
      console.error("Failed to load backend cart", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (itemId, currentQty, delta, maxStock) => {
    const targetQty = currentQty + delta;
    if (targetQty < 1 || targetQty > maxStock) return;

    try {
      setIsUpdating(true);
      const res = await updateCartItemApi(itemId, targetQty);
      if (res?.success && res?.data) {
        setCartData(res.data);
        setWarnings(res.data.warnings || []);
      }
    } catch (err) {
      alert(err.message || "Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      setIsUpdating(true);
      const res = await removeFromCartApi(item._id);
      if (res?.success && res?.data) {
        setCartData(res.data);
        setRemovedItemUndo(item);
        setTimeout(() => setRemovedItemUndo(null), 6000); // 6 sec undo window
      }
    } catch (err) {
      alert(err.message || "Failed to remove item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUndoRemove = async () => {
    if (!removedItemUndo) return;
    try {
      setIsUpdating(true);
      const res = await addToCartApi({
        productId: removedItemUndo.productId,
        colorId: removedItemUndo.color?._id || null,
        quantity: removedItemUndo.quantity,
      });
      if (res?.success && res?.data) {
        setCartData(res.data);
        setRemovedItemUndo(null);
      }
    } catch (err) {
      alert(err.message || "Failed to restore item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const cleanCode = couponInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError("Please enter a valid promo code");
      return;
    }

    try {
      setIsUpdating(true);
      const res = await applyCouponApi(cleanCode);
      if (res?.success && res?.data) {
        setCartData(res.data);
        setCouponSuccess(res.data.coupon?.message || "Promo code applied successfully!");
      }
    } catch (err) {
      setCouponError(err.message || "Invalid promo code");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      setIsUpdating(true);
      const res = await removeCouponApi();
      if (res?.success && res?.data) {
        setCartData(res.data);
        setCouponInput("");
        setCouponSuccess("");
        setCouponError("");
      }
    } catch (err) {
      alert(err.message || "Failed to remove coupon");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] py-12 px-4 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-stone-200 rounded-md w-48 animate-pulse" />
        <CartSkeleton />
      </div>
    );
  }

  const items = cartData?.items || [];
  const summary = cartData?.summary || {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    isFreeShipping: false,
    minForFreeShippingRemaining: 0,
  };
  const coupon = cartData?.coupon || { code: "", applied: false };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-20">
      {/* HEADER BREADCRUMB */}
      <div className="bg-[#EFECE6] border-b border-[#C5A059]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/sarees" className="hover:text-[#1B5E3B] transition-colors">
              Sarees
            </Link>
            <span>/</span>
            <span className="text-[#1B5E3B] font-semibold">Shopping Bag</span>
          </div>

          <Link
            href="/sarees"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* PAGE TITLE */}
        <div className="flex items-baseline justify-between mb-8 border-b border-stone-200 pb-4">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Review your handcrafted saree selections calculated directly by our server.
            </p>
          </div>
        </div>

        {/* NOTIFICATIONS & WARNINGS */}
        {warnings.length > 0 && (
          <div className="mb-6 space-y-2">
            {warnings.map((warn, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5 shadow-2xs"
              >
                <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{warn.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* UNDO ITEM REMOVAL TOAST */}
        {removedItemUndo && (
          <div className="mb-6 p-4 rounded-2xl bg-stone-900 text-white text-xs flex items-center justify-between shadow-md">
            <span>
              Removed <strong>{removedItemUndo.name}</strong> from your bag.
            </span>
            <button
              onClick={handleUndoRemove}
              className="flex items-center gap-1.5 text-amber-400 font-bold hover:underline ml-4"
            >
              <FiRotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          </div>
        )}

        {items.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-stone-200 text-center max-w-2xl mx-auto my-12 shadow-xs space-y-6">
            <div className="w-20 h-20 bg-[#1B5E3B]/10 rounded-full flex items-center justify-center mx-auto text-[#1B5E3B]">
              <FiShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl text-[#222222]">
                Your Shopping Bag is Empty
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
                Discover our exquisite collection of handwoven Kanjeevaram, Organza, Banarasi, and Chanderi sarees.
              </p>
            </div>
            <Link
              href="/sarees"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#14462B] transition-all shadow-md hover:shadow-lg"
            >
              <span>Explore Saree Collection</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* MAIN CART SPLIT LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: PRODUCT ITEMS LIST (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
                {items.map((item) => (
                  <div
                    key={item._id || item.productId}
                    className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6 hover:bg-[#FDFBF7] transition-colors"
                  >
                    {/* PRODUCT IMAGE */}
                    <Link
                      href={`/product/${item.productId}`}
                      className="relative w-20 h-24 sm:w-28 sm:h-34 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 group block"
                    >
                      <CustomImage
                        srcAttr={item.thumbnail}
                        altAttr={item.name}
                        fill={true}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* PRODUCT DETAILS & CONTROLS */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block">
                        {item.fabric || "Handloom Silk"}
                      </span>

                      {/* TITLE & PRICE ROW */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-serif font-bold text-sm sm:text-base text-[#222222] hover:text-[#1B5E3B] transition-colors leading-snug max-w-md"
                        >
                          {item.name}
                        </Link>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-2 shrink-0">
                          <span className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B]">
                            ₹{item.lineTotal.toLocaleString("en-IN")}
                          </span>
                          {item.discountedPrice > 0 && item.price > item.discountedPrice && (
                            <span className="text-xs text-zinc-400 line-through">
                              ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Variant Indicator */}
                      {item.color?.name && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                            style={{ backgroundColor: item.color.hexCode || "#1B5E3B" }}
                          />
                          <span className="text-xs text-zinc-500 font-medium truncate">
                            {item.color.name}
                          </span>
                        </div>
                      )}

                      {/* Stock Status Notice */}
                      {item.stock <= 5 && (
                        <p className="text-[10px] text-amber-700 font-semibold">
                          Only {item.stock} left in stock - order soon!
                        </p>
                      )}

                      {/* QUANTITY CONTROLLER & DELETE ICON */}
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, -1, item.stock)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs text-zinc-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity, 1, item.stock)}
                            disabled={item.quantity >= item.stock || isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isUpdating}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove Item"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: SERVER CALCULATED SUMMARY (4 COLS) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
                <h2 className="font-serif font-bold text-lg text-[#1B5E3B] border-b border-stone-100 pb-3">
                  Order Summary
                </h2>

                {/* FREE SHIPPING PROGRESS BANNER */}
                {summary.minForFreeShippingRemaining > 0 ? (
                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
                    Add ₹{summary.minForFreeShippingRemaining.toLocaleString("en-IN")} more for <strong className="text-[#1B5E3B]">FREE Shipping!</strong>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold flex items-center justify-center gap-1.5">
                    <FiCheck className="w-4 h-4 text-emerald-600" />
                    <span>You've unlocked FREE Shipping!</span>
                  </div>
                )}

                {/* PROMO / COUPON CODE SECTION */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Have a Promo Code?
                  </label>
                  {!coupon.applied ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag className="absolute left-3 top-3 text-zinc-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. ANJALI10"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-stone-300 text-zinc-800 focus:outline-none focus:border-[#1B5E3B] uppercase tracking-wider font-semibold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-4 py-2 bg-[#222222] text-white font-bold text-xs rounded-xl hover:bg-[#1B5E3B] disabled:opacity-50 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FiCheck className="w-4 h-4 text-emerald-600" />
                        <span>Code Applied: {coupon.code} (-₹{summary.discount.toLocaleString("en-IN")})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        disabled={isUpdating}
                        className="text-[10px] text-rose-600 underline font-semibold hover:text-rose-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-rose-600 font-medium pt-0.5">
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-[11px] text-emerald-600 font-semibold pt-0.5">
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* PRICE BREAKDOWN TABLE FROM BACKEND */}
                <div className="space-y-3 text-xs border-t border-b border-stone-100 py-4">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Bag Subtotal ({items.length} {items.length === 1 ? "item" : "items"})</span>
                    <span className="font-semibold text-zinc-800">
                      ₹{summary.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {summary.discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Promo Coupon Discount</span>
                      <span className="font-semibold">
                        -₹{summary.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Delivery Charge</span>
                    {summary.shipping === 0 ? (
                      <span className="font-bold text-[#1B5E3B] uppercase text-[10px]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-800">
                        ₹{summary.shipping}
                      </span>
                    )}
                  </div>
                </div>

                {/* TOTAL AMOUNT ROW */}
                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif font-bold text-base text-[#222222]">
                      Total Payable
                    </span>
                    <div className="text-right">
                      <span className="font-serif font-bold text-2xl text-[#1B5E3B]">
                        ₹{summary.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-right">
                    Calculated by single server source of truth
                  </p>
                </div>

                {/* CHECKOUT BUTTON */}
                <Link
                  href="/order"
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#14462B] transition-all shadow-md hover:shadow-lg"
                >
                  <span>Proceed to Checkout</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
