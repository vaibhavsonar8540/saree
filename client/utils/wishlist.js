export const INITIAL_MOCK_WISHLIST = [
  {
    _id: "fav-1",
    productId: "6abe60de54b7c3a7ca81f258",
    name: "Royal Purple Kanjeevaram Silk Saree",
    title: "Royal Purple Kanjeevaram Silk Saree",
    fabric: "Pure Kanjeevaram Silk",
    price: 1999,
    originalPrice: 2499,
    rating: 4.9,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop",
    category: "Silk Sarees",
    inStock: true,
  },
  {
    _id: "fav-2",
    productId: "6abe60de54b7c3a7ca81f259",
    name: "Banarasi Heavy Zari Border Saree",
    title: "Banarasi Heavy Zari Border Saree",
    fabric: "Pure Banarasi Silk",
    price: 4500,
    originalPrice: 5999,
    rating: 5.0,
    reviewsCount: 74,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop",
    category: "Banarasi Silk",
    inStock: true,
  },
];

export function getWishlist() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("anjali_wishlist");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
    // Default fallback if not initialized yet
    localStorage.setItem("anjali_wishlist", JSON.stringify(INITIAL_MOCK_WISHLIST));
    return INITIAL_MOCK_WISHLIST;
  } catch (e) {
    return INITIAL_MOCK_WISHLIST;
  }
}

export function isInWishlist(productId) {
  if (!productId) return false;
  const list = getWishlist();
  return list.some((item) => (item._id === productId || item.productId === productId));
}

export function toggleWishlist(product) {
  if (typeof window === "undefined" || !product) return false;
  try {
    const list = getWishlist();
    const prodId = product._id || product.productId;
    const index = list.findIndex((item) => item._id === prodId || item.productId === prodId);

    let updated = [];
    let isNowAdded = false;

    if (index > -1) {
      // Remove item
      updated = list.filter((_, i) => i !== index);
      isNowAdded = false;
    } else {
      // Add item
      const newItem = {
        _id: prodId || `fav-${Date.now()}`,
        productId: prodId,
        name: product.name || product.title || "Handcrafted Saree",
        title: product.name || product.title || "Handcrafted Saree",
        fabric: product.fabric || "Pure Silk",
        price: product.discountedPrice > 0 ? product.discountedPrice : (product.price || 1999),
        originalPrice: product.price || product.originalPrice || 2499,
        rating: product.rating || 4.9,
        reviewsCount: product.reviewsCount || 32,
        image: product.image || product.thumbnail || (product.images && product.images[0]) || "/assets/images/heroBanner.png",
        thumbnail: product.thumbnail || product.image || "/assets/images/heroBanner.png",
        category: product.category || product.categoryName || "Sarees",
        inStock: product.inStock ?? true,
      };
      updated = [newItem, ...list];
      isNowAdded = true;
    }

    localStorage.setItem("anjali_wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
    return isNowAdded;
  } catch (e) {
    console.error("Failed to toggle wishlist", e);
    return false;
  }
}

export function removeFromWishlist(productId) {
  if (typeof window === "undefined" || !productId) return;
  try {
    const list = getWishlist();
    const updated = list.filter((item) => item._id !== productId && item.productId !== productId);
    localStorage.setItem("anjali_wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (e) {
    console.error("Failed to remove from wishlist", e);
  }
}

export function clearWishlist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("anjali_wishlist", JSON.stringify([]));
    window.dispatchEvent(new Event("wishlistUpdated"));
  } catch (e) {
    console.error("Failed to clear wishlist", e);
  }
}
