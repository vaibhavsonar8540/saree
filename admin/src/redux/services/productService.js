import {
  fetchSarees,
  fetchSareeById,
  createSareeApi,
  updateSareeApi,
  deleteSareeApi,
} from '../../utils/api';

const productService = {
  getProducts: async (params = {}) => {
    return await fetchSarees(params);
  },

  getProductById: async (id) => {
    return await fetchSareeById(id);
  },

  createProduct: async (sareeData) => {
    return await createSareeApi(sareeData);
  },

  updateProduct: async ({ id, sareeData }) => {
    return await updateSareeApi(id, sareeData);
  },

  deleteProduct: async (id) => {
    return await deleteSareeApi(id);
  },
};

export default productService;
