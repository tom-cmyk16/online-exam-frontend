// src/features/admin/presentation/page/ScheduleExamPage.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface ExamData {
  _id?: string;
  title: string;
  course: string;
  startTime: string;
  durationMinutes: number;
}

const API_BASE = "http://localhost:5000/api/exams";

const ScheduleExamPage: React.FC = () => {
  const [exams, setExams] = useState<ExamData[]>([]);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load exams from backend
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await axios.get(API_BASE);
    setExams(res.data);
  };

  const resetForm = () => {
    setTitle("");
    setCourse("");
    setStartTime("");
    setDurationMinutes(60);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const examData: ExamData = { title, course, startTime, durationMinutes };

    if (editingId) {
      await axios.put(`${API_BASE}/${editingId}`, examData);
    } else {
      await axios.post(API_BASE, examData);
    }

    fetchExams();
    resetForm();
  };

  const handleEdit = (exam: ExamData) => {
    setTitle(exam.title);
    setCourse(exam.course);
    setStartTime(exam.startTime.slice(0, 16)); // format for datetime-local
    setDurationMinutes(exam.durationMinutes);
    setEditingId(exam._id || null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await axios.delete(`${API_BASE}/${id}`);
    fetchExams();
  };

  // Helper to calculate End Time
  const calculateEndTime = (start: string, duration: number) => {
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toLocaleString();
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">
        {editingId ? "Update Exam" : "Schedule Exam"}
      </h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Exam Title"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          placeholder="Course Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          placeholder="Duration Minutes"
          className="w-full p-2 border rounded"
          required
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {editingId ? "Save Changes" : "Add Exam"}
        </button>
      </form>

      {/* Exams Table */}
      {exams.length > 0 && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Course</th>
              <th className="border px-4 py-2">Start Time</th>
              <th className="border px-4 py-2">End Time</th>
              <th className="border px-4 py-2">Duration</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{exam.title}</td>
                <td className="border px-4 py-2">{exam.course}</td>
                <td className="border px-4 py-2">
                  {new Date(exam.startTime).toLocaleString()}
                </td>
                <td className="border px-4 py-2">
                  {calculateEndTime(exam.startTime, exam.durationMinutes)}
                </td>
                <td className="border px-4 py-2">{exam.durationMinutes} min</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(exam)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ScheduleExamPage;
