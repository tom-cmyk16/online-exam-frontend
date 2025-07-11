import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Courses</h3>
          <p className="text-2xl font-bold mt-1">12</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Students</h3>
          <p className="text-2xl font-bold mt-1">245</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
          <p className="text-2xl font-bold mt-1">87%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="border-b pb-3">
            <p className="text-sm">
              New student enrolled in "React Fundamentals"
            </p>
            <p className="text-xs text-gray-500">2 hours ago</p>
          </div>
          <div className="border-b pb-3">
            <p className="text-sm">
              Assignment submitted for "Advanced JavaScript"
            </p>
            <p className="text-xs text-gray-500">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
