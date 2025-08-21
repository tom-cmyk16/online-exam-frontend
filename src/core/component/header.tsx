// src/components/Header.tsx
import React, { useState } from "react";
import { UserCircle2, LogOut, Search } from "lucide-react";
import ProfileForm from "./ProfileForm";
import LogoutForm from "../logout";

const Header: React.FC = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggedOutToast, setLoggedOutToast] = useState(false);
  const username = localStorage.getItem("username") || "Unknown";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("department");

    setShowLogoutConfirm(false);
    setLoggedOutToast(true);
    setTimeout(() => setLoggedOutToast(false), 1500);
  };

  return (
    <>
      <header className="flex justify-between items-center bg-green-50 border-b border-green-300 shadow-md px-7 py-4">
        <div className="text-xl font-bold text-green-800 flex items-center gap-2">
          🎓Online Exam System
          <span className="text-sm font-normal text-green-600 capitalize ml-2">
            ( {username})
          </span>
        </div>

        <div className="flex items-center gap-6">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border border-green-300 rounded-lg px-6 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400"
            />
            <Search className="absolute right-2 top-2 h-4 w-4 text-green-600" />
          </div>

          {/* Profile Button */}
          <button
            title={`Logged in as ${username}`}
            className="rounded p-3 text-green-700 hover:text-green-900 hover:bg-green-100"
            onClick={() => setShowProfile(true)}
          >
            <UserCircle2 className="w-7 h-7" />
          </button>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-red-600 hover:text-white hover:bg-red-600 text-sm font-semibold flex items-center gap-1 px-3 py-1 rounded transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </header>

      {/* Toast */}
      {loggedOutToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
          Logged out
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div
          className="fixed inset-0 z-30 flex items-start justify-end bg-black/40 pt-4 pr-1"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileForm onClose={() => setShowProfile(false)} />
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <LogoutForm
          username={username}
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
};

export default Header;
