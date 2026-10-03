"use client";

import { LinkButton } from "./Buttons";
import CustomImage from "./customImage";

const HeroBanner = ({
  badge = "",
  title = "",
  desc = "",
  titleClass,
  descClass,
  badgeClass,
  btnText = "",
  secondaryBtnText = "",
  className = "",
  btnClassName = "",
  secondaryBtnClassName = "",
  href = "",
  secondaryHref = "",
  src = "",
  srcAttr = "",
  mobileSrc = "",
  altAttr = "Hero Saree Banner",
  titleAttr = "",
  contentClass = "",
  variant = "primary",
  size = "lg",
  overlay,
  overlayClass = "",
  overlayOpacity = "",
  align = "left", // 'left' or 'center'
}) => {
  const desktopSrc = srcAttr || src;
  const hasImage = Boolean(desktopSrc || mobileSrc);
  const hasContent = Boolean(title || desc || badge || btnText || secondaryBtnText);

  const isCenter = align === "center";

  // Default Overlay: if overlayClass is passed, use overlayClass. Otherwise fallback to dark gradient or light overlay
  const defaultOverlayClass = isCenter
    ? "bg-black/45 bg-linear-to-t from-black/70 via-black/40 to-black/30"
    : "bg-linear-to-r from-[#F5F2EB]/95 via-[#F5F2EB]/75 to-transparent";

  const showOverlay = overlay !== undefined ? overlay : (hasImage && hasContent);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Full-width Base Banner Image */}
      {desktopSrc && (
        <CustomImage
          srcAttr={desktopSrc}
          altAttr={altAttr}
          titleAttr={titleAttr}
          priority
          fill={false}
          containerClassName={mobileSrc ? "hidden lg:block w-full" : "w-full"}
          className="w-full h-auto object-cover min-h-[500px] sm:min-h-[580px] lg:min-h-[660px]"
        />
      )}

      {mobileSrc && (
        <CustomImage
          srcAttr={mobileSrc}
          altAttr={altAttr}
          titleAttr={titleAttr}
          priority
          fill={false}
          containerClassName="block lg:hidden w-full"
          className="w-full h-auto object-cover min-h-[500px]"
        />
      )}

      {/* Overlay Layer for Text Legibility */}
      {showOverlay && (
        <div
          className={`absolute inset-0 z-10 pointer-events-none ${overlayClass || defaultOverlayClass} ${overlayOpacity}`}
        />
      )}

      {/* Absolute Content Layer - Vertically Centered on Top of Image */}
      {hasContent && (
        <div className={`absolute inset-0 z-20 flex items-center ${isCenter ? "justify-center text-center" : ""} pointer-events-none`}>
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pointer-events-auto ${contentClass}`}>
            <div className={`space-y-4 sm:space-y-6 ${isCenter ? "max-w-4xl mx-auto flex flex-col items-center" : "max-w-xl sm:max-w-2xl"}`}>
              
              {badge && (
                <div>
                  {typeof badge === "string" ? (
                    <span className={badgeClass || "inline-block px-6 py-2 rounded-full border border-[#C5A059]/80 bg-black/20 text-[#C5A059] text-[11px] sm:text-xs font-medium tracking-[0.25em] uppercase backdrop-blur-2xs"}>
                      {badge}
                    </span>
                  ) : (
                    badge
                  )}
                </div>
              )}

              {title && (
                typeof title === "string" ? (
                  <h1 className={titleClass || (isCenter ? "text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight" : "text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1B5E3B] leading-tight")}>
                    {title}
                  </h1>
                ) : (
                  title
                )
              )}

              {desc && (
                <p className={descClass || (isCenter ? "text-xs sm:text-base text-zinc-200/90 max-w-2xl mx-auto leading-relaxed" : "text-xs sm:text-base text-zinc-800 max-w-xl")}>
                  {desc}
                </p>
              )}

              {(btnText || secondaryBtnText) && (
                <div className={`flex flex-wrap items-center gap-3 sm:gap-4 pt-2 sm:pt-4 ${isCenter ? "justify-center" : ""}`}>
                  {btnText && (
                    <LinkButton
                      href={href}
                      variant={isCenter ? "gold" : variant}
                      size={size}
                      className={btnClassName || (isCenter ? "rounded-full px-8 py-3.5 text-xs sm:text-sm uppercase tracking-widest font-bold bg-[#C8A97A] text-[#181818] hover:bg-[#b59667] shadow-lg transition-all" : "")}
                    >
                      {btnText}
                    </LinkButton>
                  )}

                  {secondaryBtnText && (
                    <LinkButton
                      href={secondaryHref}
                      variant="outline"
                      size={size}
                      className={secondaryBtnClassName || (isCenter ? "rounded-full px-8 py-3.5 text-xs sm:text-sm uppercase tracking-widest font-bold border border-[#C5A059]/80 text-white bg-black/20 hover:bg-black/50 backdrop-blur-2xs transition-all" : "")}
                    >
                      {secondaryBtnText}
                    </LinkButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
