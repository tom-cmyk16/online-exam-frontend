import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";

interface Profile {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
  image?: string;
}

const ProfileForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const storedProfile: Profile = {
      fullName: localStorage.getItem("fullName") || "Unknown",
      username: localStorage.getItem("username") || "Unknown",
      email: localStorage.getItem("email") || "Unknown",
      role: localStorage.getItem("role") || "student",
      department: localStorage.getItem("department") || "N/A",
      image: localStorage.getItem("image") || "",
    };
    setProfile(storedProfile);
  }, []);

  if (!profile) return null;

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const newProfile = { ...profile, image: reader.result as string };
        setProfile(newProfile);
        localStorage.setItem("image", reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (profile) {
      Object.entries(profile).forEach(([key, value]) =>
        localStorage.setItem(key, value as string)
      );
      setEditMode(false);
    }
  };

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    localStorage.setItem("password", newPassword);
    alert("Password changed successfully!");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordChange(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-green-700">👤 Profile</h2>

      {/* Profile Image */}
      <div className="flex flex-col items-center mb-4">
        <img
          src={profile.image || "https://via.placeholder.com/100"}
          alt="Profile"
          className="w-24 h-24 rounded-full border object-cover"
        />
        {editMode && (
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2"
          />
        )}
      </div>

      {/* Profile Info */}
      {editMode ? (
        <form onSubmit={handleSave}>
          <input
            type="text"
            value={profile.fullName}
            onChange={(e) =>
              setProfile({ ...profile, fullName: e.target.value })
            }
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="text"
            value={profile.username}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="border p-2 w-full mb-2 rounded"
          />
          <input
            type="text"
            value={profile.department}
            onChange={(e) =>
              setProfile({ ...profile, department: e.target.value })
            }
            className="border p-2 w-full mb-2 rounded"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <p>
            <b>Full Name:</b> {profile.fullName}
          </p>
          <p>
            <b>Username:</b> {profile.username}
          </p>
          <p>
            <b>Email:</b> {profile.email}
          </p>
          <p>
            <b>Role:</b> {profile.role}
          </p>
          <p>
            <b>Department:</b> {profile.department}
          </p>
        </div>
      )}

      {/* Buttons */}
      {!editMode && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setEditMode(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Change Password
          </button>
          <button
            onClick={onClose}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      )}

      {/* Change Password Form */}
      {showPasswordChange && (
        <form onSubmit={handlePasswordChange} className="mt-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border p-2 w-full mb-2 rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Update Password
            </button>
            <button
              onClick={() => setShowPasswordChange(false)}
              className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileForm;
