import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Service to fetch newly arrived saree products.
 * Endpoint: GET /api/sarees?limit=8&sortBy=newest&isActive=true
 */
export const fetchNewArrivals = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sarees`, {
      params: {
        limit,
        sortBy: 'newest',
        isActive: true,
      },
      timeout: 5000,
    });

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return response.data?.data || [];
  } catch (error) {
    console.warn('ProductService: Failed to fetch newly arrived sarees from API.', error.message);
    return null;
  }
};

/**
 * Service to fetch single saree product by ID or SKU.
 * Endpoint: GET /api/sarees/:id
 */
export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sarees/${id}`, {
      timeout: 5000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data?.data || null;
  } catch (error) {
    console.warn(`ProductService: Failed to fetch saree details for id '${id}'.`, error.message);
    return null;
  }
};

/**
 * Service to fetch sarees list with optional category filter.
 * Endpoint: GET /api/sarees
 */
export const fetchSarees = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sarees`, {
      params,
      timeout: 5000,
    });
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.warn('ProductService: Failed to fetch sarees list.', error.message);
    return [];
  }
};

/**
 * Service to fetch most loved / bestseller saree products.
 * Endpoint: GET /api/sarees?limit=8&sortBy=popular&isActive=true
 */
export const fetchMostLovedProducts = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sarees`, {
      params: {
        limit,
        sortBy: 'popular',
        isActive: true,
      },
      timeout: 5000,
    });

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return response.data?.data || [];
  } catch (error) {
    console.warn('ProductService: Failed to fetch most loved sarees from API.', error.message);
    return null;
  }
};

const productService = {
  fetchNewArrivals,
  fetchMostLovedProducts,
  fetchProductById,
  fetchSarees,
};

export default productService;
