import api from "@/lib/api";
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post("/Auth/login", credentials);
    if (response.data.token) {
      const token = response.data.token;
      const decoded: any = jwtDecode(token);
      
      // Extract permissions from claims
      // Claims might be a single string or an array of strings
      const permissionClaims = decoded["Permission"] || [];
      const permissions = Array.isArray(permissionClaims) ? permissionClaims : [permissionClaims];

      const user = {
        ...response.data.user,
        permissions: permissions
      };

      Cookies.set('token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { ...response.data, user };
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
