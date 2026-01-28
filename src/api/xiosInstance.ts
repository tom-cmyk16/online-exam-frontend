import axios from "axios";

// Render ላይ ያለው የBackend አድራሻ በቀጥታ እዚህ ገብቷል
const API_BASE_URL = "https://online-exam-backend-1o6z.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ይሄ ኢንተርሴፕተር በጣም ወሳኝ ነው!
// በስህተት "/manageuser" ብለህ ብትጽፍ እንኳ ራሱ አስተካክሎ "manageuser" ያደርገዋል
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ወሳኝ፡ የ baseURL /api እንዳይጠፋ መጀመሪያ ላይ slash ካለ ያጠፋዋል
  if (config.url && config.url.startsWith("/")) {
    config.url = config.url.substring(1);
  }

  return config;
});

export default api;
