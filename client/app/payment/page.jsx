"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CustomImage from "@/components/customImage";
import { getOrderByIdApi } from "@/service/orderService";
import { createPaymentOrderApi, verifyPaymentApi, getPaymentStatusApi } from "@/service/paymentService";
import { loadRazorpayScript } from "@/utils/loadRazorpay";
import {
  FiArrowLeft,
  FiShield,
  FiMapPin,
  FiLock,
  FiAlertCircle,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyingNotice, setVerifyingNotice] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Polling ref to clear timer on unmount
  const pollingTimerRef = useRef(null);

  useEffect(() => {
    // Load Razorpay Script from CDN
    loadRazorpayScript().then((loaded) => {
      setScriptLoaded(loaded);
    });

    const loadOrder = async () => {
      try {
        let orderIdToFetch = queryOrderId;

        if (!orderIdToFetch) {
          const savedCheckout = localStorage.getItem("anjali_checkout_order");
          if (savedCheckout) {
            const parsed = JSON.parse(savedCheckout);
            orderIdToFetch = parsed.orderId || parsed._id;
          }
        }

        if (!orderIdToFetch) {
          router.replace("/cart");
          return;
        }

        const res = await getOrderByIdApi(orderIdToFetch);
        if (res?.success && res?.data) {
          setOrderData(res.data);
        } else {
          router.replace("/cart");
        }
      } catch (e) {
        console.error("Failed to load order data:", e);
        setPaymentNotice(e.message || "Could not retrieve order details.");
      } finally {
        setIsLoaded(true);
      }
    };

    loadOrder();

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [queryOrderId, router]);

  // Handle Polling Fallback if signature verification fails or times out
  const startPaymentPolling = (orderId) => {
    setVerifyingNotice("Network delay detected. Polling payment confirmation status...");
    let attempts = 0;
    const maxAttempts = 10;

    pollingTimerRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const statusRes = await getPaymentStatusApi(orderId);
        if (statusRes?.success && statusRes?.data?.isPaid) {
          clearInterval(pollingTimerRef.current);
          localStorage.removeItem("anjali_checkout_order");
          if (typeof window !== "undefined") window.dispatchEvent(new Event("cartUpdated"));
          router.push(`/order-confirmation/${orderId}`);
          return;
        }
      } catch (e) {
        console.warn("Polling warning:", e.message);
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollingTimerRef.current);
        setIsProcessing(false);
        setVerifyingNotice("");
        setPaymentNotice("Payment confirmation pending. Please check 'My Orders' or refresh.");
        router.push(`/order-confirmation/${orderId}`);
      }
    }, 3000);
  };

  // Primary Razorpay Modal Handler
  const handleInitiateRazorpay = async () => {
    if (!orderData || isProcessing) return;

    if (!scriptLoaded) {
      const reloaded = await loadRazorpayScript();
      if (!reloaded) {
        setPaymentNotice("Failed to load Razorpay payment SDK. Please check your network connection and retry.");
        return;
      }
    }

    setIsProcessing(true);
    setPaymentNotice("");
    setVerifyingNotice("");

    try {
      const internalOrderId = orderData._id || orderData.orderId;

      // 1. Call backend create-order endpoint to generate razorpay_order_id securely
      const response = await createPaymentOrderApi(internalOrderId);

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Failed to initialize Razorpay checkout");
      }

      const { razorpay_order_id, key_id, amount_paise, currency, order_number, prefill } = response.data;

      // 2. Configure Razorpay Modal Options
      const options = {
        key: key_id,
        amount: amount_paise,
        currency: currency || "INR",
        name: "Anjali Creation",
        description: `Handcrafted Saree Order #${order_number}`,
        image: "https://anjali-creation.vercel.app/logo.png",
        order_id: razorpay_order_id,
        prefill: {
          name: prefill?.name || "",
          email: prefill?.email || "",
          contact: prefill?.phone || "",
        },
        theme: {
          color: "#1B5E3B",
        },
        notes: {
          store: "Anjali Creation Saree Store",
          mode: "TEST MODE ONLY",
        },

        // Success Handler
        handler: async function (razorpayResponse) {
          const { razorpay_payment_id, razorpay_signature } = razorpayResponse;
          setVerifyingNotice("Confirming your payment with server...");

          try {
            // 3. Call backend verify endpoint
            const verifyRes = await verifyPaymentApi({
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            });

            if (verifyRes?.success) {
              // Clear stored checkout snapshots
              localStorage.removeItem("anjali_checkout_order");
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("cartUpdated"));
              }
              // Redirect to thank-you / confirmation page
              router.push(`/order-confirmation/${internalOrderId}`);
            } else {
              throw new Error(verifyRes?.message || "Payment verification failed");
            }
          } catch (verifyError) {
            console.error("Signature Verification Failed:", verifyError);
            // Initiate polling fallback if network dropped
            startPaymentPolling(internalOrderId);
          }
        },

        // Dismiss Callback (User closed modal)
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setVerifyingNotice("");
            setPaymentNotice("Payment was not completed. You can click 'Proceed to Pay' to retry.");
          },
        },
      };

      // 3. Open Razorpay Modal
      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (failureResponse) {
        console.error("Razorpay Payment Failed:", failureResponse?.error);
        setIsProcessing(false);
        setVerifyingNotice("");
        const reason = failureResponse?.error?.description || failureResponse?.error?.reason || "Payment failed at gateway";
        setPaymentNotice(`Payment Failed: ${reason}. Please try again.`);
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setIsProcessing(false);
      setPaymentNotice(err.message || "Unable to open payment modal. Please try again.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Preparing Razorpay test environment...</p>
      </div>
    );
  }

  const { shippingAddress, items = [], orderSummary = {}, orderNumber } = orderData || {};

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
            <span className="text-[#1B5E3B] font-semibold">Razorpay Checkout</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/order")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1B5E3B] hover:underline cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Checkout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        
        {/* TEST MODE WARNING BANNER */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900 font-medium">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>
              <strong>RAZORPAY TEST MODE ACTIVE:</strong> Use test card credentials or UPI test ID. No actual money will be charged.
            </span>
          </div>
          <span className="bg-amber-200/80 text-amber-900 px-3 py-1 rounded-xl text-[11px] font-bold font-mono tracking-wide uppercase shrink-0">
            TEST MODE
          </span>
        </div>

        {/* PAGE TITLE */}
        <div className="mb-8 border-b border-stone-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B]">
              Razorpay Checkout
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Finalize payment for order <strong className="text-zinc-800">{orderNumber}</strong>
            </p>
          </div>
          <div className="text-xs font-mono text-zinc-500 bg-white px-3.5 py-1.5 rounded-xl border border-stone-200 w-fit">
            Status: <span className="font-bold text-amber-600 uppercase">{orderData?.paymentDetails?.paymentStatus || "unpaid"}</span>
          </div>
        </div>

        {/* NOTICES & ALERTS */}
        {paymentNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 shadow-2xs">
            <FiAlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{paymentNotice}</span>
          </div>
        )}

        {verifyingNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
            <FiRefreshCw className="w-4 h-4 text-[#1B5E3B] shrink-0 animate-spin" />
            <span>{verifyingNotice}</span>
          </div>
        )}

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT CARD: RAZORPAY GATEWAY LAUNCHER */}
          <div className="lg:col-span-7 bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h2 className="font-serif font-bold text-xl text-[#222222] flex items-center gap-2">
                <FiLock className="text-[#1B5E3B] w-5 h-5" />
                <span>Secure Online Payment</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, NetBanking & Wallets via Razorpay.
              </p>
            </div>

            {/* PAYMENT INFOGRAPHIC CARD */}
            <div className="bg-[#FDFBF7] p-5 rounded-2xl border border-[#C5A059]/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 font-medium">Order Reference</span>
                <span className="font-mono font-bold text-zinc-900">{orderNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-200/60">
                <span className="text-zinc-600 font-medium">Total Amount Payable</span>
                <span className="font-serif font-bold text-xl text-[#1B5E3B]">
                  ₹{(orderSummary.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleInitiateRazorpay}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#1B5E3B] text-white font-bold text-sm uppercase tracking-wider rounded-2xl hover:bg-[#14462B] transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{(orderSummary.totalAmount || 0).toLocaleString("en-IN")} via Razorpay</span>
                    <span>&rarr;</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <FiShield className="w-4 h-4 text-[#1B5E3B]" />
                <span>HMAC-SHA256 Encrypted & Authorized by Razorpay Payment Gateway</span>
              </div>
            </div>

            {/* TEST MODE DATA GUIDANCE */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-zinc-600 space-y-2">
              <p className="font-bold text-zinc-800 flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-600" />
                <span>Razorpay Test Credentials Guide</span>
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-zinc-500 font-mono">
                <li>Test Card: Any 16 digits (e.g. 4111 1111 1111 1111) | Expiry: Future date | CVV: 123</li>
                <li>Test UPI ID: success@razorpay (Success) / failure@razorpay (Failure)</li>
                <li>OTP for Test Card: 123456</li>
              </ul>
            </div>
          </div>

          {/* RIGHT CARD: ORDER SUMMARY & SHIPPING CONFIRMATION */}
          <div className="lg:col-span-5 space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#222222]">
                  Order Items ({items.length})
                </h3>
              </div>

              {/* Items */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0">
                        <CustomImage srcAttr={item.image} altAttr={item.name} fill={true} className="object-cover" />
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

              {/* Financial Calculation */}
              <div className="space-y-2 text-xs border-t border-stone-200 pt-3 text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-800">
                    ₹{(orderSummary.subtotal || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon Discount</span>
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

            {/* Delivery Address Card */}
            <div className="bg-white rounded-[24px] p-6 border border-stone-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="font-serif font-bold text-sm text-[#222222] flex items-center gap-1.5">
                  <FiMapPin className="text-[#1B5E3B]" />
                  <span>Delivery Address</span>
                </h4>
              </div>
              <div className="text-xs space-y-1 text-zinc-700">
                <p className="font-bold text-zinc-900">{shippingAddress?.fullName}</p>
                <p>{shippingAddress?.email} | {shippingAddress?.phone}</p>
                <p className="text-zinc-500">
                  {shippingAddress?.addressLine}, {shippingAddress?.roadArea ? shippingAddress?.roadArea + ', ' : ''}{shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500 font-medium font-serif">Loading Razorpay Portal...</p>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
