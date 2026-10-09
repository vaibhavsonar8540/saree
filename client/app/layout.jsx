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

import { PAGE_CONSTANT } from "./constant";
import { getPageMetadata } from "./metadata";

export const metadata = getPageMetadata(PAGE_CONSTANT.HOME);

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-[#F5F2EB] text-[#222222] antialiased"
        suppressHydrationWarning
      >
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
