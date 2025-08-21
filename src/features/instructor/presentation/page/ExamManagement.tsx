import React, { useState, useEffect, ChangeEvent, FC } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  department: string;
}

interface Question {
  _id?: string;
  text: string;
  type: "text" | "multiple-choice";
  options?: string[];
  correctAnswer: string;
  duration?: number;
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

const API_BASE = "http://localhost:5000/api";

const ExamManagement: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);

  const [editExamData, setEditExamData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    activeTime: "",
  });

  const [newExamData, setNewExamData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    activeTime: "",
  });

  const [newQuestionData, setNewQuestionData] = useState({
    text: "",
    type: "text" as "text" | "multiple-choice",
    options: [""],
    correctAnswer: "",
    duration: "",
    marks: "",
  });

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const primaryBtnClass =
    "bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 text-sm rounded";
  const smallBtnClass =
    "bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 text-sm rounded";

  // Fetch users and exams
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<User[]>(`${API_BASE}/manageuser`);
        setUsers(res.data);
        setDepartments(Array.from(new Set(res.data.map((u) => u.department))));
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    const fetchExams = async () => {
      try {
        const res = await axios.get<Exam[]>(`${API_BASE}/exams`);
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };

    fetchUsers();
    fetchExams();
  }, []);

  // Load selected exam data for editing
  useEffect(() => {
    const current = exams.find((e) => e._id === currentExamId);
    if (current) {
      setEditExamData({
        title: current.title || "",
        description: current.description || "",
        startTime: current.startTime || "",
        endTime: current.endTime || "",
        activeTime: current.activeTime || "",
      });
      setSelectedDepartments(current.assignedDepartments || []);
    } else {
      setEditExamData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        activeTime: "",
      });
      setSelectedDepartments([]);
    }
  }, [currentExamId, exams]);

  // --- Create Exam ---
  const handleCreateExam = async () => {
    if (!newExamData.title.trim()) return alert("Please enter exam title");
    try {
      const res = await axios.post<Exam>(`${API_BASE}/exams`, newExamData);
      setExams([...exams, res.data]);
      setNewExamData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        activeTime: "",
      });
      setCurrentExamId(res.data._id);
    } catch (err) {
      alert("Failed to create exam");
      console.error(err);
    }
  };

  // --- Update Exam ---
  const handleUpdateExam = async () => {
    if (!currentExamId) return alert("Select an exam first");
    if (!editExamData.title.trim()) return alert("Please enter exam title");
    try {
      const res = await axios.put<Exam>(
        `${API_BASE}/exams/${currentExamId}`,
        editExamData
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      alert("Exam updated");
    } catch (err) {
      alert("Failed to update exam");
      console.error(err);
    }
  };

  // --- Delete Exam ---
  const handleDeleteExam = async () => {
    if (!currentExamId) return alert("Select an exam first");
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await axios.delete(`${API_BASE}/exams/${currentExamId}`);
      setExams(exams.filter((e) => e._id !== currentExamId));
      setCurrentExamId(null);
      setSelectedDepartments([]);
    } catch (err) {
      alert("Failed to delete exam");
      console.error(err);
    }
  };

  // --- Question Handlers ---
  const handleQuestionChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    idx?: number
  ) => {
    const { name, value } = e.target;
    if (name === "options" && typeof idx === "number") {
      const opts = [...newQuestionData.options];
      opts[idx] = value;
      setNewQuestionData({ ...newQuestionData, options: opts });
    } else {
      setNewQuestionData({ ...newQuestionData, [name]: value });
    }
  };

  const addOption = () =>
    setNewQuestionData({
      ...newQuestionData,
      options: [...newQuestionData.options, ""],
    });

  const removeOption = (idx: number) =>
    setNewQuestionData({
      ...newQuestionData,
      options: newQuestionData.options.filter((_, i) => i !== idx),
    });

  const handleAddQuestion = async () => {
    if (!currentExamId) return alert("Select an exam first");
    if (!newQuestionData.text.trim())
      return alert("Question text cannot be empty");
    if (
      newQuestionData.type === "multiple-choice" &&
      newQuestionData.options.filter((o) => o.trim() !== "").length < 2
    )
      return alert("Multiple-choice questions must have at least 2 options");

    try {
      const res = await axios.post<Exam>(
        `${API_BASE}/exams/${currentExamId}/questions`,
        {
          text: newQuestionData.text,
          type: newQuestionData.type,
          options:
            newQuestionData.type === "multiple-choice"
              ? newQuestionData.options.filter((o) => o.trim() !== "")
              : [],
          correctAnswer: newQuestionData.correctAnswer,
          duration: newQuestionData.duration
            ? parseInt(newQuestionData.duration)
            : undefined,
          marks: newQuestionData.marks
            ? parseInt(newQuestionData.marks)
            : undefined,
        }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      setNewQuestionData({
        text: "",
        type: "text",
        options: [""],
        correctAnswer: "",
        duration: "",
        marks: "",
      });
    } catch (err) {
      alert("Failed to add question");
      console.error(err);
    }
  };

  // --- Assign Departments ---
  const handleAssignDepartments = async () => {
    if (!currentExamId) return alert("Select an exam first");
    try {
      const res = await axios.put<Exam>(
        `${API_BASE}/exams/${currentExamId}/assign-departments`,
        { assignedDepartments: selectedDepartments }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      setSelectedDepartments([]);
    } catch (err) {
      alert("Failed to assign departments");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-4xl mx-auto">
      {/* Create Exam */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4">Create New Exam</h2>
        <input
          type="text"
          placeholder="Title"
          value={newExamData.title}
          onChange={(e) =>
            setNewExamData({ ...newExamData, title: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={newExamData.description}
          onChange={(e) =>
            setNewExamData({ ...newExamData, description: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex space-x-4 mb-4">
          <input
            type="datetime-local"
            value={newExamData.startTime}
            onChange={(e) =>
              setNewExamData({ ...newExamData, startTime: e.target.value })
            }
            className="p-2 border rounded w-1/2"
          />
          <input
            type="datetime-local"
            value={newExamData.endTime}
            onChange={(e) =>
              setNewExamData({ ...newExamData, endTime: e.target.value })
            }
            className="p-2 border rounded w-1/2"
          />
        </div>
        <input
          type="number"
          min={1}
          placeholder="Active Time"
          value={newExamData.activeTime}
          onChange={(e) =>
            setNewExamData({ ...newExamData, activeTime: e.target.value })
          }
          className="w-full p-2 border rounded mb-3"
        />
        <button onClick={handleCreateExam} className={primaryBtnClass}>
          Create Exam
        </button>
      </div>

      {/* Edit Exam & Add Question */}
      {currentExamId && (
        <>
          {/* Edit Exam */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">Edit Exam</h2>
            <input
              type="text"
              placeholder="Title"
              value={editExamData.title}
              onChange={(e) =>
                setEditExamData({ ...editExamData, title: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={editExamData.description}
              onChange={(e) =>
                setEditExamData({
                  ...editExamData,
                  description: e.target.value,
                })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <div className="flex space-x-4 mb-4">
              <input
                type="datetime-local"
                value={editExamData.startTime}
                onChange={(e) =>
                  setEditExamData({
                    ...editExamData,
                    startTime: e.target.value,
                  })
                }
                className="p-2 border rounded w-1/2"
              />
              <input
                type="datetime-local"
                value={editExamData.endTime}
                onChange={(e) =>
                  setEditExamData({ ...editExamData, endTime: e.target.value })
                }
                className="p-2 border rounded w-1/2"
              />
            </div>
            <input
              type="number"
              placeholder="Active Time"
              value={editExamData.activeTime}
              onChange={(e) =>
                setEditExamData({ ...editExamData, activeTime: e.target.value })
              }
              className="w-full p-2 border rounded mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleUpdateExam} className={primaryBtnClass}>
                Save Changes
              </button>
              <button
                onClick={handleDeleteExam}
                className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 text-sm rounded"
              >
                Delete Exam
              </button>
            </div>
          </div>

          {/* Add Question */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">Add Question</h2>
            <textarea
              placeholder="Question Text"
              value={newQuestionData.text}
              onChange={(e) => handleQuestionChange(e)}
              className="w-full mb-3 p-2 border rounded"
              name="text"
            />
            <select
              value={newQuestionData.type}
              onChange={(e) =>
                setNewQuestionData({
                  ...newQuestionData,
                  type: e.target.value as "text" | "multiple-choice",
                  options: e.target.value === "multiple-choice" ? [""] : [],
                  correctAnswer: "",
                })
              }
              className="p-2 border rounded mb-3"
            >
              <option value="text">Text</option>
              <option value="multiple-choice">Multiple Choice</option>
            </select>

            {newQuestionData.type === "multiple-choice" && (
              <div className="mb-3">
                {newQuestionData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center mb-1">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleQuestionChange(e, idx)}
                      name="options"
                      className="flex-grow p-2 border rounded mr-2"
                      placeholder={`Option ${idx + 1}`}
                    />
                    {newQuestionData.options.length > 1 && (
                      <button
                        type="button"
                        className="text-red-600 font-bold px-2"
                        onClick={() => removeOption(idx)}
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className={`mt-2 ${smallBtnClass}`}
                >
                  Add Option
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Correct Answer"
              name="correctAnswer"
              value={newQuestionData.correctAnswer}
              onChange={(e) => handleQuestionChange(e)}
              className="w-full mb-3 p-2 border rounded"
            />
            <div className="flex space-x-4 mb-3">
              <input
                type="number"
                placeholder="Duration (minutes)"
                name="duration"
                value={newQuestionData.duration}
                onChange={(e) => handleQuestionChange(e)}
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Marks"
                name="marks"
                value={newQuestionData.marks}
                onChange={(e) => handleQuestionChange(e)}
                className="w-1/2 p-2 border rounded"
              />
            </div>
            <button onClick={handleAddQuestion} className={primaryBtnClass}>
              Add Question
            </button>
          </div>

          {/* Assign Departments */}
          <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Assign Exam to Departments
            </h2>
            <div className="flex flex-wrap gap-4">
              {departments.map((dept) => (
                <label
                  key={dept}
                  className="inline-flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={(e) =>
                      setSelectedDepartments(
                        e.target.checked
                          ? [...selectedDepartments, dept]
                          : selectedDepartments.filter((d) => d !== dept)
                      )
                    }
                  />
                  <span>{dept}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleAssignDepartments}
              className={`mt-4 ${primaryBtnClass}`}
            >
              Assign Departments
            </button>
          </div>
        </>
      )}

      {/* Exam List */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Exams</h2>
        {exams.length === 0 ? (
          <p>No exams created yet.</p>
        ) : (
          <ul>
            {exams.map((exam) => (
              <li
                key={exam._id}
                className={`p-3 border mb-2 rounded cursor-pointer ${
                  currentExamId === exam._id ? "bg-green-100" : ""
                }`}
                onClick={() => setCurrentExamId(exam._id)}
              >
                <div className="font-semibold">{exam.title}</div>
                <div className="text-sm text-gray-600">{exam.description}</div>
                <div className="text-xs mt-1 text-gray-500">
                  Active Time: {exam.activeTime || "N/A"}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  Assigned Departments:{" "}
                  {exam.assignedDepartments.length > 0
                    ? exam.assignedDepartments.join(", ")
                    : "None"}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  Questions: {exam.questions.length}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExamManagement;
