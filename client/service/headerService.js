import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Service to fetch categories along with their subcategories for the header component.
 * References backend server endpoints:
 * GET /api/categories?includeSubcategories=true&isActive=true
 */
export const fetchHeaderCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: {
        includeSubcategories: true,
        isActive: true,
      },
      timeout: 10000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    
    return response.data || [];
  } catch (error) {
    console.warn('HeaderService: Failed to fetch categories from server.', error.message);
    return [];
  }
};

/**
 * Service to fetch all active subcategories individually if needed.
 * GET /api/subcategories?isActive=true
 */
export const fetchSubCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/subcategories`, {
      params: { isActive: true },
      timeout: 10000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data || [];
  } catch (error) {
    console.warn('HeaderService: Failed to fetch subcategories.', error.message);
    return [];
  }
};

const headerService = {
  fetchHeaderCategories,
  fetchSubCategories,
};

export default headerService;
