import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/xiosInstance";
import logo from "../../../../assets/logo.png";
import RoleStand from "../../../../core/component/Role";
import TextBox from "../../../../core/component/commonTextBox";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const navigate = useNavigate();
  const updaterole = RoleStand((state) => state.updaterole);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter username and password");
      return;
    }

    try {
      setIsLoading(true);
      setLoginError(null);
      
      console.log("🔐 Attempting login with:", { username: username.trim() });
      
      const res = await api.post(`/auth/login`, {
        username: username.trim(),
        password: password.trim(),
      });

      const user = res.data.user;
      const token = res.data.token;

      if (!user || !token) throw new Error("Invalid login response");

      console.log("✅ Login successful:", { role: user.role, username: user.username });

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user._id || "");
      localStorage.setItem("fullName", user.fullName || "");
      if (user.department) localStorage.setItem("department", user.department);

      updaterole(user.role);

      navigate("/main"); // Redirect to dashboard
    } catch (err: any) {
      console.error("❌ Login error:", err);
      
      if (err.response?.status === 401) {
        setLoginError("Invalid username or password. Please check your credentials.");
      } else if (err.name === "ConnectionError") {
        setLoginError("Cannot connect to server. Please check if the backend is running.");
      } else {
        setLoginError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full"
        style={{ maxWidth: "438px", minHeight: "450px" }}
      >
        <div className="text-center mb-6">
          <img src={logo} alt="Logo" className="mx-auto h-20 w-20" />
          <h2 className="text-xl font-semibold mt-2 text-green-700">
            DEBRE TABOR UNIVERSITY
          </h2>
          <h2 className="text-xl font-semibold text-green-700">
            ONLINE EXAM SYSTEM
          </h2>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            ❌ {loginError}
          </div>
        )}

        <TextBox
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
        />
        <TextBox
          name="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;