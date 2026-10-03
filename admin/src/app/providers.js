'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>{children}</AuthProvider>
    </Provider>
  );
}
