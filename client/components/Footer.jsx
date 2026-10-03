"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiInstagram, FiFacebook } from "react-icons/fi";
import { FaWhatsapp, FaPinterestP } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full bg-[#181818] text-[#F5F2EB] font-sans pt-0">


      {/* Main Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold tracking-wider text-white uppercase">
                ANJALI
              </h3>
              <p className="text-[10px] tracking-[0.25em] font-semibold text-[#C5A059] uppercase">
                CREATION
              </p>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              Celebrating the timeless elegance of Indian drapes. Crafting luxury organza, printed, cotton, and silk sarees for the modern woman.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-[#C5A059] hover:text-[#181818] text-zinc-300 flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <FiInstagram className="text-sm" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-[#C5A059] hover:text-[#181818] text-zinc-300 flex items-center justify-center transition-all duration-300"
                aria-label="Facebook"
              >
                <FiFacebook className="text-sm" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-[#C5A059] hover:text-[#181818] text-zinc-300 flex items-center justify-center transition-all duration-300"
                aria-label="Pinterest"
              >
                <FaPinterestP className="text-sm" />
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-[#1B5E3B] hover:text-white text-zinc-300 flex items-center justify-center transition-all duration-300"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-sm" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/" className="hover:text-[#C5A059] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/sarees" className="hover:text-[#C5A059] transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/sarees?category=organza" className="hover:text-[#C5A059] transition-colors">
                  Organza Sarees
                </Link>
              </li>
              <li>
                <Link href="/sarees?category=silk" className="hover:text-[#C5A059] transition-colors">
                  Cotton & Silk
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C5A059] transition-colors">
                  Our Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-white tracking-wide">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/orders" className="hover:text-[#C5A059] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#C5A059] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="hover:text-[#C5A059] transition-colors">
                  Fabric Care Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#C5A059] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#C5A059] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-white tracking-wide">
              Newsletter
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Subscribe to receive exclusive festive offers, early access to new collections, and styling tips.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#b08d48] text-[#181818] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md active:scale-[0.99]"
              >
                {subscribed ? "Subscribed Thank You!" : "Subscribe Now"}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex items-center justify-center text-center text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Anjali Creation Sarees. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
