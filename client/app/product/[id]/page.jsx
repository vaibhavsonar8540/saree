"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import CustomImage from "@/components/customImage";
import { ProductDetailSkeleton } from "@/components/Skeleton";
import ProductCard from "@/components/productCard";
import { openCartDrawer } from "@/redux/slice/headerSlice";
import { getWishlist, isInWishlist, toggleWishlist } from "@/utils/wishlist";
import { fetchProductById, fetchSarees } from "@/service/productService";
import {
  FiHeart,
  FiShoppingCart,
  FiStar,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiCheck,
  FiChevronRight,
  FiShare2,
  FiArrowLeft,
  FiBox,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiLayers,
  FiFileText,
  FiSun,
  FiSliders,
} from "react-icons/fi";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  // Media State
  const [activeMedia, setActiveMedia] = useState({ type: "image", url: "" });
  const [selectedColorId, setSelectedColorId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Interactivity State
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState("specs");
  const [activeTab, setActiveTab] = useState("specs");

  useEffect(() => {
    const pId = product?._id || productId;
    if (pId) {
      setIsWishlisted(isInWishlist(pId));
    }
    const syncWishlist = () => {
      if (pId) setIsWishlisted(isInWishlist(pId));
    };

    if (typeof window !== "undefined") {
      window.addEventListener("wishlistUpdated", syncWishlist);
      window.addEventListener("storage", syncWishlist);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("wishlistUpdated", syncWishlist);
        window.removeEventListener("storage", syncWishlist);
      }
    };
  }, [product, productId]);

  const toggleAccordion = (key) => {
    setActiveAccordion((prev) => (prev === key ? null : key));
  };

  const renderSpecCards = (prod) => {
    const specs = [
      { label: "FABRIC", value: prod?.fabric || "Organza Silk" },
      { label: "PATTERN / WEAVE", value: prod?.pattern || "Floral Printed" },
      { label: "OCCASION", value: prod?.occasion || "Wedding, Festive, Party, Reception" },
      { label: "WORK TYPE", value: prod?.workType || "Printed & Embellished Work" },
      { label: "BORDER TYPE", value: prod?.borderType || "Embroidered Zari Border" },
      {
        label: "DIMENSIONS",
        value: `${prod?.sareeLength || 5.5}m Length x ${prod?.sareeWidth || 1.2}m Width`,
      },
      {
        label: "BLOUSE PIECE",
        value: prod?.blousePiece === false ? "Not Included" : `Included (${prod?.blouseLength || 0.8}m)`,
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        {specs.map((item, i) => (
          <div
            key={i}
            className="bg-[#FDFBF7] p-3 sm:p-3.5 rounded-xl border border-stone-200/70 hover:border-[#C5A059]/40 transition-all"
          >
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-0.5">
              {item.label}
            </span>
            <span className="font-sans font-medium text-xs sm:text-sm text-zinc-800 leading-snug block">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!productId) return;

    async function loadData() {
      setLoading(true);
      const data = await fetchProductById(productId);

      if (data) {
        setProduct(data);
        
        // Determine initial active media & color
        const firstColorMedia = data.colorMedia && data.colorMedia.length > 0 ? data.colorMedia[0] : null;
        if (firstColorMedia) {
          const colorId = typeof firstColorMedia.colorId === "object" ? firstColorMedia.colorId._id : firstColorMedia.colorId;
          setSelectedColorId(colorId);
          setActiveMedia({
            type: "image",
            url: firstColorMedia.thumbnail || (firstColorMedia.images && firstColorMedia.images[0]) || data.thumbnail || data.image,
          });
        } else {
          setActiveMedia({
            type: "image",
            url: data.thumbnail || data.image || "/assets/images/heroBanner.png",
          });
        }

        // Fetch related sarees
        const all = await fetchSarees({ limit: 4 });
        if (Array.isArray(all)) {
          setRelatedProducts(all.filter((item) => item._id !== data._id).slice(0, 4));
        }
      } else {
        setProduct(null);
      }

      setLoading(false);
    }

    loadData();
  }, [productId]);

  // Handle color variant selection
  const handleColorSelect = (colorItem) => {
    const colorId = typeof colorItem.colorId === "object" ? colorItem.colorId._id : colorItem.colorId;
    setSelectedColorId(colorId);

    const firstImg = colorItem.thumbnail || (colorItem.images && colorItem.images[0]) || product?.thumbnail;
    setActiveMedia({ type: "image", url: firstImg });
  };

  const handleAddToCart = async () => {
    try {
      const { addToCartApi } = await import("@/service/cartService");
      const targetProdId = product?._id || productId;
      await addToCartApi({
        productId: targetProdId,
        colorId: selectedColorId || null,
        quantity: quantity || 1,
      });
      dispatch(openCartDrawer());
    } catch (e) {
      console.error("Cart save error", e);
    }

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#F5F2EB]">
        <FiBox className="w-12 h-12 text-[#C5A059] mb-3" />
        <h2 className="font-serif font-bold text-2xl text-[#222222]">Saree Product Not Found</h2>
        <p className="text-sm text-zinc-600 mt-1 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#1B5E3B] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#15472c] transition-all"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  // Active color media set
  const activeColorMediaObj = product.colorMedia?.find((cm) => {
    const cId = typeof cm.colorId === "object" ? cm.colorId._id : cm.colorId;
    return cId === selectedColorId;
  }) || product.colorMedia?.[0];

  // All available image thumbnails for gallery
  const galleryThumbnails = [];
  if (activeColorMediaObj) {
    if (activeColorMediaObj.thumbnail) galleryThumbnails.push({ type: "image", url: activeColorMediaObj.thumbnail });
    if (Array.isArray(activeColorMediaObj.images)) {
      activeColorMediaObj.images.forEach((img) => {
        if (img && img !== activeColorMediaObj.thumbnail) {
          galleryThumbnails.push({ type: "image", url: img });
        }
      });
    }
    if (activeColorMediaObj.video) galleryThumbnails.push({ type: "video", url: activeColorMediaObj.video });
  }

  if (galleryThumbnails.length === 0) {
    if (product.thumbnail) galleryThumbnails.push({ type: "image", url: product.thumbnail });
    if (product.video) galleryThumbnails.push({ type: "video", url: product.video });
  }

  const effectivePrice = product.discountedPrice > 0 ? product.discountedPrice : product.price;
  const discountPercent =
    product.discountedPrice > 0 && product.price > product.discountedPrice
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : 0;

  return (
    <main className="bg-[#F5F2EB] text-[#222222] min-h-screen pb-16 font-sans">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1B5E3B] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-[#C5A059]/40 animate-slideDown">
          <FiCheck className="w-5 h-5 text-[#C5A059]" />
          <div>
            <p className="font-serif font-bold text-sm">{product.name || product.title}</p>
            <p className="text-xs text-emerald-100">Added to your shopping bag ({quantity} item{quantity > 1 ? "s" : ""})</p>
          </div>
        </div>
      )}

      {/* BREADCRUMB BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          <button onClick={() => router.back()} className="hover:text-[#1B5E3B] flex items-center gap-1">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <span>/</span>
          <Link href="/" className="hover:text-[#1B5E3B]">Home</Link>
          <span>/</span>
          <span className="text-[#C5A059] font-bold">{product.category || "Sarees"}</span>
          <span>/</span>
          <span className="text-zinc-800 truncate max-w-[200px]">{product.name || product.title}</span>
        </div>
      </div>

      {/* PRODUCT MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-[#C5A059]/20 shadow-xs">
          
          {/* LEFT 7 COLS: MEDIA GALLERY (Sticky on Desktop) */}
          <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24 self-start">
            {/* MAIN STAGE MEDIA VIEWER */}
            <div className="relative w-full h-[450px] sm:h-[580px] bg-zinc-100 rounded-2xl overflow-hidden border border-[#C5A059]/30 shadow-inner group">
              {activeMedia.type === "video" ? (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <CustomImage
                  srcAttr={activeMedia.url || product.thumbnail || "/assets/images/heroBanner.png"}
                  altAttr={product.name || "Luxury Saree"}
                  fill={true}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                {discountPercent > 0 && (
                  <span className="px-3 py-1 bg-[#1B5E3B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.fabric && (
                  <span className="px-3 py-1 bg-[#C5A059] text-zinc-900 text-xs font-bold uppercase tracking-wider rounded-lg shadow-md">
                    {product.fabric}
                  </span>
                )}
              </div>

              {/* Wishlist & Share buttons */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    const status = toggleWishlist(product || { _id: productId });
                    setIsWishlisted(status);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isWishlisted ? "bg-rose-600 text-white" : "bg-white/90 text-zinc-800 hover:bg-[#1B5E3B] hover:text-white"
                  }`}
                  title="Save to Favourites"
                >
                  <FiHeart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined" && navigator?.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-white/90 text-zinc-800 hover:bg-[#1B5E3B] hover:text-white flex items-center justify-center shadow-lg transition-all"
                  title="Copy Link"
                >
                  <FiShare2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* GALLERY THUMBNAILS ROW */}
            {galleryThumbnails.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {galleryThumbnails.map((thumb, idx) => {
                  const isActive = activeMedia.url === thumb.url;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveMedia(thumb)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        isActive ? "border-[#1B5E3B] ring-2 ring-[#1B5E3B]/20 scale-105" : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {thumb.type === "video" ? (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                          VIDEO
                        </div>
                      ) : (
                        <img src={thumb.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: PRODUCT SPECIFICATIONS & PURCHASE */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Header Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C5A059] font-bold uppercase tracking-wider">
                    {product.category || "Saree"} • {product.subCategory || "Silk"}
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">SKU: {product.SKU}</span>
                </div>
                <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#222222] leading-tight pt-1">
                  {product.name || product.title}
                </h1>
              </div>

              {/* Rating & Stock */}
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  <FiStar className="fill-amber-400 text-amber-400 w-4 h-4" />
                  <span>4.9</span>
                </div>
                <span className="text-xs text-zinc-500 font-medium">(48 Certified Artisan Reviews)</span>
                <span className="text-zinc-300">•</span>
                <span className={`text-xs font-bold ${product.stock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                </span>
              </div>

              {/* Pricing Section */}
              <div className="py-2 space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif font-bold text-3xl text-[#1B5E3B]">
                    ₹{effectivePrice.toLocaleString("en-IN")}
                  </span>
                  {product.price > effectivePrice && (
                    <span className="text-base text-zinc-400 line-through">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-semibold text-[#1B5E3B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 font-medium">
                  Inclusive of all taxes. <span className="text-[#1B5E3B] font-semibold">Free Express Delivery across India.</span>
                </p>
              </div>

              {/* DYNAMIC COLOR VARIATIONS */}
              {product.colorMedia && product.colorMedia.length > 0 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Available Colors ({product.colorMedia.length})
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {product.colorMedia.map((cm, idx) => {
                      const getRealColorName = () => {
                        if (typeof cm.colorId === "object" && cm.colorId?.name && !cm.colorId.name.toLowerCase().startsWith("shade")) {
                          return cm.colorId.name.trim();
                        }
                        if (cm.colorName && cm.colorName.trim() && !cm.colorName.toLowerCase().startsWith("shade")) {
                          return cm.colorName.trim();
                        }
                        if (cm.name && cm.name.trim() && !cm.name.toLowerCase().startsWith("shade")) {
                          return cm.name.trim();
                        }
                        if (product.colors && product.colors[idx] && product.colors[idx].name && !product.colors[idx].name.toLowerCase().startsWith("shade")) {
                          return product.colors[idx].name.trim();
                        }

                        // Smart fallback based on hexCode or index
                        const hex = (cm.hexCode || product.colors?.[idx]?.hexCode || "").toLowerCase();
                        if (hex.includes("1b5e3b") || hex.includes("0f2c24") || hex.includes("green") || hex === "#008000") return "Emerald Green";
                        if (hex.includes("c5a059") || hex.includes("gold") || hex.includes("yellow") || hex === "#ffd700") return "Royal Gold";
                        if (hex.includes("800000") || hex.includes("red") || hex.includes("crimson") || hex === "#ff0000") return "Ruby Crimson";
                        if (hex.includes("000080") || hex.includes("blue") || hex.includes("navy") || hex === "#0000ff") return "Peacock Blue";
                        if (hex.includes("purple") || hex.includes("violet")) return "Royal Violet";
                        if (hex.includes("pink")) return "Blush Pink";

                        const defaultColorNames = [
                          "Emerald Green",
                          "Royal Gold",
                          "Ruby Crimson",
                          "Peacock Blue",
                          "Mustard Silk",
                          "Blush Pink",
                        ];
                        return defaultColorNames[idx % defaultColorNames.length];
                      };

                      const colorName = getRealColorName();
                      const hexCode = cm.hexCode || (product.colors && product.colors[idx] && product.colors[idx].hexCode) || "#1B5E3B";
                      const colorId = (typeof cm.colorId === "object" ? cm.colorId?._id : cm.colorId) || `col-${idx}`;
                      const isSelected = colorId === selectedColorId;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleColorSelect(cm)}
                          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer ${
                            isSelected
                              ? "bg-[#222222] text-white border-[#222222] ring-2 ring-[#C5A059]/40"
                              : "bg-white text-zinc-800 border-zinc-300 hover:bg-zinc-50"
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                            style={{ backgroundColor: hexCode }}
                          ></span>
                          <span>{colorName}</span>
                          {isSelected && <FiCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* QUANTITY & ACTIONS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700">Quantity:</span>
                  <div className="flex items-center border border-zinc-300 rounded-xl bg-white overflow-hidden shadow-xs">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-serif font-bold text-sm text-zinc-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock || 10, q + 1))}
                      className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-[#1B5E3B] hover:bg-[#15472c] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FiShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>

                  <button
                    onClick={() => {
                      handleAddToCart();
                      router.push("/cart");
                    }}
                    className="w-full py-4 bg-[#222222] hover:bg-black text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all border border-[#C5A059]/30"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <FiShield className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>100% Handloom Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiRefreshCw className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>7-Day Easy Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span>Cash on Delivery Available</span>
                </div>
              </div>

              {/* TOP PRODUCT SPECIFICATIONS ACCORDIONS */}
              <div className="pt-6 border-t border-zinc-200/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-serif font-bold text-base text-[#222222] flex items-center gap-2">
                    <FiSliders className="w-4 h-4 text-[#1B5E3B]" />
                    <span>Product Details & Specs</span>
                  </h3>
                </div>

                {/* ACCORDION DROPDOWNS ON TOP */}
                <div className="space-y-2.5">
                  {/* Accordion 1: Fabric & Craft Specs */}
                  <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion("specs")}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left font-semibold text-xs uppercase tracking-wider ${
                        activeAccordion === "specs" ? "bg-[#F3EFE6] text-[#1B5E3B]" : "bg-[#F9F8F6] hover:bg-[#F3EFE6] text-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FiLayers className="w-4 h-4 text-[#1B5E3B]" />
                        Fabric & Craft Specs
                      </span>
                      {activeAccordion === "specs" ? (
                        <FiChevronUp className="w-4 h-4 text-[#1B5E3B]" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    {activeAccordion === "specs" && (
                      <div className="p-3.5 bg-white border-t border-stone-200/60">
                        {renderSpecCards(product)}
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: Product Description */}
                  <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion("description")}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left font-semibold text-xs uppercase tracking-wider ${
                        activeAccordion === "description" ? "bg-[#F3EFE6] text-[#1B5E3B]" : "bg-[#F9F8F6] hover:bg-[#F3EFE6] text-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-[#1B5E3B]" />
                        Product Description
                      </span>
                      {activeAccordion === "description" ? (
                        <FiChevronUp className="w-4 h-4 text-[#1B5E3B]" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    {activeAccordion === "description" && (
                      <div className="p-4 bg-white border-t border-stone-200/60 text-xs text-zinc-600 font-normal leading-relaxed space-y-2">
                        <p>{product.description || "An exquisite handcrafted saree masterpiece."}</p>
                        <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-100">
                          Note: Natural weave variations enhance the authentic handmade charm of pure silk & zari drapes.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: Care Guidelines */}
                  <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion("care")}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left font-semibold text-xs uppercase tracking-wider ${
                        activeAccordion === "care" ? "bg-[#F3EFE6] text-[#1B5E3B]" : "bg-[#F9F8F6] hover:bg-[#F3EFE6] text-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FiSun className="w-4 h-4 text-[#1B5E3B]" />
                        Care Guidelines
                      </span>
                      {activeAccordion === "care" ? (
                        <FiChevronUp className="w-4 h-4 text-[#1B5E3B]" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    {activeAccordion === "care" && (
                      <div className="p-4 bg-white border-t border-stone-200/60 text-xs text-zinc-600 font-normal space-y-2">
                        <div className="flex items-start gap-2">
                          <FiCheck className="w-3.5 h-3.5 text-[#1B5E3B] shrink-0 mt-0.5" />
                          <span>Dry Clean Only. Recommended for pure silk and heavy zari work.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCheck className="w-3.5 h-3.5 text-[#1B5E3B] shrink-0 mt-0.5" />
                          <span>Store in breathable cotton or muslin bags to preserve zari sheen.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCheck className="w-3.5 h-3.5 text-[#1B5E3B] shrink-0 mt-0.5" />
                          <span>Avoid spraying perfume or deodorant directly on zari work.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Accordion 4: Express Delivery & Returns */}
                  <div className="border border-stone-200/90 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => toggleAccordion("shipping")}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors text-left font-semibold text-xs uppercase tracking-wider ${
                        activeAccordion === "shipping" ? "bg-[#F3EFE6] text-[#1B5E3B]" : "bg-[#F9F8F6] hover:bg-[#F3EFE6] text-zinc-800"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FiTruck className="w-4 h-4 text-[#1B5E3B]" />
                        Shipping & Guarantee
                      </span>
                      {activeAccordion === "shipping" ? (
                        <FiChevronUp className="w-4 h-4 text-[#1B5E3B]" />
                      ) : (
                        <FiChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    {activeAccordion === "shipping" && (
                      <div className="p-4 bg-white border-t border-stone-200/60 text-xs text-zinc-600 font-normal space-y-2">
                        <p><strong className="text-zinc-800 font-semibold">Express Shipping:</strong> Dispatched within 24-48 hours. Free delivery across India.</p>
                        <p><strong className="text-zinc-800 font-semibold">Returns:</strong> 7-day hassle-free return/exchange policy.</p>
                        <p><strong className="text-zinc-800 font-semibold">100% Authentic:</strong> Directly from certified master weavers.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>



        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center justify-between border-b border-[#C5A059]/20 pb-4">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#222222]">You May Also Like</h2>
                <p className="text-xs text-zinc-500">Explore complementary handcrafted sarees from our collection.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((item) => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md p-3 border-t border-zinc-200 sm:hidden shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={activeMedia?.url || product?.thumbnail || "/assets/images/heroBanner.png"}
            alt="Thumbnail"
            className="w-11 h-11 object-cover rounded-lg border border-zinc-200"
          />
          <div>
            <p className="font-serif font-bold text-xs text-zinc-900 truncate max-w-32">
              {product?.name || product?.title}
            </p>
            <p className="font-bold text-xs text-[#1B5E3B]">
              ₹{effectivePrice?.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="px-3 py-2.5 bg-[#1B5E3B] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-md"
          >
            Add to Bag
          </button>
          <button
            onClick={() => {
              handleAddToCart();
              router.push("/cart");
            }}
            className="px-3 py-2.5 bg-[#222222] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl shadow-md"
          >
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}
