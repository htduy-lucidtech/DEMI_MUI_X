import api from "@/services/api";
import Cookies from 'js-cookie';

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post("/Auth/login", credentials);
    if (response.data.token) {
      Cookies.set('token', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "/login";
  }
};
