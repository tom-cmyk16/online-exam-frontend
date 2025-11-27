import React from "react";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  startTime?: string;
  endTime?: string;
  activeTime?: string;
  questions: any[];
  department?: string;
  year?: string;
  section?: string;
  isApproved: boolean;
  examCode?: string;
  courseCode?: string;
  semester?: string;
  instructorName?: string;
  timeAllowed?: string;
  examDate?: string;
}

interface ExamCoverPageProps {
  exam: Exam;
  onProceed: () => void;
}

const ExamCoverPage: React.FC<ExamCoverPageProps> = ({ exam, onProceed }) => {
  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded shadow">
        {/* University Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">[University Name/Logo]</h1>
          <h2 className="text-xl">[Faculty/Department Name]</h2>
        </div>

        {/* Exam Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">FINAL EXAMINATION</h1>
        </div>

        {/* Exam Details */}
        <div className="mb-8">
          <p className="mb-2">
            <strong>Course Code and Title:</strong> {exam.courseCode || "N/A"} -{" "}
            {exam.title}
          </p>
          <p className="mb-2">
            <strong>Academic Semester/Year:</strong>{" "}
            {exam.semester || "Fall 2024"}
          </p>
          <p className="mb-2">
            <strong>Exam Start Time:</strong>{" "}
            {exam.startTime
              ? new Date(exam.startTime).toLocaleString()
              : "Not set"}
          </p>
          <p className="mb-2">
            <strong>Exam End Time:</strong>{" "}
            {exam.endTime ? new Date(exam.endTime).toLocaleString() : "Not set"}
          </p>
          <p className="mb-2">
            <strong>Duration:</strong>{" "}
            {exam.duration ? `${exam.duration} minutes` : "Not set"}
          </p>
          <p className="mb-2">
            <strong>Instructor Name:</strong>{" "}
            {exam.instructorName || "Professor's Name"}
          </p>
        </div>

        {/* Student Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Student Instructions & Information
          </h2>
          <p className="font-bold mb-2">
            PLEASE READ THE FOLLOWING INSTRUCTIONS CAREFULLY
          </p>
          <ul className="list-disc list-inside mb-4">
            <li>
              This paper contains <strong>{exam.questions.length}</strong>{" "}
              questions.
            </li>
            <li>
              This exam has <strong>1</strong> page (including this cover page).
            </li>
            <li>
              Answer <strong>All</strong> questions.
            </li>
            <li>All questions are of equal value.</li>
            <li>
              <strong>Closed Book</strong>. Permitted materials:
              Non-programmable calculator only.
            </li>
            <li>Write all your answers in the spaces provided below.</li>
            <li>Start each question on a new page.</li>
          </ul>
        </div>

        {/* Student Pledge */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Student Pledge</h2>
          <p className="mb-4">
            By writing my name and student ID below, I affirm that the work
            submitted in this examination is my own, and I have not received or
            given any unauthorized assistance.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">
                Student's Full Name (Printed):
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="___________________________________"
              />
            </div>
            <div>
              <label className="block font-semibold">Student ID Number:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="___________________________________"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-semibold">Signature:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="___________________________________"
              />
            </div>
            <div>
              <label className="block font-semibold">Date:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="___________________________________"
              />
            </div>
          </div>
        </div>

        {/* Examiner Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">For Official Use Only</h2>
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Question</th>
                <th className="border border-gray-300 p-2">Marks</th>
                <th className="border border-gray-300 p-2">
                  Examiner's Initials
                </th>
              </tr>
            </thead>
            <tbody>
              {exam.questions.map((_, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2"></td>
                  <td className="border border-gray-300 p-2"></td>
                </tr>
              ))}
              <tr>
                <td className="border border-gray-300 p-2 font-bold">Total</td>
                <td className="border border-gray-300 p-2"></td>
                <td className="border border-gray-300 p-2"></td>
              </tr>
            </tbody>
          </table>
          <div>
            <label className="block font-semibold">
              Examiner's Comments (if any):
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows={2}
              placeholder="_____________________________________________________"
            />
          </div>
        </div>

        {/* Proceed Button */}
        <div className="text-center">
          <button
            onClick={onProceed}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-lg font-semibold"
          >
            Proceed to Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCoverPage;
