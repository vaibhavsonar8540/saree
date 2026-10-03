"use client";

import React, { useState, useEffect } from "react";
import {
  FiX,
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { loginUser, registerUser } from "@/service/authService";

export default function AuthModal({ isOpen, onClose, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab); // "login" | "register"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: true,
  });

  const [error, setError] = useState("");

  // Synchronize initialTab state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setError("");
      setIsSuccess(false);
    }
  }, [isOpen, initialTab]);

  // Disable background scrolling & stop Lenis smooth scroll while modal is open
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

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (response && response.success) {
        if (response.user) {
          localStorage.setItem("anjali_user", JSON.stringify(response.user));
        }
        if (response.token) {
          localStorage.setItem("anjali_token", response.token);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userAuthUpdated"));
        }
        setIsSuccess(true);
        setSuccessMessage(
          response.message || "Welcome back! You have successfully signed in."
        );
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(response?.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login API Error:", err);
      const apiErrorMessage =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please verify your credentials.";
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !registerData.fullName ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password
    ) {
      setError("Please fill in name, email, phone number, and password.");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    if (!registerData.agreeTerms) {
      setError("You must agree to the Terms & Privacy Policy.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: registerData.fullName.trim(),
        email: registerData.email.trim(),
        phone: registerData.phone.trim(),
        password: registerData.password,
        role: "user",
      });

      if (response && response.success) {
        if (response.user) {
          localStorage.setItem("anjali_user", JSON.stringify(response.user));
        }
        if (response.token) {
          localStorage.setItem("anjali_token", response.token);
        }
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("userAuthUpdated"));
        }
        setIsSuccess(true);
        setSuccessMessage(
          response.message ||
            "Account created successfully! Welcome to Anjali Creation."
        );
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 1500);
      } else {
        setError(response?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Register API Error:", err);
      const apiErrorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please verify your details.";
      setError(apiErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Background click listener to close */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#F5F2EB] rounded-3xl border border-[#C5A059]/40 shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col">
        {/* Background Decorative Radial Glows */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-radial from-[#C5A059]/15 via-transparent to-transparent pointer-events-none blur-2xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-radial from-black/10 via-transparent to-transparent pointer-events-none blur-2xl" />

        {/* Modal Header & Close Button */}
        <div className="relative p-6 sm:p-7 pb-4 text-center shrink-0 border-b border-[#C5A059]/20">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-zinc-600 hover:text-zinc-900 border border-[#C5A059]/30 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 z-20"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
            ANJALI CREATION PATRON PORTAL
          </span>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#181818]">
            {activeTab === "login" ? "Welcome Back" : "Begin Your Journey"}
          </h2>
          <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto font-normal">
            {activeTab === "login"
              ? "Sign in to access your curated wishlist, order tracking, and exclusive previews."
              : "Create an account to experience generational handloom saree luxury."}
          </p>

          {/* TAB SWITCHER PILLS */}
          <div className="mt-5 p-1 rounded-full bg-white border border-[#C5A059]/30 inline-flex items-center w-full max-w-xs shadow-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
              className={`w-1/2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "login"
                  ? "bg-[#181818] text-white shadow-md"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
              className={`w-1/2 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "register"
                  ? "bg-[#181818] text-white shadow-md"
                  : "text-zinc-600 hover:text-black"
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body with Vertical Scrollbar */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 pr-4 sm:pr-6 pl-6 sm:pl-8 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#E8DFD1]/50 [&::-webkit-scrollbar-thumb]:bg-[#C5A059]/70 hover:[&::-webkit-scrollbar-thumb]:bg-[#181818] [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS STATE */}
          {isSuccess ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#181818] text-white flex items-center justify-center text-2xl mb-4 shadow-xl border border-[#C5A059]/40 animate-bounce">
                <FiCheck />
              </div>
              <h3 className="font-serif font-bold text-xl text-[#181818]">
                {successMessage}
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Redirecting you to your experience...
              </p>
            </div>
          ) : activeTab === "login" ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email / Mobile Field */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Password reset functionality will be enabled shortly.")}
                    className="text-[11px] font-semibold text-black hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <FiLock className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        rememberMe: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300 accent-black cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#181818] text-white hover:bg-black font-semibold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98 border border-[#C5A059]/40 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>SIGN IN TO YOUR ACCOUNT</span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>

              {/* Toggle to Register */}
              <div className="text-center pt-3 border-t border-zinc-200">
                <p className="text-xs text-zinc-600">
                  New to Anjali Creation?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("register");
                      setError("");
                    }}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Create an Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Full Name *
                </label>
                <div className="relative flex items-center">
                  <FiUser className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={registerData.fullName}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Email Address *
                </label>
                <div className="relative flex items-center">
                  <FiMail className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Mobile Phone Number *
                </label>
                <div className="relative flex items-center">
                  <FiPhone className="absolute left-3.5 text-zinc-400 text-sm pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                  />
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Password *
                  </label>
                  <div className="relative flex items-center">
                    <FiLock className="absolute left-3 text-zinc-400 text-xs pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 6 chars"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <FiLock className="absolute left-3 text-zinc-400 text-xs pointer-events-none" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat password"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full pl-8 pr-8 py-2.5 rounded-xl bg-white border border-[#C5A059]/40 text-xs text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="text-xs" />
                      ) : (
                        <FiEye className="text-xs" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 text-[11px] text-zinc-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={registerData.agreeTerms}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        agreeTerms: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-black focus:ring-black border-zinc-300 accent-black mt-0.5 cursor-pointer shrink-0"
                  />
                  <span className="leading-snug">
                    I agree to the{" "}
                    <span className="font-semibold text-black underline">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-black underline">
                      Privacy Policy
                    </span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#181818] text-white hover:bg-black font-semibold text-xs uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98 border border-[#C5A059]/40 flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>CREATE MY ACCOUNT</span>
                    <FiArrowRight className="text-sm" />
                  </>
                )}
              </button>

              {/* Toggle to Login */}
              <div className="text-center pt-3 border-t border-zinc-200">
                <p className="text-xs text-zinc-600">
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("login");
                      setError("");
                    }}
                    className="font-bold text-black hover:underline cursor-pointer"
                  >
                    Sign In Instead
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer / Guarantee Badge */}
        <div className="px-6 py-3 bg-[#E8DFD1]/60 border-t border-[#C5A059]/20 text-center flex items-center justify-center gap-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider shrink-0">
          <FiShield className="text-[#C5A059] text-xs" />
          <span>256-Bit Encrypted Secure Authentication</span>
        </div>
      </div>
    </div>
  );
}
