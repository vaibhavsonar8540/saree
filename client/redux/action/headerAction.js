import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchHeaderCategories, fetchSubCategories } from '../../service/headerService';

/**
 * Async Thunk Action to fetch Categories and Subcategories for Saree header card menu.
 */
export const fetchHeaderCategoriesAction = createAsyncThunk(
  'header/fetchCategoriesAndSubcategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await fetchHeaderCategories();
      return categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories and subcategories'
      );
    }
  }
);

/**
 * Alias action creator for category and subcategory fetching
 */
export const getCategoryAndSubCategoryAction = fetchHeaderCategoriesAction;

/**
 * Async Thunk Action to fetch standalone subcategories
 */
export const fetchSubCategoriesAction = createAsyncThunk(
  'header/fetchSubCategories',
  async (_, { rejectWithValue }) => {
    try {
      const subCategories = await fetchSubCategories();
      return subCategories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch subcategories'
      );
    }
  }
);
