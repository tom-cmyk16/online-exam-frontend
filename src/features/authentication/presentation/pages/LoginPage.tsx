import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../../assets/logo.png";
import RoleStand from "../../../../core/component/Role";
import PasswordResetForm from "../component/PasswordResetForm";
import ResetSuccessMessage from "../component/ResetSuccessMessage";
import TextBox from "../../../../core/component/commonTextBox";
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
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });
      console.log("Login response:", res.data);

      const user = res.data.user;
      if (!user) throw new Error("No user data returned");

      // Persist auth/session details so protected routes render
      localStorage.setItem("token", res.data.token || "true");
      localStorage.setItem("role", user.role);
      localStorage.setItem("username", user.username);
      if (user.department)
        localStorage.setItem("department", user.department || "");
      if (user.fullName) localStorage.setItem("fullName", user.fullName || "");
      if (user._id) localStorage.setItem("userId", user._id);

      // Update in-memory role for routing/menus
      updaterole(user.role);

      navigate(`/main?role=${user.role}&username=${user.username}`);
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
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        email,
      });
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
        style={{
          maxWidth: "438px",
          minHeight: "450px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
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
