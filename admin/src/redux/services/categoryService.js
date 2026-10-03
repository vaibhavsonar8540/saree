import {
  fetchCategories,
  createCategoryApi,
  deleteCategoryApi,
  seedCategoriesApi,
  fetchSubCategories,
  createSubCategoryApi,
  deleteSubCategoryApi,
  seedSubCategoriesApi,
} from '../../utils/api';

const categoryService = {
  getCategories: async (includeSubcategories = true) => {
    return await fetchCategories(includeSubcategories);
  },

  createCategory: async (name) => {
    return await createCategoryApi(name);
  },

  deleteCategory: async (id) => {
    return await deleteCategoryApi(id);
  },

  seedCategories: async () => {
    return await seedCategoriesApi();
  },

  getSubCategories: async (categoryId = '') => {
    return await fetchSubCategories(categoryId);
  },

  createSubCategory: async ({ name, categoryId }) => {
    return await createSubCategoryApi(name, categoryId);
  },

  deleteSubCategory: async (id) => {
    return await deleteSubCategoryApi(id);
  },

  seedSubCategories: async () => {
    return await seedSubCategoriesApi();
  },
};

export default categoryService;
