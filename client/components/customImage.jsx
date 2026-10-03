"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const CustomImage = ({
  src,
  srcAttr,
  alt = "",
  altAttr,
  title,
  titleAttr,
  width,
  height,
  fill,
  priority = false,
  quality = 85,
  sizes,
  className = "",
  containerClassName = "",
  objectFit = "cover",
  unoptimized,
  fallbackSrc = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
  ...props
}) => {
  const initialSrc = srcAttr || src;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(initialSrc);
    setHasError(false);
  }, [initialSrc]);

  if (!initialSrc && !fallbackSrc) return null;

  const finalAlt = altAttr || alt || "Saree Elegance Product Image";
  const finalTitle = titleAttr || title;

  // Determine if fill should be used
  const isFill = fill !== undefined
    ? Boolean(fill)
    : (width === undefined && height === undefined && typeof initialSrc !== "object");

  // Auto-detect if external domain URL
  const isExternal = typeof imgSrc === "string" && (imgSrc.startsWith("http://") || imgSrc.startsWith("https://"));
  const isUnoptimized = unoptimized !== undefined ? unoptimized : isExternal;

  const isStaticObject = typeof (imgSrc || initialSrc) === "object" && (imgSrc || initialSrc)?.src;

  return (
    <div
      className={`relative overflow-hidden ${
        isFill ? "w-full h-full min-h-[40px]" : "w-full"
      } ${containerClassName}`}
    >
      <Image
        src={hasError ? fallbackSrc : (imgSrc || initialSrc)}
        alt={finalAlt}
        title={finalTitle}
        {...(isFill
          ? { fill: true }
          : isStaticObject
          ? {} // Static imports supply their own width/height to Next.js Image
          : { width: width || 1200, height: height || 600 })}
        priority={priority}
        quality={quality}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"}
        className={`transition-all duration-300 ${
          isFill ? `object-${objectFit}` : "w-full h-auto"
        } ${className}`}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
          }
        }}
        unoptimized={isUnoptimized}
        {...props}
      />
    </div>
  );
};

export default CustomImage;