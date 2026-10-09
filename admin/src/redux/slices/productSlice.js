import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  submitting: false,
  error: null,
  successMessage: null,
};

export const fetchProductsAction = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, thunkAPI) => {
    try {
      const res = await productService.getProducts({ limit: 1000, isActive: 'all', ...params });
      return res.data || res;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch saree products';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const createProductAction = createAsyncThunk(
  'product/createProduct',
  async (sareeData, thunkAPI) => {
    try {
      const res = await productService.createProduct(sareeData);
      return res.data || res;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create product';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const updateProductAction = createAsyncThunk(
  'product/updateProduct',
  async ({ id, sareeData }, thunkAPI) => {
    try {
      const res = await productService.updateProduct({ id, sareeData });
      return res.data || res;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update product';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const deleteProductAction = createAsyncThunk(
  'product/deleteProduct',
  async (id, thunkAPI) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete product';
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductFeedback: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH PRODUCTS
      .addCase(fetchProductsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsAction.fulfilled, (state, action) => {
        state.loading = false;
        const list = Array.isArray(action.payload) ? action.payload : action.payload?.data || [];
        state.products = list;
      })
      .addCase(fetchProductsAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE PRODUCT
      .addCase(createProductAction.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createProductAction.fulfilled, (state, action) => {
        state.submitting = false;
        const newProd = action.payload?.data || action.payload;
        if (newProd && newProd._id) {
          state.products.unshift(newProd);
          state.successMessage = `Product '${newProd.name}' added successfully!`;
        } else {
          state.successMessage = 'Product added successfully!';
        }
      })
      .addCase(createProductAction.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // UPDATE PRODUCT
      .addCase(updateProductAction.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateProductAction.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedProd = action.payload?.data || action.payload;
        const index = state.products.findIndex((p) => p._id === updatedProd._id);
        if (index !== -1) {
          state.products[index] = updatedProd;
        }
        state.successMessage = `Product '${updatedProd.name}' updated!`;
      })
      .addCase(updateProductAction.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      // DELETE PRODUCT
      .addCase(deleteProductAction.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.successMessage = 'Product deleted successfully!';
      })
      .addCase(deleteProductAction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearProductFeedback, setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
