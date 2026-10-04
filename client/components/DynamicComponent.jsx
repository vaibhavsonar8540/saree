"use client";

import dynamic from "next/dynamic";
import {
  CartSkeleton,
  CurvedCarouselSkeleton,
  ProductCardSkeleton,
} from "./Skeleton";

/**
 * Dynamic Component Exports for Client-Only Features (ssr: false)
 * Optimized for performance, avoiding hydration mismatches and reducing initial SSR bundle size.
 */

// Drawers & Modals (Browser localStorage & interactive overlay state)
export const DynamicCartDrawer = dynamic(
  () => import("@/components/CartDrawer"),
  {
    ssr: false,
    loading: () => <CartSkeleton />,
  }
);

export const DynamicAuthModal = dynamic(
  () => import("@/components/AuthModal"),
  { ssr: false }
);

export const DynamicUserProfileModal = dynamic(
  () => import("@/components/UserProfileModal"),
  { ssr: false }
);

// Interactive Sliders & 3D Carousels (Window calculations & touch math)
export const DynamicCurvedProductCarousel = dynamic(
  () => import("@/components/CurvedProductCarousel"),
  {
    ssr: false,
    loading: () => <CurvedCarouselSkeleton />,
  }
);

export const DynamicNewArrivalsSlider = dynamic(
  () => import("@/components/NewArrivalsSlider"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 bg-[#F5F2EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ),
  }
);

export const DynamicMostLovedSlider = dynamic(
  () => import("@/components/MostLovedSlider"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full py-12 bg-[#F5F2EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ),
  }
);

// Browser Smooth Scroll & Reviews
export const DynamicSmoothScroll = dynamic(
  () => import("@/components/SmoothScroll"),
  { ssr: false }
);

export const DynamicCustomerReviews = dynamic(
  () => import("@/components/CustomerReviews"),
  { ssr: false }
);

export default DynamicCartDrawer;
