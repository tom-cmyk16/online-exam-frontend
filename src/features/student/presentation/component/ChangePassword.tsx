// src/features/student/pages/ChangePassword.tsx
import React, { useState } from "react";
import StudentLayout from "../components/StudentLayout";

const ChangePassword: React.FC = () => {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const handleChangePassword = () => {
    console.log("Old:", oldPass, "New:", newPass);
  };

  return (
    <StudentLayout>
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <input
        type="password"
        className="w-full p-2 mb-2 border rounded-md"
        placeholder="Old Password"
        value={oldPass}
        onChange={(e) => setOldPass(e.target.value)}
      />
      <input
        type="password"
        className="w-full p-2 mb-2 border rounded-md"
        placeholder="New Password"
        value={newPass}
        onChange={(e) => setNewPass(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={handleChangePassword}
      >
        Update Password
      </button>
    </StudentLayout>
  );
};

export default ChangePassword;
