import axios from "axios";
<<<<<<< HEAD

// Use proxy in development, full URL in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Handle CORS and network errors
    if (!error.response) {
      console.error("🚫 Network Error - Backend server may not be running");
      console.error("📍 API Base URL:", API_BASE_URL);
      console.error("🔧 Environment:", import.meta.env.DEV ? "Development" : "Production");
      console.error("💡 Solutions:");
      console.error("   1. Start the backend server: npm run dev (in server folder)");
      console.error("   2. Check if backend is running on http://localhost:5000");
      console.error("   3. Verify CORS is configured on the backend");
      console.error("   4. Check if proxy is working in vite.config.ts");

      // Show user-friendly error
      const userError = new Error("Cannot connect to server. Please check if the backend is running.");
      userError.name = "ConnectionError";
      return Promise.reject(userError);
    }

    if (error.response?.status === 401) {
      console.warn("🔐 Authentication failed - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    console.error("❌ API Error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
=======
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
