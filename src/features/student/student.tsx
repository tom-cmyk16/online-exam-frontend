import React, { useState } from "react";
import TabsNavigation from "./TabsNavigation";
import ProfileSection from "./ProfileSection";
import ResultsAndSubmitSection from "./ResultsAndSubmitSection";

const initialStudentData = {
  name: "Jane Doe",
  email: "jane@student.com",
  department: "Computer Science",
  studentId: "CS2025001",
};

const exams = [
  /* same as before */
];
const results = [
  /* same as before */
];

const StudentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "profile" | "edit" | "results" | "submit"
  >("profile");
  const [studentData, setStudentData] = useState(initialStudentData);
  const [answerExamId, setAnswerExamId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = () => {
    alert("Profile saved!");
    setActiveTab("profile");
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerExamId === null || !answerText.trim()) {
      alert("Please select an exam and enter your answer.");
      return;
    }
    alert(`Answer submitted for exam ID ${answerExamId}: ${answerText}`);
    setAnswerText("");
    setAnswerExamId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">
          Student Dashboard
        </h1>

        <TabsNavigation activeTab={activeTab} onChangeTab={setActiveTab} />

        {(activeTab === "profile" || activeTab === "edit") && (
          <ProfileSection
            activeTab={activeTab}
            studentData={studentData}
            onChange={handleProfileChange}
            onSave={handleProfileSave}
          />
        )}

        {(activeTab === "results" || activeTab === "submit") && (
          <ResultsAndSubmitSection
            activeTab={activeTab}
            results={results}
            exams={exams}
            answerExamId={answerExamId}
            answerText={answerText}
            onExamChange={(e) => setAnswerExamId(Number(e.target.value))}
            onAnswerChange={(e) => setAnswerText(e.target.value)}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}
      </div>
    </div>
  );
};

export default StudentPage;
