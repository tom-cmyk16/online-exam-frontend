import React, { useState } from "react";
import InstructorProfile from "../component/instructorcompont/InstructorProfile";
import StudentResults from "../component/instructorcompont/StudentResults";
import ChangePasswordForm from "../component/instructorcompont/ChangePasswordForm";
import QuestionForm from "../component/instructorcompont/QuestionForm";

const InstructorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "questions" | "results" | "password"
  >("profile");

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-5 bg-gray-100">
      {/* Sidebar */}
      <aside className="bg-white border-r col-span-1 p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-blue-700 mb-6">
          Instructor Panel
        </h2>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`text-left px-4 py-2 rounded-md ${
              activeTab === "profile"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`text-left px-4 py-2 rounded-md ${
              activeTab === "questions"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Manage Questions
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`text-left px-4 py-2 rounded-md ${
              activeTab === "results"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Student Results
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`text-left px-4 py-2 rounded-md ${
              activeTab === "password"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-200"
            }`}
          >
            Change Password
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="col-span-4 p-6">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 capitalize">
            {activeTab.replace("_", " ")}
          </h1>
          <div className="bg-white shadow rounded-full px-4 py-2 text-sm text-gray-600">
            Logged in as: <strong>Dr. Meron Alemu</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 min-h-[400px]">
          {activeTab === "profile" && <InstructorProfile />}
          {activeTab === "questions" && <QuestionForm />}
          {activeTab === "results" && <StudentResults />}
          {activeTab === "password" && <ChangePasswordForm />}
        </div>
      </main>
    </div>
  );
};

export default InstructorDashboard;
