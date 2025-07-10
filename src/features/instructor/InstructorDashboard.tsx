import React, { useState } from "react";
import QuestionForm from "../../component/instructorcompont/QuestionForm";
import StudentResults from "../../component/instructorcompont/StudentResults";
import ChangePasswordForm from "../../component/instructorcompont/ChangePasswordForm";
import InstructorProfile from "../../component/instructorcompont/InstructorProfile";

const InstructorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "questions" | "results" | "password" | "profile"
  >("questions");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-xl p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-800 mb-4 text-center">
          Instructor Dashboard – Debre Tabor University
        </h1>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center mb-6 gap-3">
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded ${
              activeTab === "questions"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Manage Questions
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2 rounded ${
              activeTab === "results" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Student Results
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 py-2 rounded ${
              activeTab === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded ${
              activeTab === "profile" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Instructor Profile
          </button>
        </div>

        {/* Tabs Content */}
        {activeTab === "questions" && <QuestionForm />}
        {activeTab === "results" && <StudentResults />}
        {activeTab === "password" && <ChangePasswordForm />}
        {activeTab === "profile" && <InstructorProfile />}
      </div>
    </div>
  );
};

export default InstructorDashboard;
