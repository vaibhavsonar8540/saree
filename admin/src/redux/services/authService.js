import { loginApi, registerApi, logoutApi, getMeApi } from '../../utils/api';

const authService = {
  login: async (email, password) => {
    const data = await loginApi(email, password);
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    const data = await registerApi(userData);
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
    }
    return data;
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore API errors on logout
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },

  getMe: async () => {
    const data = await getMeApi();
    return data;
  },
};

export default authService;
