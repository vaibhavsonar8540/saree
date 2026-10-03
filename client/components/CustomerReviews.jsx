"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomImage from "./customImage";
import {
  FiStar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiShield,
  FiTruck,
  FiHeart,
  FiMessageSquare,
  FiThumbsUp,
  FiX,
  FiShoppingBag,
  FiPlus,
  FiFilter,
  FiMapPin,
  FiCheck,
  FiUser,
} from "react-icons/fi";

const QuoteIcon = ({ className = "" }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const categoryFilters = [
  { id: "all", label: "All Stories" },
  { id: "kanjeevaram", label: "Kanjeevaram Silk" },
  { id: "banarasi", label: "Banarasi Silk" },
  { id: "organza", label: "Organza & Chanderi" },
  { id: "paithani", label: "Paithani & Bridal" },
];

const sampleReviewsData = [
  {
    id: 1,
    category: "kanjeevaram",
    name: "Ananya Roy",
    location: "Mumbai, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 days ago",
    verified: true,
    purchasedProduct: "Royal Kanjeevaram Pure Silk Saree",
    sareeImg: "/assets/images/heroBanner.png",
    title: "Breathtaking Zari & Unmatched Silk Quality!",
    comment:
      "I ordered this Kanjeevaram saree for my sister's wedding reception, and it completely stole the show! The pure silk shine and intricate gold zari border feel so regal. The packaging was royal too.",
    helpfulCount: 24,
  },
  {
    id: 2,
    category: "organza",
    name: "Priya Sharma",
    location: "Bangalore, Karnataka",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 week ago",
    verified: true,
    purchasedProduct: "Handspun Organza Floral Print Saree",
    sareeImg: "/assets/images/oraganza.png",
    title: "Lightweight, Elegant & So Comfortable!",
    comment:
      "Organza sarees can sometimes be stiff, but Anjali Creation's handspun organza drapes like a dream! Delicately printed with stunning pastel shades. Received endless compliments at our festive function.",
    helpfulCount: 18,
  },
  {
    id: 3,
    category: "banarasi",
    name: "Meera Nair",
    location: "Chennai, Tamil Nadu",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    purchasedProduct: "Banarasi Royal Brocade Silk Saree",
    sareeImg: "/assets/images/banarasi.png",
    title: "True Artisan Handloom Work!",
    comment:
      "As someone who collects authentic sarees, I am super impressed by the kadwa weaving on this Banarasi silk. The silver zari work is flawless. Authentic silk mark certified as promised!",
    helpfulCount: 31,
  },
  {
    id: 4,
    category: "organza",
    name: "Radhika Patel",
    location: "Ahmedabad, Gujarat",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "3 weeks ago",
    verified: true,
    purchasedProduct: "Traditional Bandhani Tie & Dye Saree",
    sareeImg: "/assets/images/traditional.png",
    title: "Vibrant Colors & Premium Gaji Silk",
    comment:
      "The Bandhej colors are so rich and deep! The saree arrived right on time with express shipping. Exceptional craftsmanship that truly honors Indian master weavers.",
    helpfulCount: 15,
  },
  {
    id: 5,
    category: "paithani",
    name: "Kavita Reddy",
    location: "Hyderabad, Telangana",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Maharashtrian Paithani Silk Saree",
    sareeImg: "/assets/images/banner2.png",
    title: "Exquisite Peacock Pallu Motif!",
    comment:
      "The Paithani pallu motif is breathtakingly detailed. Wore it for a family puja and felt so graceful. Fast shipping and wonderful customer service. Worth every rupee spent!",
    helpfulCount: 29,
  },
  {
    id: 6,
    category: "paithani",
    name: "Sunita Verma",
    location: "New Delhi",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Pastel Pink Tissue Silk Festive Saree",
    sareeImg: "/assets/images/bridal.png",
    title: "Pure Royalty in Every Weave!",
    comment:
      "The subtle shimmer of the tissue silk and delicate meenakari highlights made me feel like royalty. The fall and pico work was done impeccably.",
    helpfulCount: 20,
  },
  {
    id: 7,
    category: "kanjeevaram",
    name: "Devika Sen",
    location: "Kolkata, West Bengal",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    rating: 5,
    date: "1 month ago",
    verified: true,
    purchasedProduct: "Golden Crimson Kanjeevaram Bridal Saree",
    sareeImg: "/assets/images/heroBanner.png",
    title: "A Timeless Heirloom Piece!",
    comment:
      "Bought this for my daughter's wedding. The weight of the pure silk and rich zari embroidery is reminiscent of heirloom sarees passed down through generations. Outstanding quality!",
    helpfulCount: 42,
  },
  {
    id: 8,
    category: "banarasi",
    name: "Shalini Hegde",
    location: "Pune, Maharashtra",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    rating: 4,
    date: "2 months ago",
    verified: true,
    purchasedProduct: "Emerald Green Katan Banarasi Silk",
    sareeImg: "/assets/images/banarasi.png",
    title: "Stunning Color & Soft Silk Handfeel",
    comment:
      "The shade of emerald green is mesmerizing! The fabric drapes effortlessly. Delivery took an extra day due to rain, but customer support updated me promptly.",
    helpfulCount: 11,
  },
];

export default function CustomerReviews() {
  const [reviews, setReviews] = useState(sampleReviewsData);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [likedReviews, setLikedReviews] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // New review form state
  const [newReview, setNewReview] = useState({
    name: "",
    location: "",
    category: "kanjeevaram",
    purchasedProduct: "",
    rating: 5,
    title: "",
    comment: "",
  });
  const [hoverRating, setHoverRating] = useState(0);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter reviews based on active category & rating filter
  const filteredReviews = reviews.filter((rev) => {
    const categoryMatch =
      selectedCategory === "all" || rev.category === selectedCategory;
    const ratingMatch =
      selectedRating === "all" || rev.rating === Number(selectedRating);
    return categoryMatch && ratingMatch;
  });

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (ref) ref.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [selectedCategory, selectedRating, filteredReviews]);

  // Smooth scroll back to start when filter changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, [selectedCategory, selectedRating]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.title || !newReview.comment) return;

    const createdReview = {
      id: Date.now(),
      category: newReview.category,
      name: newReview.name,
      location: newReview.location || "Verified Shopper",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: Number(newReview.rating),
      date: "Just now",
      verified: true,
      purchasedProduct:
        newReview.purchasedProduct || "Handloom Pure Silk Saree",
      sareeImg: "/assets/images/heroBanner.png",
      title: newReview.title,
      comment: newReview.comment,
      helpfulCount: 0,
    };

    setReviews([createdReview, ...reviews]);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setNewReview({
        name: "",
        location: "",
        category: "kanjeevaram",
        purchasedProduct: "",
        rating: 5,
        title: "",
        comment: "",
      });
    }, 1500);
  };

  // Helper to count reviews per category
  const getCategoryCount = (catId) => {
    if (catId === "all") return reviews.length;
    return reviews.filter((r) => r.category === catId).length;
  };

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F2EB] relative overflow-hidden border-t border-[#C5A059]/30">
      {/* Background Decorative Gold Watermark */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-radial from-[#1B5E3B]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TOP SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C5A059]/40 shadow-xs mb-3">
            <FiHeart className="text-[#C5A059] fill-[#C5A059] text-xs" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1B5E3B]">
              LOVED BY 5,000+ PATRONS
            </span>
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#1B5E3B] tracking-tight">
            Words of Grace & Appreciation
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 mt-2.5 font-normal leading-relaxed max-w-2xl mx-auto">
            Real stories and unedited reviews from women who celebrate timeless handloom artistry.
          </p>

          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-4 rounded-full" />
        </div>





        {/* REVIEWS CAROUSEL TRACK WITH NAVIGATION BUTTONS */}
        <div className="relative group/carousel px-1 sm:px-4">
          
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous Reviews"
            className={`absolute -left-3 sm:-left-6 lg:-left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-[#C5A059]/50 flex items-center justify-center transition-all duration-300 shadow-xl ${
              canScrollLeft
                ? "text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white hover:border-[#1B5E3B] cursor-pointer active:scale-95"
                : "text-zinc-300 border-zinc-200 cursor-not-allowed opacity-25"
            }`}
          >
            <FiChevronLeft className="text-xl sm:text-2xl" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next Reviews"
            className={`absolute -right-3 sm:-right-6 lg:-right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-[#C5A059]/50 flex items-center justify-center transition-all duration-300 shadow-xl ${
              canScrollRight
                ? "text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-white hover:border-[#1B5E3B] cursor-pointer active:scale-95"
                : "text-zinc-300 border-zinc-200 cursor-not-allowed opacity-25"
            }`}
          >
            <FiChevronRight className="text-xl sm:text-2xl" />
          </button>

          {/* Scrollable Track */}
          {filteredReviews.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex items-stretch overflow-x-auto scroll-smooth gap-6 py-4 px-3 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {filteredReviews.map((rev) => {
                const isLiked = likedReviews[rev.id];
                return (
                  <div
                    key={rev.id}
                    className="w-[300px] sm:w-[360px] md:w-[380px] shrink-0 scroll-snap-align-start flex flex-col justify-between rounded-3xl bg-white border border-[#C5A059]/30 p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:border-[#C5A059] transition-all duration-500 group relative"
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* Decorative Quote Icon Background */}
                    <QuoteIcon className="absolute top-6 right-6 text-4xl text-[#C5A059]/15 group-hover:text-[#C5A059]/30 transition-colors pointer-events-none" />

                    <div>
                      {/* Rating Stars & Verified Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center text-amber-400 gap-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <FiStar
                              key={i}
                              className="fill-amber-400 text-amber-400 text-sm"
                            />
                          ))}
                        </div>

                        {rev.verified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1B5E3B]/10 text-[#1B5E3B] text-[10px] font-bold uppercase tracking-wider border border-[#1B5E3B]/20">
                            <FiCheckCircle className="text-xs text-[#1B5E3B]" />
                            Verified
                          </span>
                        )}
                      </div>

                      {/* Purchased Product Tag Pill */}
                      {rev.purchasedProduct && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F5F2EB] border border-[#C5A059]/20 text-zinc-700 text-[11px] font-medium mb-3 max-w-full truncate">
                          <FiShoppingBag className="text-[#C5A059] shrink-0 text-xs" />
                          <span className="truncate">
                            <span className="font-semibold text-zinc-900">Purchased:</span> {rev.purchasedProduct}
                          </span>
                        </div>
                      )}

                      {/* Review Title */}
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#222222] mb-2 leading-snug group-hover:text-[#1B5E3B] transition-colors">
                        "{rev.title}"
                      </h3>

                      {/* Review Body */}
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal mb-6">
                        {rev.comment}
                      </p>
                    </div>

                    {/* Bottom Card Footer: Customer Avatar & Info */}
                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#C5A059] shrink-0 bg-zinc-200 shadow-xs">
                          <CustomImage
                            srcAttr={rev.avatar}
                            altAttr={rev.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-xs sm:text-sm text-[#222222]">
                            {rev.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                            <FiMapPin className="text-[10px] text-[#C5A059]" />
                            {rev.location}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Helpful Like Button */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(rev.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                            isLiked
                              ? "bg-[#1B5E3B] text-white"
                              : "bg-zinc-100 text-zinc-600 hover:bg-[#C5A059]/20 hover:text-[#1B5E3B]"
                          }`}
                        >
                          <FiThumbsUp
                            className={`text-xs ${
                              isLiked ? "fill-white" : ""
                            }`}
                          />
                          <span>{rev.helpfulCount}</span>
                        </button>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {rev.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State when no reviews match filters */
            <div className="py-16 text-center bg-white rounded-3xl border border-[#C5A059]/30 shadow-xs my-4">
              <FiMessageSquare className="text-4xl text-[#C5A059] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif font-bold text-lg text-[#1B5E3B]">
                No Reviews Found
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                No customer reviews match your selected filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedRating("all");
                }}
                className="mt-4 px-5 py-2 rounded-full bg-[#1B5E3B] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#154a2e] transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

      </div>

      {/* WRITE A REVIEW MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#F5F2EB] rounded-3xl border border-[#C5A059]/50 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white text-zinc-500 hover:text-zinc-900 border border-zinc-200 flex items-center justify-center transition-all cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                COMMUNITY FEEDBACK
              </span>
              <h3 className="font-serif font-bold text-2xl text-[#1B5E3B] mt-1">
                Share Your Saree Story
              </h3>
              <p className="text-xs text-zinc-600 mt-1">
                Help other women celebrate authentic handloom craftsmanship.
              </p>
            </div>

            {isSubmitted ? (
              <div className="py-10 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#1B5E3B] text-white flex items-center justify-center text-2xl mb-4 shadow-lg animate-bounce">
                  <FiCheck />
                </div>
                <h4 className="font-serif font-bold text-xl text-[#1B5E3B]">
                  Thank You for Your Review!
                </h4>
                <p className="text-xs text-zinc-600 mt-1">
                  Your review has been successfully published to our story collection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Rating selection stars */}
                <div className="flex flex-col items-center justify-center py-2 bg-white rounded-2xl border border-[#C5A059]/30">
                  <span className="text-xs font-semibold text-zinc-700 mb-1 uppercase tracking-wider">
                    Select Rating
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                      >
                        <FiStar
                          className={`text-2xl ${
                            star <= (hoverRating || newReview.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Location Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Radhika Sharma"
                      value={newReview.name}
                      onChange={(e) =>
                        setNewReview({ ...newReview, name: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Location / City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={newReview.location}
                      onChange={(e) =>
                        setNewReview({ ...newReview, location: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]"
                    />
                  </div>
                </div>

                {/* Category & Purchased Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Saree Category
                    </label>
                    <select
                      value={newReview.category}
                      onChange={(e) =>
                        setNewReview({ ...newReview, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] cursor-pointer"
                    >
                      <option value="kanjeevaram">Kanjeevaram Silk</option>
                      <option value="banarasi">Banarasi Silk</option>
                      <option value="organza">Organza & Chanderi</option>
                      <option value="paithani">Paithani & Bridal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Saree Product Purchased
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Silk Brocade Saree"
                      value={newReview.purchasedProduct}
                      onChange={(e) =>
                        setNewReview({
                          ...newReview,
                          purchasedProduct: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]"
                    />
                  </div>
                </div>

                {/* Review Headline / Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stunning Silk Shine & Exceptional Drape!"
                    value={newReview.title}
                    onChange={(e) =>
                      setNewReview({ ...newReview, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B]"
                  />
                </div>

                {/* Review Body */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Detailed Experience *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about the fabric quality, zari work, drape, packaging, or customer service..."
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-800 focus:outline-none focus:border-[#1B5E3B] focus:ring-1 focus:ring-[#1B5E3B] leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#1B5E3B] text-white hover:bg-[#154a2e] font-semibold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer active:scale-98 border border-[#C5A059]/40"
                >
                  Submit Story & Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
