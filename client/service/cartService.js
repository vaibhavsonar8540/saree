import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get stored guest token or auth token headers
 */
const getCartHeaders = () => {
  const headers = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('anjali_token');
    if (token && token !== 'undefined' && token !== 'null') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    let guestToken = localStorage.getItem('anjali_guest_token');
    if (!guestToken) {
      guestToken = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('anjali_guest_token', guestToken);
    }
    if (guestToken) {
      headers['X-Guest-Token'] = guestToken;
    }
  }
  return headers;
};

/**
 * Save guest token from backend response if set
 */
const saveGuestTokenFromResponse = (response) => {
  if (typeof window !== 'undefined' && response?.headers) {
    const guestTokenHeader = response.headers['x-guest-token'] || response.headers['X-Guest-Token'];
    if (guestTokenHeader) {
      localStorage.setItem('anjali_guest_token', guestTokenHeader);
    }
  }
};

/**
 * Fetch current user / guest cart
 * GET /api/cart
 */
export const getCartApi = async (pincode = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      params: pincode ? { pincode } : {},
      headers: getCartHeaders(),
      withCredentials: true,
      timeout: 15000,
    });
    saveGuestTokenFromResponse(response);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && typeof window !== 'undefined' && localStorage.getItem('anjali_token')) {
      localStorage.removeItem('anjali_token');
      try {
        const retryResponse = await axios.get(`${API_BASE_URL}/cart`, {
          params: pincode ? { pincode } : {},
          headers: getCartHeaders(),
          withCredentials: true,
          timeout: 15000,
        });
        saveGuestTokenFromResponse(retryResponse);
        return retryResponse.data;
      } catch (retryErr) {
        console.error('getCartApi retry error:', retryErr);
      }
    }
    console.error('getCartApi Error:', error);
    return { success: false, data: { items: [], summary: { total: 0 } } };
  }
};

/**
 * Add item to cart
 * POST /api/cart
 */
export const addToCartApi = async ({ productId, colorId, quantity = 1 }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart`,
      { productId, colorId, quantity },
      {
        headers: getCartHeaders(),
        withCredentials: true,
        timeout: 15000,
      }
    );
    saveGuestTokenFromResponse(response);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    return response.data;
  } catch (error) {
    if (error.response?.status === 401 && typeof window !== 'undefined' && localStorage.getItem('anjali_token')) {
      localStorage.removeItem('anjali_token');
      const retryResponse = await axios.post(
        `${API_BASE_URL}/cart`,
        { productId, colorId, quantity },
        {
          headers: getCartHeaders(),
          withCredentials: true,
          timeout: 15000,
        }
      );
      saveGuestTokenFromResponse(retryResponse);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cartUpdated'));
      }
      return retryResponse.data;
    }
    console.error('addToCartApi Error:', error);
    throw error?.response?.data || new Error('Failed to add product to cart');
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
export const updateCartItemApi = async (itemId, quantity) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/cart/items/${itemId}`,
      { quantity },
      {
        headers: getCartHeaders(),
        withCredentials: true,
        timeout: 15000,
      }
    );
    saveGuestTokenFromResponse(response);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    return response.data;
  } catch (error) {
    console.error('updateCartItemApi Error:', error);
    throw error?.response?.data || new Error('Failed to update cart item');
  }
};

/**
 * Remove single item from cart
 * DELETE /api/cart/items/:itemId
 */
export const removeFromCartApi = async (itemId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/items/${itemId}`, {
      headers: getCartHeaders(),
      withCredentials: true,
      timeout: 15000,
    });
    saveGuestTokenFromResponse(response);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    return response.data;
  } catch (error) {
    console.error('removeFromCartApi Error:', error);
    throw error?.response?.data || new Error('Failed to remove item from cart');
  }
};

/**
 * Apply promo/coupon code to cart
 * POST /api/cart/coupon
 */
export const applyCouponApi = async (couponCode) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/cart/coupon`,
      { couponCode },
      {
        headers: getCartHeaders(),
        withCredentials: true,
        timeout: 15000,
      }
    );
    saveGuestTokenFromResponse(response);
    return response.data;
  } catch (error) {
    console.error('applyCouponApi Error:', error);
    throw error?.response?.data || new Error('Failed to apply coupon');
  }
};

/**
 * Remove coupon code from cart
 * DELETE /api/cart/coupon
 */
export const removeCouponApi = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart/coupon`, {
      headers: getCartHeaders(),
      withCredentials: true,
      timeout: 15000,
    });
    saveGuestTokenFromResponse(response);
    return response.data;
  } catch (error) {
    console.error('removeCouponApi Error:', error);
    throw error?.response?.data || new Error('Failed to remove coupon');
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart
 */
export const clearCartApi = async () => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cart`, {
      headers: getCartHeaders(),
      withCredentials: true,
      timeout: 15000,
    });
    saveGuestTokenFromResponse(response);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cartUpdated'));
    }
    return response.data;
  } catch (error) {
    console.error('clearCartApi Error:', error);
    throw error?.response?.data || new Error('Failed to clear cart');
  }
};

const cartService = {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  applyCouponApi,
  removeCouponApi,
  clearCartApi,
};

export default cartService;
