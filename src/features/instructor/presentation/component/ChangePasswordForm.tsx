import React, { useState } from "react";

const ChangePasswordForm: React.FC = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect with backend (e.g., Firebase auth update)
    setMessage("Password changed successfully.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <form onSubmit={handleChange} className="space-y-4">
      {message && <div className="text-green-600">{message}</div>}
      <div>
        <label className="font-medium">Old Password</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="font-medium">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Change Password
      </button>
    </form>
  );
};

export default ChangePasswordForm;
