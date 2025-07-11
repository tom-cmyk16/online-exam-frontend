import React from "react";
import TextBox from "../../../../core/component/commonTextBox";
import Button from "../../../../core/component/commonButton";

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
        <TextBox
          name="email"
          label="enter your email"
          value={resetEmail}
          onChange={onResetEmailChange}
        ></TextBox>
      </div>

      <Button
        title="Send Reset Link"
        type="submit"
        fullWidth
        isLoading={isLoading}
        variant="primary"
      >
        Send Reset Link
      </Button>

      <button
        type="button"
        className="text-blue-600 underline mt-2 text-sm cursor-pointer"
        onClick={onBackToLogin}
      >
        Back to Login
      </button>
    </form>
  </>
);

export default PasswordResetForm;
