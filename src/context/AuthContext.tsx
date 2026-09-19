import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // 🔥 RESET TOKEN DI SETIAP START APLIKASI
    resetAndLoadData();
  }, []);

  const resetAndLoadData = async () => {
    try {
      // 🔥 HAPUS SEMUA TOKEN LAMA
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_user");

      // Reset state
      setToken(null);
      setUser(null);
      delete api.defaults.headers.Authorization;
    } catch (error) {
      console.error("Error resetting auth data:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/login", { email, password });

      if (response.data.success) {
        const { token, user } = response.data;

        await SecureStore.setItemAsync("auth_token", token);
        await SecureStore.setItemAsync("auth_user", JSON.stringify(user));

        setToken(token);
        setUser(user);
        api.defaults.headers.Authorization = `Bearer ${token}`;

        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login gagal",
      };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post("/logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_user");
      setToken(null);
      setUser(null);
      delete api.defaults.headers.Authorization;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
