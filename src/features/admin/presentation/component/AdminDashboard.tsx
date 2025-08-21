// src/features/admin/presentation/pages/AdminDashboard.tsx
import { CalendarCheck } from "lucide-react";
import StatCard from "../../../../core/component/card";
const AdminDashboard = () => {
  return (
    <div className="p-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Users"
          value="120"
          badgeText="Active"
          variant="primary"
        />
        <StatCard
          title="Student Pass %"
          value="72%"
          badgeText="Pass"
          variant="success"
        />
        <StatCard
          title="Student Fail %"
          value="28%"
          badgeText="Fail"
          variant="danger"
        />
        <StatCard
          title="Active Users"
          value="94"
          badgeText="Online"
          variant="info"
        />
      </div>

      {/* Schedule Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5" />
          Schedule Overview
        </h2>
        <p className="text-sm text-gray-600">No upcoming exams this week.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
