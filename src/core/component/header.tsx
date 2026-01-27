// src/components/Header.tsx
import React, { useState } from "react";
<<<<<<< HEAD
import { UserCircle2, LogOut, ChevronDown, X, Key } from "lucide-react";
import LogoutForm from "../logout";
import logo from "../../assets/logo.png";

const Header: React.FC = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggedOutToast, setLoggedOutToast] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fullName = localStorage.getItem("fullName") || "Not available";
  const role = localStorage.getItem("role") || "Not available";
  const department = localStorage.getItem("department") || "Not available";
  const email = localStorage.getItem("email") || "Not available";
  const username = localStorage.getItem("username") || "Not available";

  const getFormattedRole = (role: string) => {
    const map: { [key: string]: string } = {
      student: "Student",
      instructor: "Instructor",
      admin: "Administrator",
      departmentHead: "Department Head",
      examCommittee: "Exam Committee",
    };
    return map[role] || role;
  };

  const handleLogout = () => {
    ["token", "role", "username", "email", "fullName", "department"].forEach(
      (key) => localStorage.removeItem(key)
    );
    setShowLogoutConfirm(false);
    setLoggedOutToast(true);
    setTimeout(() => {
      setLoggedOutToast(false);
      window.location.reload();
    }, 1500);
=======
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
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
  };

  return (
    <>
<<<<<<< HEAD
      <header className="sticky top-0 z-20 flex justify-between items-center bg-green-50 border-b border-green-200 px-6 py-3 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-1 rounded-lg">
            <img
              src={logo}
              alt="University Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-green-800">
              Online Exam System
            </h1>
            <p className="text-green-700 text-xs">
              Secure Examination Platform
            </p>
          </div>
        </div>

        {/* User Info - Non-clickable area */}
        <div className="flex items-center gap-3 select-none">
          <div className="bg-white px-4 py-2 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-green-700">Role:</span>
              <span className="text-green-900 capitalize">
                {getFormattedRole(role)}
              </span>
            </div>
          </div>

          {/* Show department only if role is not admin and not student */}
          {role !== "admin" && role !== "student" && (
            <div className="bg-white px-4 py-2 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-green-700">
                  Department:
                </span>
                <span className="text-green-900">{department}</span>
              </div>
            </div>
          )}

          {/* Show full name and department for students only */}
          {role === "student" && (
            <div className="bg-white px-4 py-2 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-green-700">Name:</span>
                <span className="text-green-900">{fullName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="font-semibold text-green-700">
                  Department:
                </span>
                <span className="text-green-900">{department}</span>
              </div>
            </div>
          )}
        </div>

        {/* User Menu - Only this area is clickable */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-green-800 hover:bg-green-100 rounded-lg transition-colors border border-transparent hover:border-green-200"
          >
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center border border-green-300">
              <span className="text-green-800 text-sm font-semibold">
                {fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform text-green-700 ${
                showUserMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-12 mt-1 w-56 bg-white rounded-lg shadow-lg border border-green-100 py-2 z-30">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-green-700 hover:bg-green-100 transition-colors"
              >
                <UserCircle2 className="w-4 h-4" />
                <span>View Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowChangePassword(true);
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-green-700 hover:bg-green-100 transition-colors"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </button>

              <div className="border-t border-green-50 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Profile Slide-in Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowProfile(false)}
          />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-green-100 bg-green-50">
                <h2 className="text-xl font-bold text-green-800">
                  User Profile
                </h2>
                <button
                  onClick={() => setShowProfile(false)}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-green-700" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center border-4 border-green-300 mx-auto mb-4">
                    <span className="text-green-800 text-2xl font-bold">
                      {fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">
                    {fullName}
                  </h3>
                  <p className="text-green-600 capitalize">
                    {getFormattedRole(role)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-3">
                      Personal Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-green-600 font-medium">
                          Full Name
                        </label>
                        <p className="text-green-900">{fullName}</p>
                      </div>
                      <div>
                        <label className="text-xs text-green-600 font-medium">
                          Email
                        </label>
                        <p className="text-green-900">{email}</p>
                      </div>
                      <div>
                        <label className="text-xs text-green-600 font-medium">
                          Username
                        </label>
                        <p className="text-green-900">{username}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-3">
                      Role Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-green-600 font-medium">
                          Role
                        </label>
                        <p className="text-green-900 capitalize">
                          {getFormattedRole(role)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-green-600 font-medium">
                          Department
                        </label>
                        <p className="text-green-900">{department}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-green-100 bg-green-50">
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Panel */}
      {showChangePassword && (
        <div className="fixed inset-0 z-30">
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowChangePassword(false)}
          />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-green-100 bg-green-50">
                <h2 className="text-xl font-bold text-green-800">
                  Change Password
                </h2>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-green-700" />
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-green-700 mb-2">
                      Password Requirements
                    </h4>
                    <ul className="text-xs text-green-600 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-green-100 bg-green-50">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle password change logic here
                      setShowChangePassword(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loggedOutToast && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 text-green-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 bg-green-700 rounded-full animate-pulse"></div>
          Successfully logged out
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutForm
          username={fullName}
=======
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
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutConfirm(false)}
        />
      )}
<<<<<<< HEAD

      {showUserMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowUserMenu(false)}
        />
      )}
=======
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
    </>
  );
};

export default Header;
