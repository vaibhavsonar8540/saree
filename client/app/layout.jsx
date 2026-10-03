import { Geist, Geist_Mono } from "next/font/google";
import ReduxProvider from "@/redux/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
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
  title: "Anjali Creation | Exquisite Indian Sarees & Ethnic Wear",
  description: "Explore exquisite Organza, Kanjeevaram Silk, Banarasi & Cotton Sarees online.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F2EB] text-[#222222] antialiased">
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
