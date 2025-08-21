// ./features/student/presentation/page/StudentExamResult.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface ExamResult {
  _id: string;
  examTitle: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

const API_BASE = "http://localhost:5000/api/student";

const StudentExamResult: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await axios.get(`${API_BASE}/results/${examId}`);
        setResult(res.data);
      } catch (err) {
        setError("Failed to load exam result.");
      } finally {
        setLoading(false);
      }
    };
    if (examId) fetchResult();
  }, [examId]);

  if (loading) return <p>Loading exam result...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!result) return <p>No result found.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <button
        className="text-sm text-blue-600 hover:underline mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h2 className="text-xl font-semibold mb-2">{result.examTitle}</h2>
      <p>
        Score: {result.obtainedMarks} / {result.totalMarks} ({result.percentage}
        %)
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Submitted At: {new Date(result.submittedAt).toLocaleString()}
      </p>
    </div>
  );
};

export default StudentExamResult;
