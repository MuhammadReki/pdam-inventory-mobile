import axios from "axios";

// 🔥 PILIH URL SECARA OTOMATIS!
// Kalo jalan di Expo Go (development) → pake URL LOCAL
// Kalo udah jadi APK (production) → pake URL PUBLIC
const API_BASE_URL = __DEV__
  ? process.env.EXPO_PUBLIC_API_URL_LOCAL
  : process.env.EXPO_PUBLIC_API_URL_PUBLIC;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default api;
