import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  variant?: "primary" | "success" | "danger" | "info";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  badgeText,
  variant = "primary",
}) => {
  // Color configuration based on variant
  const colorVariants = {
    primary: {
      text: "text-primary",
      bg: "bg-primary-100",
      border: "border-primary-200",
    },
    success: {
      text: "text-success",
      bg: "bg-success-100",
      border: "border-success-200",
    },
    danger: {
      text: "text-danger",
      bg: "bg-danger-100",
      border: "border-danger-200",
    },
    info: {
      text: "text-info",
      bg: "bg-info-100",
      border: "border-info-200",
    },
  };

  const colors = colorVariants[variant];

  return (
    <div
      className={`group relative bg-white ${colors.border} p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 transform hover:scale-[1.02]`}
    >
      {badgeText && (
        <div
          className={`absolute top-3 right-3 ${colors.bg} ${colors.text} text-xs font-semibold px-2 py-1 rounded-full shadow`}
        >
          {badgeText}
        </div>
      )}

      <div className="relative z-10">
        <h3 className={`text-sm font-medium ${colors.text}`}>{title}</h3>
        <p className={`text-3xl font-bold mt-1 ${colors.text}`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
