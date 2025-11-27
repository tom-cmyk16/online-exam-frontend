import React, { useEffect, useState } from "react";
import axios from "axios";

interface StudentResult {
  studentId: {
    _id: string;
    fullName: string;
    username: string;
    department: string;
    year?: string;
    section?: string;
  };
  examId: string;
  answers: Record<string, string>;
  score?: number;
  totalMarks?: number;
  submittedAt: string;
}

interface Exam {
  _id: string;
  title: string;
  department: string;
  year?: string;
  section?: string;
  questions: any[];
}

const API_BASE = "http://localhost:5000/api";

const StudentExamResults: React.FC = () => {
  const [approvedExams, setApprovedExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchApprovedExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Exam[]>(
          `${API_BASE}/exams/committee/approved`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApprovedExams(res.data);
      } catch (err) {
        console.error("Error fetching approved exams:", err);
      }
    };

    fetchApprovedExams();
  }, []);

  const handleViewResults = async (exam: Exam) => {
    setSelectedExam(exam);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<StudentResult[]>(
        `${API_BASE}/exams/committee/${exam._id}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(res.data);
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Student Exam Results</h1>

      {!selectedExam ? (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Approved Exams</h2>
          <ul className="space-y-3">
            {approvedExams.map((exam) => (
              <li
                key={exam._id}
                className="p-4 border rounded flex justify-between items-center bg-white shadow-sm"
              >
                <div>
                  <div className="font-semibold text-lg">{exam.title}</div>
                  <div className="text-sm text-gray-500">
                    Dept: {exam.department}, Year: {exam.year || "-"}, Section:{" "}
                    {exam.section || "-"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Questions: {exam.questions?.length || 0}
                  </div>
                </div>
                <button
                  onClick={() => handleViewResults(exam)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  View Results
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              Results for: {selectedExam.title}
            </h2>
            <button
              onClick={() => {
                setSelectedExam(null);
                setResults([]);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Back to Exams
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-500">Loading results...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500">
              No results found for this exam.
            </p>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 border rounded bg-white shadow-sm"
                >
                  <div className="font-semibold text-lg mb-2">
                    {result.studentId.fullName} ({result.studentId.username})
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Dept: {result.studentId.department}, Year:{" "}
                    {result.studentId.year || "N/A"}, Section:{" "}
                    {result.studentId.section || "N/A"}
                  </div>
                  <div className="text-sm mb-2">
                    Submitted At:{" "}
                    {new Date(result.submittedAt).toLocaleString()}
                  </div>
                  <div className="text-sm mb-4">
                    Score: {result.score || "N/A"} /{" "}
                    {result.totalMarks || "N/A"}
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">
                      View Answers
                    </summary>
                    <div className="mt-2 space-y-2">
                      {Object.entries(result.answers).map(([qId, answer]) => (
                        <div key={qId} className="border-t pt-2">
                          <strong>Question ID: {qId}</strong>
                          <p>Answer: {answer || "No answer"}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentExamResults;
