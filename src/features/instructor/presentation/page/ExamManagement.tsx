import { useState, useEffect, FC } from "react";
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
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [newExamData, setNewExamData] = useState({
    university: "Debre Tabor University", // Default university
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
    assignedDepartments: [] as string[],
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
    assignedDepartments: [] as string[],
  });

  const [newQuestionData, setNewQuestionData] = useState({
    text: "",
    type: "text" as "text" | "multiple-choice" | "true-false",
    options: [""],
    correctAnswer: "",
    duration: "",
    marks: "",
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [editQuestionData, setEditQuestionData] = useState({
    text: "",
    type: "text" as "text" | "multiple-choice" | "true-false",
    options: [""],
    correctAnswer: "",
    duration: "",
    marks: "",
  });

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Fetch current user and exams on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
        console.log("✅ Current user loaded:", res.data.fullName, res.data.department);
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError("Failed to load user information. Please login again.");
      }
    };

    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("📋 Fetching exams...");
        const res = await api.get<Exam[]>("/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ Exams loaded:", res.data.length, "exams");
        setExams(res.data);
      } catch (err: any) {
        console.error("Error fetching exams:", err);
        setError(err.message || "Failed to load exams. Please check if the server is running.");
      } finally {
        setPageLoading(false);
      }
    };

    fetchCurrentUser();
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
        assignedDepartments: current.assignedDepartments || [],
      });
    }
  }, [currentExamId, exams]);

  // Enhanced validation functions
  const validateExamData = (data: typeof newExamData) => {
    const errors: {[key: string]: string} = {};
    
    if (!data.title.trim()) {
      errors.title = "Exam title is required";
    } else if (data.title.length < 3) {
      errors.title = "Exam title must be at least 3 characters";
    } else if (data.title.length > 100) {
      errors.title = "Exam title must be less than 100 characters";
    }
    
    if (!data.university.trim()) {
      errors.university = "University name is required";
    }
    
    if (data.duration && (parseInt(data.duration) < 10 || parseInt(data.duration) > 300)) {
      errors.duration = "Duration must be between 10 and 300 minutes";
    }
    
    if (data.weight && (parseInt(data.weight) < 1 || parseInt(data.weight) > 100)) {
      errors.weight = "Weight must be between 1 and 100 percent";
    }
    
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (start >= end) {
        errors.endTime = "End time must be after start time";
      }
      if (start < new Date()) {
        errors.startTime = "Start time cannot be in the past";
      }
      
      // Check if duration is reasonable compared to time window
      const timeDiff = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      const examDuration = parseInt(data.duration) || 60;
      if (timeDiff < examDuration) {
        errors.duration = "Exam duration cannot be longer than the time window";
      }
    }
    
    return errors;
  };

  const validateQuestionData = (data: typeof newQuestionData) => {
    const errors: {[key: string]: string} = {};
    
    if (!data.text.trim()) {
      errors.text = "Question text is required";
    } else if (data.text.length < 5) {
      errors.text = "Question must be at least 5 characters";
    } else if (data.text.length > 1000) {
      errors.text = "Question must be less than 1000 characters";
    }
    
    if (!data.correctAnswer.trim()) {
      errors.correctAnswer = "Correct answer is required";
    }
    
    if (data.type === "multiple-choice") {
      const validOptions = data.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        errors.options = "Multiple choice questions need at least 2 options";
      }
      if (validOptions.length > 6) {
        errors.options = "Maximum 6 options allowed for multiple choice questions";
      }
      if (!validOptions.includes(data.correctAnswer)) {
        errors.correctAnswer = "Correct answer must match one of the options";
      }
      
      // Check for duplicate options
      const uniqueOptions = new Set(validOptions.map(opt => opt.toLowerCase().trim()));
      if (uniqueOptions.size !== validOptions.length) {
        errors.options = "Options must be unique";
      }
    }
    
    if (data.type === "true-false") {
      if (!["True", "False", "true", "false"].includes(data.correctAnswer)) {
        errors.correctAnswer = "True/False answer must be 'True' or 'False'";
      }
    }
    
    if (data.marks && (parseInt(data.marks) < 1 || parseInt(data.marks) > 100)) {
      errors.marks = "Marks must be between 1 and 100";
    }
    
    if (data.duration && (parseInt(data.duration) < 1 || parseInt(data.duration) > 60)) {
      errors.duration = "Question duration must be between 1 and 60 minutes";
    }
    
    return errors;
  };

  // Check edit permissions before allowing modifications
  const checkEditPermissions = async (examId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/exams/${examId}/edit-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.permissions;
    } catch (err) {
      console.error("Error checking edit permissions:", err);
      return { canEditExam: false, canDeleteExam: false, canEditQuestions: false, reasons: ["Permission check failed"] };
    }
  };

  // Validate exam data on server before saving
  const validateExamOnServer = async (examId: string, examData: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(`/exams/${examId}/validate-edit`, examData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("Error validating exam on server:", err);
      return { isValid: false, errors: ["Server validation failed"], warnings: [] };
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleCreateExam = async () => {
    clearMessages();
    
    // Validate exam data
    const errors = validateExamData(newExamData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showError("Please fix the validation errors before creating the exam");
      return;
    }
    
    // Check if user has permission
    if (!currentUser || !["instructor", "departmentHead", "admin"].includes(currentUser.role)) {
      showError("You don't have permission to create exams");
      return;
    }
    
    // Check if user has department (required for exam creation)
    if (!currentUser.department) {
      showError("Your account must have a department assigned to create exams");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const examData = {
        ...newExamData,
        department: currentUser.department, // Add the user's department
        duration: newExamData.duration ? parseInt(newExamData.duration) : undefined,
        weight: newExamData.weight ? parseInt(newExamData.weight) : undefined,
        assignedDepartments: newExamData.assignedDepartments.length > 0 
          ? newExamData.assignedDepartments 
          : [currentUser.department], // Default to user's department if none selected
      };
      
      const res = await api.post<Exam>("/exams", examData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setExams([...exams, res.data]);
      setNewExamData({
        university: "Debre Tabor University", // Keep default university
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
        assignedDepartments: [],
      });
      setCurrentExamId(res.data._id);
      showSuccess(`Exam created successfully! Exam Code: ${res.data.examCode}`);
    } catch (err: any) {
      console.error("Error creating exam:", err);
      showError(err.response?.data?.message || "Error creating exam");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExam = async () => {
    clearMessages();
    
    if (!currentExamId) {
      showError("Please select an exam first");
      return;
    }
    
    // Check edit permissions first
    const permissions = await checkEditPermissions(currentExamId);
    if (!permissions.canEditExam) {
      showError(permissions.reasons.join(". "));
      return;
    }
    
    // Validate exam data locally
    const localErrors = validateExamData(editExamData);
    if (Object.keys(localErrors).length > 0) {
      setValidationErrors(localErrors);
      showError("Please fix the validation errors before updating the exam");
      return;
    }
    
    // Validate on server
    const examData = {
      ...editExamData,
      duration: editExamData.duration ? parseInt(editExamData.duration) : undefined,
      weight: editExamData.weight ? parseInt(editExamData.weight) : undefined,
    };
    
    const serverValidation = await validateExamOnServer(currentExamId, examData);
    if (!serverValidation.isValid) {
      setValidationErrors(serverValidation.errors.reduce((acc: any, error: string, index: number) => {
        acc[`server_${index}`] = error;
        return acc;
      }, {}));
      showError("Server validation failed: " + serverValidation.errors.join(", "));
      return;
    }
    
    // Show warnings if any
    if (serverValidation.warnings && serverValidation.warnings.length > 0) {
      const proceedWithWarnings = window.confirm(
        "Warning:\n" + serverValidation.warnings.join("\n") + "\n\nDo you want to proceed?"
      );
      if (!proceedWithWarnings) return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const res = await api.put<Exam>(`/exams/${currentExamId}`, examData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      showSuccess("Exam updated successfully!");
    } catch (err: any) {
      console.error("Error updating exam:", err);
      showError(err.response?.data?.message || "Error updating exam");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    clearMessages();
    
    if (!currentExamId) {
      showError("Please select an exam first");
      return;
    }
    
    // Check edit permissions first
    const permissions = await checkEditPermissions(currentExamId);
    if (!permissions.canDeleteExam) {
      showError(permissions.reasons.join(". "));
      return;
    }
    
    const currentExam = exams.find((e) => e._id === currentExamId);
    
    // Enhanced confirmation dialog with different messages for approved vs non-approved exams
    let confirmMessage;
    let requiredInput;
    
    if (currentExam?.isApproved) {
      // Special handling for approved exams
      confirmMessage = [
        `⚠️  WARNING: You are about to delete an APPROVED exam!`,
        ``,
        `📋 Exam: "${currentExam.title}"`,
        `🔢 Code: ${currentExam.examCode}`,
        `📊 Questions: ${currentExam.questions?.length || 0}`,
        `🏫 Department: ${currentExam.department}`,
        currentExam.year && currentExam.section ? `📚 Year/Section: ${currentExam.year}/${currentExam.section}` : "",
        ``,
        `🚨 CRITICAL IMPACT:`,
        `• This exam is currently AVAILABLE TO STUDENTS`,
        `• Students will LOSE ACCESS immediately after deletion`,
        `• All exam data will be PERMANENTLY DELETED`,
        `• This action CANNOT BE UNDONE`,
        ``,
        `⚠️  Only proceed if you are absolutely certain!`,
        ``,
        `Type "DELETE APPROVED EXAM" to confirm:`
      ].filter(Boolean).join("\n");
      requiredInput = "DELETE APPROVED EXAM";
    } else {
      // Regular confirmation for non-approved exams
      confirmMessage = [
        `Are you sure you want to delete "${currentExam?.title}"?`,
        ``,
        `📊 Exam Details:`,
        `• Questions: ${currentExam?.questions?.length || 0}`,
        `• Exam Code: ${currentExam?.examCode}`,
        `• Department: ${currentExam?.department}`,
        currentExam?.year && currentExam?.section ? `• Year/Section: ${currentExam.year}/${currentExam.section}` : "",
        ``,
        `⚠️  This action cannot be undone.`,
        `⚠️  All questions and exam data will be permanently deleted.`,
        ``,
        `Type "DELETE" to confirm:`
      ].filter(Boolean).join("\n");
      requiredInput = "DELETE";
    }
    
    const userInput = window.prompt(confirmMessage);
    if (userInput !== requiredInput) {
      showError(`Deletion cancelled. You must type '${requiredInput}' to confirm.`);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(`/exams/${currentExamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setExams(exams.filter((e) => e._id !== currentExamId));
      setCurrentExamId(null);
      
      // Show detailed success message
      const deletedInfo = response.data.deletedExam;
      const successMessage = deletedInfo?.wasApproved 
        ? `✅ Approved exam "${deletedInfo?.title}" (Code: ${deletedInfo?.examCode}) deleted successfully!\n🚨 Students no longer have access to this exam.`
        : `✅ Exam "${deletedInfo?.title}" (Code: ${deletedInfo?.examCode}) deleted successfully!`;
      
      showSuccess(successMessage);
    } catch (err: any) {
      console.error("Error deleting exam:", err);
      showError(err.response?.data?.message || "Error deleting exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    clearMessages();
    
    if (!currentExamId) {
      showError("Please select an exam first");
      return;
    }
    
    // Validate question data
    const errors = validateQuestionData(newQuestionData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showError("Please fix the validation errors before adding the question");
      return;
    }
    
    const currentExam = exams.find((e) => e._id === currentExamId);
    
    // Check if exam can be modified
    if (currentExam?.isApproved) {
      showError("Cannot add questions to approved exams");
      return;
    }
    
    // Check ownership
    if (currentExam?.createdBy._id !== currentUser?._id && currentUser?.role !== "admin") {
      showError("You can only add questions to exams that you created");
      return;
    }
    
    // Check question limit
    if (currentExam && currentExam.questions && currentExam.questions.length >= 50) {
      showError("Maximum 50 questions allowed per exam");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const questionData = {
        text: newQuestionData.text.trim(),
        type: newQuestionData.type,
        options: newQuestionData.type === "multiple-choice" 
          ? newQuestionData.options.filter(opt => opt.trim()).map(opt => opt.trim())
          : undefined,
        correctAnswer: newQuestionData.correctAnswer.trim(),
        duration: newQuestionData.duration ? parseInt(newQuestionData.duration) : undefined,
        marks: newQuestionData.marks ? parseInt(newQuestionData.marks) : 1,
      };
      
      const res = await api.post<Exam>(
        `/exams/${currentExamId}/questions`,
        questionData,
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
      showSuccess("Question added successfully!");
    } catch (err: any) {
      console.error("Error adding question:", err);
      showError(err.response?.data?.message || "Error adding question");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index: number) => {
    const currentExam = exams.find((e) => e._id === currentExamId);
    if (!currentExam) return;
    
    const question = currentExam.questions[index];
    if (!question) return;
    
    setEditingQuestionIndex(index);
    setEditQuestionData({
      text: question.text,
      type: question.type,
      options: question.options || [""],
      correctAnswer: question.correctAnswer,
      duration: question.duration?.toString() || "",
      marks: question.marks?.toString() || "",
    });
  };

  const handleUpdateQuestion = async () => {
    clearMessages();
    
    if (!currentExamId || editingQuestionIndex === null) {
      showError("Please select a question to edit");
      return;
    }
    
    // Validate question data
    const errors = validateQuestionData(editQuestionData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showError("Please fix the validation errors before updating the question");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const currentExam = exams.find((e) => e._id === currentExamId);
      const questionId = currentExam?.questions[editingQuestionIndex]?._id;
      
      if (!questionId) {
        showError("Invalid question selected");
        return;
      }

      const questionData = {
        text: editQuestionData.text.trim(),
        type: editQuestionData.type,
        options: editQuestionData.type === "multiple-choice" 
          ? editQuestionData.options.filter(opt => opt.trim()).map(opt => opt.trim())
          : undefined,
        correctAnswer: editQuestionData.correctAnswer.trim(),
        duration: editQuestionData.duration ? parseInt(editQuestionData.duration) : undefined,
        marks: editQuestionData.marks ? parseInt(editQuestionData.marks) : 1,
      };

      const res = await api.put<Exam>(
        `/exams/${currentExamId}/questions/${questionId}`,
        questionData,
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
      showSuccess("Question updated successfully!");
    } catch (err: any) {
      console.error("Error updating question:", err);
      showError(err.response?.data?.message || "Error updating question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (index: number) => {
    clearMessages();
    
    if (!currentExamId) {
      showError("Please select an exam first");
      return;
    }

    const currentExam = exams.find((e) => e._id === currentExamId);
    if (!currentExam) return;
    
    const question = currentExam.questions[index];
    if (!question) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete this question?\n\n"${question.text}"\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const questionId = question._id;
      
      if (!questionId) {
        showError("Invalid question selected");
        return;
      }

      const res = await api.delete<Exam>(
        `/exams/${currentExamId}/questions/${questionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      showSuccess("Question deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting question:", err);
      showError(err.response?.data?.message || "Error deleting question");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToCommittee = async () => {
    clearMessages();
    
    if (!currentExamId) {
      showError("Please select an exam first");
      return;
    }

    const currentExam = exams.find((e) => e._id === currentExamId);
    if (!currentExam) return;

    // Validation checks before sending to committee
    if (currentExam.questions.length === 0) {
      showError("Cannot send exam to committee: No questions added. Please add at least 1 question.");
      return;
    }

    // Check if all questions have correct answers
    const questionsWithoutAnswers = currentExam.questions.filter(
      q => !q.correctAnswer || q.correctAnswer.trim() === ""
    );
    
    if (questionsWithoutAnswers.length > 0) {
      showError(`Cannot send to committee: ${questionsWithoutAnswers.length} question(s) missing correct answers`);
      return;
    }

    const confirmSend = window.confirm(
      `Send "${currentExam.title}" to Exam Committee?\n\n` +
      `Questions: ${currentExam.questions.length}\n` +
      `Department: ${currentExam.department}\n\n` +
      `Once sent, you cannot modify the exam until committee review is complete.\n` +
      `The committee will review, approve, and assign students.`
    );
    
    if (!confirmSend) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Send to committee
      const res = await api.post(
        `/exams/${currentExamId}/send-to-committee`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setExams(exams.map((e) => (e._id === currentExamId ? res.data : e)));
      showSuccess("Exam sent to committee successfully! The committee will review and approve.");
    } catch (err: any) {
      console.error("Error sending to committee:", err);
      showError(err.response?.data?.message || "Error sending exam to committee");
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter(
    (exam) => exam.department === currentUser?.department
  );

  const primaryBtnClass = "bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded";

  // Show loading state while fetching data
  if (pageLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-100 max-w-5xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading exam management...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-5xl mx-auto">
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-600 mr-2">❌</div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">✅</div>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Create New Exam */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-green-700">Create New Exam</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <input
              type="text"
              placeholder="University *"
              value={newExamData.university}
              onChange={(e) => setNewExamData({ ...newExamData, university: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.university ? 'border-red-500' : ''}`}
            />
            {validationErrors.university && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.university}</p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Exam Title *"
              value={newExamData.title}
              onChange={(e) => setNewExamData({ ...newExamData, title: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.title ? 'border-red-500' : ''}`}
            />
            {validationErrors.title && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
            )}
          </div>
          <div>
            <textarea
              placeholder="Description"
              value={newExamData.description}
              onChange={(e) => setNewExamData({ ...newExamData, description: e.target.value })}
              className="p-2 border rounded w-full"
              rows={2}
            />
          </div>
          <div>
            <textarea
              placeholder="Instructions"
              value={newExamData.instructions}
              onChange={(e) => setNewExamData({ ...newExamData, instructions: e.target.value })}
              className="p-2 border rounded w-full"
              rows={2}
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={newExamData.duration}
              onChange={(e) => setNewExamData({ ...newExamData, duration: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.duration ? 'border-red-500' : ''}`}
              min="10"
              max="300"
            />
            {validationErrors.duration && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.duration}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              placeholder="Weight (%)"
              value={newExamData.weight}
              onChange={(e) => setNewExamData({ ...newExamData, weight: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.weight ? 'border-red-500' : ''}`}
              min="1"
              max="100"
            />
            {validationErrors.weight && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.weight}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={newExamData.startTime}
              onChange={(e) => setNewExamData({ ...newExamData, startTime: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.startTime ? 'border-red-500' : ''}`}
            />
            {validationErrors.startTime && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.startTime}</p>
            )}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Time</label>
            <input
              type="datetime-local"
              value={newExamData.endTime}
              onChange={(e) => setNewExamData({ ...newExamData, endTime: e.target.value })}
              className={`p-2 border rounded w-full ${validationErrors.endTime ? 'border-red-500' : ''}`}
            />
            {validationErrors.endTime && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.endTime}</p>
            )}
          </div>
        </div>

        {/* Assigned Department Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-3">📚 Department Assignment</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-700">This exam will be assigned to:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {currentUser?.department || "Your Department"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Exams are automatically assigned to your department. Students in your department will see this exam after committee approval.
          </p>
          
          {/* Year and Section for New Exam */}
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Year (optional)</label>
              <input
                type="text"
                placeholder="e.g., 1, 2, 3, 4"
                value={newExamData.year}
                onChange={(e) => setNewExamData({ ...newExamData, year: e.target.value })}
                className="p-2 border rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Section (optional)</label>
              <input
                type="text"
                placeholder="e.g., A, B, C"
                value={newExamData.section}
                onChange={(e) => setNewExamData({ ...newExamData, section: e.target.value })}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleCreateExam} 
            disabled={loading}
            className={`${primaryBtnClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? "Creating..." : "Create Exam"}
          </button>
          {currentExamId && (
            <button 
              onClick={handleSendToCommittee} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Sending..." : "📤 Assign to Exam Committee"}
            </button>
          )}
        </div>
      </div>

      {/* Edit Exam + Questions */}
      {currentExamId && (
        <div className="bg-white p-6 rounded shadow mb-6">
          {(() => {
            const currentExam = exams.find((e) => e._id === currentExamId);
            const isApproved = currentExam?.isApproved;
            const isRejected = currentExam?.isRejected;
            const isPending = !isApproved && !isRejected;
            
            return (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-green-700">
                    {isApproved ? "✅ Approved Exam - View Only" : 
                     isRejected ? "❌ Rejected Exam - Edit & Resubmit" : 
                     "📝 Edit Exam"}
                  </h2>
                  <div className="flex gap-2">
                    {isPending && currentExam && currentExam.questions.length >= 1 && (
                      <button
                        onClick={handleSendToCommittee}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
                      >
                        {loading ? "Sending..." : "📤 Send to Committee"}
                      </button>
                    )}
                  </div>
                </div>

                {isApproved && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      This exam has been approved by the committee and is now available to students.
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      You cannot modify approved exams, but you can still delete them if necessary.
                    </p>
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-yellow-800 text-sm font-medium">
                        ⚠️ Warning: Deleting an approved exam will immediately remove student access.
                      </p>
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium">
                      This exam was rejected by the committee.
                    </p>
                    <p className="text-red-700 text-sm mt-1">
                      Please review and edit the exam, then resubmit to the committee.
                    </p>
                  </div>
                )}

                {/* Exam Details Form */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Exam Title *"
                      value={editExamData.title}
                      onChange={(e) => setEditExamData({ ...editExamData, title: e.target.value })}
                      className={`p-2 border rounded w-full ${validationErrors.title ? 'border-red-500' : ''}`}
                      disabled={isApproved}
                    />
                    {validationErrors.title && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Year (e.g., 2024) *"
                      value={editExamData.year}
                      onChange={(e) => setEditExamData({ ...editExamData, year: e.target.value })}
                      className="p-2 border rounded w-full"
                      disabled={isApproved}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Section (e.g., A, B, C) *"
                      value={editExamData.section}
                      onChange={(e) => setEditExamData({ ...editExamData, section: e.target.value })}
                      className="p-2 border rounded w-full"
                      disabled={isApproved}
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Duration (minutes)"
                      value={editExamData.duration}
                      onChange={(e) => setEditExamData({ ...editExamData, duration: e.target.value })}
                      className={`p-2 border rounded w-full ${validationErrors.duration ? 'border-red-500' : ''}`}
                      disabled={isApproved}
                      min="10"
                      max="300"
                    />
                    {validationErrors.duration && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.duration}</p>
                    )}
                  </div>
                </div>

                {!isApproved && (
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={handleUpdateExam} 
                      disabled={loading}
                      className={`${primaryBtnClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? "Updating..." : "Update Exam"}
                    </button>
                    <button
                      onClick={handleDeleteExam}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded disabled:opacity-50"
                    >
                      {loading ? "Deleting..." : "Delete Exam"}
                    </button>
                  </div>
                )}

                {/* Exam Statistics */}
                {currentExam && (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{currentExam.questions.length}</div>
                        <div className="text-xs text-gray-600">Questions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {currentExam.questions.reduce((sum, q) => sum + (q.marks || 1), 0)}
                        </div>
                        <div className="text-xs text-gray-600">Total Marks</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{editExamData.duration || 0}</div>
                        <div className="text-xs text-gray-600">Minutes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{currentExam.examCode}</div>
                        <div className="text-xs text-gray-600">Exam Code</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Department Info Section */}
                {currentExam && !isApproved && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-800 mb-3">📚 Department Assignment</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-gray-700">Assigned to:</span>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {currentExam.department || currentUser?.department || "Your Department"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      This exam is assigned to your department. Students in this department will see it after committee approval.
                    </p>
                  </div>
                )}
              </>
            );
          })()}

          {/* Add Question Section */}
          {!exams.find((e) => e._id === currentExamId)?.isApproved && (
            <div className="mt-6 border-t pt-6">
              <h3 className="font-semibold text-green-700 mb-4">
                {editingQuestionIndex !== null ? "Edit Question" : "Add Question"}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    placeholder="Question Text *"
                    value={editingQuestionIndex !== null ? editQuestionData.text : newQuestionData.text}
                    onChange={(e) => {
                      if (editingQuestionIndex !== null) {
                        setEditQuestionData({ ...editQuestionData, text: e.target.value });
                      } else {
                        setNewQuestionData({ ...newQuestionData, text: e.target.value });
                      }
                    }}
                    className={`w-full p-2 border rounded ${validationErrors.text ? 'border-red-500' : ''}`}
                    rows={3}
                  />
                  {validationErrors.text && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.text}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <select
                      value={editingQuestionIndex !== null ? editQuestionData.type : newQuestionData.type}
                      onChange={(e) => {
                        const newType = e.target.value as "text" | "multiple-choice" | "true-false";
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, type: newType });
                        } else {
                          setNewQuestionData({ ...newQuestionData, type: newType });
                        }
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="text">Text Answer</option>
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Marks *"
                      value={editingQuestionIndex !== null ? editQuestionData.marks : newQuestionData.marks}
                      onChange={(e) => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, marks: e.target.value });
                        } else {
                          setNewQuestionData({ ...newQuestionData, marks: e.target.value });
                        }
                      }}
                      className={`w-full p-2 border rounded ${validationErrors.marks ? 'border-red-500' : ''}`}
                      min="1"
                      max="100"
                    />
                    {validationErrors.marks && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.marks}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Duration (optional)"
                      value={editingQuestionIndex !== null ? editQuestionData.duration : newQuestionData.duration}
                      onChange={(e) => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, duration: e.target.value });
                        } else {
                          setNewQuestionData({ ...newQuestionData, duration: e.target.value });
                        }
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {((editingQuestionIndex !== null ? editQuestionData.type : newQuestionData.type) === "multiple-choice") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Options:</label>
                    {(editingQuestionIndex !== null ? editQuestionData.options : newQuestionData.options).map((option, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1} *`}
                          value={option}
                          onChange={(e) => {
                            if (editingQuestionIndex !== null) {
                              const opts = [...editQuestionData.options];
                              opts[idx] = e.target.value;
                              setEditQuestionData({ ...editQuestionData, options: opts });
                            } else {
                              const opts = [...newQuestionData.options];
                              opts[idx] = e.target.value;
                              setNewQuestionData({ ...newQuestionData, options: opts });
                            }
                          }}
                          className="flex-1 p-2 border rounded"
                        />
                        {(editingQuestionIndex !== null ? editQuestionData.options : newQuestionData.options).length > 2 && (
                          <button
                            onClick={() => {
                              if (editingQuestionIndex !== null) {
                                const opts = editQuestionData.options.filter((_, i) => i !== idx);
                                setEditQuestionData({ ...editQuestionData, options: opts });
                              } else {
                                const opts = newQuestionData.options.filter((_, i) => i !== idx);
                                setNewQuestionData({ ...newQuestionData, options: opts });
                              }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, options: [...editQuestionData.options, ""] });
                        } else {
                          setNewQuestionData({ ...newQuestionData, options: [...newQuestionData.options, ""] });
                        }
                      }}
                      className="text-blue-600 text-sm hover:text-blue-800"
                    >
                      + Add Option
                    </button>
                    {validationErrors.options && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.options}</p>
                    )}
                  </div>
                )}

                {/* Correct Answer */}
                <div>
                  {((editingQuestionIndex !== null ? editQuestionData.type : newQuestionData.type) === "true-false") ? (
                    <select
                      value={editingQuestionIndex !== null ? editQuestionData.correctAnswer : newQuestionData.correctAnswer}
                      onChange={(e) => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, correctAnswer: e.target.value });
                        } else {
                          setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value });
                        }
                      }}
                      className={`w-full p-2 border rounded ${validationErrors.correctAnswer ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Correct Answer *</option>
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  ) : ((editingQuestionIndex !== null ? editQuestionData.type : newQuestionData.type) === "multiple-choice") ? (
                    <select
                      value={editingQuestionIndex !== null ? editQuestionData.correctAnswer : newQuestionData.correctAnswer}
                      onChange={(e) => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, correctAnswer: e.target.value });
                        } else {
                          setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value });
                        }
                      }}
                      className={`w-full p-2 border rounded ${validationErrors.correctAnswer ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select Correct Answer *</option>
                      {(editingQuestionIndex !== null ? editQuestionData.options : newQuestionData.options)
                        .filter(opt => opt.trim())
                        .map((option, idx) => (
                          <option key={idx} value={option}>{option}</option>
                        ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Correct Answer *"
                      value={editingQuestionIndex !== null ? editQuestionData.correctAnswer : newQuestionData.correctAnswer}
                      onChange={(e) => {
                        if (editingQuestionIndex !== null) {
                          setEditQuestionData({ ...editQuestionData, correctAnswer: e.target.value });
                        } else {
                          setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value });
                        }
                      }}
                      className={`w-full p-2 border rounded ${validationErrors.correctAnswer ? 'border-red-500' : ''}`}
                    />
                  )}
                  {validationErrors.correctAnswer && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.correctAnswer}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingQuestionIndex !== null ? (
                    <>
                      <button 
                        onClick={handleUpdateQuestion} 
                        disabled={loading}
                        className={`${primaryBtnClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? "Updating..." : "Update Question"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestionIndex(null);
                          setEditQuestionData({
                            text: "",
                            type: "text",
                            options: [""],
                            correctAnswer: "",
                            duration: "",
                            marks: "",
                          });
                          clearMessages();
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleAddQuestion} 
                      disabled={loading}
                      className={`${primaryBtnClass} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? "Adding..." : "Add Question"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* List Questions */}
          <div className="mt-6 border-t pt-6">
            <h3 className="font-semibold text-green-700 mb-4">
              Questions ({exams.find((e) => e._id === currentExamId)?.questions.length || 0})
            </h3>
            
            {(!exams.find((e) => e._id === currentExamId)?.questions.length) ? (
              <div className="text-center py-8 text-gray-500">
                <p>No questions added yet.</p>
                <p className="text-sm mt-1">Add at least 3 questions to send the exam to committee.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams
                  .find((e) => e._id === currentExamId)
                  ?.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="border p-4 rounded-lg bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium mb-2">
                            {idx + 1}. {q.text}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Type:</strong> {q.type} | <strong>Marks:</strong> {q.marks || 1}</p>
                            {q.options && (
                              <div>
                                <strong>Options:</strong>
                                <ul className="list-disc list-inside ml-4">
                                  {q.options.map((opt, optIdx) => (
                                    <li key={optIdx} className={opt === q.correctAnswer ? "text-green-600 font-medium" : ""}>
                                      {opt} {opt === q.correctAnswer && "✓"}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {!q.options && (
                              <p><strong>Correct Answer:</strong> <span className="text-green-600">{q.correctAnswer}</span></p>
                            )}
                          </div>
                        </div>
                        {!exams.find((e) => e._id === currentExamId)?.isApproved && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditQuestion(idx)}
                              disabled={loading}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(idx)}
                              disabled={loading}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List of Exams */}
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
                  {exam.year && exam.section && (
                    <div className="text-sm text-blue-600">
                      📚 Year: {exam.year} | Section: {exam.section}
                    </div>
                  )}
                  {exam.assignedDepartments && exam.assignedDepartments.length > 0 && (
                    <div className="text-sm text-purple-600 mt-1">
                      🏫 Assigned to: {exam.assignedDepartments.join(", ")}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {exam.isApproved && (
                    <span className="text-green-600 font-semibold block mb-1">
                      ✅ Approved - Available to Students
                    </span>
                  )}
                  {!exam.isApproved && !exam.isRejected && (
                    <>
                      <span className="text-yellow-600 font-semibold block mb-1">
                        ⏳ Pending Committee Approval
                      </span>
                      {exam.questions.length >= 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentExamId(exam._id);
                            setTimeout(() => handleSendToCommittee(), 100);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded mt-1"
                        >
                          📤 Send to Committee
                        </button>
                      )}
                    </>
                  )}
                  {exam.isRejected && (
                    <span className="text-red-600 font-semibold block mb-1">
                      ❌ Rejected by Committee
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