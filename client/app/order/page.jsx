"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderSummary from "@/components/order/OrderSummary";
import ShippingForm from "@/components/order/ShippingForm";
import { createOrderApi } from "@/service/orderService";
import { getCartApi, applyCouponApi, removeCouponApi } from "@/service/cartService";
import { getCurrentUser } from "@/service/authService";
import { FiArrowLeft, FiShield, FiTruck, FiRotateCcw, FiAlertCircle } from "react-icons/fi";

export default function OrderPage() {
  const router = useRouter();
  const [cartData, setCartData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo code states
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Preserved initial shipping address
  const [initialShipping, setInitialShipping] = useState({});
  const [checkoutNotice, setCheckoutNotice] = useState("");

  // Unique Idempotency Key per checkout session
  const idempotencyKeyRef = useRef(`idempotency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const initializeOrderPage = async () => {
      try {
        // 1. Fetch server cart single source of truth
        const cartRes = await getCartApi();
        if (cartRes?.success && cartRes?.data) {
          const items = cartRes.data.items || [];
          if (items.length === 0) {
            router.replace("/cart");
            return;
          }
          setCartData(cartRes.data);
          if (cartRes.data.coupon?.code) {
            setCouponCode(cartRes.data.coupon.code);
          }
        }

        // 2. Load saved progress from sessionStorage or logged-in user profile
        let savedSessionProgress = null;
        try {
          savedSessionProgress = JSON.parse(sessionStorage.getItem("anjali_checkout_progress") || "null");
        } catch (e) {}

        let currentUser = null;
        try {
          const userRes = await getCurrentUser();
          if (userRes?.success && userRes?.user) {
            currentUser = userRes.user;
          }
        } catch (e) {}

        setInitialShipping({
          fullName: savedSessionProgress?.fullName || currentUser?.name || "",
          email: savedSessionProgress?.email || currentUser?.email || "",
          phone: savedSessionProgress?.phone || currentUser?.phone || "",
          state: savedSessionProgress?.state || "",
          city: savedSessionProgress?.city || "",
          addressLine: savedSessionProgress?.addressLine || "",
          roadArea: savedSessionProgress?.roadArea || "",
          pincode: savedSessionProgress?.pincode || "",
        });
      } catch (e) {
        console.error("Error initializing checkout page:", e);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeOrderPage();
  }, [router]);

  // Promo code Handlers
  const handleApplyCoupon = async (inputCode) => {
    setCouponError("");
    setCouponSuccess("");
    const clean = inputCode ? inputCode.trim().toUpperCase() : "";

    if (!clean) {
      setCouponError("Please enter a valid promo code");
      return;
    }

    try {
      const res = await applyCouponApi(clean);
      if (res?.success && res?.data) {
        setCartData(res.data);
        setCouponSuccess(res.data.coupon?.message || "Promo code applied!");
      }
    } catch (err) {
      setCouponError(err.message || "Invalid promo code");
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      const res = await removeCouponApi();
      if (res?.success && res?.data) {
        setCartData(res.data);
        setCouponCode("");
        setCouponError("");
        setCouponSuccess("");
      }
    } catch (err) {
      alert(err.message || "Failed to remove coupon");
    }
  };

  // Submit Order Form
  const handleSubmitOrder = async (shippingFormData) => {
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
    setCheckoutNotice("");

    // Save form progress in sessionStorage
    try {
      sessionStorage.setItem("anjali_checkout_progress", JSON.stringify(shippingFormData));
    } catch (e) {}

    try {
      // 1. Prepare Order Payload (Frontend sends ONLY customer fields, address, coupon, and idempotency key - NO MONEY VALUES!)
      const orderPayload = {
        shippingAddress: shippingFormData,
        couponCode: cartData?.coupon?.code || "",
        paymentMethod: "Pending",
        idempotencyKey: idempotencyKeyRef.current,
      };

      // 2. Call backend order creation API
      const response = await createOrderApi(orderPayload);
      if (response?.success && response?.data) {
        const createdOrder = response.data;
        
        // Save order snapshot for payment page
        localStorage.setItem(
          "anjali_checkout_order",
          JSON.stringify({
            orderId: createdOrder._id,
            orderNumber: createdOrder.orderNumber,
            shippingAddress: createdOrder.shippingAddress,
            items: createdOrder.items,
            orderSummary: createdOrder.orderSummary,
            createdAt: createdOrder.createdAt,
          })
        );

        // Clear session progress
        sessionStorage.removeItem("anjali_checkout_progress");

        // Navigate to payment page
        router.push("/payment");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      const errMsg = err.message || "Failed to place order. Please verify details and try again.";
      setCheckoutNotice(errMsg);

      // If cart changed or item became unavailable, show warning
      if (err.calculation) {
        setCartData(err.calculation);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Preparing your secure checkout...</p>
      </div>
    );
  }

  const items = cartData?.items || [];
  const summary = cartData?.summary || {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
  };
  const coupon = cartData?.coupon || { code: "", applied: false };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pb-24">
      {/* HEADER BREADCRUMB */}
      <div className="bg-[#EFECE6] border-b border-[#C5A059]/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#1B5E3B] transition-colors">
              Cart
            </Link>
            <span>/</span>
            <span className="text-[#1B5E3B] font-semibold">Checkout</span>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Shopping Cart
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* PAGE TITLE */}
        <div className="mb-8 border-b border-stone-200 pb-4">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
            Order Checkout
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Provide your delivery details and review your verified handcrafted saree order.
          </p>
        </div>

        {/* ERROR / NOTICE BANNER */}
        {checkoutNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs">
            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{checkoutNotice}</span>
          </div>
        )}

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* SHIPPING ADDRESS FORM (Left card) */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <ShippingForm
              initialValues={initialShipping}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* ORDER SUMMARY (Right card) */}
          <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <OrderSummary
              cartItems={items}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={coupon.code}
              discountPercent={coupon.discountValue || 0}
              couponError={couponError}
              couponSuccess={couponSuccess}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              subtotal={summary.subtotal}
              discount={summary.discount}
              deliveryCharge={summary.shipping}
              totalAmount={summary.total}
            />

            {/* TRUST BADGES & POLICIES */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-[11px] text-zinc-600 font-medium">
                <div className="flex flex-col items-center space-y-1">
                  <FiShield className="w-5 h-5 text-[#1B5E3B]" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex flex-col items-center space-y-1 border-x border-stone-200 px-1">
                  <FiTruck className="w-5 h-5 text-[#1B5E3B]" />
                  <span>Handcrafted Quality</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <FiRotateCcw className="w-5 h-5 text-[#1B5E3B]" />
                  <span>Easy Returns</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-zinc-400 space-x-3">
                <Link href="/about" className="hover:underline">Terms & Conditions</Link>
                <span>&bull;</span>
                <Link href="/about" className="hover:underline">Privacy Policy</Link>
                <span>&bull;</span>
                <Link href="/about" className="hover:underline">Refund Policy</Link>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
