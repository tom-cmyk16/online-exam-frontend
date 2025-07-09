import { useState } from "react";

const ChangePassword = () => {
  const [password, setPassword] = useState("");

  const handleChange = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    alert("Password changed successfully!");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-blue-700 mb-4">
        Change Password
      </h1>
      <form onSubmit={handleChange} className="space-y-4">
        <input
          type="password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};
