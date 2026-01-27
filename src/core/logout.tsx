import React from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";

interface LogoutFormProps {
  username?: string;
<<<<<<< HEAD
  onConfirm?: () => void; // Called when logout is confirmed
  onCancel?: () => void; // Called when modal is closed without logout
}

const LogoutForm: React.FC<LogoutFormProps> = ({ username, onConfirm, onCancel }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      // Clear localStorage immediately
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      // Redirect to login page
      navigate("/login");
    }
=======
  onCancel?: () => void; // Called when modal is closed without logout
}

const LogoutForm: React.FC<LogoutFormProps> = ({ username, onCancel }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage immediately
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");

    // Redirect to login page
    navigate("/login");
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-200 overflow-hidden p-6 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <LogOut className="text-red-500 w-10 h-10 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Confirm Logout
        </h3>
        <p className="text-gray-600 text-center mb-6">
          {username
            ? `Are you sure you want to log out, ${username}?`
            : "Are you sure you want to log out?"}
        </p>

        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md w-1/2"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center justify-center gap-2 w-1/2"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutForm;
