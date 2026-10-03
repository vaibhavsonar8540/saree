"use client";

import React from "react";
import Link from "next/link";
import { FiLoader } from "react-icons/fi";

const getVariantClass = (variant = "") => {
  switch (variant) {
    case "primary":
      return "bg-[#1B5E3B] text-[#F5F2EB] border border-[#1B5E3B] hover:bg-[#14462B] hover:border-[#14462B] shadow-md shadow-[#1B5E3B]/20 active:scale-[0.98]";

    case "primaryHover":
      return "bg-[#F5F2EB] border border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#14462B] hover:border-[#14462B] hover:text-[#F5F2EB] shadow-xs active:scale-[0.98]";

    case "secondary":
    case "gold":
      return "bg-[#C5A059] text-[#222222] border border-[#C5A059] hover:bg-[#b08d48] hover:border-[#b08d48] shadow-sm font-bold active:scale-[0.98]";

    case "secondaryHover":
      return "bg-transparent border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#222222] active:scale-[0.98]";

    case "outline":
      return "bg-transparent border border-[#1B5E3B]/40 text-[#1B5E3B] hover:border-[#1B5E3B] hover:bg-[#1B5E3B]/10 active:scale-[0.98]";

    case "ghost":
      return "bg-transparent text-[#1B5E3B] hover:bg-[#1B5E3B]/10 active:scale-[0.98]";

    case "white":
      return "bg-[#F5F2EB] border border-[#C5A059]/30 text-[#1B5E3B] hover:bg-white shadow-md active:scale-[0.98]";

    case "whiteHover":
      return "bg-transparent border border-[#F5F2EB] text-[#F5F2EB] hover:bg-[#F5F2EB] hover:text-[#1B5E3B] active:scale-[0.98]";

    case "dark":
      return "bg-[#222222] border border-zinc-800 text-[#F5F2EB] hover:bg-black active:scale-[0.98]";

    default:
      return "bg-[#1B5E3B] text-[#F5F2EB] border border-[#1B5E3B] hover:bg-[#14462B] hover:border-[#14462B] shadow-sm active:scale-[0.98]";
  }
};

const getSizeClass = (size = "md") => {
  switch (size) {
    case "sm":
      return "px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5";
    case "lg":
      return "px-7 py-3.5 text-sm sm:text-base font-bold rounded-2xl gap-2.5";
    case "md":
    default:
      return "px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl gap-2";
  }
};

export const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "right",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4a1f2d]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none ${getVariantClass(
        variant
      )} ${getSizeClass(size)} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <FiLoader className="animate-spin text-base shrink-0" />
      ) : (
        <>
          {Icon && iconPosition === "left" && <Icon className="shrink-0 text-base" />}
          <span>{children}</span>
          {Icon && iconPosition === "right" && <Icon className="shrink-0 text-base" />}
        </>
      )}
    </button>
  );
};

export const LinkButton = ({
  children,
  href = "",
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon: Icon,
  iconPosition = "right",
  ...props
}) => {
  return (
    <Link
      href={href || "#"}
      className={`inline-flex items-center justify-center font-sans tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#4a1f2d]/30 ${getVariantClass(
        variant
      )} ${getSizeClass(size)} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {Icon && iconPosition === "left" && <Icon className="shrink-0 text-base" />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && <Icon className="shrink-0 text-base" />}
    </Link>
  );
};

export default Button;