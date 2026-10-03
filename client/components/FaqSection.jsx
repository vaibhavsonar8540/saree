"use client";

import React, { useState } from "react";
import {
  FiChevronDown,
  FiHelpCircle,
  FiAward,
  FiTruck,
  FiShield,
  FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";



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
  const [openFaqId, setOpenFaqId] = useState(1); // Default first open

  const toggleFaq = (id) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  // Trigger Lenis smooth scroll resize when accordion changes
  React.useEffect(() => {
    const handleResizeScroll = () => {
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.resize();
      }
    };

    handleResizeScroll();
    const timer1 = setTimeout(handleResizeScroll, 150);
    const timer2 = setTimeout(handleResizeScroll, 350);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [openFaqId]);

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F2EB] relative overflow-hidden border-t border-[#C5A059]/30">
      {/* Background Soft Glow Effects */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-radial from-[#1B5E3B]/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C5A059]/40 shadow-xs mb-3">
            <FiHelpCircle className="text-[#C5A059] text-xs" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#1B5E3B]">
              HELP & TRANSPARENCY
            </span>
          </div>

          <h2 className="font-serif font-bold text-2xl sm:text-3xl md:text-4xl text-[#1B5E3B] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="text-xs sm:text-base text-zinc-600 mt-2.5 font-normal leading-relaxed max-w-xl mx-auto">
            Everything you need to know about our silk mark authenticity guarantees, worldwide delivery, and easy returns.
          </p>

          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-4 rounded-full" />
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="space-y-4">
          {faqData.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "bg-white border-[#C5A059] shadow-lg"
                    : "bg-white/80 hover:bg-white border-[#C5A059]/30 hover:border-[#C5A059]/60 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none cursor-pointer group"
                >
                  <span className="font-serif font-bold text-base sm:text-lg text-[#222222] group-hover:text-[#1B5E3B] transition-colors pr-4 leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-[#1B5E3B] text-white rotate-180"
                        : "bg-[#F5F2EB] text-[#1B5E3B] group-hover:bg-[#C5A059]/20"
                    }`}
                  >
                    <FiChevronDown className="text-base" />
                  </div>
                </button>

                {/* ACCORDION CONTENT (Smooth Grid transition) */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-stone-100">
                      <p className="pt-3 font-normal">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* STILL HAVE QUESTIONS ASSISTANCE BAR */}
        <div className="mt-12 sm:mt-16 bg-white p-6 sm:p-8 rounded-3xl border border-[#C5A059]/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg sm:text-xl text-[#1B5E3B]">
              Still Have Questions?
            </h4>
            <p className="text-xs text-zinc-500 max-w-md">
              Our saree concierge team is available to help you with silk certification details, order tracking, and custom blouse sizing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#1B5E3B] text-white hover:bg-[#14462B] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <FaWhatsapp className="text-base text-emerald-300" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* TRUST GUARANTEES VERTICAL CARDS (Placed below FAQ) */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1 */}
          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-[#C5A059]/30 shadow-2xs hover:shadow-xl hover:border-[#C5A059] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5E3B] text-[#C5A059] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 border border-[#C5A059]/30 mb-4">
              <FiAward className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B] tracking-tight group-hover:text-[#C5A059] transition-colors mb-1">
              100% Pure Silk Certified
            </h4>
            <p className="text-xs text-zinc-600 leading-snug font-normal">
              Authentic Silk Mark Guarantee
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-[#C5A059]/30 shadow-2xs hover:shadow-xl hover:border-[#C5A059] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5E3B] text-[#C5A059] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 border border-[#C5A059]/30 mb-4">
              <FiShield className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B] tracking-tight group-hover:text-[#C5A059] transition-colors mb-1">
              Generational Weavers
            </h4>
            <p className="text-xs text-zinc-600 leading-snug font-normal">
              Direct Handloom Sourcing
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-[#C5A059]/30 shadow-2xs hover:shadow-xl hover:border-[#C5A059] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5E3B] text-[#C5A059] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 border border-[#C5A059]/30 mb-4">
              <FiTruck className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B] tracking-tight group-hover:text-[#C5A059] transition-colors mb-1">
              Express Global Delivery
            </h4>
            <p className="text-xs text-zinc-600 leading-snug font-normal">
              Insured Worldwide Shipping
            </p>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col items-center text-center p-6 sm:p-7 rounded-3xl bg-white border border-[#C5A059]/30 shadow-2xs hover:shadow-xl hover:border-[#C5A059] transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-[#1B5E3B] text-[#C5A059] flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300 border border-[#C5A059]/30 mb-4">
              <FiMessageSquare className="text-2xl" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#1B5E3B] tracking-tight group-hover:text-[#C5A059] transition-colors mb-1">
              24/7 Styling Concierge
            </h4>
            <p className="text-xs text-zinc-600 leading-snug font-normal">
              Expert Saree Draping Advice
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
