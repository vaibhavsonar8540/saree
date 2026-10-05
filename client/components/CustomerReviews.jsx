"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomImage from "./customImage";
import {
  FiStar,
  FiCheckCircle,
  FiShoppingBag,
  FiThumbsUp,
  FiMapPin,
  FiHeart,
} from "react-icons/fi";

const QuoteIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const sampleReviewsData = [
  {
    id: 1,
    name: "Ananya Roy",
    location: "Mumbai, MH",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 days ago",
    verified: true,
    purchasedProduct: "Kanjeevaram Pure Silk",
    title: "Breathtaking Zari & Silk Quality",
    comment:
      "Stole the show at my sister's wedding! The pure silk shine and intricate gold zari border feel truly regal.",
    helpfulCount: 24,
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Bangalore, KA",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 week ago",
    verified: true,
    purchasedProduct: "Handspun Organza Saree",
    title: "Lightweight & So Comfortable",
    comment:
      "Drapes like a dream! Delicately printed with stunning pastel shades. Received endless compliments.",
    helpfulCount: 18,
  },
  {
    id: 3,
    name: "Meera Nair",
    location: "Chennai, TN",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    purchasedProduct: "Banarasi Brocade Silk",
    title: "True Artisan Handloom Work",
    comment:
      "Super impressed by the kadwa weaving on this Banarasi silk. Authentic silk mark certified as promised!",
    helpfulCount: 31,
  },
  {
    id: 4,
    name: "Radhika Patel",
    location: "Ahmedabad, GJ",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "3 weeks ago",
    verified: true,
    purchasedProduct: "Bandhani Tie & Dye Saree",
    title: "Vibrant Colors & Premium Feel",
    comment:
      "Rich Bandhej colors and premium Gaji silk fabric. Exceptional craftsmanship that honors master weavers.",
    helpfulCount: 15,
  },
  {
    id: 5,
    name: "Kavita Reddy",
    location: "Hyderabad, TS",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Paithani Silk Saree",
    title: "Exquisite Peacock Motif",
    comment:
      "The peacock pallu motif is breathtakingly detailed. Felt graceful and regal wearing it for our puja.",
    helpfulCount: 29,
  },
  {
    id: 6,
    name: "Sunita Verma",
    location: "New Delhi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Tissue Silk Festive Saree",
    title: "Pure Royalty in Every Weave",
    comment:
      "Subtle shimmer of tissue silk with delicate meenakari highlights. Made me feel like pure royalty!",
    helpfulCount: 20,
  },
  {
    id: 7,
    name: "Devika Sen",
    location: "Kolkata, WB",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Crimson Kanjeevaram",
    title: "Timeless Heirloom Piece",
    comment:
      "Pure silk weight and rich zari embroidery reminiscent of timeless family heirlooms. Outstanding quality!",
    helpfulCount: 42,
  },
  {
    id: 8,
    name: "Shalini Hegde",
    location: "Pune, MH",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 months ago",
    verified: true,
    purchasedProduct: "Emerald Katan Banarasi",
    title: "Stunning Color & Soft Drape",
    comment:
      "Mesmerizing emerald green shade with effortless drape. Exceptional silk handfeel and prompt service.",
    helpfulCount: 11,
  },
];

