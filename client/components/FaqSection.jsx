"use client";

import React, { useState } from "react";
import {
  FiChevronDown,
  FiHelpCircle,
  FiAward,
  FiTruck,
  FiShield,
  FiMessageSquare,
  FiCheckCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const faqCategories = [
  { id: "all", label: "All Questions" },
  { id: "authenticity", label: "Silk Authenticity" },
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "returns", label: "Returns & Care" },
];

const faqData = [
  {
    id: 1,
    category: "authenticity",
    question: "How do I verify that my saree is 100% pure authentic silk?",
    answer:
      "Every pure silk saree from Anjali Creation comes with an official Silk Mark Organisation of India (SMOI) tag featuring an authorized hologram and unique serial number. You can verify your certificate code online at silkmarkindia.com. Furthermore, all our zari is handcrafted by generational master weavers in Kanchipuram and Varanasi.",
  },
  {
    id: 2,
    category: "shipping",
    question: "What are your delivery timelines and shipping charges?",
    answer:
      "We provide FREE insured express shipping across India on all orders over ₹3,000. Metro cities receive delivery within 2–4 business days, while non-metro locations take 4–6 business days. International orders are shipped via DHL/FedEx Express and arrive in 5–7 business days worldwide.",
  },
  {
    id: 3,
    category: "returns",
    question: "What is your return and exchange policy?",
    answer:
      "We offer a seamless 7-day doorstep return and exchange policy from the date of delivery. If you are not completely delighted with your saree, simply request a return via your account or customer care. Our courier partner will pick up the package from your address with full refund or exchange processing upon quality check.",
  },
  {
    id: 4,
    category: "authenticity",
    question: "Do sarees come with complementary Fall and Pico work?",
    answer:
      "Yes! All sarees purchased from Anjali Creation receive complementary high-quality cotton fall edging and precision pico finishing done by our master tailors prior to dispatch so your drape is ready to wear immediately.",
  },
  {
    id: 5,
    category: "shipping",
    question: "How can I track my order once it is shipped?",
    answer:
      "As soon as your order is dispatched, you will receive an automated SMS and Email with a live tracking link. You can also track your real-time shipment status at any time on our website using your Order Reference Number.",
  },
  {
    id: 6,
    category: "returns",
    question: "Are custom stitched blouse pieces eligible for returns?",
    answer:
      "Sarees with unstitched blouse fabrics included are 100% eligible for standard returns. However, once the blouse fabric has been custom-stitched to your personalized measurements, the saree cannot be returned unless there is a manufacturing defect.",
  },
  {
    id: 7,
    category: "authenticity",
    question: "How should I store and care for my pure silk & organza sarees?",
    answer:
      "We recommend dry cleaning for all pure silk, zari brocade, and organza sarees. Store your sarees wrapped in breathable muslin or cotton saree bags in a cool, dry place. Avoid hanging heavy silk sarees for long periods to preserve their structural drape.",
  },
  {
    id: 8,
    category: "shipping",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major domestic and international Credit/Debit Cards (Visa, MasterCard, RuPay, Amex), UPI (Google Pay, PhonePe, Paytm), Net Banking across 50+ Indian banks, and Cash on Delivery (COD) for eligible pin codes.",
  },
];

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqId, setOpenFaqId] = useState(1); // Default open first item

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const filteredFaqs = faqData;

  return (
    <section className="w-full py-12 sm:py-20 lg:py-24 bg-[#F5F2EB] relative overflow-x-clip border-t border-[#C5A059]/30">
      {/* Background Subtle Luxury Glows */}
      <div className="absolute top-1/2 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-radial from-[#1B5E3B]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#C5A059]/40 shadow-2xs mb-3">
            <FiHelpCircle className="text-[#C5A059] text-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#1B5E3B]">
              Help & Concierge
            </span>
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#1B5E3B] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 mt-2 font-normal leading-relaxed max-w-lg mx-auto">
            Clear answers about our silk mark authenticity certificates, global shipping, and easy returns.
          </p>

          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-3.5 rounded-full" />
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="space-y-3 sm:space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-xl sm:rounded-2xl border transition-colors duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#C5A059] shadow-md"
                    : "bg-white/90 hover:bg-white border-stone-200 hover:border-[#C5A059]/50 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none cursor-pointer group active:bg-stone-50 select-none"
                >
                  <span className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#222222] group-hover:text-[#1B5E3B] transition-colors pr-3 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-[#1B5E3B] text-white rotate-180"
                        : "bg-[#F5F2EB] text-[#1B5E3B] group-hover:bg-[#C5A059]/20"
                    }`}
                  >
                    <FiChevronDown className="text-sm sm:text-base" />
                  </div>
                </button>

                {/* ACCORDION CONTENT */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-stone-100">
                    <p className="pt-3 font-normal text-zinc-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STILL HAVE QUESTIONS CONCIERGE BAR */}
        <div className="mt-10 sm:mt-14 bg-white p-5 sm:p-7 rounded-2xl border border-[#C5A059]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B]">
              Have a Specific Question?
            </h3>
            <p className="text-xs text-zinc-600 max-w-md font-normal">
              Our saree specialists are online to assist with silk Mark certificates, custom blouse tailoring, and order tracking.
            </p>
          </div>

          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B5E3B] text-white hover:bg-[#14462B] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0 active:scale-95"
          >
            <FaWhatsapp className="text-base text-emerald-300" />
            <span>WhatsApp Concierge</span>
          </a>
        </div>

        {/* TRUST GUARANTEES GRID */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#134E2F] text-[#C5A059] flex items-center justify-center mb-4 shadow-xs">
              <FiAward className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1B5E3B] mb-1">
              100% Pure Silk
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Silk Mark Certified
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#134E2F] text-[#C5A059] flex items-center justify-center mb-4 shadow-xs">
              <FiShield className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1B5E3B] mb-1">
              Master Weavers
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Direct Handloom
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#134E2F] text-[#C5A059] flex items-center justify-center mb-4 shadow-xs">
              <FiTruck className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1B5E3B] mb-1">
              Express Delivery
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Insured Shipping
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs hover:shadow-md hover:border-[#C5A059] transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-[#134E2F] text-[#C5A059] flex items-center justify-center mb-4 shadow-xs">
              <FiMessageSquare className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-sm sm:text-base md:text-lg text-[#1B5E3B] mb-1">
              24/7 Concierge
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 font-normal">
              Expert Saree Support
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
