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
      timeout: 10000,
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
      timeout: 10000,
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
 * Service to fetch Category details by ID or slug/name.
 * Endpoint: GET /api/categories/:id
 */
export const fetchCategoryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories/${id}`, {
      timeout: 10000,
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return response.data?.data || null;
  } catch (error) {
    console.warn(`ProductService: Failed to fetch category details for '${id}'.`, error.message);
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
      timeout: 10000,
    });
    if (response.data && response.data.success) {
      const list = Array.isArray(response.data.data) ? response.data.data : [];
      list.total = response.data.total ?? list.length;
      list.totalPages = response.data.totalPages ?? 1;
      list.currentPage = response.data.currentPage ?? 1;
      list.count = response.data.count ?? list.length;
      return list;
    }
    const emptyList = [];
    emptyList.total = 0;
    emptyList.totalPages = 1;
    emptyList.currentPage = 1;
    emptyList.count = 0;
    return emptyList;
  } catch (error) {
    console.warn('ProductService: Failed to fetch sarees list.', error.message);
    const emptyList = [];
    emptyList.total = 0;
    emptyList.totalPages = 1;
    emptyList.currentPage = 1;
    emptyList.count = 0;
    return emptyList;
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
      timeout: 10000,
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
  fetchCategoryById,
  fetchSarees,
};

export default productService;