export default function CustomerReviews() {
  const [reviews, setReviews] = useState(sampleReviewsData);
  const [likedReviews, setLikedReviews] = useState({});
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  // Continuous auto-slide animation loop using rAF
  useEffect(() => {
    let animationFrameId;
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const step = () => {
      if (!isPaused && scrollContainer) {
        // When scrolled past half (the first copy), seamlessly jump back to 0
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 0.7; // Smooth continuous movement speed
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  const handleToggleLike = (id) => {
    setLikedReviews((prev) => {
      const isLiked = prev[id];
      const updated = { ...prev, [id]: !isLiked };

      setReviews((prevReviews) =>
        prevReviews.map((rev) => {
          if (rev.id === id) {
            return {
              ...rev,
              helpfulCount: isLiked
                ? rev.helpfulCount - 1
                : rev.helpfulCount + 1,
            };
          }
          return rev;
        })
      );
      return updated;
    });
  };

  // Duplicate items array for seamless infinite looping
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="w-full py-12 sm:py-16 bg-[#F5F2EB] relative overflow-hidden border-t border-[#C5A059]/30">
      {/* Background Decorative Gold Watermarks */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#1B5E3B]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* TOP SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C5A059]/40 shadow-xs mb-2.5">
            <FiHeart className="text-[#C5A059] fill-[#C5A059] text-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B5E3B]">
              LOVED BY 5,000+ PATRONS
            </span>
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#1B5E3B] tracking-tight">
            Words of Grace & Appreciation
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 font-normal leading-relaxed">
            Real stories and unedited feedback from patrons who celebrate authentic handloom artistry.
          </p>

          <div className="w-12 h-0.5 bg-[#C5A059] mx-auto mt-3 rounded-full" />
        </div>

        {/* CONTINUOUS AUTO-SLIDING CAROUSEL (NO BUTTONS, PAUSES ON INTERACTION) */}
        <div
          className="relative overflow-hidden py-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Scrollable Continuous Track */}
          <div
            ref={scrollRef}
            className="flex items-stretch overflow-x-auto gap-5 py-3 px-2 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {duplicatedReviews.map((rev, index) => {
              const isLiked = likedReviews[rev.id];
              return (
                <div
                  key={`${rev.id}-${index}`}
                  className="w-[280px] sm:w-[320px] shrink-0 flex flex-col justify-between rounded-2xl bg-white border border-[#C5A059]/30 p-5 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all duration-300 group relative"
                >
                  {/* Decorative Quote Icon */}
                  <QuoteIcon className="absolute top-5 right-5 text-zinc-200 group-hover:text-[#C5A059]/30 transition-colors pointer-events-none" />

                  <div>
                    {/* Rating Stars & Verified Badge */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <FiStar
                            key={i}
                            className="fill-amber-400 text-amber-400 text-xs"
                          />
                        ))}
                      </div>

                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B5E3B]/10 text-[#1B5E3B] text-[9px] font-bold uppercase tracking-wider border border-[#1B5E3B]/20">
                          <FiCheckCircle className="text-[10px] text-[#1B5E3B]" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Purchased Product Tag */}
                    {rev.purchasedProduct && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F5F2EB] border border-[#C5A059]/20 text-zinc-700 text-[10px] font-medium mb-2.5 max-w-full truncate">
                        <FiShoppingBag className="text-[#C5A059] shrink-0 text-[10px]" />
                        <span className="truncate">
                          <span className="font-semibold text-zinc-900">Purchased:</span> {rev.purchasedProduct}
                        </span>
                      </div>
                    )}

                    {/* Review Title */}
                    <h3 className="font-serif font-bold text-sm sm:text-base text-[#222222] mb-1.5 leading-snug group-hover:text-[#1B5E3B] transition-colors">
                      "{rev.title}"
                    </h3>

                    {/* Review Body (Reduced Content) */}
                    <p className="text-xs text-zinc-600 leading-relaxed font-normal mb-4">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Customer Info & Like Button */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#C5A059] shrink-0 bg-zinc-200">
                        <CustomImage
                          srcAttr={rev.avatar}
                          altAttr={rev.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-xs text-[#222222] leading-tight">
                          {rev.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-0.5">
                          <FiMapPin className="text-[9px] text-[#C5A059]" />
                          {rev.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(rev.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          isLiked
                            ? "bg-[#1B5E3B] text-white"
                            : "bg-stone-100 text-zinc-600 hover:bg-[#C5A059]/20 hover:text-[#1B5E3B]"
                        }`}
                      >
                        <FiThumbsUp
                          className={`text-[10px] ${
                            isLiked ? "fill-white" : ""
                          }`}
                        />
                        <span>{rev.helpfulCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
