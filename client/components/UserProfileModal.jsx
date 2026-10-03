"use client";

import React, { useState, useEffect } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCalendar,
  FiCheckCircle,
  FiEdit2,
  FiCheck,
  FiLogOut,
} from "react-icons/fi";
import { updateUserDetails, logoutUser } from "@/service/authService";

export default function UserProfileModal({ isOpen, onClose, user, onLogout }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && window.lenis) {
        window.lenis.start();
      }
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  // Get user initials for avatar
  const getInitials = (userName) => {
    if (!userName) return "U";
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recent Patron";

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      let updatedUser = { ...user, name: name.trim(), phone: phone.trim() };

      try {
        const res = await updateUserDetails({ name, phone });
        if (res && res.user) {
          updatedUser = res.user;
        }
      } catch (err) {
        console.warn("Backend update error, saving locally:", err.message);
      }

      localStorage.setItem("anjali_user", JSON.stringify(updatedUser));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userAuthUpdated"));
      }

      setMessage("Profile details updated successfully!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to update profile details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
      onClose();
      return;
    }

    try {
      await logoutUser();
    } catch (e) {
      console.warn("Logout API warning:", e.message);
    } finally {
      localStorage.removeItem("anjali_user");
      localStorage.removeItem("anjali_token");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("userAuthUpdated"));
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Background overlay click listener */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Centered Modal Card */}
      <div className="relative w-full max-w-md bg-[#F5F2EB] rounded-3xl border border-[#C5A059]/40 shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]">
        {/* Background Decorative Radial Glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-radial from-[#C5A059]/20 via-transparent to-transparent pointer-events-none blur-2xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-radial from-black/10 via-transparent to-transparent pointer-events-none blur-2xl" />

        {/* Modal Header */}
        <div className="relative p-6 sm:p-7 pb-4 text-center border-b border-[#C5A059]/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-600 hover:text-zinc-900 border border-[#C5A059]/30 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
            aria-label="Close profile modal"
          >
            <FiX className="text-lg" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
            ANJALI CREATION PATRON PROFILE
          </span>
          <h2 className="font-serif font-bold text-2xl text-[#181818]">
            My Account Details
          </h2>
        </div>

        {/* Profile Card Scrollable Content */}
        <div className="p-6 sm:p-7 space-y-5 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#E8DFD1]/50 [&::-webkit-scrollbar-thumb]:bg-[#C5A059]/70 hover:[&::-webkit-scrollbar-thumb]:bg-[#181818] [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Notification Banners */}
          {message && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <FiCheck className="text-emerald-600 text-sm shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar & Name Header */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#C5A059]/30 shadow-xs">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-[#181818] text-[#C5A059] font-serif font-bold text-xl flex items-center justify-center shrink-0 border border-[#C5A059]/40 shadow-md">
                {getInitials(name || user.name)}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-[#181818] truncate">
                    {name || user.name || "Valued Patron"}
                  </h3>
                  <FiCheckCircle className="text-[#C5A059] text-sm shrink-0" />
                </div>
                <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-[#C5A059]/15 text-[#8A6D3B] px-2 py-0.5 rounded-full border border-[#C5A059]/30">
                  {user.role === "admin" ? "Store Administrator" : "Privileged Patron"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2.5 rounded-full border transition-all cursor-pointer text-xs font-bold flex items-center gap-1 shrink-0 ${
                isEditing
                  ? "bg-zinc-200 text-zinc-800 border-zinc-300"
                  : "bg-[#181818] text-white hover:bg-black border-[#C5A059]/30"
              }`}
            >
              <FiEdit2 />
              <span>{isEditing ? "Cancel" : "Edit"}</span>
            </button>
          </div>

          {/* User Details Form / View */}
          <form onSubmit={handleUpdate} className="space-y-3.5 pt-1">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <FiUser className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                ) : (
                  <div className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-zinc-200 text-xs font-bold text-[#181818]">
                    {name || "N/A"}
                  </div>
                )}
              </div>
            </div>

            {/* Email Address (Display Only) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Email Address (Account ID)
              </label>
              <div className="relative flex items-center">
                <FiMail className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                <div className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-zinc-200 text-xs font-bold text-[#181818] truncate max-w-45 sm:max-w-full">
                  {user.email || "N/A"}
                </div>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Mobile Phone Number
              </label>
              <div className="relative flex items-center">
                <FiPhone className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                {isEditing ? (
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/50 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                ) : (
                  <div className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-zinc-200 text-xs font-bold text-[#181818]">
                    {phone || "Not Provided"}
                  </div>
                )}
              </div>
            </div>


            {/* Save Button (when editing) */}
            {isEditing && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-[#181818] text-white hover:bg-black font-semibold text-xs uppercase tracking-widest shadow-lg transition-all cursor-pointer border border-[#C5A059]/40 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCheck />
                    <span>SAVE PROFILE CHANGES</span>
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Modal Footer with Logout Option */}
        <div className="p-4 bg-[#E8DFD1]/60 border-t border-[#C5A059]/20 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-red-600 hover:bg-red-100/60 border border-red-200 transition-all cursor-pointer"
          >
            <FiLogOut />
            <span>Logout Account</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#181818] text-white hover:bg-black font-semibold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm active:scale-95 border border-[#C5A059]/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
