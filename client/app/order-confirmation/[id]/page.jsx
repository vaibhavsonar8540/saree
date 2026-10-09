"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import { getOrderByIdApi } from "@/service/orderService";
import { getPaymentStatusApi } from "@/service/paymentService";
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMapPin,
  FiShoppingBag,
  FiTruck,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

export default function OrderConfirmationPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getOrderByIdApi(orderId);
      if (res?.success && res?.data) {
        setOrder(res.data);
      } else {
        setError("Order details could not be found.");
      }
    } catch (err) {
      console.error("Error loading order confirmation:", err);
      setError(err.message || "Failed to load order confirmation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  // Polling fallback if order payment status is pending
  useEffect(() => {
    if (!order) return;
    const isPaid = order.paymentDetails?.paymentStatus === "paid";
    const isPending = order.orderStatus === "pending" || order.paymentDetails?.paymentStatus === "unpaid";

    if (isPending && !isPaid) {
      setIsPolling(true);
      const interval = setInterval(async () => {
        try {
          const statusRes = await getPaymentStatusApi(orderId);
          if (statusRes?.success && statusRes?.data?.isPaid) {
            clearInterval(interval);
            setIsPolling(false);
            fetchOrderDetails();
          }
        } catch (e) {
          console.warn("Polling payment status warning:", e);
        }
      }, 3000);

      // Timeout polling after 30s
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setIsPolling(false);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Fetching your order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-4">
          <FiXCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-zinc-900">Order Not Found</h2>
          <p className="text-xs text-zinc-500">{error || "Unable to retrieve order information."}</p>
          <Link
            href="/sarees"
            className="inline-block px-6 py-3 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#14462B]"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const { orderNumber, shippingAddress, items = [], orderSummary = {}, paymentDetails = {}, orderStatus } = order;
  const isPaid = paymentDetails.paymentStatus === "paid";
  const isFailed = paymentDetails.paymentStatus === "failed";

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#222222] font-sans pt-8 pb-24 px-4 sm:px-6 lg:px-8">
      {/* TEST MODE BANNER */}
      <div className="max-w-3xl mx-auto mb-6 bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span><strong>RAZORPAY TEST MODE:</strong> No real bank charges applied.</span>
        </div>
        <span className="font-mono text-[10px] bg-amber-200/60 px-2 py-0.5 rounded font-bold uppercase">Test Environment</span>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-[28px] p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
        
        {/* STATUS BANNER */}
        <div className="text-center space-y-3 border-b border-stone-100 pb-8">
          {isPaid ? (
            <div className="w-20 h-20 bg-emerald-100 text-[#1B5E3B] rounded-full flex items-center justify-center mx-auto shadow-2xs">
              <FiCheckCircle className="w-10 h-10" />
            </div>
          ) : isFailed ? (
            <div className="w-20 h-20 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
              <FiXCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
              <FiClock className="w-10 h-10 animate-pulse" />
            </div>
          )}

          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              {isPaid
                ? "Order Confirmed!"
                : isFailed
                ? "Payment Failed"
                : "Confirming Payment..."}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {isPaid
                ? "Thank you for shopping with Anjali Creation. Your handcrafted saree order is being processed."
                : isFailed
                ? "Your payment was not completed. You can retry payment below."
                : "We are verifying your payment details with Razorpay..."}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#FDFBF7] px-4 py-2 rounded-xl border border-[#C5A059]/40 mt-2">
            <span className="text-xs text-zinc-500 font-medium">Order Reference: </span>
            <span className="text-xs font-bold font-mono text-zinc-900">{orderNumber}</span>
          </div>

          {isPolling && (
            <div className="flex items-center justify-center gap-2 text-xs text-amber-700 pt-2">
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Polling backend payment status...</span>
            </div>
          )}
        </div>

        {/* ORDER ITEMS LIST */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-base text-zinc-900 flex items-center gap-2">
            <FiShoppingBag className="text-[#1B5E3B]" />
            <span>Ordered Items ({items.length})</span>
          </h3>
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
            {items.map((item, idx) => {
              const quantity = item.quantity || 1;
              const effectiveTotal = item.itemSubtotal || ((item.price || 0) * quantity);
              const originalUnitPrice = item.originalPrice || item.price;
              const originalTotal = originalUnitPrice * quantity;
              const hasDiscount = originalUnitPrice > item.price;

              return (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-stone-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-14 h-16 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                      <CustomImage srcAttr={item.image} altAttr={item.name} fill={true} className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-xs sm:text-sm text-zinc-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-zinc-500">Qty: {quantity} {item.colorName ? `| ${item.colorName}` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5 shrink-0">
                    <span className="font-serif font-bold text-xs sm:text-sm text-[#1B5E3B]">
                      ₹{effectiveTotal.toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-zinc-400 line-through font-normal">
                        ₹{originalTotal.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          {/* Shipping Address */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-zinc-900 flex items-center gap-1.5">
              <FiMapPin className="text-[#1B5E3B]" />
              <span>Shipping Address</span>
            </h4>
            <p className="font-semibold text-zinc-800">{shippingAddress?.fullName}</p>
            <p className="text-zinc-600 leading-relaxed">
              {shippingAddress?.addressLine}, {shippingAddress?.roadArea ? shippingAddress?.roadArea + ', ' : ''}
              {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}
            </p>
            <p className="text-zinc-500 pt-1 border-t border-stone-200">
              Phone: {shippingAddress?.phone} | {shippingAddress?.email}
            </p>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <h4 className="font-serif font-bold text-sm text-zinc-900 flex items-center gap-1.5">
              <FiShield className="text-[#1B5E3B]" />
              <span>Payment Breakdown</span>
            </h4>
            <div className="space-y-1.5 pt-1 text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-zinc-800">₹{(orderSummary.subtotal || 0).toLocaleString("en-IN")}</span>
              </div>
              {orderSummary.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount:</span>
                  <span>-₹{orderSummary.discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-medium text-zinc-800">{orderSummary.deliveryCharge === 0 ? "FREE" : `₹${orderSummary.deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-stone-200">
                <span>Total Amount:</span>
                <span className="font-serif text-[#1B5E3B] text-base">₹{(orderSummary.totalAmount || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span>Payment Method:</span>
                <span className="font-bold text-zinc-800">{paymentDetails.paymentMethod || 'Razorpay'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
          {!isPaid && (
            <button
              type="button"
              onClick={() => router.push(`/payment?orderId=${order._id}`)}
              className="flex-1 py-3.5 bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-colors cursor-pointer text-center"
            >
              Retry Payment Now
            </button>
          )}

          <Link
            href="/sarees"
            className="flex-1 py-3.5 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#14462B] transition-colors text-center"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="flex-1 py-3.5 bg-stone-100 text-zinc-800 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-200 transition-colors border border-stone-200 text-center"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}
