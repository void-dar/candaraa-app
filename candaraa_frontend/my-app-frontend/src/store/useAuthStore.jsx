import { create } from "zustand";
import jwtDecode from "jwt-decode";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("token")
    ? jwtDecode(localStorage.getItem("token"))
    : null,

  setToken: (token) => {
    const decoded = jwtDecode(token);
    set({ token, user: decoded });
    localStorage.setItem("token", token);
  },

  clearAuth: () => {
    set({ token: null, user: null });
    localStorage.removeItem("token");
  },
}));
