import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";

interface Question {
  _id: string;
  text: string;
  type: "text" | "multiple-choice";
  options?: string[];
  correctAnswer: string;
  marks?: number;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  activeTime?: string;
  questions: Question[];
  assignedDepartments: string[];
}

interface StudentResult {
  _id: string;
  score: number;
  exam: { title: string; description?: string };
  submittedAt: string;
}

const STUDENT_NAME = localStorage.getItem("name") || "John Doe";
const STUDENT_DEPARTMENT = localStorage.getItem("department") || "CS";
const API_BASE = "http://localhost:5000/api/exams";

const StudentTakeExam: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [results, setResults] = useState<StudentResult[]>([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get<Exam[]>(API_BASE);
        const filtered = res.data.filter((exam) =>
          exam.assignedDepartments.includes(STUDENT_DEPARTMENT)
        );
        setExams(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await axios.get<StudentResult[]>(
        `${API_BASE}/results/${STUDENT_NAME}`
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmitExam = async () => {
    if (!selectedExam) return;
    try {
      const res = await axios.post(`${API_BASE}/${selectedExam._id}/submit`, {
        answers,
        department: STUDENT_DEPARTMENT,
        studentName: STUDENT_NAME,
      });
      setScore(res.data.score);
      fetchResults();
    } catch (err) {
      console.error(err);
      alert("Submission failed!");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-5xl mx-auto">
      {!selectedExam && score === null ? (
        <>
          {exams.length === 0 ? (
            <p className="text-center text-gray-500">No exams available.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => setSelectedExam(exam)}
                  className="p-6 bg-white rounded-lg shadow-lg cursor-pointer hover:shadow-2xl transform hover:-translate-y-1 transition duration-300"
                >
                  <h3 className="text-xl font-semibold mb-2 text-center text-blue-600">
                    {exam.title}
                  </h3>
                  <p className="text-gray-700 text-center">
                    {exam.description}
                  </p>
                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-500">
                      Questions: {exam.questions.length}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-bold mt-10 mb-4 text-center text-green-700">
            Past Results
          </h2>
          <div className="flex flex-col items-center">
            {results.map((r) => (
              <div
                key={r._id}
                className="p-4 border rounded-lg bg-white w-full md:w-3/4 mb-3 shadow-sm hover:shadow-md transition duration-200"
              >
                <strong>{r.exam.title}</strong> - Score: {r.score} -{" "}
                {dayjs(r.submittedAt).format("YYYY-MM-DD HH:mm")}
              </div>
            ))}
          </div>
        </>
      ) : score !== null ? (
        <div className="bg-green-100 p-6 rounded shadow text-center">
          <h2 className="text-2xl font-semibold mb-4">Exam Submitted!</h2>
          <p className="text-lg">Your score: {score}</p>
          <button
            onClick={() => {
              setSelectedExam(null);
              setAnswers({});
              setScore(null);
            }}
            className="mt-4 bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
          >
            Back to Exam List
          </button>
        </div>
      ) : selectedExam ? (
        <div className="bg-white p-6 rounded shadow">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2 text-blue-600">
              {selectedExam.title}
            </h2>
            <p className="text-gray-700">{selectedExam.description}</p>
          </div>

          {selectedExam.questions.map((q, idx) => (
            <div key={q._id} className="mb-4">
              <p className="font-semibold">
                Q{idx + 1}: {q.text} ({q.marks || 1} marks)
              </p>
              {q.type === "text" ? (
                <input
                  type="text"
                  value={answers[q._id] || ""}
                  onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <div className="flex flex-col mt-2">
                  {q.options?.map((opt, i) => (
                    <label key={i} className="mb-1 cursor-pointer">
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={(e) =>
                          handleAnswerChange(q._id, e.target.value)
                        }
                        className="mr-2"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center mt-4">
            <button
              onClick={handleSubmitExam}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
            >
              Submit Exam
            </button>
            <button
              onClick={() => setSelectedExam(null)}
              className="ml-4 bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
            >
              Back to Exam List
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default StudentTakeExam;
