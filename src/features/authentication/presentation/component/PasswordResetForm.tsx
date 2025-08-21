import React, { useState } from "react";
interface PasswordResetFormProps {
  onReset: (email: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  onReset,
  onCancel,
  isLoading,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onReset(email);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your registered email"
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Back to Login
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Reset Password"}
        </button>
      </div>
    </form>
  );
};

export default PasswordResetForm;
