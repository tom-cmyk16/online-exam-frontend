// src/features/student/pages/StudentDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import StudentLayout from "../state/StudentLayout";

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { title: "Read Question", path: "/student/read-question" },
    { title: "Submit Answer", path: "/student/submit-answer" },
    { title: "See Result", path: "/student/see-result" },
    { title: "Change Password", path: "/student/change-password" },
  ];

  return (
    <StudentLayout>
      <h2 className="text-xl font-bold mb-6 text-center text-blue-700">
        Welcome to Your Dashboard
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {menuItems.map((item) => (
          <div
            key={item.title}
            onClick={() => navigate(item.path)}
            className="cursor-pointer p-6 border border-blue-300 rounded-xl hover:bg-blue-100 shadow transition"
          >
            <h3 className="text-lg font-semibold text-blue-800">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
