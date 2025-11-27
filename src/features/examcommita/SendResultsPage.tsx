import React, { useEffect, useState } from "react";
import axios from "axios";

interface Exam {
  _id: string;
  title: string;
  description?: string;
  department: string;
  year?: string;
  section?: string;
  startTime?: string;
  endTime?: string;
  examCode?: string;
  isApproved: boolean;
  isRejected: boolean;
  createdBy: {
    _id: string;
    fullName: string;
    department: string;
  };
}

const API_BASE = "http://localhost:5000/api";

const SendResultsPage = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Exam[]>(
          `${API_BASE}/exams/committee/approved`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setExams(res.data);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch exams");
      }
    };

    fetchExams();
  }, []);

  const handleSendResults = async (examId: string) => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_BASE}/exams/instructor/${examId}/send-results`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(
        `Results sent successfully to instructor. ${res.data.resultsCount} student results included.`
      );
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to send results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Send Exam Results to Instructors
      </h1>
      <p className="text-gray-600 mb-6">
        Select an approved exam to send the student results to the instructor
        who created it.
      </p>

      {message && (
        <div
          className={`p-4 mb-4 rounded ${
            message.includes("successfully")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam._id} className="p-4 border rounded-lg bg-white shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{exam.title}</h2>
                <p className="text-gray-600">{exam.description}</p>
                <div className="text-sm text-gray-500 mt-2">
                  <p>Department: {exam.department}</p>
                  <p>
                    Year: {exam.year || "N/A"}, Section: {exam.section || "N/A"}
                  </p>
                  <p>
                    Created by: {exam.createdBy?.fullName || "Unknown"} (
                    {exam.createdBy?.department || "N/A"})
                  </p>
                  <p>Exam Code: {exam.examCode}</p>
                  <p>
                    Start:{" "}
                    {exam.startTime
                      ? new Date(exam.startTime).toLocaleString()
                      : "TBD"}
                  </p>
                  <p>
                    End:{" "}
                    {exam.endTime
                      ? new Date(exam.endTime).toLocaleString()
                      : "TBD"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendResults(exam._id)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Results"}
              </button>
            </div>
          </div>
        ))}

        {exams.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No approved exams found.
          </p>
        )}
      </div>
    </div>
  );
};

export default SendResultsPage;
