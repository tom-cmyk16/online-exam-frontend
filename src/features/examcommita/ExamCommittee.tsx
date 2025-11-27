import React, { useEffect, useState } from "react";
import axios from "axios";

interface Student {
  _id: string;
  fullName: string;
  username: string;
  department: string;
  year?: string;
  section?: string;
  email?: string;
  phone?: string;
}

interface StudentApproval {
  studentId: Student;
  isApproved: boolean;
  isRejected: boolean;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  university?: string;
  department: string;
  year?: string;
  section?: string;
  startTime?: string;
  endTime?: string;
  activeTime?: number;
  weight?: number;
  examCode?: string;
  questions: any[];
  assignedDepartments: string[];
  isApproved: boolean;
  isRejected: boolean;
  assignedStudents: Student[];
  studentApprovals: StudentApproval[];
  createdBy: {
    _id: string;
    fullName: string;
    department: string;
  };
}

const API_BASE = "http://localhost:5000/api";

const ExamCommitteeView = () => {
  const [pendingExams, setPendingExams] = useState<Exam[]>([]);
  const [approvedExams, setApprovedExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showQuestionsModal, setShowQuestionsModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchPendingExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Exam[]>(`${API_BASE}/exams/committee`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPendingExams(res.data);
      } catch (err) {
        console.error(err);
      }
    };

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
        console.error(err);
      }
    };

    fetchPendingExams();
    fetchApprovedExams();
  }, []);

  const handleApproveExam = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/exams/committee/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingExams(pendingExams.filter((e) => e._id !== id));
      setApprovedExams([...approvedExams, res.data.exam]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectExam = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/exams/committee/${id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingExams(
        pendingExams.map((e) => (e._id === id ? res.data.exam : e))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveStudent = async (examId: string, studentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/exams/committee/${examId}/students/${studentId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApprovedExams(
        approvedExams.map((e) => (e._id === examId ? res.data.exam : e))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectStudent = async (examId: string, studentId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_BASE}/exams/committee/${examId}/students/${studentId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApprovedExams(
        approvedExams.map((e) => (e._id === examId ? res.data.exam : e))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Exam Committee</h1>

      {/* Tabs */}
      <div className="flex mb-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 ${
            activeTab === "pending" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Pending Exams
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-4 py-2 ${
            activeTab === "approved" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Approved Exams (Student Approvals)
        </button>
        <button
          onClick={() =>
            (window.location.href = "/main/exam-committee/student-results")
          }
          className="px-4 py-2 bg-green-600 text-white hover:bg-green-700"
        >
          View Student Results
        </button>
        <button
          onClick={() =>
            (window.location.href = "/main/exam-committee/send-results")
          }
          className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          Send Results to Instructors
        </button>
      </div>

      {/* Pending Exams Tab */}
      {activeTab === "pending" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pending Exams</h2>
          <ul>
            {pendingExams.map((exam) => (
              <li
                key={exam._id}
                className="p-4 border mb-2 rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{exam.title}</div>
                  <div className="text-sm text-gray-500">
                    Dept: {exam.department}, Year: {exam.year || "-"}, Section:{" "}
                    {exam.section || "-"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created by: {exam.createdBy?.fullName || "Unknown"} (
                    {exam.createdBy?.department || "N/A"})
                  </div>
                  <div className="text-sm text-gray-500">
                    Questions: {exam.questions?.length || 0}
                  </div>
                  <div className="text-sm">Status: ⏳ Pending</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedExam(exam);
                      setShowQuestionsModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    View Questions
                  </button>
                  <button
                    onClick={() => handleApproveExam(exam._id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Approve Exam
                  </button>
                  <button
                    onClick={() => handleRejectExam(exam._id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Reject Exam
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Approved Exams Tab */}
      {activeTab === "approved" && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Approved Exams - Student Approvals
          </h2>
          {approvedExams.map((exam) => (
            <div key={exam._id} className="mb-6 p-4 border rounded">
              <div className="font-semibold text-lg mb-2">{exam.title}</div>
              <div className="text-sm text-gray-500 mb-4">
                Dept: {exam.department}, Year: {exam.year || "-"}, Section:{" "}
                {exam.section || "-"}
              </div>
              <h3 className="font-medium mb-2">
                Students ({(exam.studentApprovals || []).length}):
              </h3>
              <ul>
                {(exam.studentApprovals || []).map((approval) => (
                  <li
                    key={approval.studentId._id}
                    className="flex justify-between items-center p-2 border-b"
                  >
                    <div>
                      <div className="font-medium">
                        {approval.studentId.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {approval.studentId.username} -{" "}
                        {approval.studentId.department} - Year:{" "}
                        {approval.studentId.year || "N/A"}, Section:{" "}
                        {approval.studentId.section || "N/A"}
                      </div>
                      <div className="text-sm">
                        Status:{" "}
                        {approval.isApproved
                          ? "✅ Approved"
                          : approval.isRejected
                          ? "❌ Rejected"
                          : "⏳ Pending"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!approval.isApproved && !approval.isRejected && (
                        <>
                          <button
                            onClick={() =>
                              handleApproveStudent(
                                exam._id,
                                approval.studentId._id
                              )
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleRejectStudent(
                                exam._id,
                                approval.studentId._id
                              )
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Questions Modal */}
      {showQuestionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Exam Questions: {selectedExam.title}
              </h2>
              <button
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedExam(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Description:</strong>{" "}
                {selectedExam.description || "No description"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Instructions:</strong>{" "}
                {selectedExam.instructions || "No instructions"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Total Questions:</strong>{" "}
                {selectedExam.questions?.length || 0}
              </p>
            </div>

            <div className="space-y-4">
              {selectedExam.questions && selectedExam.questions.length > 0 ? (
                selectedExam.questions.map((question: any, index: number) => (
                  <div key={index} className="border rounded p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">
                        Question {index + 1}
                      </h3>
                      <div className="text-sm text-gray-600">
                        Type:{" "}
                        {question.type === "multiple-choice"
                          ? "Multiple Choice"
                          : "Text"}
                        {question.marks && ` | Marks: ${question.marks}`}
                        {question.duration &&
                          ` | Duration: ${question.duration}s`}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-gray-800">{question.text}</p>
                    </div>

                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div className="mb-3">
                          <p className="font-medium text-sm text-gray-700 mb-1">
                            Options:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            {question.options.map(
                              (option: string, optIndex: number) => (
                                <li key={optIndex} className="text-gray-700">
                                  {option}
                                  {question.correctAnswer === option && (
                                    <span className="text-green-600 font-semibold ml-2">
                                      (Correct Answer)
                                    </span>
                                  )}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {question.type === "text" && question.correctAnswer && (
                      <div className="mb-3">
                        <p className="font-medium text-sm text-gray-700">
                          Correct Answer:
                        </p>
                        <p className="text-green-600 bg-green-50 p-2 rounded">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No questions found for this exam.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowQuestionsModal(false);
                  setSelectedExam(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCommitteeView;
