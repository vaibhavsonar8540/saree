import { PAGE_CONSTANT } from "./constant";

export const SITE_NAME = "Anjali Creation Sarees";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://anjali-creation.vercel.app";

export const DEFAULT_META = {
  metadataBase: new URL(SITE_URL),
  title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
  description:
    "Discover handcrafted Kanchipuram Silk, Banarasi Brocades, Organza & Paithani Sarees at Anjali Creation. 100% Certified Pure Silk Mark. Global Express Insured Delivery.",
  keywords:
    "anjali creation, luxury silk sarees, kanchipuram silk saree, banarasi saree, paithani saree, organza saree, pure silk saree online, indian ethnic wear, bridal saree, handloom sarees, wedding sarees",
  url: SITE_URL,
  path: "/",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    description:
      "Exquisite handcrafted Kanchipuram, Banarasi, Paithani & Organza sarees. 100% Pure Silk Mark certified.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/images/about/hero_banner.png",
        width: 1200,
        height: 630,
        alt: "Anjali Creation Luxury Pure Silk Sarees Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    description: "Explore handcrafted Kanchipuram, Banarasi & Organza silk sarees. 100% Certified Pure Silk.",
    images: ["/images/about/hero_banner.png"],
  },
};

export const PAGE_META = {
  [PAGE_CONSTANT.HOME]: {
    path: "",
    title: "Anjali Creation | Luxury Indian Silk Sarees & Ethnic Heritage",
    description:
      "Discover handcrafted Kanchipuram Silk, Banarasi Brocades, Organza & Paithani Sarees at Anjali Creation. 100% Certified Pure Silk Mark.",
    keywords:
      "anjali creation home, silk sarees online, luxury sarees, pure silk sarees, banarasi silk, organza saree, bridal ethnic wear",
  },
  [PAGE_CONSTANT.SAREES]: {
    path: "/sarees",
    title: "Explore Handcrafted Saree Collections | Anjali Creation",
    description:
      "Browse our exclusive handcrafted saree catalog. Discover Pure Kanchipuram, Banarasi Silk, Lightweight Organza, Chiffon, and Designer Weaves.",
    keywords:
      "saree collection, silk saree catalog, designer sarees online, traditional weaves, anjali creation sarees",
  },
  [PAGE_CONSTANT.COLLECTION]: {
    path: "/sarees",
    title: "Exclusive Handwoven Collections | Anjali Creation Sarees",
    description:
      "Explore curated luxury saree collections. High-end Banarasi brocades, royal Paithani weaves, and festive organza drapes.",
    keywords: "saree collection, handloom sarees, festive sarees, bridal drape catalog",
  },
  [PAGE_CONSTANT.CATEGORY]: {
    path: "/category",
    title: "Saree Categories & Fabric Weaves Directory | Anjali Creation",
    description:
      "Browse sarees by fabric type, weave heritage, and occasion. Organza, Silk, Cotton, Banarasi, Traditional, and Modern Fusion Sarees.",
    keywords: "saree categories, fabric directory, silk weaves, organza sarees, banarasi sarees",
  },
  [PAGE_CONSTANT.PRODUCT_DETAIL]: {
    path: "/product",
    title: "Saree Details & Fabric Specifications | Anjali Creation",
    description:
      "Explore intricate zari work specifications, blouse piece details, fabric care guidelines, and customer reviews for Anjali Creation sarees.",
    keywords: "saree details, pure silk specifications, saree zari work, silk mark saree details",
  },
  [PAGE_CONSTANT.CART]: {
    path: "/cart",
    title: "Your Shopping Cart | Review Selected Sarees - Anjali Creation",
    description:
      "Review your selected luxury sarees, calculate GST, and proceed with secure checkout at Anjali Creation Sarees.",
    keywords: "shopping cart, saree cart, order review, anjali creation checkout",
  },
  [PAGE_CONSTANT.CHECKOUT]: {
    path: "/checkout",
    title: "Secure Checkout & Shipping Details | Anjali Creation",
    description:
      "Enter your insured shipping address and delivery preferences for insured delivery of your handcrafted sarees from Anjali Creation.",
    keywords: "saree checkout, express shipping address, secure order placement",
  },
  [PAGE_CONSTANT.CHECKOUT_SUCCESS]: {
    path: "/checkout-success",
    title: "Order Confirmed | Thank You - Anjali Creation",
    description:
      "Thank you for choosing Anjali Creation! Your saree order has been placed successfully. Track shipment updates here.",
    keywords: "order confirmation, saree order success, thank you page",
  },
  [PAGE_CONSTANT.ORDER]: {
    path: "/order",
    title: "Track Your Saree Orders & Delivery | Anjali Creation",
    description:
      "Review your order status, shipment tracking, destination details, and past purchase receipts at Anjali Creation.",
    keywords: "track saree order, my orders, order status, shipment tracking",
  },
  [PAGE_CONSTANT.PAYMENT]: {
    path: "/payment",
    title: "Select Payment Method | Safe & Instant Checkout - Anjali Creation",
    description:
      "Choose from 100% safe online payment options (Razorpay, UPI, Credit/Debit Cards, NetBanking) or Pay on Delivery.",
    keywords: "saree payment, razorpay payment, UPI checkout, cash on delivery",
  },
  [PAGE_CONSTANT.WISHLIST]: {
    path: "/favourites",
    title: "My Saved Favourites & Wishlist | Anjali Creation",
    description:
      "View your saved favorite sarees, bookmark dream weaves, and transfer to cart whenever you are ready.",
    keywords: "saree wishlist, my favourites, saved sarees, bookmarked weaves",
  },
  [PAGE_CONSTANT.FAVOURITES]: {
    path: "/favourites",
    title: "My Saved Favourites & Wishlist | Anjali Creation",
    description:
      "View your saved favorite sarees, bookmark dream weaves, and transfer to cart whenever you are ready.",
    keywords: "saree wishlist, my favourites, saved sarees, bookmarked weaves",
  },
  [PAGE_CONSTANT.PROFILE]: {
    path: "/profile",
    title: "My Account & Profile Dashboard | Anjali Creation",
    description:
      "Manage your personal profile information, saved addresses, order history, and account preferences at Anjali Creation.",
    keywords: "user profile, my account, saree store dashboard, customer portal",
  },
  [PAGE_CONSTANT.MY_PRODUCTS]: {
    path: "/my-products",
    title: "Store Catalog & Product Management | Anjali Creation",
    description:
      "Manage store inventory, view active saree catalog listings, and update product details on Anjali Creation.",
    keywords: "store products, inventory management, saree catalog listing",
  },
  [PAGE_CONSTANT.ADD_PRODUCT]: {
    path: "/add-product",
    title: "Add New Saree to Catalog | Admin Portal - Anjali Creation",
    description:
      "Upload high-resolution saree images, specify zari details, pricing, inventory counts, and publish new saree designs.",
    keywords: "add saree, add product, inventory upload, store admin portal",
  },
  [PAGE_CONSTANT.SELLER]: {
    path: "/seller",
    title: "Artisan & Weaver Partner Network | Anjali Creation",
    description:
      "Partner with Anjali Creation. Join our weaver network to showcase authentic handloom sarees to thousands of patrons worldwide.",
    keywords: "artisan partner, weaver network, sell handloom sarees, saree merchant",
  },
  [PAGE_CONSTANT.SELLER_REGISTER]: {
    path: "/seller/register",
    title: "Weaver Registration Portal | Partner Account - Anjali Creation",
    description:
      "Register your loom house or brand details to partner with Anjali Creation's luxury handloom marketplace.",
    keywords: "weaver registration, artisan sign up, merchant onboarding",
  },
  [PAGE_CONSTANT.ABOUT_US]: {
    path: "/about",
    title: "Our Heritage & Craftsmanship Story | Anjali Creation",
    description:
      "Learn about Anjali Creation's legacy of preserving traditional Indian handloom weaving, pure silk mark certification, and master weavers.",
    keywords: "about anjali creation, saree heritage, master weavers, pure silk mark, handloom story",
  },
  [PAGE_CONSTANT.CONTACT_US]: {
    path: "/contact",
    title: "Contact Us & Customer Atelier | Anjali Creation",
    description:
      "Have questions regarding custom saree orders, silk care, or express shipping? Reach out to Anjali Creation support 24/7.",
    keywords: "contact anjali creation, customer support, saree help center, atelier inquiry",
  },
  [PAGE_CONSTANT.PRIVACY_POLICY]: {
    path: "/privacy",
    title: "Privacy Policy & Data Security | Anjali Creation",
    description:
      "Learn how Anjali Creation protects your personal details, payment transactions, and privacy while shopping on our store.",
    keywords: "privacy policy, data security, user privacy, encrypted checkout",
  },
  [PAGE_CONSTANT.RETURN_POLICY]: {
    path: "/return-policy",
    title: "Returns, Exchange & Refund Guidelines | Anjali Creation",
    description:
      "Read our hassle-free return and exchange policies. Easy replacements and transparent refund processes at Anjali Creation.",
    keywords: "return policy, saree exchange, refund policy, customer guarantee",
  },
  [PAGE_CONSTANT.TERMS_AND_CONDITIONS]: {
    path: "/terms",
    title: "Terms & Conditions | Anjali Creation Sarees",
    description:
      "Review terms of service, shipping policies, platform guidelines, and purchasing terms for Anjali Creation Sarees.",
    keywords: "terms and conditions, terms of service, legal guidelines, store policies",
  },
  [PAGE_CONSTANT.SITEMAP]: {
    path: "/sitemap",
    title: "Store Sitemap & Directory Navigation | Anjali Creation",
    description:
      "Browse our complete directory of pages, saree categories, subcategories, customer support, and account links.",
    keywords: "sitemap, page directory, saree catalog links, website navigation",
  },
};

