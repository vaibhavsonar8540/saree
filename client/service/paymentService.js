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
 * Create a Razorpay Payment Order
 * POST /api/payment/create-order
 */
export const createPaymentOrderApi = async (orderId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payment/create-order`,
      { orderId },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Create Payment Order API Failed:', error?.response?.data || error.message);
    throw error?.response?.data || new Error('Failed to initialize payment gateway');
  }
};

/**
 * Verify Razorpay Payment Signature
 * POST /api/payment/verify
 */
export const verifyPaymentApi = async (verificationPayload) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payment/verify`,
      verificationPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Verify Payment API Failed:', error?.response?.data || error.message);
    throw error?.response?.data || new Error('Payment verification failed');
  }
};

/**
 * Fetch Order Payment Status (for polling fallback)
 * GET /api/payment/status/:orderId
 */
export const getPaymentStatusApi = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/payment/status/${orderId}`, {
      headers: {
        ...getAuthHeaders(),
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error?.response?.data || new Error('Failed to fetch payment status');
  }
};

/**
 * Cancel Order & Trigger Refund if Paid
 * POST /api/payment/cancel/:orderId
 */
export const cancelOrderApi = async (orderId, reason = 'Cancelled by user') => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payment/cancel/${orderId}`,
      { reason },
      {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    throw error?.response?.data || new Error('Failed to cancel order');
  }
};

const paymentService = {
  createPaymentOrderApi,
  verifyPaymentApi,
  getPaymentStatusApi,
  cancelOrderApi,
};

export default paymentService;
