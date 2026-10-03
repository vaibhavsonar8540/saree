import { createSlice } from '@reduxjs/toolkit';
import { fetchHeaderCategoriesAction, fetchSubCategoriesAction } from '../action/headerAction';

const initialState = {
  categories: [],
  subCategories: [],
  loading: false,
  error: null,
  activeCategory: null,
  isCardOpen: false,
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  cartCount: 2,
  favouriteCount: 5,
  searchQuery: '',
};

const headerSlice = createSlice({
  name: 'header',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setIsCardOpen: (state, action) => {
      state.isCardOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.isMobileMenuOpen = false;
    },
    setIsCartDrawerOpen: (state, action) => {
      state.isCartDrawerOpen = action.payload;
    },
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },
    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
    toggleCartDrawer: (state) => {
      state.isCartDrawerOpen = !state.isCartDrawerOpen;
    },
    setCartCount: (state, action) => {
      state.cartCount = action.payload;
    },
    setFavouriteCount: (state, action) => {
      state.favouriteCount = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchHeaderCategoriesAction
      .addCase(fetchHeaderCategoriesAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeaderCategoriesAction.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];
        if (action.payload && action.payload.length > 0 && !state.activeCategory) {
          state.activeCategory = action.payload[0]._id;
        }
      })
      .addCase(fetchHeaderCategoriesAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load categories';
      })
      // Handle fetchSubCategoriesAction
      .addCase(fetchSubCategoriesAction.fulfilled, (state, action) => {
        state.subCategories = action.payload || [];
      });
  },
});

export const {
  setActiveCategory,
  setIsCardOpen,
  toggleMobileMenu,
  closeMobileMenu,
  setIsCartDrawerOpen,
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  setCartCount,
  setFavouriteCount,
  setSearchQuery,
} = headerSlice.actions;

export default headerSlice.reducer;
