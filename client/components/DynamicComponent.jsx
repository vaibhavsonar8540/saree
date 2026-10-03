import dynamic from "next/dynamic";

export const DynamicHeroBanner = dynamic(
  () => import("@/components/heroBanner"),
  { ssr: false }
);

export const DynamicHeroCarousel = dynamic(
  () => import("@/components/heroCarousel"),
  { ssr: false }
);

export const DynamicHeader = dynamic(
  () => import("@/components/Header"),
  { ssr: false }
);

export const DynamicCustomImage = dynamic(
  () => import("@/components/customImage"),
  { ssr: false }
);

export const DynamicButton = dynamic(
  () => import("@/components/Buttons"),
  { ssr: false }
);

export default DynamicHeroCarousel;
