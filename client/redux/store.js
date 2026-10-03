import { configureStore } from '@reduxjs/toolkit';
import headerReducer from './slice/headerSlice';

export const store = configureStore({
  reducer: {
    header: headerReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
