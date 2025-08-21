import React from "react";
import StatCard from "../../../../core/component/card";
const InstructorDashboard: React.FC = () => {
  const stats = [
    { title: "Total Courses", value: 4, badgeText: "Active" },
    { title: "Exams Scheduled", value: 2 },
    { title: "Pending Grades", value: 5 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            badgeText={stat.badgeText}
          />
        ))}
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: "#98CD00" }}>
          Upcoming Exams
        </h2>
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Course</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">OOP</td>
              <td className="px-4 py-2">2025-08-12</td>
              <td className="px-4 py-2 text-green-600">Scheduled</td>
            </tr>
            <tr className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">Database Systems</td>
              <td className="px-4 py-2">2025-08-20</td>
              <td className="px-4 py-2 text-yellow-600">Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorDashboard;
