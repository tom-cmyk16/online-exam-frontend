// src/components/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = "primary",
  loading = false,
  ...rest
}) => {
  const baseStyle = "w-full py-2 rounded-lg text-white transition duration-200";
  const variantStyle =
    variant === "primary"
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      {...rest}
      className={`${baseStyle} ${variantStyle} ${
        rest.disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Please wait..." : label}
    </button>
  );
};

export default Button;
