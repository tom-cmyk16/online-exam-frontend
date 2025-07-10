import React from "react";
import Button from "../../component/studentpagescompont/Buttons";

interface PasswordResetFormProps {
  resetEmail: string;
  onResetEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  resetMessage: string;
  onBackToLogin: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({
  resetEmail,
  onResetEmailChange,
  onSubmit,
  isLoading,
  resetMessage,
  onBackToLogin,
}) => (
  <>
    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
      Reset Password
    </h2>

    {resetMessage && (
      <div
        className={`mb-4 p-3 rounded-lg text-sm ${
          resetMessage.includes("Failed")
            ? "bg-red-100 text-red-700"
            : "bg-green-100 text-green-700"
        }`}
      >
        {resetMessage}
      </div>
    )}

    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={resetEmail}
          onChange={onResetEmailChange}
          required
        />
      </div>

      <Button
        label="Send Reset Link"
        type="submit"
        loading={isLoading}
        variant="secondary"
      />

      <button
        type="button"
        className="text-blue-600 underline mt-2 text-sm"
        onClick={onBackToLogin}
      >
        Back to Login
      </button>
    </form>
  </>
);

export default PasswordResetForm;
