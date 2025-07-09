import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "text";
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  loading = false,
  fullWidth = true,
  className = "",
  ...props
}) => {
  const baseStyles =
    "py-2 rounded-lg transition font-medium focus:outline-none focus:ring-2";
  const widthClass = fullWidth ? "w-full" : "w-auto";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-70",
    text: "text-blue-600 hover:underline",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;
