/**
 * Centralized Image ALT and TITLE Metadata Directory
 * Provides standardized, SEO-optimized ALT text and TITLE attributes for all images across the store.
 */

export const IMG_ALT_TITLE = {
  // Brand & Header Logos
  LOGO: {
    alt: "Anjali Creation Sarees Brand Logo",
    title: "Anjali Creation - Luxury Pure Silk & Handloom Sarees",
  },

  // Hero & Collection Banners
  HERO_DESKTOP: {
    alt: "Anjali Creation Luxury Pure Silk Sarees Collection Showcase",
    title: "Anjali Creation Handcrafted Silk & Organza Sarees Showcase",
  },
  HERO_MOBILE: {
    alt: "Anjali Creation Ethnic Silk & Festive Sarees Mobile Banner",
    title: "Anjali Creation Luxury Festive Sarees",
  },
  HERO_SAREE: {
    alt: "Handcrafted Pure Silk Saree Showcase Banner",
    title: "Explore Premium Kanchipuram, Banarasi & Organza Sarees",
  },

  // Homepage Featured Categories
  FEATURED_BANARASI: {
    alt: "Handcrafted Pure Banarasi Silk Saree with Real Gold Zari",
    title: "Royal Banarasi Silk Saree Collection - Anjali Creation",
  },
  FEATURED_ORGANZA: {
    alt: "Lightweight Designer Floral Printed Organza Silk Saree",
    title: "Elegant Organza Saree Collection - Anjali Creation",
  },
  FEATURED_SILK: {
    alt: "Certified 100% Pure Kanchipuram Silk Saree",
    title: "Pure Kanchipuram Silk Saree - Anjali Creation",
  },
  FEATURED_PAITHANI: {
    alt: "Traditional Maharashtra Paithani Silk Saree with Peacock Pallu",
    title: "Handcrafted Paithani Silk Saree - Anjali Creation",
  },
  FEATURED_COTTON: {
    alt: "Handloom Chanderi & Pure Breathable Cotton Saree",
    title: "Breathable Cotton & Chanderi Saree - Anjali Creation",
  },

  // About Page Heritage Images
  ABOUT_HERO: {
    alt: "Anjali Creation 30+ Year Heritage Weaving Master Artisans Showcase",
    title: "Our Heritage & Master Handloom Artisans - Anjali Creation",
  },
  ABOUT_ARTISAN: {
    alt: "Master Handloom Weaver Crafting Pure Gold Zari Brocade Motifs",
    title: "Master Weaver Crafting Zari Motifs at Anjali Creation",
  },
  ABOUT_HERITAGE: {
    alt: "Heritage Pure Silk Mark Certified Sarees Display",
    title: "Handwoven Pure Silk Mark Certified Sarees Showcase",
  },

  // Product Cards & Empty States
  PRODUCT_PLACEHOLDER: {
    alt: "Anjali Creation Handcrafted Pure Silk Saree Preview Image",
    title: "Luxury Pure Silk Saree - Anjali Creation",
  },
  PRODUCT_NOT_FOUND: {
    alt: "No Sarees Found Matching Selected Filter Criteria Icon",
    title: "No Sarees Found - Explore Popular Collections",
  },
};

/**
 * Helper to dynamically generate SEO-optimized alt and title attributes for products
 * @param {string} productName - Name of the saree product
 * @param {string} categoryName - Category/weave type of the saree
 * @returns {{ alt: string, title: string }}
 */
export function getProductImageAltTitle(productName, categoryName) {
  const name = productName ? productName.trim() : "Handcrafted Pure Silk Saree";
  const category = categoryName ? ` (${categoryName})` : "";
  return {
    alt: `${name}${category} - Anjali Creation Pure Silk Mark Saree`,
    title: `${name}${category} | Certified 100% Pure Silk Handloom Saree`,
  };
}

/**
 * Helper to get alt and title object for a given image key
 * @param {string} key - Key in IMG_ALT_TITLE
 * @param {object} fallback - Fallback object { alt, title }
 */
export function getImageAltTitle(key, fallback = {}) {
  const target = IMG_ALT_TITLE[key];
  if (target) return target;
  return {
    alt: fallback.alt || "Anjali Creation Pure Silk Saree",
    title: fallback.title || "Anjali Creation Luxury Sarees",
  };
}
