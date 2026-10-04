"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import { fetchProductById } from "@/service/productService";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiShoppingBag,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiTag,
  FiCheck,
  FiHeart,
  FiArrowLeft,
} from "react-icons/fi";

import { CartSkeleton } from "@/components/Skeleton";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const loadCartAndHydrate = async () => {
      try {
        const savedCart = localStorage.getItem("anjali_cart");
        let rawCart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(rawCart)) {
          rawCart = [];
        }

        // Hydrate with latest backend product info if available
        const hydratedCart = await Promise.all(
          rawCart.map(async (item) => {
            if (item.productId && typeof item.productId === "string" && item.productId.length === 24) {
              const freshProduct = await fetchProductById(item.productId);
              if (freshProduct) {
                const firstColorMedia = freshProduct.colorMedia?.[0];
                const colorObj = firstColorMedia?.colorId;
                return {
                  ...item,
                  name: freshProduct.name || freshProduct.title || item.name,
                  fabric: freshProduct.fabric || item.fabric,
                  price: freshProduct.discountedPrice > 0 ? freshProduct.discountedPrice : (freshProduct.price || item.price),
                  originalPrice: freshProduct.price || item.originalPrice,
                  image: freshProduct.thumbnail || firstColorMedia?.thumbnail || item.image,
                  colorName: typeof colorObj === "object" ? colorObj.name : item.colorName,
                  colorHex: typeof colorObj === "object" ? colorObj.hexCode : item.colorHex,
                };
              }
            }
            return item;
          })
        );

        setCartItems(hydratedCart);
      } catch (e) {
        setCartItems([]);
      }
      setIsLoaded(true);
    };

    loadCartAndHydrate();
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem("anjali_cart", JSON.stringify(items));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  };

  const handleUpdateQuantity = (id, delta) => {
    const updated = cartItems.map((item) => {
      if (item._id === id) {
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCart(updated);
  };

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter((item) => item._id !== id);
    saveCart(updated);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError("Please enter a valid promo code.");
      return;
    }

    if (cleanCode === "ANJALI10" || cleanCode === "SAREE10") {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (cleanCode === "ANJALI20") {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      setCouponError("Invalid coupon code. Try ANJALI10");
      setCouponApplied(false);
      setDiscountPercent(0);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponApplied(false);
    setDiscountPercent(0);
    setCouponError("");
  };

  // Financial Calculations
  const rawSubtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );
  const rawOriginalTotal = cartItems.reduce(
    (acc, item) => acc + (item.originalPrice || item.price || 0) * item.quantity,
    0
  );

  const productSavings = Math.max(0, rawOriginalTotal - rawSubtotal);
  const couponDiscountAmount = Math.round((rawSubtotal * discountPercent) / 100);
  const discountedSubtotal = Math.max(0, rawSubtotal - couponDiscountAmount);
  const shippingFee = discountedSubtotal > 3000 || cartItems.length === 0 ? 0 : 199;
  const grandTotal = Math.max(
    0,
    discountedSubtotal + shippingFee
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] py-12 px-4 max-w-7xl mx-auto space-y-6">
        <div className="h-8 bg-stone-200 rounded-md w-48 animate-pulse" />
        <CartSkeleton />
      </div>
    );
  }

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
              Review your luxury handcrafted saree selections before checkout.
            </p>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-zinc-600 bg-white px-3.5 py-1.5 rounded-full border border-stone-200 shadow-2xs">
            {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        {cartItems.length === 0 ? (
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
                Discover our exquisite collection of handwoven Kanjeevaram, Organza, Banarasi, and Chanderi sarees crafted by master weavers.
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
            
            {/* LEFT COLUMN: PRODUCT ITEMS LIST & OPTIONS (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6 hover:bg-[#FDFBF7] transition-colors"
                  >
                    {/* PRODUCT IMAGE */}
                    <Link
                      href={`/product/${item.productId}`}
                      className="relative w-20 h-24 sm:w-28 sm:h-34 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 group block"
                    >
                      <CustomImage
                        srcAttr={item.image || item.thumbnail}
                        altAttr={item.name}
                        fill={true}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* PRODUCT DETAILS & CONTROLS */}
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* FABRIC TAG */}
                      <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider block">
                        {item.fabric || "Handloom Silk"}
                      </span>

                      {/* TITLE & PRICE ROW (Price in front of name) */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <Link
                          href={`/product/${item.productId}`}
                          className="font-serif font-bold text-sm sm:text-base text-[#222222] hover:text-[#1B5E3B] transition-colors leading-snug max-w-md"
                        >
                          {item.name}
                        </Link>

                        {/* Price in front of name */}
                        <div className="flex items-baseline gap-2 shrink-0">
                          <span className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B]">
                            ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                          </span>
                          {item.originalPrice > item.price && (
                            <span className="text-xs text-zinc-400 line-through">
                              ₹{((item.originalPrice || 0) * item.quantity).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Color Variant Indicator */}
                      {item.colorName && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                            style={{ backgroundColor: item.colorHex || "#1B5E3B" }}
                          />
                          <span className="text-xs text-zinc-500 font-medium truncate">
                            {item.colorName}
                          </span>
                        </div>
                      )}

                      {/* QUANTITY CONTROLLER BELOW TITLE/NAME & DELETE ICON IN FRONT OF IT */}
                      <div className="flex items-center gap-3 pt-2">
                        {/* Quantity Controller */}
                        <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item._id, -1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="w-3 h-3" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs text-zinc-800">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item._id, 1)}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Trash / Delete Icon in front of quantity controller */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item._id)}
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

            {/* RIGHT COLUMN: PRICE CALCULATION & CHECKOUT (4 COLS) */}
            <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-6">
                <h2 className="font-serif font-bold text-lg text-[#1B5E3B] border-b border-stone-100 pb-3">
                  Order Summary
                </h2>

                {/* PROMO / COUPON CODE SECTION */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Have a Promo Code?
                  </label>
                  {!couponApplied ? (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <FiTag className="absolute left-3 top-3 text-zinc-400 w-3.5 h-3.5" />
                        <input
                          type="text"
                          placeholder="e.g. ANJALI10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[#FDFBF7] border border-stone-300 text-zinc-800 focus:outline-none focus:border-[#1B5E3B] uppercase tracking-wider font-semibold"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#222222] text-white font-bold text-xs rounded-xl hover:bg-[#1B5E3B] transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <FiCheck className="w-4 h-4 text-emerald-600" />
                        <span>Code Applied: {couponCode.toUpperCase()} ({discountPercent}% OFF)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
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
                </div>

                {/* PRICE BREAKDOWN TABLE */}
                <div className="space-y-3 text-xs border-t border-b border-stone-100 py-4">
                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Total MRP ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})</span>
                    <span className="font-semibold text-zinc-800">
                      ₹{rawOriginalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {productSavings > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Discount on MRP</span>
                      <span className="font-semibold">
                        -₹{productSavings.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-zinc-800 font-semibold pt-1 border-t border-dashed border-stone-200">
                    <span>Bag Subtotal</span>
                    <span>₹{rawSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {couponDiscountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700">
                      <span>Promo Coupon ({discountPercent}% OFF)</span>
                      <span className="font-semibold">
                        -₹{couponDiscountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-zinc-600">
                    <span>Estimated Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-[#1B5E3B] uppercase text-[10px]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-800">
                        ₹{shippingFee}
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
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-400 text-right">
                    Inclusive of all taxes & duties
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

                <p className="text-[10px] text-center text-zinc-400 flex items-center justify-center gap-1">
                  <FiShield className="w-3.5 h-3.5 text-[#1B5E3B]" />
                  256-Bit SSL Encrypted & Safe Checkout
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