/**
 * Helper to get metadata object for Next.js App Router
 * @param {string} pageKey - Key from PAGE_CONSTANT
 * @param {object} dynamicMeta - Dynamic metadata overrides (title, description, keywords, image, url, path, canonical)
 */
export function getPageMetadata(pageKey, dynamicMeta = {}) {
  const base = PAGE_META[pageKey] || DEFAULT_META;
  const title = dynamicMeta.title
    ? `${dynamicMeta.title} | ${SITE_NAME}`
    : base.title;
  const description = dynamicMeta.description || base.description;
  const keywords = dynamicMeta.keywords || base.keywords;
  const image = dynamicMeta.image || "/images/about/hero_banner.png";

  // Calculate self-referencing canonical URL
  const relPath = dynamicMeta.path !== undefined ? dynamicMeta.path : (base.path || "");
  let canonicalUrl;
  if (dynamicMeta.canonical) {
    canonicalUrl = dynamicMeta.canonical.startsWith("http")
      ? dynamicMeta.canonical
      : `${SITE_URL}${dynamicMeta.canonical}`;
  } else if (dynamicMeta.url) {
    canonicalUrl = dynamicMeta.url.startsWith("http")
      ? dynamicMeta.url
      : `${SITE_URL}${dynamicMeta.url}`;
  } else {
    canonicalUrl = `${SITE_URL}${relPath}`;
  }

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      images: [
        {
          url: image,
          alt: dynamicMeta.title || title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
