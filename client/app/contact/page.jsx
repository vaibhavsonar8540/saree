"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiHelpCircle,
  FiUser,
  FiTag,
  FiMessageSquare,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { submitContactForm } from "@/service/contactService";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Bridal & Custom Order Inquiry",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const subjectOptions = [
    "Bridal & Custom Order Inquiry",
    "Silk Mark Authenticity & Certification",
    "Order Tracking & Delivery Status",
    "Return, Exchange & Refund Request",
    "Custom Blouse Sizing & Tailoring",
    "Wholesale & Bulk Inquiries",
    "General Inquiry",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (status.type) setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setStatus({ type: "error", message: "Please enter your full name." });
      return;
    }
    if (!formData.email.trim()) {
      setStatus({ type: "error", message: "Please enter your email address." });
      return;
    }
    if (!formData.message.trim()) {
      setStatus({ type: "error", message: "Please enter your message." });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    const result = await submitContactForm(formData);

    setLoading(false);

    if (result.success) {
      setStatus({
        type: "success",
        message: result.message || "Thank you for reaching out! Our saree concierge team will contact you within 24 hours.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Bridal & Custom Order Inquiry",
        message: "",
      });
    } else {
      setStatus({
        type: "error",
        message: result.message || "Something went wrong. Please try again or contact us on WhatsApp.",
      });
    }
  };

  return (
    <main className="w-full bg-[#F5F2EB] min-h-screen py-10 sm:py-16 lg:py-20 text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-[#1B5E3B] transition-colors">
            Home
          </Link>
          <span className="mx-2 text-[#C5A059]">•</span>
          <span className="text-[#1B5E3B] font-bold">Contact Concierge</span>
        </nav>

        {/* HEADER HERO */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C5A059]/40 shadow-2xs mb-3">
            <FiHelpCircle className="text-[#C5A059] text-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#1B5E3B]">
              PERSONALIZED ASSISTANCE
            </span>
          </div>

          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1B5E3B] tracking-tight leading-tight">
            Connect With Our Saree Concierge
          </h1>

          <p className="text-xs sm:text-base text-zinc-600 mt-3 font-normal leading-relaxed">
            Whether you need assistance choosing pure silk drapes, verifying Silk Mark tags, or scheduling custom blouse tailoring, our concierge is at your service.
          </p>

          <div className="w-16 h-0.5 bg-[#C5A059] mx-auto mt-4 rounded-full" />
        </div>

        {/* TWO COLUMN CONTAINER: LEFT INFO (5 cols) | RIGHT FORM (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDE: CONTACT INFORMATION & BOUTIQUE DETAILS */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* BOUTIQUE DETAILS CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/40 shadow-md space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

              <div className="border-b border-stone-100 pb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] block mb-1">
                  HERITAGE FLAGSHIP STUDIO
                </span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1B5E3B]">
                  Anjali Creation Boutique
                </h2>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-zinc-700">
                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] text-[#1B5E3B] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                    <FiPhone className="text-base text-[#1B5E3B]" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-0.5">Phone & Customer Care</p>
                    <p className="text-zinc-600 font-normal">+91 98765 43210 / +91 261 2345678</p>
                    <p className="text-[11px] text-[#C5A059] font-semibold mt-0.5">Mon - Sat: 10:00 AM – 8:00 PM IST</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] text-[#1B5E3B] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                    <FiMail className="text-base text-[#1B5E3B]" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-0.5">Direct Email</p>
                    <p className="text-zinc-600 font-normal">concierge@anjalicreation.com</p>
                    <p className="text-zinc-600 font-normal">support@anjalicreation.com</p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F2EB] text-[#1B5E3B] flex items-center justify-center shrink-0 border border-[#C5A059]/30">
                    <FiClock className="text-base text-[#1B5E3B]" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 mb-0.5">Operating Hours</p>
                    <p className="text-zinc-600 font-normal">Monday – Saturday: 10:00 AM – 8:00 PM</p>
                    <p className="text-zinc-500 font-normal">Sunday: By Appointment Only</p>
                  </div>
                </div>
              </div>

              {/* INSTANT WHATSAPP BUTTON */}
              <div className="pt-2 border-t border-stone-100">
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#1B5E3B] text-white hover:bg-[#14462B] font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <FaWhatsapp className="text-lg text-emerald-300" />
                  <span>Instant WhatsApp Concierge</span>
                </a>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: CONTACT FORM */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#C5A059]/30 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#C5A059]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] block mb-1">
                SEND AN INQUIRY
              </span>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1B5E3B]">
                How May We Assist You?
              </h2>
            </div>

            {/* STATUS NOTIFICATION BANNER */}
            {status.type === "success" && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                <FiCheckCircle className="text-xl text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-medium leading-relaxed">
                  {status.message}
                </div>
              </div>
            )}

            {status.type === "error" && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                <FiAlertCircle className="text-xl text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-medium leading-relaxed">
                  {status.message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                    <FiUser className="text-[#C5A059]" />
                    <span>Your Full Name</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Radhika Sharma"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EB]/50 border border-stone-200 focus:border-[#C5A059] focus:bg-white focus:outline-none text-xs sm:text-sm text-zinc-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                    <FiMail className="text-[#C5A059]" />
                    <span>Email Address</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. radhika@example.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EB]/50 border border-stone-200 focus:border-[#C5A059] focus:bg-white focus:outline-none text-xs sm:text-sm text-zinc-800 transition-all"
                  />
                </div>
              </div>

              {/* Phone & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                    <FiPhone className="text-[#C5A059]" />
                    <span>Phone / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EB]/50 border border-stone-200 focus:border-[#C5A059] focus:bg-white focus:outline-none text-xs sm:text-sm text-zinc-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                    <FiTag className="text-[#C5A059]" />
                    <span>Subject / Topic</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F2EB]/50 border border-stone-200 focus:border-[#C5A059] focus:bg-white focus:outline-none text-xs sm:text-sm text-zinc-800 transition-all cursor-pointer"
                  >
                    {subjectOptions.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Details */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                  <FiMessageSquare className="text-[#C5A059]" />
                  <span>Message Details</span>
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you with your drape selection, order customizations, or delivery inquiries..."
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F2EB]/50 border border-stone-200 focus:border-[#C5A059] focus:bg-white focus:outline-none text-xs sm:text-sm text-zinc-800 transition-all resize-y"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1B5E3B] text-white hover:bg-[#14462B] font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Inquiry...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-sm" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </main>
  );
}
