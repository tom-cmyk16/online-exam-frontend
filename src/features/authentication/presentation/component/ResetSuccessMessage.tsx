// src/features/authentication/presentation/pages/ResetSuccessMessage.tsx
import React from "react";

interface ResetSuccessMessageProps {
  onBackToLogin: () => void;
}

const ResetSuccessMessage: React.FC<ResetSuccessMessageProps> = ({
  onBackToLogin,
}) => {
  return (
    <div className="text-center space-y-4">
      <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
        Password reset instructions have been sent to your email. Please check
        your inbox.
      </div>
      <button
        onClick={onBackToLogin}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Back to Login
      </button>
    </div>
  );
};

export default ResetSuccessMessage;
