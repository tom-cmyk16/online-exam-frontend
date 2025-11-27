// src/components/common/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  bgColor = "bg-white",
  textColor = "text-gray-800",
}) => {
  return (
    <div
      className={`rounded-2xl shadow-md p-6 w-full sm:w-64 ${bgColor} ${textColor} transition-transform hover:scale-105`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium">{title}</h4>
        {icon && <div className="text-xl">{icon}</div>}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
};

export default DashboardCard;
