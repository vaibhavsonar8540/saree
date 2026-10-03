"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    let lenis;
    let animationFrameId;

    try {
      lenis = new Lenis({
        duration: 0.9,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
        touchMultiplier: 1.5,
        prevent: (node) =>
          node.classList?.contains("no-lenis") || node.closest?.(".no-lenis"),
      });

      window.lenis = lenis;

      function raf(time) {
        if (lenis) {
          lenis.raf(time);
          animationFrameId = requestAnimationFrame(raf);
        }
      }

      animationFrameId = requestAnimationFrame(raf);
    } catch (e) {
      console.warn("Lenis scroll initialization warning:", e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenis) {
        lenis.destroy();
      }
      delete window.lenis;
    };
  }, []);

  // Recalculate layout height & reset scroll position on page navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
        setTimeout(() => {
          if (window.lenis) window.lenis.resize();
        }, 150);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return <>{children}</>;
}
