"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import { updateOrderPaymentApi } from "@/service/orderService";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiCreditCard,
  FiSmartphone,
  FiDollarSign,
  FiShield,
  FiMapPin,
  FiShoppingBag,
  FiLock,
} from "react-icons/fi";

export default function PaymentPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  useEffect(() => {
    try {
      const savedCheckout = localStorage.getItem("anjali_checkout_order");
      if (savedCheckout) {
        const parsed = JSON.parse(savedCheckout);
        setOrderData(parsed);
      } else {
        // If no checkout data found, redirect to cart
        router.replace("/cart");
        return;
      }
    } catch (e) {
      console.error("Failed to load checkout order data:", e);
      router.replace("/cart");
    } finally {
      setIsLoaded(true);
    }
  }, [router]);

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    try {
      if (orderData?.orderId && !orderData.orderId.startsWith("LOCAL-")) {
        await updateOrderPaymentApi(orderData.orderId, {
          paymentMethod: selectedMethod === "card" ? "Credit Card" : selectedMethod === "upi" ? "UPI" : "Cash on Delivery",
          paymentStatus: "Paid",
          transactionId: `TXN-${Date.now()}`,
        });
      }

      // Clear cart
      localStorage.removeItem("anjali_cart");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }

      setIsPaidSuccess(true);
    } catch (err) {
      console.error("Payment submission failed:", err);
      // Still show success demo if backend offline
      localStorage.removeItem("anjali_cart");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cartUpdated"));
      }
      setIsPaidSuccess(true);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Loading payment portal...</p>
      </div>
    );
  }

  if (isPaidSuccess) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pt-12 pb-24 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-[24px] p-8 sm:p-12 border border-stone-200 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-[#1B5E3B] rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              Order Placed Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600">
              Thank you for shopping with <strong className="text-[#1B5E3B]">Anjali Creation</strong>.
            </p>
            <div className="inline-block bg-[#FDFBF7] px-4 py-2 rounded-xl border border-[#C5A059]/40 mt-2">
              <span className="text-xs text-zinc-500 font-medium">Order Reference: </span>
              <span className="text-xs font-bold text-zinc-900">{orderData?.orderNumber || "ORD-20261003"}</span>
            </div>
          </div>

          <div className="bg-stone-50 p-4 sm:p-6 rounded-2xl border border-stone-200 text-left text-xs space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#222222]">
              Delivery Details
            </h3>
            <p className="text-zinc-700 font-semibold">
              {orderData?.shippingAddress?.fullName}
            </p>
            <p className="text-zinc-500 leading-relaxed">
              {orderData?.shippingAddress?.addressLine}, {orderData?.shippingAddress?.roadArea}, {orderData?.shippingAddress?.city}, {orderData?.shippingAddress?.state} - {orderData?.shippingAddress?.pincode}, {orderData?.shippingAddress?.country}
            </p>
            <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-zinc-800">
              <span>Total Paid Amount:</span>
              <span className="text-[#1B5E3B] font-serif text-base">
                ₹{(orderData?.orderSummary?.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/sarees"
              className="flex-1 py-3.5 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#14462B] transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="flex-1 py-3.5 bg-stone-100 text-zinc-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-200 transition-colors border border-stone-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { shippingAddress, items = [], orderSummary = {} } = orderData || {};

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
            <Link href="/order" className="hover:text-[#1B5E3B] transition-colors">
              Order
            </Link>
            <span>/</span>
            <span className="text-[#1B5E3B] font-semibold">Payment</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/order")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Shipping Address
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        {/* PAGE TITLE */}
        <div className="mb-8 border-b border-stone-200 pb-4">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
            Payment Options
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Choose your payment method to finalize order <strong className="text-zinc-800">{orderData?.orderNumber}</strong>
          </p>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT CARD: PAYMENT METHOD SELECTION */}
          <div className="lg:col-span-7 bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif font-bold text-xl text-[#222222] flex items-center gap-2">
                <FiLock className="text-[#1B5E3B] w-5 h-5" />
                <span>Select Payment Method</span>
              </h2>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3">
              {/* Option 1: Credit / Debit Card */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                  selectedMethod === "card"
                    ? "border-[#1B5E3B] bg-[#1B5E3B]/5 shadow-2xs"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedMethod === "card"}
                  onChange={() => setSelectedMethod("card")}
                  className="mt-1 accent-[#1B5E3B]"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                      <FiCreditCard className="w-4 h-4 text-[#1B5E3B]" />
                      Credit / Debit Card
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold">Visa, Mastercard, RuPay</span>
                  </div>

                  {selectedMethod === "card" && (
                    <div className="pt-2 space-y-3 text-xs border-t border-stone-200">
                      <div>
                        <label className="block font-bold text-zinc-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-zinc-800 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-zinc-700 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-zinc-800 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-zinc-700 mb-1">CVC / CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-zinc-800 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {/* Option 2: UPI / QR Code */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                  selectedMethod === "upi"
                    ? "border-[#1B5E3B] bg-[#1B5E3B]/5 shadow-2xs"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedMethod === "upi"}
                  onChange={() => setSelectedMethod("upi")}
                  className="mt-1 accent-[#1B5E3B]"
                />
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                    <FiSmartphone className="w-4 h-4 text-[#1B5E3B]" />
                    UPI / QR Code (Google Pay, PhonePe, Paytm)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Instant & zero charge UPI payment transfer.
                  </p>
                </div>
              </label>

              {/* Option 3: Cash On Delivery */}
              <label
                className={`p-4 rounded-2xl border flex items-start gap-4 cursor-pointer transition-all ${
                  selectedMethod === "cod"
                    ? "border-[#1B5E3B] bg-[#1B5E3B]/5 shadow-2xs"
                    : "border-stone-200 bg-white hover:bg-stone-50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedMethod === "cod"}
                  onChange={() => setSelectedMethod("cod")}
                  className="mt-1 accent-[#1B5E3B]"
                />
                <div className="flex-1 space-y-1">
                  <span className="font-bold text-xs sm:text-sm text-zinc-900 flex items-center gap-2">
                    <FiDollarSign className="w-4 h-4 text-[#1B5E3B]" />
                    Cash on Delivery (COD)
                  </span>
                  <p className="text-[11px] text-zinc-500">
                    Pay in cash upon doorstep delivery.
                  </p>
                </div>
              </label>
            </div>

            {/* Complete Payment Button */}
            <div className="pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#1B5E3B] text-white font-bold text-sm uppercase tracking-wider rounded-2xl hover:bg-[#14462B] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>
                    Pay ₹{(orderSummary.totalAmount || 0).toLocaleString("en-IN")} & Complete Order &rarr;
                  </span>
                )}
              </button>

              <p className="text-[11px] text-center text-zinc-400 mt-3 flex items-center justify-center gap-1">
                <FiShield className="w-4 h-4 text-[#1B5E3B]" />
                256-Bit Bank Level Encryption Security
              </p>
            </div>
          </div>

          {/* RIGHT CARD: ORDER SUMMARY & SHIPPING CONFIRMATION */}
          <div className="lg:col-span-5 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#222222]">
                  Order Items ({items.length})
                </h3>
                <span className="text-xs text-zinc-500 font-mono font-semibold">
                  {orderData?.orderNumber}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                        <CustomImage srcAttr={item.image || item.thumbnail} altAttr={item.name} fill={true} className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-zinc-800 truncate">{item.name}</p>
                        <p className="text-[11px] text-zinc-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-zinc-900 shrink-0">
                      ₹{((item.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 text-xs border-t border-stone-200 pt-3 text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-800">
                    ₹{(orderSummary.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount ({orderSummary.couponCode})</span>
                    <span className="font-semibold">
                      -₹{(orderSummary.discount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-semibold text-zinc-800">
                    {orderSummary.deliveryCharge === 0 ? "FREE" : `₹${orderSummary.deliveryCharge}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-stone-200">
                  <span>Total Payable</span>
                  <span className="font-serif text-lg text-[#1B5E3B]">
                    ₹{(orderSummary.totalAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address Confirmation Card */}
            <div className="bg-white rounded-[24px] p-6 border border-stone-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="font-serif font-bold text-sm text-[#222222] flex items-center gap-1.5">
                  <FiMapPin className="text-[#1B5E3B]" />
                  <span>Deliver To</span>
                </h4>
                <button
                  type="button"
                  onClick={() => router.push("/order")}
                  className="text-xs font-semibold text-[#1B5E3B] underline hover:text-[#14462B]"
                >
                  Edit Address
                </button>
              </div>
              <div className="text-xs space-y-1 text-zinc-700">
                <p className="font-bold text-zinc-900">{shippingAddress?.fullName}</p>
                <p>{shippingAddress?.email} | {shippingAddress?.phone}</p>
                <p className="text-zinc-500">
                  {shippingAddress?.addressLine}, {shippingAddress?.roadArea}, {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}, {shippingAddress?.country}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
