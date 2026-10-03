"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiHome,
  FiNavigation,
  FiHash,
  FiCreditCard,
  FiMapPin,
} from "react-icons/fi";
import { getIndianStates, getCitiesForState } from "@/utils/indianStatesCities";

export default function ShippingForm({
  initialValues = {},
  onSubmitOrder,
  isSubmitting = false,
}) {
  const [formData, setFormData] = useState({
    fullName: initialValues.fullName || "",
    email: initialValues.email || "",
    phone: initialValues.phone || "",
    country: "India", // Read-only / disabled
    state: initialValues.state || "",
    city: initialValues.city || "",
    addressLine: initialValues.addressLine || "",
    roadArea: initialValues.roadArea || "",
    pincode: initialValues.pincode || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const indianStates = getIndianStates();
  const availableCities = formData.state ? getCitiesForState(formData.state) : [];

  // Refs for scrolling to first error field
  const fieldRefs = {
    fullName: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    state: useRef(null),
    city: useRef(null),
    addressLine: useRef(null),
    roadArea: useRef(null),
    pincode: useRef(null),
  };

  // Sync state if user changes state -> reset city if city not in new state
  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: selectedState,
      city: "", // reset city when state changes
    }));

    validateField("state", selectedState);
    validateField("city", "");
  };

  const validateField = (fieldName, value) => {
    let errorMsg = "";

    switch (fieldName) {
      case "fullName":
        if (!value || !value.trim()) {
          errorMsg = "Full name is required";
        } else if (value.trim().length < 2) {
          errorMsg = "Name must be at least 2 characters";
        }
        break;

      case "email":
        if (!value || !value.trim()) {
          errorMsg = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errorMsg = "Enter a valid email address";
        }
        break;

      case "phone":
        if (!value || !value.trim()) {
          errorMsg = "Phone number is required";
        } else if (!/^[6-9]\d{9}$/.test(value.trim())) {
          errorMsg = "Enter valid 10-digit Indian mobile number (starts 6-9)";
        }
        break;

      case "state":
        if (!value) {
          errorMsg = "Please select a state";
        }
        break;

      case "city":
        if (!value) {
          errorMsg = "Please select a city";
        }
        break;

      case "addressLine":
        if (!value || !value.trim()) {
          errorMsg = "Flat/Building address is required";
        }
        break;

      case "roadArea":
        if (!value || !value.trim()) {
          errorMsg = "Road/Area/Street details required";
        }
        break;

      case "pincode":
        if (!value || !value.trim()) {
          errorMsg = "Pincode is required";
        } else if (!/^\d{6}$/.test(value.trim())) {
          errorMsg = "Pincode must be exactly 6 digits";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));

    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, formData[fieldName]);
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;
    let firstInvalidField = null;

    const fieldsToValidate = [
      "fullName",
      "email",
      "phone",
      "state",
      "city",
      "addressLine",
      "roadArea",
      "pincode",
    ];

    fieldsToValidate.forEach((field) => {
      let errorMsg = "";
      const val = formData[field];

      if (field === "fullName") {
        if (!val || !val.trim()) errorMsg = "Full name is required";
        else if (val.trim().length < 2) errorMsg = "Name must be at least 2 characters";
      } else if (field === "email") {
        if (!val || !val.trim()) errorMsg = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) errorMsg = "Enter a valid email address";
      } else if (field === "phone") {
        if (!val || !val.trim()) errorMsg = "Phone number is required";
        else if (!/^[6-9]\d{9}$/.test(val.trim())) errorMsg = "Enter valid 10-digit Indian mobile (starts 6-9)";
      } else if (field === "state") {
        if (!val) errorMsg = "Please select a state";
      } else if (field === "city") {
        if (!val) errorMsg = "Please select a city";
      } else if (field === "addressLine") {
        if (!val || !val.trim()) errorMsg = "Address is required";
      } else if (field === "roadArea") {
        if (!val || !val.trim()) errorMsg = "Road/Area is required";
      } else if (field === "pincode") {
        if (!val || !val.trim()) errorMsg = "Pincode is required";
        else if (!/^\d{6}$/.test(val.trim())) errorMsg = "Pincode must be exactly 6 digits";
      }

      if (errorMsg) {
        newErrors[field] = errorMsg;
        isValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      state: true,
      city: true,
      addressLine: true,
      roadArea: true,
      pincode: true,
    });

    if (!isValid && firstInvalidField && fieldRefs[firstInvalidField]?.current) {
      fieldRefs[firstInvalidField].current.focus();
      fieldRefs[firstInvalidField].current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      onSubmitOrder(formData);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-stone-200/90 shadow-sm space-y-6">
      {/* Heading */}
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center gap-2.5">
          <FiMapPin className="w-5 h-5 text-[#1B5E3B]" />
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#222222]">
            Shipping Address
          </h2>
        </div>
        <p className="text-xs text-zinc-500 mt-1">
          Required fields are marked with (<span className="text-rose-600 font-bold">*</span>)
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* ROW 1: Full Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* FULL NAME */}
          <div className="space-y-1.5">
            <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Full Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                ref={fieldRefs.fullName}
                id="fullName"
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                onBlur={() => handleBlur("fullName")}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                  errors.fullName
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                    : "border-stone-300 focus:border-[#1B5E3B]"
                }`}
              />
            </div>
            {errors.fullName && (
              <p id="fullName-error" className="text-xs text-rose-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* EMAIL ADDRESS */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                ref={fieldRefs.email}
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                    : "border-stone-300 focus:border-[#1B5E3B]"
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-xs text-rose-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* ROW 2: Phone & Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* PHONE NUMBER */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Phone Number <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                ref={fieldRefs.phone}
                id="phone"
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  handleChange("phone", cleaned);
                }}
                onBlur={() => handleBlur("phone")}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                  errors.phone
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                    : "border-stone-300 focus:border-[#1B5E3B]"
                }`}
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="text-xs text-rose-600 font-medium">
                {errors.phone}
              </p>
            )}
          </div>

          {/* COUNTRY (Read-only / Disabled) */}
          <div className="space-y-1.5">
            <label htmlFor="country" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Country <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiGlobe className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                id="country"
                type="text"
                value={formData.country}
                readOnly
                disabled
                className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-stone-100 border border-stone-200 text-zinc-500 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* ROW 3: State & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* STATE DROPDOWN */}
          <div className="space-y-1.5">
            <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              State <span className="text-rose-600">*</span>
            </label>
            <select
              ref={fieldRefs.state}
              id="state"
              value={formData.state}
              onChange={handleStateChange}
              onBlur={() => handleBlur("state")}
              aria-invalid={!!errors.state}
              aria-describedby={errors.state ? "state-error" : undefined}
              className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                errors.state
                  ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                  : "border-stone-300 focus:border-[#1B5E3B]"
              }`}
            >
              <option value="">Select Indian State</option>
              {indianStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.state && (
              <p id="state-error" className="text-xs text-rose-600 font-medium">
                {errors.state}
              </p>
            )}
          </div>

          {/* CITY DROPDOWN */}
          <div className="space-y-1.5">
            <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              City <span className="text-rose-600">*</span>
            </label>
            <select
              ref={fieldRefs.city}
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              onBlur={() => handleBlur("city")}
              disabled={!formData.state}
              aria-invalid={!!errors.city}
              aria-describedby={errors.city ? "city-error" : undefined}
              className={`w-full px-4 py-3 text-xs sm:text-sm rounded-xl border transition-colors text-zinc-900 focus:outline-none ${
                !formData.state
                  ? "bg-stone-100 border-stone-200 text-zinc-400 cursor-not-allowed"
                  : errors.city
                  ? "bg-rose-50/20 border-rose-500 focus:border-rose-600"
                  : "bg-white border-stone-300 focus:border-[#1B5E3B]"
              }`}
            >
              <option value="">
                {formData.state ? "Select City" : "Select state first"}
              </option>
              {availableCities.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
            {errors.city && (
              <p id="city-error" className="text-xs text-rose-600 font-medium">
                {errors.city}
              </p>
            )}
          </div>
        </div>

        {/* ADDRESS (Flat, House No, Building) */}
        <div className="space-y-1.5">
          <label htmlFor="addressLine" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
            Address (Flat, House No, Building) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <FiHome className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
            <input
              ref={fieldRefs.addressLine}
              id="addressLine"
              type="text"
              placeholder="e.g. Flat 402, Sunshine Apartments"
              value={formData.addressLine}
              onChange={(e) => handleChange("addressLine", e.target.value)}
              onBlur={() => handleBlur("addressLine")}
              aria-invalid={!!errors.addressLine}
              aria-describedby={errors.addressLine ? "addressLine-error" : undefined}
              className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                errors.addressLine
                  ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                  : "border-stone-300 focus:border-[#1B5E3B]"
              }`}
            />
          </div>
          {errors.addressLine && (
            <p id="addressLine-error" className="text-xs text-rose-600 font-medium">
              {errors.addressLine}
            </p>
          )}
        </div>

        {/* ROW 4: Road / Area & Pincode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* ROAD / AREA / STREET */}
          <div className="space-y-1.5">
            <label htmlFor="roadArea" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Road / Area / Street <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiNavigation className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                ref={fieldRefs.roadArea}
                id="roadArea"
                type="text"
                placeholder="e.g. MG Road, Sector 15"
                value={formData.roadArea}
                onChange={(e) => handleChange("roadArea", e.target.value)}
                onBlur={() => handleBlur("roadArea")}
                aria-invalid={!!errors.roadArea}
                aria-describedby={errors.roadArea ? "roadArea-error" : undefined}
                className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                  errors.roadArea
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                    : "border-stone-300 focus:border-[#1B5E3B]"
                }`}
              />
            </div>
            {errors.roadArea && (
              <p id="roadArea-error" className="text-xs text-rose-600 font-medium">
                {errors.roadArea}
              </p>
            )}
          </div>

          {/* PINCODE */}
          <div className="space-y-1.5">
            <label htmlFor="pincode" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
              Pincode / Postal Code <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <FiHash className="absolute left-3.5 top-3.5 text-zinc-400 w-4 h-4 pointer-events-none" />
              <input
                ref={fieldRefs.pincode}
                id="pincode"
                type="text"
                maxLength={6}
                placeholder="e.g. 400001"
                value={formData.pincode}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  handleChange("pincode", cleaned);
                }}
                onBlur={() => handleBlur("pincode")}
                aria-invalid={!!errors.pincode}
                aria-describedby={errors.pincode ? "pincode-error" : undefined}
                className={`w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-white border transition-colors text-zinc-900 focus:outline-none ${
                  errors.pincode
                    ? "border-rose-500 focus:border-rose-600 bg-rose-50/20"
                    : "border-stone-300 focus:border-[#1B5E3B]"
                }`}
              />
            </div>
            {errors.pincode && (
              <p id="pincode-error" className="text-xs text-rose-600 font-medium">
                {errors.pincode}
              </p>
            )}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-2xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <FiCreditCard className="w-4 h-4" />
                <span>Place Order &rarr;</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
