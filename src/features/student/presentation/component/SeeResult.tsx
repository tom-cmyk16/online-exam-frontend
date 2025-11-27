// src/features/student/pages/SeeResult.tsx
import React from "react";
import StudentLayout from "./StudentLayout";

const SeeResult: React.FC = () => {
  return (
    <StudentLayout>
      <h2 className="text-xl font-semibold mb-4">Exam Results</h2>
      <p className="text-gray-700">Show student’s grades or feedback here...</p>
    </StudentLayout>
  );
};

export default SeeResult;
