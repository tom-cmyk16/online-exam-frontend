// src/components/ProfileForm.tsx
import React, { useState } from "react";
import {
  X,
  User,
  Mail,
  Building,
  Shield,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ProfileFormProps {
  onClose: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    username: localStorage.getItem("username") || "",
    role: localStorage.getItem("role") || "",
    department: localStorage.getItem("department") || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userRole = localStorage.getItem("role") || "";
  const isStudent = userRole === "student";

  // Format role name for display
  const getFormattedRole = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      student: "Student",
      instructor: "Instructor",
      admin: "Administrator",
      departmentHead: "Department Head",
      examCommittee: "Exam Committee",
    };
    return roleMap[role] || role;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;

    // Allow email and username editing, keep other fields read-only
    if (e.target.name === "email" || e.target.name === "username") {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username, // Include username in update
        }),
      });

      if (response.ok) {
        // Update localStorage
        localStorage.setItem("email", formData.email);
        localStorage.setItem("username", formData.username);
        setIsEditing(false);
        setSaveSuccess(true);

        // Show success message
        setTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      if (response.ok) {
        alert("Password changed successfully!");
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileFields = [
    {
      icon: User,
      label: "Full Name",
      name: "fullName",
      value: formData.fullName,
      editable: false, // NOT editable
      type: "text",
    },
    {
      icon: Mail,
      label: "Email",
      name: "email",
      value: formData.email,
      editable: true, // Editable
      type: "email",
    },
    {
      icon: User,
      label: "Username",
      name: "username",
      value: formData.username,
      editable: true, // Changed to true - NOW editable
      type: "text",
    },
    {
      icon: Shield,
      label: "Role",
      name: "role",
      value: getFormattedRole(formData.role),
      editable: false, // NOT editable
      type: "text",
    },
    {
      icon: Building,
      label: "Department",
      name: "department",
      value: formData.department,
      editable: false, // NOT editable
      type: "text",
    },
  ];

  return (
    <div className="bg-white rounded-lg w-full max-w-md mx-auto animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-5 h-5 text-green-600" />
          Profile Information
        </h2>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <div className="flex items-center gap-1 text-green-600 text-sm animate-fadeIn">
              <CheckCircle className="w-4 h-4" />
              Saved!
            </div>
          )}
          {!showChangePassword && (
            <>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm transform hover:scale-105"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 transform hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Information */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {!showChangePassword ? (
          <>
            {profileFields.map((field, index) => (
              <div
                key={index}
                className="space-y-2 transition-all duration-200 hover:bg-gray-50 rounded-lg p-2 -mx-2"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <field.icon className="w-4 h-4 text-green-600" />
                  {field.label}
                </label>
                {isEditing && field.editable ? (
                  <input
                    type={field.type}
                    name={field.name}
                    value={field.value}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                ) : (
                  <div
                    className={`w-full p-3 border rounded-lg text-gray-700 transition-all duration-200 ${
                      field.editable && isEditing
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    {field.value}
                  </div>
                )}
              </div>
            ))}

            {/* Change Password Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              >
                <Lock className="w-4 h-4" />
                Change Password
              </button>
            </div>

            {/* Information Message */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <AlertCircle className="w-4 h-4" />
                Only email and username can be updated. Contact administrator
                for other changes.
              </div>
            </div>
          </>
        ) : (
          /* Change Password Form */
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center mb-4">
              <Lock className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Change Password
              </h3>
              <p className="text-sm text-gray-600">
                Enter your current and new password
              </p>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-700">
                • Password must be at least 6 characters long
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowChangePassword(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isSubmitting ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!showChangePassword && (
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
