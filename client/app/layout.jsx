import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/redux/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { DynamicSmoothScroll as SmoothScroll } from "@/components/DynamicComponent";
import StoreJsonLd from "@/components/JsonLdSchema";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://anjalicreation.com"),
  title: {
    default: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    template: "%s | Anjali Creation",
  },
  description:
    "Discover handcrafted Kanchipuram Silk, Banarasi Brocades, Organza & Paithani Sarees at Anjali Creation. 100% Certified Pure Silk Mark. Global Express Insured Delivery.",
  keywords: [
    "Silk Sarees",
    "Kanchipuram Silk Saree",
    "Banarasi Saree",
    "Paithani Saree",
    "Organza Saree",
    "Anjali Creation",
    "Pure Silk Saree Online",
    "Indian Ethnic Wear",
    "Bridal Saree",
    "Handloom Sarees",
  ],
  authors: [{ name: "Anjali Creation" }],
  creator: "Anjali Creation",
  publisher: "Anjali Creation",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    description:
      "Exquisite handcrafted Kanchipuram, Banarasi, Paithani & Organza sarees. 100% Pure Silk Mark certified.",
    url: "https://anjalicreation.com",
    siteName: "Anjali Creation",
    images: [
      {
        url: "/images/about/hero_banner.png",
        width: 1200,
        height: 630,
        alt: "Anjali Creation Luxury Pure Silk Sarees Showcase",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    description:
      "Explore handcrafted Kanchipuram, Banarasi & Organza silk sarees. 100% Certified Pure Silk.",
    images: ["/images/about/hero_banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F2EB] text-[#222222] antialiased">
        <StoreJsonLd />
        <ReduxProvider>
          <SmoothScroll>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </SmoothScroll>
        </ReduxProvider>
      </body>
    </html>
  );
}
