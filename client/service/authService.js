import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Register a new user
 * POST /api/auth/register
 * Payload: { name, email, phone, password, role }
 */
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Login user
 * POST /api/auth/login
 * Payload: { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logoutUser = async () => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/logout`,
    {},
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Get current logged in user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("anjali_token") : null;
  const response = await axios.get(`${API_BASE_URL}/auth/me`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Update current logged in user details
 * PUT /api/auth/updatedetails
 * Payload: { name, phone }
 */
export const updateUserDetails = async (userData) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("anjali_token") : null;
  const response = await axios.put(`${API_BASE_URL}/auth/updatedetails`, userData, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    withCredentials: true,
  });
  return response.data;
};

const authService = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserDetails,
};

export default authService;
