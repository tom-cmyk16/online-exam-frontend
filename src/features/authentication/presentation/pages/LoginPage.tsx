import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/xiosInstance";
import logo from "../../../../assets/logo.png";
import RoleStand from "../../../../core/component/Role";
import PasswordResetForm from "../component/PasswordResetForm";
import ResetSuccessMessage from "../component/ResetSuccessMessage";
import TextBox from "../../../../core/component/commonTextBox";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const updaterole = RoleStand((state) => state.updaterole);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      alert("Please enter username and password");
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.post(`/auth/login`, {
        username: username.trim(),
        password: password.trim(),
      });

      const user = res.data.user;
      const token = res.data.token;

      if (!user || !token) throw new Error("Invalid login response");

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
      console.error("Login error:", err);
      alert(err.response?.data?.message || "❌ Login failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (email: string) => {
    try {
      setIsLoading(true);
      await api.post(`/auth/reset-password`, { email });
      setShowResetForm(false);
      setShowResetSuccess(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "❌ Failed to send reset email");
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

        {showResetForm ? (
          <PasswordResetForm
            onReset={handleReset}
            onCancel={() => setShowResetForm(false)}
            isLoading={isLoading}
          />
        ) : showResetSuccess ? (
          <ResetSuccessMessage
            onBackToLogin={() => setShowResetSuccess(false)}
          />
        ) : (
          <>
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
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="text-right mt-3">
              <button
                onClick={() => setShowResetForm(true)}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
