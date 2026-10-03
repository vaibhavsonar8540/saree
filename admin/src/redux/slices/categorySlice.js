import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../services/categoryService';

const initialState = {
  categories: [],
  subCategories: [],
  loading: false,
  categoryLoading: false,
  subCategoryLoading: false,
  error: null,
  successMessage: null,
};

export const fetchCategoriesAction = createAsyncThunk(
  'category/fetchCategories',
  async (includeSubcategories = true, thunkAPI) => {
    try {
      const res = await categoryService.getCategories(includeSubcategories);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch categories';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createCategoryAction = createAsyncThunk(
  'category/createCategory',
  async (name, thunkAPI) => {
    try {
      const res = await categoryService.createCategory(name);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create category';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteCategoryAction = createAsyncThunk(
  'category/deleteCategory',
  async (id, thunkAPI) => {
    try {
      await categoryService.deleteCategory(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete category';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const seedCategoriesAction = createAsyncThunk(
  'category/seedCategories',
  async (_, thunkAPI) => {
    try {
      const res = await categoryService.seedCategories();
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to seed categories';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const fetchSubCategoriesAction = createAsyncThunk(
  'category/fetchSubCategories',
  async (categoryId = '', thunkAPI) => {
    try {
      const res = await categoryService.getSubCategories(categoryId);
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch subcategories';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createSubCategoryAction = createAsyncThunk(
  'category/createSubCategory',
  async ({ name, categoryId }, thunkAPI) => {
    try {
      const res = await categoryService.createSubCategory({ name, categoryId });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create subcategory';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteSubCategoryAction = createAsyncThunk(
  'category/deleteSubCategory',
  async (id, thunkAPI) => {
    try {
      await categoryService.deleteSubCategory(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete subcategory';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const seedSubCategoriesAction = createAsyncThunk(
  'category/seedSubCategories',
  async (_, thunkAPI) => {
    try {
      const res = await categoryService.seedSubCategories();
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to seed subcategories';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH CATEGORIES
      .addCase(fetchCategoriesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoriesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
      })
      .addCase(fetchCategoriesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE CATEGORY
      .addCase(createCategoryAction.pending, (state) => {
        state.categoryLoading = true;
        state.error = null;
      })
      .addCase(createCategoryAction.fulfilled, (state, action) => {
        state.categoryLoading = false;
        state.categories.unshift(action.payload);
        state.successMessage = `Category '${action.payload.name}' created!`;
      })
      .addCase(createCategoryAction.rejected, (state, action) => {
        state.categoryLoading = false;
        state.error = action.payload;
      })

      // DELETE CATEGORY
      .addCase(deleteCategoryAction.fulfilled, (state, action) => {
        state.categories = state.categories.filter((cat) => cat._id !== action.payload);
        state.successMessage = 'Category deleted successfully!';
      })
      .addCase(deleteCategoryAction.rejected, (state, action) => {
        state.error = action.payload;
      })

      // SEED CATEGORIES
      .addCase(seedCategoriesAction.fulfilled, (state, action) => {
        state.categories = action.payload || [];
        state.successMessage = 'Default categories seeded successfully!';
      })

      // FETCH SUBCATEGORIES
      .addCase(fetchSubCategoriesAction.fulfilled, (state, action) => {
        state.subCategories = action.payload || [];
      })

      // CREATE SUBCATEGORY
      .addCase(createSubCategoryAction.pending, (state) => {
        state.subCategoryLoading = true;
        state.error = null;
      })
      .addCase(createSubCategoryAction.fulfilled, (state, action) => {
        state.subCategoryLoading = false;
        state.subCategories.unshift(action.payload);
        state.successMessage = `Subcategory '${action.payload.name}' created!`;
      })
      .addCase(createSubCategoryAction.rejected, (state, action) => {
        state.subCategoryLoading = false;
        state.error = action.payload;
      })

      // DELETE SUBCATEGORY
      .addCase(deleteSubCategoryAction.fulfilled, (state, action) => {
        state.subCategories = state.subCategories.filter((sub) => sub._id !== action.payload);
        state.successMessage = 'Subcategory deleted successfully!';
      })

      // SEED SUBCATEGORIES
      .addCase(seedSubCategoriesAction.fulfilled, (state, action) => {
        state.subCategories = action.payload || [];
        state.successMessage = 'Default subcategories seeded successfully!';
      });
  },
});

export const { clearCategoryFeedback } = categorySlice.actions;
export default categorySlice.reducer;
