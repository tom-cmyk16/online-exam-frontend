import React, { useState } from "react";
import logo from "../../assets/logo.png";
import PasswordResetForm from "../../component/authenticationcompont/PasswordResetForm";
import LoginForm from "../../component/authenticationcompont/LoginForm";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../../firebase/config";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Login logic with Firebase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );

      const user = userCredential.user;
      console.log("Logged in user:", user);

      // Redirect or navigate to role-based dashboard (example only)
      switch (userRole) {
        case "student":
          window.location.href = "/student/dashboard";
          break;
        case "instructor":
          window.location.href = "/instructor/dashboard";
          break;
        case "admin":
          window.location.href = "/admin";
          break;
        case "exam_committee":
          window.location.href = "/exam-committee";
          break;
        default:
          alert("Invalid role");
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      alert("Login failed. " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Reset password logic with Firebase
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage(`Password reset link sent to ${resetEmail}`);
      setTimeout(() => {
        setShowResetForm(false);
        setResetMessage("");
      }, 3000);
    } catch (error: any) {
      setResetMessage("Failed to send reset link: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <img
          src={logo}
          alt="Debre Tabor University Logo"
          className="w-24 h-24 mx-auto mb-4 object-contain"
        />
        <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center leading-relaxed">
          Online Course Examination
          <br />
          Debre Tabor University
        </h1>

        {showResetForm ? (
          <PasswordResetForm
            resetEmail={resetEmail}
            onResetEmailChange={(e) => setResetEmail(e.target.value)}
            onSubmit={handlePasswordReset}
            isLoading={isLoading}
            resetMessage={resetMessage}
            onBackToLogin={() => setShowResetForm(false)}
          />
        ) : (
          <LoginForm
            username={username}
            password={password}
            userRole={userRole}
            onUsernameChange={(e) => setUsername(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            onUserRoleChange={(e) => setUserRole(e.target.value)}
            onSubmit={handleLoginSubmit}
            isLoading={isLoading}
            onForgotPasswordClick={() => setShowResetForm(true)}
          />
        )}
      </div>
    </div>
  );
};

export default LoginPage;
