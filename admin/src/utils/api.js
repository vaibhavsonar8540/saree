import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication Endpoints
export const loginApi = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Category Endpoints
export const fetchCategories = async (includeSubcategories = true) => {
  const response = await api.get(`/categories?includeSubcategories=${includeSubcategories}`);
  return response.data;
};

export const createCategoryApi = async (name) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

export const deleteCategoryApi = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const seedCategoriesApi = async () => {
  const response = await api.post('/categories/seed');
  return response.data;
};

// SubCategory Endpoints
export const fetchSubCategories = async (categoryId = '') => {
  const url = categoryId ? `/subcategories?categoryId=${categoryId}` : '/subcategories';
  const response = await api.get(url);
  return response.data;
};

export const createSubCategoryApi = async (name, categoryId) => {
  const response = await api.post('/subcategories', { name, categoryId });
  return response.data;
};

export const deleteSubCategoryApi = async (id) => {
  const response = await api.delete(`/subcategories/${id}`);
  return response.data;
};

export const seedSubCategoriesApi = async () => {
  const response = await api.post('/subcategories/seed');
  return response.data;
};

// Color Endpoints
export const fetchColors = async () => {
  const response = await api.get('/colors');
  return response.data;
};

export const createColorApi = async (name, hexCode) => {
  const response = await api.post('/colors', { name, hexCode });
  return response.data;
};

export const deleteColorApi = async (id) => {
  const response = await api.delete(`/colors/${id}`);
  return response.data;
};

export const seedColorsApi = async () => {
  const response = await api.post('/colors/seed');
  return response.data;
};

// Saree Product Endpoints
export const fetchSarees = async (params = {}) => {
  const response = await api.get('/sarees', { params });
  return response.data;
};

export const fetchSareeById = async (id) => {
  const response = await api.get(`/sarees/${id}`);
  return response.data;
};

export const createSareeApi = async (sareeData) => {
  // Supports both JSON object and FormData if uploading files directly
  const isFormData = sareeData instanceof FormData;
  const response = await api.post('/sarees', sareeData, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

export const updateSareeApi = async (id, sareeData) => {
  const isFormData = sareeData instanceof FormData;
  const response = await api.put(`/sarees/${id}`, sareeData, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
  return response.data;
};

export const deleteSareeApi = async (id) => {
  const response = await api.delete(`/sarees/${id}`);
  return response.data;
};

export default api;
