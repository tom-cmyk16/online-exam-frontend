import { useState, useEffect } from "react";
import api from "../../../../api/xiosInstance";
import { toast } from "react-toastify";

interface Student {
  _id: string;
  fullName: string;
  username: string;
  department: string;
  year?: string;
  section?: string;
}

interface Submission {
  _id: string;
  studentId: Student;
  score: number;
  adjustedScore: number | null;
  submittedAt: string;
  isReviewed: boolean;
  reviewNotes?: string;
  answers: Array<{
    questionId: string;
    value: string;
  }>;
}

interface Exam {
  _id: string;
  title: string;
  department: string;
  questions: Array<{
    _id: string;
    text: string;
    type: string;
    correctAnswer?: string;
    marks?: number;
  }>;
}

const ViewStudentResults = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adjustedScore, setAdjustedScore] = useState<number>(0);
  const [reviewNotes, setReviewNotes] = useState<string>("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch exams");
    }
  };

  const fetchSubmissions = async (examId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/student-exams/submissions/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = (exam: Exam) => {
    setSelectedExam(exam);
    fetchSubmissions(exam._id);
  };

  const handleReview = async (submissionId: string) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/student-exams/review/${submissionId}`,
        {
          adjustedScore,
          reviewNotes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Submission reviewed successfully!");
      setReviewingId(null);
      setAdjustedScore(0);
      setReviewNotes("");
      if (selectedExam) {
        fetchSubmissions(selectedExam._id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to review submission");
    }
  };

  const handleDeleteSubmission = async (submissionId: string, studentName: string) => {
    const confirmed = window.confirm(
      `⚠️ Delete Submission?\n\n` +
      `Student: ${studentName}\n\n` +
      `This will permanently delete this submission and allow the student to retake the exam.\n\n` +
      `Are you sure?`
    );
    
    if (!confirmed) return;
    
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/student-exams/submission/${submissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Submission deleted successfully!");
      if (selectedExam) {
        fetchSubmissions(selectedExam._id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete submission");
    }
  };

  const calculateTotalMarks = () => {
    if (!selectedExam) return 0;
    return selectedExam.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  };

  const getPercentage = (score: number) => {
    const total = calculateTotalMarks();
    return total > 0 ? ((score / total) * 100).toFixed(2) : "0.00";
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          Student Results
        </h1>

        {!selectedExam ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select an Exam</h2>
            <div className="grid gap-4">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  onClick={() => handleExamSelect(exam)}
                  className="p-4 border rounded-lg cursor-pointer hover:border-green-600 hover:bg-green-50 transition"
                >
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  <p className="text-sm text-gray-600">
                    Department: {exam.department}
                  </p>
                  <p className="text-sm text-gray-600">
                    Questions: {exam.questions.length}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold">{selectedExam.title}</h2>
                <p className="text-gray-600">
                  Total Marks: {calculateTotalMarks()} | Submissions: {submissions.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (selectedExam) {
                      fetchSubmissions(selectedExam._id);
                      toast.info("Refreshed submissions");
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    // Export to CSV
                    const csvContent = [
                      ["Student Name", "Username", "Department", "Score", "Total", "Percentage", "Submitted", "Status", "Review Notes"],
                      ...submissions.map(sub => {
                        const finalScore = sub.adjustedScore !== null ? sub.adjustedScore : sub.score;
                        return [
                          sub.studentId.fullName,
                          sub.studentId.username,
                          sub.studentId.department,
                          finalScore.toFixed(2),
                          calculateTotalMarks(),
                          getPercentage(finalScore) + "%",
                          new Date(sub.submittedAt).toLocaleString(),
                          sub.isReviewed ? "Reviewed" : "Pending",
                          sub.reviewNotes || ""
                        ];
                      })
                    ].map(row => row.join(",")).join("\n");
                    
                    const blob = new Blob([csvContent], { type: "text/csv" });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${selectedExam.title}_results.csv`;
                    a.click();
                    toast.success("Results exported to CSV");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    setSelectedExam(null);
                    setSubmissions([]);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                >
                  Back
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center py-8">Loading submissions...</p>
            ) : submissions.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No submissions yet
              </p>
            ) : (
              <>
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Submissions</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {submissions.length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-green-700">
                      {(
                        submissions.reduce((sum, sub) => {
                          const score = sub.adjustedScore !== null ? sub.adjustedScore : sub.score;
                          return sum + score;
                        }, 0) / submissions.length
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {submissions.filter(sub => !sub.isReviewed).length}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reviewed</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {submissions.filter(sub => sub.isReviewed).length}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Username</th>
                      <th className="px-4 py-3 text-left">Department</th>
                      <th className="px-4 py-3 text-left">Score</th>
                      <th className="px-4 py-3 text-left">Percentage</th>
                      <th className="px-4 py-3 text-left">Submitted</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const finalScore =
                        sub.adjustedScore !== null
                          ? sub.adjustedScore
                          : sub.score;
                      return (
                        <tr key={sub._id} className="border-t">
                          <td className="px-4 py-3">
                            {sub.studentId.fullName}
                          </td>
                          <td className="px-4 py-3">
                            {sub.studentId.username}
                          </td>
                          <td className="px-4 py-3">
                            {sub.studentId.department}
                          </td>
                          <td className="px-4 py-3">
                            {finalScore.toFixed(2)} / {calculateTotalMarks()}
                          </td>
                          <td className="px-4 py-3">
                            {getPercentage(finalScore)}%
                          </td>
                          <td className="px-4 py-3">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            {sub.isReviewed ? (
                              <span className="text-green-600 font-semibold">
                                Reviewed
                              </span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {reviewingId === sub._id ? (
                              <div className="space-y-2">
                                <input
                                  type="number"
                                  value={adjustedScore}
                                  onChange={(e) =>
                                    setAdjustedScore(Number(e.target.value))
                                  }
                                  placeholder="Adjusted Score"
                                  className="w-full p-1 border rounded text-sm"
                                />
                                <textarea
                                  value={reviewNotes}
                                  onChange={(e) =>
                                    setReviewNotes(e.target.value)
                                  }
                                  placeholder="Review notes..."
                                  className="w-full p-1 border rounded text-sm"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReview(sub._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setReviewingId(null);
                                      setAdjustedScore(0);
                                      setReviewNotes("");
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setReviewingId(sub._id);
                                    setAdjustedScore(finalScore);
                                    setReviewNotes(sub.reviewNotes || "");
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                                >
                                  {sub.isReviewed ? "Edit" : "Review"}
                                </button>
                                <button
                                  onClick={() => handleDeleteSubmission(sub._id, sub.studentId.fullName)}
                                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                                  title="Delete submission"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStudentResults;
