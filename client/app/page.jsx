
import banner2Img from "@/assets/images/banner2.png";
import bannerMobileImg from "@/assets/images/bannerMobile.png";
import heroBannerImg from "@/assets/images/heroBanner.png";
import traditionalImg from "@/assets/images/traditional.png";
import bridalImg from "@/assets/images/bridal.png";
import organzaImg from "@/assets/images/oraganza.png";
import banarasiImg from "@/assets/images/banarasi.png";
import { FiPackage, FiShield, FiTruck, FiArrowRight } from "react-icons/fi";
import HeroBanner from "../components/heroBanner";
import ProductCard from "../components/productCard";
import CustomImage from "../components/customImage";
import NewArrivalsSlider from "../components/NewArrivalsSlider";
import MostLovedSlider from "../components/MostLovedSlider";
import CurvedProductCarousel from "../components/CurvedProductCarousel";
import CustomerReviews from "../components/CustomerReviews";
import FaqSection from "../components/FaqSection";
import Link from "next/link";

const featuredCategories = [
  {
    id: "traditional",
    name: "Traditional",
    subtitle: "Heritage Classics",
    image: traditionalImg,
    href: "/sarees?category=traditional",
  },
  {
    id: "bridal",
    name: "Bridal",
    subtitle: "Wedding Finery",
    image: bridalImg,
    href: "/sarees?category=bridal",
  },
  {
    id: "organza",
    name: "Organza",
    subtitle: "Sheer Luxury",
    image: organzaImg,
    href: "/sarees?category=organza",
  },
  {
    id: "banarasi",
    name: "Banarasi",
    subtitle: "Royal Brocade",
    image: banarasiImg,
    href: "/sarees?category=banarasi",
  },
];

export default function Home() {
  return (
    <main className="w-full bg-[#F5F2EB]">
      {/* Centered Luxury Hero Banner Section using banner2.png & bannerMobile.png */}
      <HeroBanner
        src={banner2Img}
        mobileSrc={bannerMobileImg}
        align="center"
        badge="FESTIVE & BRIDAL COLLECTION 2026"
        badgeClass="inline-block px-4 sm:px-6 py-1.5 sm:py-2 rounded-full border border-[#C5A059]/80 bg-black/25 text-[#C5A059] text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase backdrop-blur-2xs shadow-md"
        title={
          <h1 className="text-2xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight drop-shadow-sm">
            Exquisite Drapes for Every
            <span className="block font-serif italic font-normal text-[#C5A059] text-3xl sm:text-6xl md:text-7xl lg:text-8xl mt-0.5 sm:mt-1">
              Occasion
            </span>
          </h1>
        }
        desc="Handcrafted organza, breathable pure cottons, and royal silks woven with generational artistry to celebrate your timeless grace."
        descClass="text-xs sm:text-base lg:text-lg text-zinc-200/90 max-w-2xl mx-auto leading-relaxed font-normal pt-1 px-2"
        btnText="EXPLORE COLLECTION"
        href="/sarees"
        btnClassName="rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm uppercase tracking-widest font-bold bg-[#C8A97A] text-[#181818] hover:bg-[#b59667] shadow-xl transition-all"
        secondaryBtnText="OUR HERITAGE"
        secondaryHref="/about"
        secondaryBtnClassName="rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm uppercase tracking-widest font-bold border border-[#C5A059]/80 text-white bg-black/25 hover:bg-black/50 backdrop-blur-2xs transition-all"
      />

      {/* Top Rounded Full Arch Category Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
            Curated Collections
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#1B5E3B]">
            Shop By Style
          </h2>
          <div className="w-12 h-0.5 bg-[#C5A059]/60 mx-auto mt-2 rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group flex flex-col items-center cursor-pointer"
            >
              {/* Upper Rounded Full Arch Container */}
              <div className="relative w-full aspect-[4/5] rounded-t-full overflow-hidden border border-[#C5A059]/30 bg-[#E8DFD1]/50 shadow-md group-hover:shadow-xl group-hover:border-[#C5A059] transition-all duration-300">
                <CustomImage
                  srcAttr={cat.image}
                  altAttr={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              {/* Title & Subtitle below Arch */}
              <div className="mt-3 sm:mt-4 text-center">
                <h3 className="font-serif font-bold text-base sm:text-xl text-[#222222] group-hover:text-[#1B5E3B] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-xs font-medium text-[#C5A059] uppercase tracking-wider mt-0.5">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Newly Arrived Products Slider Section */}
      <NewArrivalsSlider />

      {/* 3D Arc Product Carousel Section */}
      <CurvedProductCarousel />

      {/* Most Loved / Bestsellers Slider Section */}
      <MostLovedSlider />

      {/* Customer Reviews & Feedback Section */}
      <CustomerReviews />

      {/* Frequently Asked Questions Section */}
      <FaqSection />
    </main>
  );
}
