import React from "react";

const LoadingSpinner: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex justify-center items-center min-h-64">
      <div
        className={`animate-spin border-4 border-green-600 border-t-transparent rounded-full ${sizeClasses[size]}`}
      />
    </div>
  );
};

export default LoadingSpinner;
