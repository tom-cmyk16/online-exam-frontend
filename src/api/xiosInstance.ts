import axios from "axios";

// ✅ ቋሚ መፍትሄ፡ Production ላይ የ Render ሊንክን፣ Development ላይ localhostን ይጠቀማል
const API_BASE_URL = "https://online-exam-backend-1o6z.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 15000, // ሰርቨሩ Render ላይ ተኝቶ ከሆነ ለመቀስቀስ ትንሽ ሰዓት እንዲኖረው 15 ሰከንድ ተደርጓል
});

// Request interceptor - ቶክን ለመጨመር
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ ወሳኝ ማስተካከያ፡ በስህተት ቀድሞ የሚመጣን / በማጥፋት ከ baseURL ጋር እንዲገጣጠም ያደርጋል
    // ለምሳሌ "/manageuser" ወደ "manageuser" ይቀየራል
    if (config.url && config.url.startsWith("/")) {
      config.url = config.url.substring(1);
    }

    console.log(
      "📤 API Request:",
      config.method?.toUpperCase(),
      `${config.baseURL}/${config.url}`,
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - ለስህተቶች
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error(
        "🚫 Network Error - Check if Backend is running at:",
        API_BASE_URL,
      );
    }

    if (error.response?.status === 401) {
      console.warn("🔐 Session expired - redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // አስፈላጊ ከሆነ ወደ login እንዲሄድ ማድረግ ይቻላል
      // window.location.href = "/login";
    }

    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data,
    );
    return Promise.reject(error);
  },
);

export default api;
