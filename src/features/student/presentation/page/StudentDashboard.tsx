import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../../core/component/card";
import api from "../../../../api/xiosInstance";

interface DashboardStats {
  totalExams: number;
  completedExams: number;
  scheduledExams: number;
  averageScore: number;
}

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    completedExams: 0,
    scheduledExams: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get("/student/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <Link
          to="/main/student/take-exam"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Take Exam
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Exams"
          value={stats.totalExams}
          variant="primary"
        />
        <StatCard
          title="Completed Exams"
          value={stats.completedExams}
          variant="success"
        />
        <StatCard
          title="Scheduled Exams"
          value={stats.scheduledExams}
          variant="info"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          variant="info"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/main/student/take-exam"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">Take Exam</h3>
            <p className="text-sm text-gray-600">Start a new exam</p>
          </Link>
          <Link
            to="/main/student/assigned-courses"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <h3 className="font-medium text-gray-900">My Courses</h3>
            <p className="text-sm text-gray-600">View assigned courses</p>
          </Link>
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-medium text-gray-900">Exam Results</h3>
            <p className="text-sm text-gray-600">View your results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
