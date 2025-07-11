import React, { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center justify-center cursor-pointer gap-2";
  const widthClass = fullWidth ? "w-full" : "w-auto";

  const variantClasses = {
    primary:
      "bg-green-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-opacity-50",
    outline:
      "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50",
  };

  const disabledClasses =
    disabled || isLoading ? "opacity-70 cursor-not-allowed" : "";
  const loadingClasses = isLoading ? "cursor-wait" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${disabledClasses} ${loadingClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {children}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};

export default Button;
