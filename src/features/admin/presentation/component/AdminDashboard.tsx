import React, { useState, useEffect } from "react";
import axios from "axios";

// Types
interface User {
  _id: string;
  fullName: string;
  username: string;
  role: string;
  department: string;
  isActive: boolean;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: "success" | "warning" | "error" | "info";
}

interface DashboardStats {
  totalUsers: number;
  students: number;
  instructors: number;
  admins: number;
  recentActivity: Activity[];
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token") || "";
const axiosConfig = { headers: { Authorization: `Bearer ${getToken()}` } };

// ---------------- Hook to fetch dashboard data ----------------
const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    students: 0,
    instructors: 0,
    admins: 0,
    recentActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [usersRes, activityRes] = await Promise.all([
        axios.get<User[]>(`${API_BASE}/manageuser`, axiosConfig),
        axios
          .get<Activity[]>(`${API_BASE}/activity`, axiosConfig)
          .catch(() => []),
      ]);

      const usersData = usersRes.data;
      const activityData =
        activityRes instanceof Array ? activityRes : activityRes.data;

      // Calculate statistics
      const totalUsers = usersData.length;
      const students = usersData.filter((u) => u.role === "student").length;
      const instructors = usersData.filter(
        (u) => u.role === "instructor"
      ).length;
      const admins = usersData.filter((u) =>
        ["admin", "departmentHead", "examCommittee"].includes(u.role)
      ).length;

      setStats({
        totalUsers,
        students,
        instructors,
        admins,
        recentActivity: activityData.slice(0, 10), // Limit to 10
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch dashboard"
      );
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return { stats, isLoading, error, refetch: fetchDashboardStats };
};

// ---------------- Components ----------------
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div
    className={`p-6 rounded-xl shadow-lg border-l-4 ${color} bg-white hover:shadow-xl transition-shadow duration-300`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full bg-${color.split("-")[1]}-100`}>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  </div>
);

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
  const typeColors = {
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
      <div
        className={`w-3 h-3 rounded-full ${typeColors[activity.type]}`}
      ></div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">{activity.action}</p>
        <p className="text-xs text-gray-500">
          By {activity.user} • {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ---------------- Main Dashboard ----------------
const AdminDashboard: React.FC = () => {
  const { stats, isLoading, error, refetch } = useDashboardData();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="👥"
                color="border-blue-500"
              />
              <StatCard
                title="Students"
                value={stats.students}
                icon="🎓"
                color="border-green-500"
              />
              <StatCard
                title="Instructors"
                value={stats.instructors}
                icon="👨‍🏫"
                color="border-purple-500"
              />
              <StatCard
                title="Administrators"
                value={stats.admins}
                icon="🔧"
                color="border-orange-500"
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
