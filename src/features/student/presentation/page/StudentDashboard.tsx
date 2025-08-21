// src/features/student/presentation/components/StudentDashboard.tsx
import React from "react";
import StatCard from "../../../../core/component/card";
interface DashboardStats {
  scheduledExams: number;
  passPercentage: number;
  failPercentage: number;
  activeusere: number;
}

const StudentDashboard: React.FC = () => {
  // Example data - should be replaced with actual API call
  const dashboardStats: DashboardStats = {
    scheduledExams: 5,
    passPercentage: 78,
    failPercentage: 22,
    activeusere: 45,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Scheduled Exams"
          value={`${dashboardStats.scheduledExams}%`}
          badgeText="New"
          variant="info"
        />

        <StatCard
          title="Pass Percentage"
          badgeText="New "
          value={`${dashboardStats.passPercentage}%`}
          variant="success"
        />

        <StatCard
          title="Fail Percentage"
          value={`${dashboardStats.failPercentage}%`}
          variant="danger"
        />
        <StatCard
          title="Total user"
          value={`${dashboardStats.activeusere}%`}
          variant="danger"
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
