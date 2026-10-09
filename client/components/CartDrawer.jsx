"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { closeCartDrawer } from "@/redux/slice/headerSlice";
import CustomImage from "./customImage";
import { fetchProductById } from "@/service/productService";
import { CartSkeleton } from "./Skeleton";
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiShoppingBag as FiCartIcon,
} from "react-icons/fi";

export default function CartDrawer() {
  const dispatch = useDispatch();
  const { isCartDrawerOpen } = useSelector((state) => state.header);

  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  const loadCartFromBackend = async () => {
    try {
      const { getCartApi } = await import("@/service/cartService");
      const res = await getCartApi();
      if (res?.success && res?.data) {
        setCartItems(res.data.items || []);
      }
    } catch (e) {
      setCartItems([]);
    }
    setIsLoaded(true);
  };

  useEffect(() => {
    loadCartFromBackend();

    const handleShowNotice = (e) => {
      const msg = e.detail?.message || "Item is already added to your cart!";
      setNoticeMessage(msg);
      setTimeout(() => setNoticeMessage(""), 4000);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("cartUpdated", loadCartFromBackend);
      window.addEventListener("storage", loadCartFromBackend);
      window.addEventListener("showCartNotice", handleShowNotice);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cartUpdated", loadCartFromBackend);
        window.removeEventListener("storage", loadCartFromBackend);
        window.removeEventListener("showCartNotice", handleShowNotice);
      }
    };
  }, []);

  const handleUpdateQuantity = async (itemId, currentQty, delta, maxStock = 10) => {
    const targetQty = Number(currentQty) + Number(delta);
    if (isNaN(targetQty) || targetQty < 1 || targetQty > maxStock) return;
    try {
      const { updateCartItemApi } = await import("@/service/cartService");
      const res = await updateCartItemApi(itemId, targetQty);
      if (res?.success && res?.data) {
        setCartItems(res.data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const { removeFromCartApi } = await import("@/service/cartService");
      const res = await removeFromCartApi(itemId);
      if (res?.success && res?.data) {
        setCartItems(res.data.items || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Financial calculation from items lineTotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.lineTotal || 0),
    0
  );

  return (
    <>
      {/* BACKDROP OVERLAY */}
      <div
        onClick={() => dispatch(closeCartDrawer())}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isCartDrawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* RIGHT SIDE DRAWER CONTAINER */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out no-lenis ${
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart Drawer"
      >
        {/* DRAWER HEADER */}
        <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FiShoppingBag className="w-5 h-5 text-[#222222]" />
            <h2 className="font-serif font-bold text-xl text-[#222222]">
              Your Cart
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeCartDrawer())}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-stone-100 transition-colors focus:outline-none"
            aria-label="Close Cart Drawer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* ALREADY IN CART NOTICE BANNER */}
        {noticeMessage && (
          <div className="bg-amber-50 border-b border-amber-200/80 text-amber-800 px-4 py-3 text-xs font-medium flex items-center justify-between animate-fadeIn shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMessage("")}
              className="text-amber-600 hover:text-amber-900 font-bold p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* DRAWER BODY: CART ITEMS LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          {!isLoaded ? (
            <CartSkeleton />
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-[#1B5E3B]/10 rounded-full flex items-center justify-center text-[#1B5E3B]">
                <FiCartIcon className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="font-serif font-bold text-lg text-zinc-800">
                  Your Cart is Empty
                </h3>
                <p className="text-xs text-zinc-500">
                  Explore our handcrafted saree collection and add your favorite drapes.
                </p>
              </div>
              <Link
                href="/sarees"
                onClick={() => dispatch(closeCartDrawer())}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-[#14462B] transition-colors shadow-sm"
              >
                <span>Shop Sarees</span>
                <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            cartItems.map((item) => {
              const qty = item.quantity || 1;
              let effectiveUnitPrice = 0;
              if (item.discountedPrice > 0) {
                effectiveUnitPrice = item.discountedPrice;
              } else if (item.unitPrice > 0) {
                effectiveUnitPrice = item.unitPrice;
              } else if (item.lineTotal > 0) {
                effectiveUnitPrice = item.lineTotal / qty;
              } else if (item.itemSubtotal > 0) {
                effectiveUnitPrice = item.itemSubtotal / qty;
              } else {
                effectiveUnitPrice = item.price || 0;
              }

              let originalUnitPrice = item.originalPrice || item.price || effectiveUnitPrice;
              if (originalUnitPrice < effectiveUnitPrice) {
                originalUnitPrice = effectiveUnitPrice;
              }

              const hasDiscount = originalUnitPrice > effectiveUnitPrice;
              
              return (
                <div
                  key={item._id}
                  className="p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 bg-white flex gap-3.5 sm:gap-4 shadow-2xs hover:border-stone-300 transition-all"
                >
                  {/* PRODUCT THUMBNAIL */}
                  <Link
                    href={`/product/${item.productId}`}
                    onClick={() => dispatch(closeCartDrawer())}
                    className="relative w-20 h-24 sm:w-22 sm:h-28 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 group block"
                  >
                    <CustomImage
                      srcAttr={item.image || item.thumbnail}
                      altAttr={item.name}
                      fill={true}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* PRODUCT INFO & CONTROLS */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                    <div className="space-y-1">
                      <Link
                        href={`/product/${item.productId}`}
                        onClick={() => dispatch(closeCartDrawer())}
                        className="font-serif font-bold text-xs sm:text-sm text-[#222222] hover:text-[#1B5E3B] transition-colors line-clamp-2 leading-snug block"
                      >
                        {item.name}
                      </Link>

                      {/* PRICE ROW (Discounted green + original strikethrough) */}
                      <div className="flex items-baseline gap-1.5 pt-0.5">
                        <span className="font-serif font-bold text-sm sm:text-base text-[#1B5E3B]">
                          ₹{effectiveUnitPrice.toLocaleString("en-IN")}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-zinc-400 line-through font-normal">
                            ₹{originalUnitPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QUANTITY & DELETE ICON ROW (Matching user image) */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      {/* Quantity Controller Pill */}
                      <div className="flex items-center border border-stone-200 rounded-full px-2.5 py-0.5 bg-stone-50/50 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity, -1, item.stock || 10)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-zinc-600 hover:text-black disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-zinc-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item._id, item.quantity, 1, item.stock || 10)}
                          disabled={item.quantity >= (item.stock || 10)}
                          className="p-1 text-zinc-600 hover:text-black disabled:opacity-30 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete Icon Button (Red circular trash icon as shown in image) */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item._id)}
                        className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 shadow-2xs border border-rose-100"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DRAWER FOOTER */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-stone-200 bg-white space-y-4 shrink-0 shadow-lg">
            {/* Price Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-500 font-medium">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-700">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1 border-t border-stone-100">
                <span className="font-bold text-sm sm:text-base text-zinc-900">
                  Total Amount
                </span>
                <span className="font-serif font-bold text-base sm:text-lg text-zinc-900">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* CTA Buttons (Matching design & user image style) */}
            <div className="space-y-2.5 pt-1">
              <Link
                href="/order"
                onClick={() => dispatch(closeCartDrawer())}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl text-center shadow-md transition-all block"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/cart"
                onClick={() => dispatch(closeCartDrawer())}
                className="w-full py-3 bg-white hover:bg-[#F5F2EB] text-[#222222] border border-[#C5A059]/80 font-bold text-xs uppercase tracking-wider rounded-2xl text-center transition-all block"
              >
                View Your Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
