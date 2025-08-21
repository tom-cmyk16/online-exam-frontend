// src/features/student/pages/SubmitAnswer.tsx
import React, { useState } from "react";
import StudentLayout from "./StudentLayout";

const SubmitAnswer: React.FC = () => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    console.log("Submitted answer:", answer);
  };

  return (
    <StudentLayout>
      <h2 className="text-xl font-semibold mb-4">Submit Answer</h2>
      <textarea
        className="w-full p-2 border rounded-md"
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </StudentLayout>
  );
};

export default SubmitAnswer;
