import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Check Indian pincode serviceability and shipping details
 * GET /api/shipping/check-pincode/:pincode
 */
export const checkPincodeServiceability = async (pincode) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/shipping/check-pincode/${pincode}`);
    return response.data;
  } catch (error) {
    console.error('Pincode check error:', error);
    throw error?.response?.data || new Error('Failed to verify pincode');
  }
};

/**
 * Fetch general shipping settings (free shipping threshold, flat rate)
 * GET /api/shipping/settings
 */
export const getShippingSettingsApi = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/shipping/settings`);
    return response.data;
  } catch (error) {
    console.error('Shipping settings error:', error);
    throw error?.response?.data || new Error('Failed to fetch shipping settings');
  }
};

const shippingService = {
  checkPincodeServiceability,
  getShippingSettingsApi,
};

export default shippingService;
