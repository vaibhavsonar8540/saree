import React from "react";

/**
 * Organization & Store JSON-LD Schema for rich Google Brand snippets
 */
export const StoreJsonLd = () => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Anjali Creation",
    image: "https://anjali-creation.vercel.app/images/about/hero_banner.png",
    "@id": "https://anjali-creation.vercel.app/#store",
    url: "https://anjali-creation.vercel.app",
    telephone: "+91-9876543210",
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ring Road, Near Millennium Market",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395002",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.1702,
      longitude: 72.8311,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "20:00",
    },
    sameAs: [
      "https://instagram.com",
      "https://facebook.com",
      "https://pinterest.com",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

/**
 * Product JSON-LD Schema for rich product snippet cards in Google Search
 */
export const ProductJsonLd = ({ product }) => {
  if (!product) return null;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name || product.title || "Pure Silk Saree",
    image: product.images?.[0]?.url || product.image || product.thumbnail,
    description:
      product.description ||
      "Pure handcrafted silk saree with authentic Silk Mark certification.",
    sku: product._id || product.id,
    brand: {
      "@type": "Brand",
      name: "Anjali Creation",
    },
    offers: {
      "@type": "Offer",
      url: `https://anjali-creation.vercel.app/product/${product._id || product.id}`,
      priceCurrency: "INR",
      price: product.price || product.discountPrice || 4999,
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.stock > 0 || product.inStock !== false
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Anjali Creation",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export default StoreJsonLd;
