"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OrderSummary from "@/components/order/OrderSummary";
import ShippingForm from "@/components/order/ShippingForm";
import { createOrderApi } from "@/service/orderService";
import { fetchProductById } from "@/service/productService";
import { FiArrowLeft, FiShield, FiTruck, FiRotateCcw } from "react-icons/fi";

const INITIAL_MOCK_CART = [
  {
    _id: "cart-1",
    productId: "6abe60de54b7c3a7ca81f258",
    name: "Elegant Deep Wine Georgette Saree With Beaded Gold Lace Border",
    fabric: "Pure Georgette",
    colorName: "Deep Wine",
    colorHex: "#5B2C6F",
    price: 1299,
    originalPrice: 1500,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
  },
  {
    _id: "cart-2",
    productId: "6abe60de54b7c3a7ca81f259",
    name: "Maroon Floral Block Print Flared Anarkali Suit Set With Dupatta",
    fabric: "Cotton Silk",
    colorName: "Maroon Red",
    colorHex: "#800000",
    price: 699,
    originalPrice: 999,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop",
  },
];

export default function OrderPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo code states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Preserved initial shipping address
  const [initialShipping, setInitialShipping] = useState({});

  useEffect(() => {
    const initializeOrderPage = async () => {
      try {
        // 1. Load cart items
        const savedCart = localStorage.getItem("anjali_cart");
        let rawCart = savedCart ? JSON.parse(savedCart) : [];

        if (!Array.isArray(rawCart) || rawCart.length === 0) {
          // If no items in cart, redirect back to cart page
          router.replace("/cart");
          return;
        }

        // Hydrate with latest product info if needed
        const hydratedCart = await Promise.all(
          rawCart.map(async (item) => {
            if (item.productId && typeof item.productId === "string" && item.productId.length === 24) {
              const fresh = await fetchProductById(item.productId);
              if (fresh) {
                const firstColorMedia = fresh.colorMedia?.[0];
                const colorObj = firstColorMedia?.colorId;
                return {
                  ...item,
                  name: fresh.name || fresh.title || item.name,
                  fabric: fresh.fabric || item.fabric,
                  price: fresh.discountedPrice > 0 ? fresh.discountedPrice : (fresh.price || item.price),
                  image: fresh.thumbnail || firstColorMedia?.thumbnail || item.image,
                  colorName: typeof colorObj === "object" ? colorObj.name : item.colorName,
                  colorHex: typeof colorObj === "object" ? colorObj.hexCode : item.colorHex,
                };
              }
            }
            return item;
          })
        );

        setCartItems(hydratedCart);

        // 2. Pre-fill user shipping address if saved previously or logged in
        let savedCheckout = null;
        try {
          savedCheckout = JSON.parse(localStorage.getItem("anjali_checkout_order") || "null");
        } catch (e) {}

        let savedUser = null;
        try {
          savedUser = JSON.parse(localStorage.getItem("anjali_user") || "null");
        } catch (e) {}

        setInitialShipping({
          fullName: savedCheckout?.shippingAddress?.fullName || savedUser?.name || "",
          email: savedCheckout?.shippingAddress?.email || savedUser?.email || "",
          phone: savedCheckout?.shippingAddress?.phone || savedUser?.phone || "",
          state: savedCheckout?.shippingAddress?.state || "",
          city: savedCheckout?.shippingAddress?.city || "",
          addressLine: savedCheckout?.shippingAddress?.addressLine || "",
          roadArea: savedCheckout?.shippingAddress?.roadArea || "",
          pincode: savedCheckout?.shippingAddress?.pincode || "",
        });

        // Pre-fill coupon if saved
        if (savedCheckout?.orderSummary?.couponCode) {
          const savedCode = savedCheckout.orderSummary.couponCode;
          setCouponCode(savedCode);
          setAppliedCoupon(savedCode);
          if (savedCode === "ANJALI10" || savedCode === "SAREE10") setDiscountPercent(10);
          else if (savedCode === "ANJALI20") setDiscountPercent(20);
        }
      } catch (e) {
        console.error("Error loading cart:", e);
      } finally {
        setIsLoaded(true);
      }
    };

    initializeOrderPage();
  }, [router]);

  // Financial calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
    0
  );

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const deliveryCharge = discountedSubtotal > 3000 || cartItems.length === 0 ? 0 : 199;
  const totalAmount = Math.max(0, discountedSubtotal + deliveryCharge);

  // Promo code Handlers
  const handleApplyCoupon = (inputCode) => {
    setCouponError("");
    const clean = inputCode ? inputCode.trim().toUpperCase() : "";

    if (!clean) {
      setCouponError("Please enter a valid promo code.");
      return;
    }

    if (clean === "ANJALI10" || clean === "SAREE10") {
      setDiscountPercent(10);
      setAppliedCoupon(clean);
      setCouponCode(clean);
    } else if (clean === "ANJALI20") {
      setDiscountPercent(20);
      setAppliedCoupon(clean);
      setCouponCode(clean);
    } else {
      setCouponError("Invalid promo code. Try ANJALI10");
      setAppliedCoupon("");
      setDiscountPercent(0);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon("");
    setDiscountPercent(0);
    setCouponError("");
  };

  // Submit Order Form
  const handleSubmitOrder = async (shippingFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Prepare Order Payload
      const orderPayload = {
        shippingAddress: shippingFormData,
        items: cartItems.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          fabric: item.fabric || "",
          colorName: item.colorName || "",
          colorHex: item.colorHex || "",
          image: item.image || item.thumbnail || "",
          quantity: item.quantity,
          price: item.price,
        })),
        couponCode: appliedCoupon,
        paymentMethod: "Pending",
      };

      // 2. Call backend order creation API
      let createdOrder = null;
      try {
        const response = await createOrderApi(orderPayload);
        if (response?.success && response?.data) {
          createdOrder = response.data;
        }
      } catch (apiError) {
        console.warn("Backend order creation warning, creating fallback order object:", apiError);
      }

      // 3. Fallback/Local storage structure
      const savedCheckoutData = {
        orderId: createdOrder?._id || `LOCAL-${Date.now()}`,
        orderNumber: createdOrder?.orderNumber || `ORD-${Date.now()}`,
        shippingAddress: shippingFormData,
        items: cartItems,
        orderSummary: {
          subtotal,
          discount: discountAmount,
          discountPercent,
          deliveryCharge,
          totalAmount,
          couponCode: appliedCoupon,
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("anjali_checkout_order", JSON.stringify(savedCheckoutData));

      // 4. Navigate to Payment Screen (/payment)
      router.push("/payment");
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Failed to proceed to payment. Please check your network and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#1B5E3B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 font-medium">Preparing your checkout...</p>
      </div>
    );
  }

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
            Provide your shipping details and verify your handcrafted saree selections.
          </p>
        </div>

        {/* TWO-COLUMN RESPONSIVE LAYOUT */}
        {/* Mobile/Tablet: Order Summary first (order-1), Shipping Address form second (order-2) */}
        {/* Desktop: Shipping Address form on left (lg:order-1), Order Summary on right (lg:order-2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* SHIPPING ADDRESS FORM (Left card on Desktop) */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <ShippingForm
              initialValues={initialShipping}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* ORDER SUMMARY (Right card on Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <OrderSummary
              cartItems={cartItems}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              discountPercent={discountPercent}
              couponError={couponError}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              subtotal={subtotal}
              discount={discountAmount}
              deliveryCharge={deliveryCharge}
              totalAmount={totalAmount}
            />

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-3 text-center bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs text-[11px] text-zinc-600 font-medium">
              <div className="flex flex-col items-center space-y-1">
                <FiShield className="w-5 h-5 text-[#1B5E3B]" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex flex-col items-center space-y-1 border-x border-stone-200 px-1">
                <FiTruck className="w-5 h-5 text-[#1B5E3B]" />
                <span>Express Delivery</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <FiRotateCcw className="w-5 h-5 text-[#1B5E3B]" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
