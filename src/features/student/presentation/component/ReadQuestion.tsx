// src/features/student/pages/ReadQuestion.tsx
import React from "react";
import StudentLayout from "../state/StudentLayout";

const ReadQuestion: React.FC = () => {
  return (
    <StudentLayout>
      <h2 className="text-xl font-semibold mb-4">Read Questions</h2>
      <p className="text-gray-700">Display exam questions here...</p>
    </StudentLayout>
  );
};

export default ReadQuestion;
