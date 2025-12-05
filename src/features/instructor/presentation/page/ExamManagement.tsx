import { useState, useEffect, ChangeEvent, FC } from "react";
import api from "../../../../api/xiosInstance";

interface User {
  _id: string;
  fullName: string;
  username: string;
  department: string;
  year?: string;
  section?: string;
  role: string;
  isActive: boolean;
}

interface Question {
  _id?: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false";
  options?: string[];
  correctAnswer: string;
  duration?: number;
  marks?: number;
}

interface Exam {
  _id: string;
  university: string;
  title: string;
  description?: string;
  instructions?: string;
  startTime?: string;
  endTime?: string;
  activeTime?: string;
  weight?: number;
  duration?: number;
  questions: Question[];
  assignedDepartments: string[];
  year?: string;
  section?: string;
  assignedStudents: User[];
  isApproved: boolean;
  isRejected: boolean;
  department: string;
  examCode?: string;
  createdBy: {
    _id: string;
    fullName: string;
    department: string;
  };
}

const ExamManagement: FC = () => {
  const [, setUsers] = useState<User[]>([]);
  const [, setDepartments] = useState<string[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [newExamData, setNewExamData] = useState({
    university: "",
    title: "",
    description: "",
    instructions: "",
    startTime: "",
    endTime: "",
    activeTime: "",
    weight: "",
    duration: "",
  });

  const [editExamData, setEditExamData] = useState({
    university: "",
    title: "",
    description: "",
    instructions: "",
    startTime: "",
    endTime: "",
    activeTime: "",
    weight: "",
    duration: "",
    year: "",
    section: "",
  });

  const [newQuestionData, setNewQuestionData] = useState({
    text: "",
    type: "text" as "text" | "multiple-choice" | "true-false",
    options: [""],
    correctAnswer: "",
    duration: "",
    marks: "",
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [editQuestionData, setEditQuestionData] = useState({
    text: "",
    type: "text" as "text" | "multiple-choice" | "true-false",
    options: [""],
    correctAnswer: "",
    duration: "",
    marks: "",
  });

  const primaryBtnClass =
    "bg-green-600 hover:bg-green-700 text-white py-1.5 px-4 text-sm rounded";

  // Fetch initial data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<User[]>("/manageuser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
        setDepartments(Array.from(new Set(res.data.map((u) => u.department))));
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<Exam[]>("/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams", err);
      }
    };

    fetchCurrentUser();
    fetchUsers();
    fetchExams();
  }, []);

  // Update editExamData when selecting a current exam
  useEffect(() => {
    const current = exams.find((e) => e._id === currentExamId);
    if (current) {
      setEditExamData({
        university: current.university || "",
        title: current.title || "",
        description: current.description || "",
        instructions: current.instructions || "",
        startTime: current.startTime || "",
        endTime: current.endTime || "",
        activeTime: current.activeTime || "",
        weight: current.weight?.toString() || "",
        duration: current.duration?.toString() || "",
        year: current.year || "",
        section: current.section || "",
      });
      // No need to set selectedDepartments anymore
    } else {
      setEditExamData({
        university: "",
        title: "",
        description: "",
        instructions: "",
        startTime: "",
        endTime: "",
        activeTime: "",
        weight: "",
        duration: "",
        year: "",
        section: "",
      });
    }
  }, [currentExamId, exams]);

  // --- CRUD & other handlers ---
  const handleCreateExam = async () => {
    if (!newExamData.title.trim()) return alert("Enter exam title");
    try {
      const token = localStorage.getItem("token");
      const res = await api.post<Exam>(
        "/exams",
        {
          ...newExamData,
          department: currentUser?.department,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams([...exams, res.data]);
      setNewExamData({
        university: "",
        title: "",
        description: "",
        instructions: "",
        startTime: "",
        endTime: "",
        activeTime: "",
        weight: "",
        duration: "",
      });
      setCurrentExamId(res.data._id);
      alert(`Exam created successfully! Exam Code: ${res.data.examCode}`);
    } catch (err) {
      alert("Failed to create exam");
      console.error(err);
    }
  };

  const handleUpdateExam = async () => {
    if (!currentExamId) return alert("Select exam first");
    if (!editExamData.title.trim()) return alert("Enter exam title");
    try {
      const token = localStorage.getItem("token");
      const res = await api.put<Exam>(`/exams/${currentExamId}`, editExamData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      alert("Exam updated successfully!");
    } catch (err) {
      alert("Failed to update exam");
      console.error(err);
    }
  };

  const handleDeleteExam = async () => {
    if (!currentExamId) return alert("Select exam first");
    if (!window.confirm("Are you sure to delete this exam?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/exams/${currentExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(exams.filter((e) => e._id !== currentExamId));
      setCurrentExamId(null);
      alert("Exam deleted successfully!");
    } catch (err) {
      alert("Failed to delete exam");
      console.error(err);
    }
  };

  const handleSendToExamCommittee = async () => {
    if (!currentExamId) return alert("Select exam first");

    // Check if all questions have correct answers before sending to committee
    const currentExam = exams.find((e) => e._id === currentExamId);
    if (!currentExam) return alert("Exam not found");

    const questionsWithoutAnswers = currentExam.questions.filter(
      (q) => !q.correctAnswer || q.correctAnswer.trim() === ""
    );
    if (questionsWithoutAnswers.length > 0) {
      alert(
        `Please provide correct answers for all questions before sending to committee. ${questionsWithoutAnswers.length} question(s) are missing correct answers.`
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/exams/${currentExamId}/send-to-committee`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      alert("Exam sent to committee!");
    } catch (err) {
      alert("Failed to send exam");
      console.error(err);
    }
  };

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
    if (!currentExamId) return alert("Select exam first");
    if (!newQuestionData.text.trim()) return alert("Question cannot be empty");
    if (
      newQuestionData.type === "multiple-choice" &&
      newQuestionData.options.filter((o) => o.trim() !== "").length < 2
    )
      return alert("MCQs must have at least 2 options");
    if (
      newQuestionData.type === "true-false" &&
      !newQuestionData.correctAnswer.trim()
    )
      return alert("Please select True or False for the correct answer");

    try {
      const token = localStorage.getItem("token");
      const res = await api.post<Exam>(
        `/exams/${currentExamId}/questions`,
        {
          text: newQuestionData.text,
          type: newQuestionData.type,
          options:
            newQuestionData.type === "multiple-choice"
              ? newQuestionData.options.filter((o) => o.trim() !== "")
              : newQuestionData.type === "true-false"
              ? ["True", "False"]
              : [],
          correctAnswer: newQuestionData.correctAnswer,
          duration: newQuestionData.duration
            ? parseInt(newQuestionData.duration)
            : undefined,
          marks: newQuestionData.marks ? parseInt(newQuestionData.marks) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
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
      alert("Question added!");
    } catch (err) {
      alert("Failed to add question");
      console.error(err);
    }
  };

  const handleEditQuestion = (index: number) => {
    const question = exams.find((e) => e._id === currentExamId)?.questions[
      index
    ];
    if (question) {
      setEditingQuestionIndex(index);
      setEditQuestionData({
        text: question.text || "",
        type: question.type || "text",
        options: question.options || [""],
        correctAnswer: question.correctAnswer || "",
        duration: question.duration?.toString() || "",
        marks: question.marks?.toString() || "",
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!currentExamId || editingQuestionIndex === null)
      return alert("Select question to edit");
    if (!editQuestionData.text.trim()) return alert("Question cannot be empty");
    if (
      editQuestionData.type === "multiple-choice" &&
      editQuestionData.options.filter((o) => o.trim() !== "").length < 2
    )
      return alert("MCQs must have at least 2 options");
    if (
      editQuestionData.type === "true-false" &&
      !editQuestionData.correctAnswer.trim()
    )
      return alert("Please select True or False for the correct answer");

    try {
      const token = localStorage.getItem("token");
      const current = exams.find((e) => e._id === currentExamId);
      const qId = current?.questions[editingQuestionIndex]?._id;
      if (!qId) return alert("Invalid question selected");

      const res = await api.put<Exam>(
        `/exams/${currentExamId}/questions/${qId}`,
        {
          text: editQuestionData.text,
          type: editQuestionData.type,
          options:
            editQuestionData.type === "multiple-choice"
              ? editQuestionData.options.filter((o) => o.trim() !== "")
              : editQuestionData.type === "true-false"
              ? ["True", "False"]
              : [],
          correctAnswer: editQuestionData.correctAnswer,
          duration: editQuestionData.duration
            ? parseInt(editQuestionData.duration)
            : undefined,
          marks: editQuestionData.marks ? parseInt(editQuestionData.marks) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      setEditingQuestionIndex(null);
      setEditQuestionData({
        text: "",
        type: "text",
        options: [""],
        correctAnswer: "",
        duration: "",
        marks: "",
      });
      alert("Question updated!");
    } catch (err) {
      alert("Failed to update question");
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    if (!currentExamId) return alert("Select exam first");
    if (!window.confirm("Are you sure to delete this question?")) return;
    try {
      const token = localStorage.getItem("token");
      const current = exams.find((e) => e._id === currentExamId);
      const qId = current?.questions[index]?._id;
      if (!qId) return alert("Invalid question selected");

      const res = await api.delete<Exam>(
        `/exams/${currentExamId}/questions/${qId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      alert("Question deleted!");
    } catch (err) {
      alert("Failed to delete question");
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionIndex(null);
    setEditQuestionData({
      text: "",
      type: "text",
      options: [""],
      correctAnswer: "",
      duration: "",
      marks: "",
    });
  };

  const handleAssignDepartments = async () => {
    if (!currentExamId) return alert("Select exam first");
    if (!editExamData.year.trim()) return alert("Please enter a year");
    if (!editExamData.section.trim()) return alert("Please enter a section");

    // Check if all questions have correct answers
    const currentExam = exams.find((e) => e._id === currentExamId);
    if (!currentExam) return alert("Exam not found");

    const questionsWithoutAnswers = currentExam.questions.filter(
      (q) => !q.correctAnswer || q.correctAnswer.trim() === ""
    );
    if (questionsWithoutAnswers.length > 0) {
      alert(
        `Please provide correct answers for all questions before assigning. ${questionsWithoutAnswers.length} question(s) are missing correct answers.`
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.put<Exam>(
        `/exams/${currentExamId}/assign-departments`,
        {
          assignedDepartments: [currentUser?.department], // Only assign to own department
          year: editExamData.year,
          section: editExamData.section,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      alert("Assigned successfully to your department!");
      // Automatically send to exam committee after assignment
      await handleSendToExamCommittee();
    } catch (err) {
      alert("Failed to assign");
      console.error(err);
    }
  };

  const filteredExams = exams.filter(
    (exam) => exam.department === currentUser?.department
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-5xl mx-auto">
      {/* Create Exam Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          Create Exam
        </h2>
        <input
          type="text"
          placeholder="University"
          value={newExamData.university}
          onChange={(e) =>
            setNewExamData({ ...newExamData, university: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Exam Title"
          value={newExamData.title}
          onChange={(e) =>
            setNewExamData({ ...newExamData, title: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={newExamData.description}
          onChange={(e) =>
            setNewExamData({ ...newExamData, description: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          placeholder="Instructions"
          value={newExamData.instructions}
          onChange={(e) =>
            setNewExamData({ ...newExamData, instructions: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Weight / Total Marks"
          value={newExamData.weight}
          onChange={(e) =>
            setNewExamData({ ...newExamData, weight: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Duration (minutes)"
          value={newExamData.duration}
          onChange={(e) =>
            setNewExamData({ ...newExamData, duration: e.target.value })
          }
          className="w-full mb-2 p-2 border rounded"
        />
        <div className="flex gap-2 mb-2">
          <input
            type="datetime-local"
            value={newExamData.startTime}
            onChange={(e) =>
              setNewExamData({ ...newExamData, startTime: e.target.value })
            }
            className="flex-1 p-2 border rounded"
          />
          <input
            type="datetime-local"
            value={newExamData.endTime}
            onChange={(e) =>
              setNewExamData({ ...newExamData, endTime: e.target.value })
            }
            className="flex-1 p-2 border rounded"
          />
        </div>

        <button onClick={handleCreateExam} className={primaryBtnClass}>
          Create Exam
        </button>
      </div>

      {/* Edit Exam + Questions */}
      {currentExamId && (
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-green-700">
            Edit Exam
          </h2>
          {/* --- inputs similar to create form --- */}
          <input
            type="text"
            placeholder="Exam Title"
            value={editExamData.title}
            onChange={(e) =>
              setEditExamData({ ...editExamData, title: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Year"
            value={editExamData.year}
            onChange={(e) =>
              setEditExamData({ ...editExamData, year: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Section"
            value={editExamData.section}
            onChange={(e) =>
              setEditExamData({ ...editExamData, section: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={editExamData.duration}
            onChange={(e) =>
              setEditExamData({ ...editExamData, duration: e.target.value })
            }
            className="w-full mb-2 p-2 border rounded"
          />
          <div className="flex gap-2 mb-2">
            <input
              type="datetime-local"
              value={editExamData.startTime}
              onChange={(e) =>
                setEditExamData({ ...editExamData, startTime: e.target.value })
              }
              className="flex-1 p-2 border rounded"
            />
            <input
              type="datetime-local"
              value={editExamData.endTime}
              onChange={(e) =>
                setEditExamData({ ...editExamData, endTime: e.target.value })
              }
              className="flex-1 p-2 border rounded"
            />
          </div>

          {/* Assign to Own Department with Year and Section */}
          <div className="mb-2">
            <label className="font-semibold">
              Assign to Department: {currentUser?.department}
            </label>
            <p className="text-sm text-gray-600">
              Students will be assigned based on year and section.
            </p>
          </div>

          <div className="flex gap-2 mb-2">
            <button onClick={handleUpdateExam} className={primaryBtnClass}>
              Update Exam
            </button>
            <button
              onClick={handleDeleteExam}
              className="bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 rounded"
            >
              Delete Exam
            </button>

            {currentExamId && (
              <>
                <button
                  onClick={handleAssignDepartments}
                  className={primaryBtnClass}
                  disabled={
                    exams
                      .find((e) => e._id === currentExamId)
                      ?.questions.some(
                        (q) => !q.correctAnswer || q.correctAnswer.trim() === ""
                      ) ?? false
                  }
                >
                  Assign to Department
                </button>
                <button
                  onClick={handleSendToExamCommittee}
                  className={primaryBtnClass}
                  disabled={
                    !editExamData.year.trim() ||
                    !editExamData.section.trim() ||
                    exams.find((e) => e._id === currentExamId)?.isApproved ||
                    exams.find((e) => e._id === currentExamId)?.isRejected ||
                    (exams
                      .find((e) => e._id === currentExamId)
                      ?.questions.some(
                        (q) => !q.correctAnswer || q.correctAnswer.trim() === ""
                      ) ??
                      false)
                  }
                >
                  Send to Committee
                </button>
              </>
            )}
          </div>

          {/* --- Add Question --- */}
          <div className="mt-4">
            <h3 className="font-semibold text-green-700 mb-2">Add Question</h3>
            <textarea
              placeholder="Question Text"
              value={newQuestionData.text}
              name="text"
              onChange={handleQuestionChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <select
              name="type"
              value={newQuestionData.type}
              onChange={handleQuestionChange}
              className="w-full mb-2 p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True/False</option>
            </select>
            {newQuestionData.type === "multiple-choice" && (
              <div>
                {newQuestionData.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={opt}
                      name="options"
                      onChange={(e) => handleQuestionChange(e, idx)}
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={() => removeOption(idx)}
                      className="bg-red-600 hover:bg-red-700 text-white px-2 rounded"
                    >
                      X
                    </button>
                  </div>
                ))}
                <button onClick={addOption} className={primaryBtnClass}>
                  Add Option
                </button>
              </div>
            )}
            {newQuestionData.type === "true-false" && (
              <div>
                <label className="block mb-2 font-medium">
                  Correct Answer:
                </label>
                <select
                  name="correctAnswer"
                  value={newQuestionData.correctAnswer}
                  onChange={handleQuestionChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select True or False</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
                </select>
              </div>
            )}
            {newQuestionData.type !== "true-false" && (
              <input
                type="text"
                placeholder="Correct Answer"
                value={newQuestionData.correctAnswer}
                name="correctAnswer"
                onChange={handleQuestionChange}
                className="w-full mb-2 p-2 border rounded"
              />
            )}

            <input
              type="number"
              placeholder="Marks"
              value={newQuestionData.marks}
              name="marks"
              onChange={handleQuestionChange}
              className="w-full mb-2 p-2 border rounded"
            />
            <button onClick={handleAddQuestion} className={primaryBtnClass}>
              Add Question
            </button>
          </div>

          {/* --- Edit Question --- */}
          {editingQuestionIndex !== null && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-green-700 mb-2">
                Edit Question
              </h3>
              <textarea
                placeholder="Question Text"
                value={editQuestionData.text}
                name="text"
                onChange={(e) =>
                  setEditQuestionData({
                    ...editQuestionData,
                    text: e.target.value,
                  })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <select
                name="type"
                value={editQuestionData.type}
                onChange={(e) =>
                  setEditQuestionData({
                    ...editQuestionData,
                    type: e.target.value as any,
                  })
                }
                className="w-full mb-2 p-2 border rounded"
              >
                <option value="text">Text</option>
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
              </select>
              {editQuestionData.type === "multiple-choice" && (
                <div>
                  {editQuestionData.options.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 mb-1">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...editQuestionData.options];
                          opts[idx] = e.target.value;
                          setEditQuestionData({
                            ...editQuestionData,
                            options: opts,
                          });
                        }}
                        className="flex-1 p-2 border rounded"
                      />
                      <button
                        onClick={() => {
                          const opts = editQuestionData.options.filter(
                            (_, i) => i !== idx
                          );
                          setEditQuestionData({
                            ...editQuestionData,
                            options: opts,
                          });
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 rounded"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setEditQuestionData({
                        ...editQuestionData,
                        options: [...editQuestionData.options, ""],
                      })
                    }
                    className={primaryBtnClass}
                  >
                    Add Option
                  </button>
                </div>
              )}
              {editQuestionData.type === "true-false" && (
                <div>
                  <label className="block mb-2 font-medium">
                    Correct Answer:
                  </label>
                  <select
                    value={editQuestionData.correctAnswer}
                    onChange={(e) =>
                      setEditQuestionData({
                        ...editQuestionData,
                        correctAnswer: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select True or False</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}
              {editQuestionData.type !== "true-false" && (
                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={editQuestionData.correctAnswer}
                  onChange={(e) =>
                    setEditQuestionData({
                      ...editQuestionData,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
              )}

              <input
                type="number"
                placeholder="Marks"
                value={editQuestionData.marks}
                onChange={(e) =>
                  setEditQuestionData({
                    ...editQuestionData,
                    marks: e.target.value,
                  })
                }
                className="w-full mb-2 p-2 border rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateQuestion}
                  className={primaryBtnClass}
                >
                  Update Question
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* --- List Questions --- */}
          <div className="mt-4">
            <h3 className="font-semibold text-green-700 mb-2">Questions</h3>
            <ul>
              {exams
                .find((e) => e._id === currentExamId)
                ?.questions.map((q, idx) => (
                  <li
                    key={idx}
                    className="border p-2 mb-2 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{q.text}</div>
                      <div className="text-sm text-gray-500">
                        Type: {q.type}, Marks: {q.marks || 0}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditQuestion(idx)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- List of Exams --- */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">
          Your Exams
        </h2>
        <ul>
          {filteredExams.map((exam) => (
            <li
              key={exam._id}
              onClick={() => setCurrentExamId(exam._id)}
              className={`p-4 mb-2 rounded cursor-pointer border ${
                exam._id === currentExamId
                  ? "border-green-600"
                  : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{exam.title}</div>
                  <div className="text-sm text-gray-500">
                    Dept: {exam.department} | Created by:{" "}
                    {exam.createdBy?.fullName || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Questions: {exam.questions.length} | Exam Code:{" "}
                    {exam.examCode}
                  </div>
                  <div className="text-sm text-gray-500">
                    Start:{" "}
                    {exam.startTime
                      ? new Date(exam.startTime).toLocaleString()
                      : "Not set"}{" "}
                    | End:{" "}
                    {exam.endTime
                      ? new Date(exam.endTime).toLocaleString()
                      : "Not set"}
                  </div>
                </div>
                <div>
                  {exam.isApproved && (
                    <span className="text-green-600 font-semibold">
                      ✅ Approved
                    </span>
                  )}
                  {!exam.isApproved && !exam.isRejected && (
                    <span className="text-yellow-600 font-semibold">
                      ⏳ Pending
                    </span>
                  )}
                  {exam.isRejected && (
                    <span className="text-red-600 font-semibold">
                      ❌ Rejected
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExamManagement;
