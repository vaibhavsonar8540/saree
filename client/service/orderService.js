import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper to get authorization header
 */
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('anjali_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Create a new order via API
 * POST /api/orders
 */
export const createOrderApi = async (orderPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderPayload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Order API Creation Failed:', error?.response?.data || error.message);
    throw error?.response?.data || new Error('Failed to create order');
  }
};

/**
 * Get order details by ID or order number
 * GET /api/orders/:id
 */
export const getOrderByIdApi = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        ...getAuthHeaders(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || new Error('Failed to fetch order');
  }
};

/**
 * Get current user orders
 * GET /api/orders/my-orders
 */
export const getUserOrdersApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        ...getAuthHeaders(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || new Error('Failed to fetch user orders');
  }
};

/**
 * Update payment details / status for order
 * PATCH /api/orders/:id/payment
 */
export const updateOrderPaymentApi = async (orderId, paymentPayload) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/payment`, paymentPayload, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || new Error('Failed to update payment status');
  }
};

const orderService = {
  createOrderApi,
  getOrderByIdApi,
  getUserOrdersApi,
  updateOrderPaymentApi,
};

export default orderService;
