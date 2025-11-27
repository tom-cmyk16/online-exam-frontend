import React, { useEffect, useState } from "react";
import axios from "axios";

// ---------- Types ----------
interface Stats {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalExams: number;
}

interface User {
  _id: string;
  fullName: string;
  department: string;
  role: string;
}

const DepartmentDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    totalExams: 0,
  });

  const [loading, setLoading] = useState(true);
  const [departmentName, setDepartmentName] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDepartmentStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "http://localhost:5000/api/department/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(res.data.stats);
        setDepartmentName(res.data.departmentName);
      } catch (error) {
        console.error("Error fetching department stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading Department Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-green-500">
          <h2 className="text-gray-600 font-semibold">Total Students</h2>
          <p className="text-3xl font-bold text-green-700 mt-2">
            {stats.totalStudents}
          </p>
        </div>

        {/* Total Instructors */}
        <div className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-blue-500">
          <h2 className="text-gray-600 font-semibold">Total Instructors</h2>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {stats.totalInstructors}
          </p>
        </div>

        {/* Total Courses */}
        <div className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-yellow-500">
          <h2 className="text-gray-600 font-semibold">Total Courses</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.totalCourses}
          </p>
        </div>

        {/* Total Exams */}
        <div className="bg-white shadow-md rounded-2xl p-6 border-l-4 border-red-500">
          <h2 className="text-gray-600 font-semibold">Total Exams</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {stats.totalExams}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
