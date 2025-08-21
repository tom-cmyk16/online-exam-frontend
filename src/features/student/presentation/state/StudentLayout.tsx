// src/features/student/components/StudentLayout.tsx
import React from "react";

interface Props {
  children: React.ReactNode;
}

const StudentLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Student Dashboard
      </h1>
      <div className="max-w-4xl mx-auto bg-white shadow-md p-6 rounded-xl">
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;
