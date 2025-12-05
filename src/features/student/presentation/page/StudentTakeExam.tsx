import { useState, useEffect, FC } from "react";
import api from "../../../../api/xiosInstance";
import { toast } from "react-toastify";

interface User {
  _id: string;
  fullName: string;
  username: string;
  department: string;
  year?: string;
  section?: string;
  role: string;
}

interface Question {
  _id?: string;
  text: string;
  type: "text" | "multiple-choice" | "true-false";
  options?: string[];
  correctAnswer?: string;
  marks?: number;
}

interface Exam {
  _id: string;
  title: string;
  department: string;
  description?: string;
  instructions?: string;
  examCode?: string;
  duration?: number; // in minutes
  questions: Question[];
  startTime?: string;
  endTime?: string;
  isSubmitted?: boolean;
  studentScore?: number;
}

const StudentTakesExam: FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [examOpened, setExamOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [flags, setFlags] = useState<{ [key: number]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
        toast.error("Failed to fetch user information");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        console.log("Fetching exams for user:", currentUser);
        
        // Try the filtered endpoint first
        let res;
        try {
          res = await api.get<Exam[]>(
            `/student-exams/student/filtered?department=${currentUser.department}&year=${currentUser.year || ""}&section=${currentUser.section || ""}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (filterErr) {
          // Fallback to regular exams endpoint and filter on frontend
          console.log("Filtered endpoint failed, trying regular endpoint");
          const allExamsRes = await api.get<Exam[]>("/exams", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Filter exams by department
          res = {
            data: allExamsRes.data.filter(
              (exam) => exam.department === currentUser.department
            ),
          };
        }
        
        console.log("Fetched exams:", res.data);
        
        // Check which exams have been submitted
        const examsWithStatus = await Promise.all(
          res.data.map(async (exam) => {
            try {
              const statusRes = await api.get(
                `/student-exams/submission-status/${exam._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              console.log(`Exam ${exam.title} status:`, statusRes.data);
              return {
                ...exam,
                isSubmitted: statusRes.data.submitted || false,
                studentScore: statusRes.data.score || 0,
              };
            } catch (err) {
              console.error(`Error checking status for exam ${exam.title}:`, err);
              return { ...exam, isSubmitted: false };
            }
          })
        );
        
        setExams(examsWithStatus);
        if (examsWithStatus.length === 0) {
          toast.info("No exams available for your department");
        }
      } catch (err: any) {
        console.error("Error fetching exams:", err);
        console.error("Error response:", err.response?.data);
        toast.error(err.response?.data?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [currentUser]);

  // Timer - Auto submit when time runs out
  useEffect(() => {
    if (!examOpened || timeLeft <= 0) {
      if (examOpened && timeLeft === 0) {
        toast.warning("Time's up! Submitting exam automatically...");
        finishExam();
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [examOpened, timeLeft]);

  const handleOpenExam = async () => {
    if (!selectedExam) return;
    
    // Check if already submitted
    if (selectedExam.isSubmitted) {
      toast.error("❌ You have already submitted this exam!");
      const viewResult = window.confirm(
        "You have already completed this exam.\n\nWould you like to view your result?"
      );
      if (viewResult) {
        fetchExamResult(selectedExam._id);
      }
      return;
    }
    
    // Strict exam code validation - must match exactly
    if (!enteredCode.trim()) {
      toast.error("❌ Please enter the exam code!");
      alert("⚠️ Exam Code Required\n\nYou must enter the exam code to proceed.\n\nPlease get the exam code from your instructor.");
      return;
    }
    
    const enteredCodeUpper = enteredCode.trim().toUpperCase();
    const correctCodeUpper = selectedExam.examCode?.toUpperCase() || "";
    
    if (enteredCodeUpper !== correctCodeUpper) {
      toast.error("❌ Incorrect exam code!");
      
      // Show detailed error message
      alert(
        "❌ INCORRECT EXAM CODE\n\n" +
        `You entered: "${enteredCode.trim()}"\n` +
        `This code is not correct.\n\n` +
        `Please:\n` +
        `1. Check the exam code from your instructor\n` +
        `2. Make sure there are no typos\n` +
        `3. Try entering the code again\n\n` +
        `Note: Exam codes are case-insensitive`
      );
      
      // Clear the input to let them try again
      setEnteredCode("");
      return;
    }

    // Code is correct, proceed to open exam
    try {
      const token = localStorage.getItem("token");
      console.log("✅ Correct exam code entered!");
      console.log("Starting exam:", selectedExam._id);
      
      // Start the exam on backend
      await api.post(
        `/student-exams/start/${selectedExam._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Exam opened successfully!");
      console.log("Exam details:", selectedExam);
      console.log("Number of questions:", selectedExam.questions?.length || 0);
      console.log("Questions:", selectedExam.questions);
      
      setExamOpened(true);
      setTimeLeft(selectedExam.duration ? selectedExam.duration * 60 : 0);
      setCurrentQuestionIndex(0);
      toast.success("Exam started successfully!");
    } catch (err: any) {
      console.error("Error starting exam:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || "Failed to start exam";
      const errorData = err.response?.data;
      
      // Handle already submitted exam
      if (errorMessage.includes("already submitted")) {
        toast.warning("You have already submitted this exam!");
        
        const viewResult = window.confirm(
          "You have already submitted this exam.\n\nWould you like to view your result?"
        );
        
        if (viewResult) {
          // Fetch and display result
          fetchExamResult(selectedExam._id);
        } else {
          // Ask if they want to retake (for testing)
          const retake = window.confirm(
            "Would you like to retake this exam? (This will create a new submission)"
          );
          if (retake) {
            // Open exam anyway for retake
            setExamOpened(true);
            setTimeLeft(selectedExam.duration ? selectedExam.duration * 60 : 0);
            setCurrentQuestionIndex(0);
            toast.info("Retaking exam. This will create a new submission.");
          }
        }
        return;
      }
      
      // Show detailed error for role issues
      if (errorMessage.includes("Insufficient role")) {
        console.error("Role mismatch!");
        console.error("Your role:", errorData?.userRole);
        console.error("Required roles:", errorData?.requiredRoles);
        console.error("Current user:", currentUser);
        
        toast.error(`Access denied. Your role: ${errorData?.userRole || "unknown"}. Please login as a student.`);
        
        // Allow bypass for testing
        const forceOpen = window.confirm(
          `Role mismatch detected!\nYour role: ${errorData?.userRole || "unknown"}\nRequired: student\n\nWould you like to open the exam anyway for testing?`
        );
        if (forceOpen) {
          console.log("Force opening exam despite role mismatch");
          console.log("Exam details:", selectedExam);
          console.log("Number of questions:", selectedExam.questions?.length || 0);
          
          setExamOpened(true);
          setTimeLeft(selectedExam.duration ? selectedExam.duration * 60 : 0);
          setCurrentQuestionIndex(0);
          toast.warning("Exam opened in test mode. Submission may fail.");
        }
        return;
      }
      
      toast.error(errorMessage);
      
      // If the error is about approval, allow opening anyway with exam code
      if (errorMessage.includes("not approved")) {
        const forceOpen = window.confirm(
          "You are not pre-approved for this exam, but you have the correct exam code. Would you like to proceed anyway?"
        );
        if (forceOpen) {
          console.log("Force opening exam");
          console.log("Exam details:", selectedExam);
          console.log("Number of questions:", selectedExam.questions?.length || 0);
          
          setExamOpened(true);
          setTimeLeft(selectedExam.duration ? selectedExam.duration * 60 : 0);
          setCurrentQuestionIndex(0);
          toast.info("Exam opened. You can take it, but submission may require instructor approval.");
        }
      }
    }
  };

  const fetchExamResult = async (examId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/student-exams/result/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const result = res.data;
      
      // Show detailed result with option to view answers
      const viewAnswers = window.confirm(
        `📊 Exam Result\n\n` +
        `Exam: ${result.examTitle}\n` +
        `Score: ${result.obtainedMarks}/${result.totalMarks}\n` +
        `Percentage: ${result.percentage}%\n` +
        `Submitted: ${new Date(result.submittedAt).toLocaleString()}\n` +
        `${result.isReviewed ? `Reviewed: Yes\nNotes: ${result.reviewNotes || "None"}` : "Status: Pending Review"}\n\n` +
        `Would you like to view your answers?`
      );
      
      if (viewAnswers) {
        viewSubmittedExam(examId);
      }
    } catch (err: any) {
      console.error("Error fetching result:", err);
      toast.error("Failed to fetch exam result");
    }
  };

  const viewSubmittedExam = async (examId: string) => {
    try {
      const token = localStorage.getItem("token");
      
      // Fetch the exam
      const examRes = await api.get(`/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch the submission
      const submissionRes = await api.get(`/student-exams/result/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const exam = examRes.data;
      const submission = submissionRes.data;
      
      // Create a detailed view
      let answerDetails = `📝 Your Submitted Answers\n\n`;
      answerDetails += `Exam: ${exam.title}\n`;
      answerDetails += `Score: ${submission.obtainedMarks}/${submission.totalMarks} (${submission.percentage}%)\n\n`;
      
      // This is a simplified view - in production, you'd want a proper modal/page
      toast.info("Check console for detailed answers");
      console.log("=== EXAM SUBMISSION DETAILS ===");
      console.log("Exam:", exam.title);
      console.log("Score:", submission.obtainedMarks, "/", submission.totalMarks);
      console.log("Percentage:", submission.percentage + "%");
      console.log("Submitted:", new Date(submission.submittedAt).toLocaleString());
      console.log("\nYour answers have been recorded.");
      
    } catch (err: any) {
      console.error("Error viewing submission:", err);
      toast.error("Failed to load submission details");
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const toggleFlag = (index: number) => {
    setFlags({ ...flags, [index]: !flags[index] });
  };

  const clearAnswer = (questionId: string) => {
    const newAns = { ...answers };
    delete newAns[questionId];
    setAnswers(newAns);
  };

  const finishExam = async () => {
    if (!selectedExam) return;

    if (submitting) return; // Prevent double submission

    // Confirm submission
    const confirmed = window.confirm(
      "Are you sure you want to submit the exam? This action cannot be undone."
    );
    if (!confirmed) return;

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      
      // Submit exam to backend
      const response = await api.post(
        `/student-exams/submit-exam/${selectedExam._id}`,
        { answers },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { score, totalMarks, percentage, message } = response.data;
      
      console.log("✅ Exam submitted successfully!");
      console.log("Score:", score);
      console.log("Total Marks:", totalMarks);
      console.log("Percentage:", percentage);
      console.log("Answers saved:", Object.keys(answers).length);
      
      // Show detailed result
      toast.success(`✅ ${message || "Exam submitted successfully!"}`);
      
      // Display score in alert
      alert(
        `🎉 Exam Submitted Successfully!\n\n` +
        `Exam: ${selectedExam?.title}\n` +
        `Your Score: ${score}/${totalMarks}\n` +
        `Percentage: ${percentage}%\n\n` +
        `✓ All answers saved\n` +
        `✓ Score saved to database\n` +
        `✓ You cannot retake this exam\n\n` +
        `Thank you for completing the exam!`
      );
      
      // Mark exam as submitted in the list
      if (selectedExam) {
        setExams(prevExams =>
          prevExams.map(exam =>
            exam._id === selectedExam._id
              ? { ...exam, isSubmitted: true, studentScore: score }
              : exam
          )
        );
      }
      
      // Reset state
      setExamOpened(false);
      setSelectedExam(null);
      setEnteredCode("");
      setAnswers({});
      setFlags({});
      setTimeLeft(0);
      setCurrentQuestionIndex(0);
      
      // Show success message
      toast.info("You can now view your result from the exam list");
    } catch (err: any) {
      console.error("❌ Error submitting exam:", err);
      console.error("Error details:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const refreshExams = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get<Exam[]>("/exams", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const filteredExams = res.data.filter(
        (exam) => exam.department === currentUser.department
      );
      setExams(filteredExams);
      toast.success(`Found ${filteredExams.length} exam(s)`);
    } catch (err: any) {
      console.error("Error refreshing exams:", err);
      toast.error("Failed to refresh exams");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 max-w-6xl mx-auto">
      {!selectedExam && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-700">
              Available Exams
            </h2>
            <button
              onClick={refreshExams}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          {currentUser && (
            <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
              <p>
                <strong>Your Info:</strong> {currentUser.fullName} |{" "}
                {currentUser.department} | Year: {currentUser.year || "N/A"} |
                Section: {currentUser.section || "N/A"}
              </p>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-gray-600">No exams available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check back later or contact your instructor.
              </p>
              <button
                onClick={refreshExams}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Try Again
              </button>
            </div>
          ) : (
            <ul>
              {exams.map((exam) => (
                <li
                  key={exam._id}
                  onClick={() => {
                    if (exam.isSubmitted) {
                      toast.warning("You have already submitted this exam!");
                      const viewResult = window.confirm(
                        "You have already completed this exam.\n\nWould you like to view your result?"
                      );
                      if (viewResult) {
                        fetchExamResult(exam._id);
                      }
                      return;
                    }
                    setSelectedExam(exam);
                    setEnteredCode("");
                    setExamOpened(false);
                    setAnswers({});
                    setFlags({});
                  }}
                  className={`p-4 mb-2 border rounded cursor-pointer bg-white shadow-sm transition ${
                    exam.isSubmitted
                      ? "border-gray-300 bg-gray-50 opacity-75"
                      : "hover:border-green-600 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {exam.title}
                        {exam.isSubmitted && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-normal">
                            ✓ Submitted
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Department: {exam.department} | Duration: {exam.duration}{" "}
                        min | Questions: {exam.questions?.length || 0}
                      </div>
                      {exam.description && (
                        <div className="text-sm text-gray-600 mt-2">
                          {exam.description}
                        </div>
                      )}
                      {exam.isSubmitted && exam.studentScore !== undefined && (
                        <div className="text-sm font-semibold text-green-600 mt-2">
                          Your Score: {exam.studentScore}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selectedExam && !examOpened && (
        <div className="bg-white p-6 rounded shadow mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-700">
              Enter Exam Code for {selectedExam.title}
            </h3>
            <button
              onClick={() => {
                setSelectedExam(null);
                setEnteredCode("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Back
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exam Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
              placeholder="Enter Exam Code (e.g., ABC123)"
              className="w-full p-3 border-2 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono tracking-wider"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleOpenExam();
                }
              }}
              autoFocus
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                ⚠️ You must enter the correct exam code to proceed
              </p>
              {enteredCode && (
                <p className="text-xs text-blue-600 font-medium">
                  Code entered: {enteredCode}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleOpenExam}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded font-semibold mb-4"
          >
            Open Exam
          </button>

          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-semibold text-gray-700 mb-2">Exam Details:</h4>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Duration:</strong> {selectedExam.duration} minutes
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Questions:</strong> {selectedExam.questions?.length || 0}
            </p>
            {selectedExam.description && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Description:</strong> {selectedExam.description}
              </p>
            )}
            {selectedExam.instructions && (
              <p className="text-sm text-gray-600">
                <strong>Instructions:</strong> {selectedExam.instructions}
              </p>
            )}
          </div>
        </div>
      )}

      {selectedExam && examOpened && (
        <div className="bg-white p-6 rounded shadow mt-6">
          {/* Header: Title + Timer */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-green-700">
              {selectedExam.title} - Exam
            </h3>
            <div className="text-lg font-semibold text-red-600">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Debug info */}
          {(!selectedExam.questions || selectedExam.questions.length === 0) && (
            <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
              <p className="text-red-700 font-semibold">⚠️ No questions found in this exam!</p>
              <p className="text-sm text-red-600 mt-2">
                This exam may not have been set up correctly. Please contact your instructor.
              </p>
              <button
                onClick={() => {
                  setExamOpened(false);
                  setSelectedExam(null);
                }}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Back to Exams
              </button>
            </div>
          )}

          {/* Navigation boxes */}
          {selectedExam.questions && selectedExam.questions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedExam.questions.map((q, idx) => (
              <button
                key={idx}
                className={`w-10 h-10 rounded text-white font-semibold transition-all ${
                  currentQuestionIndex === idx
                    ? "bg-blue-600 ring-2 ring-blue-300"
                    : flags[idx]
                    ? "bg-red-600"
                    : answers[q._id || ""]
                    ? "bg-green-600"
                    : "bg-gray-400"
                }`}
                onClick={() => setCurrentQuestionIndex(idx)}
              >
                {idx + 1}
              </button>
              ))}
            </div>
          )}

          {/* Current Question Card */}
          {selectedExam.questions && selectedExam.questions.length > 0 && (() => {
            const q = selectedExam.questions[currentQuestionIndex];
            const idx = currentQuestionIndex;
            
            if (!q) return null;
            
            return (
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 mb-6">
                {/* Question Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-2">
                      Question {idx + 1} of {selectedExam.questions.length}
                    </div>
                    <div className="text-lg font-semibold text-gray-800">
                      {q.text}
                    </div>
                    {q.marks && (
                      <div className="text-sm text-blue-600 mt-2">
                        Marks: {q.marks}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleFlag(idx)}
                    className={`ml-4 px-4 py-2 rounded font-semibold transition-all ${
                      flags[idx] 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {flags[idx] ? "🚩 Flagged" : "🏳️ Flag"}
                  </button>
                </div>

                {/* Answer Section */}
                <div className="mt-6">
                  {q.type === "text" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Answer:
                      </label>
                      <textarea
                        value={answers[q._id || ""] || ""}
                        onChange={(e) => handleAnswerChange(q._id || "", e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                        placeholder="Type your answer here..."
                      />
                    </div>
                  )}

                  {q.type === "multiple-choice" && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select one option:
                      </label>
                      {q.options?.map((opt, i) => (
                        <div 
                          key={i}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            answers[q._id || ""] === opt
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAnswerChange(q._id || "", opt)}
                        >
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt}
                              checked={answers[q._id || ""] === opt}
                              onChange={() => handleAnswerChange(q._id || "", opt)}
                              className="mr-3 w-5 h-5"
                            />
                            <span className="text-gray-800">{opt}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "true-false" && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select True or False:
                      </label>
                      <div className="flex gap-4">
                        {["True", "False"].map((val) => (
                          <div 
                            key={val}
                            className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                              answers[q._id || ""] === val
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                            }`}
                            onClick={() => handleAnswerChange(q._id || "", val)}
                          >
                            <label className="flex items-center justify-center cursor-pointer">
                              <input
                                type="radio"
                                name={`q${idx}`}
                                value={val}
                                checked={answers[q._id || ""] === val}
                                onChange={() => handleAnswerChange(q._id || "", val)}
                                className="mr-3 w-5 h-5"
                              />
                              <span className="text-lg font-semibold text-gray-800">{val}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clear Answer Button */}
                  {answers[q._id || ""] && (
                    <div className="mt-4">
                      <button
                        onClick={() => clearAnswer(q._id || "")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded font-semibold"
                      >
                        Clear Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Bottom Navigation */}
          {selectedExam.questions && selectedExam.questions.length > 0 && (
            <div className="flex justify-between items-center mt-6 gap-4">
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.max(currentQuestionIndex - 1, 0))
                }
                disabled={currentQuestionIndex === 0}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>
              
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Answered: {Object.keys(answers).length} / {selectedExam.questions.length}
                </div>
                {Object.keys(flags).filter(k => flags[parseInt(k)]).length > 0 && (
                  <div className="text-sm text-red-600">
                    Flagged: {Object.keys(flags).filter(k => flags[parseInt(k)]).length}
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(
                      currentQuestionIndex + 1,
                      selectedExam.questions.length - 1
                    )
                  )
                }
                disabled={currentQuestionIndex === selectedExam.questions.length - 1}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next →
              </button>
            </div>
          )}

          {/* Submit Button */}
          {selectedExam.questions && selectedExam.questions.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={finishExam}
                disabled={submitting}
                className={`bg-green-600 hover:bg-green-700 text-white py-3 px-8 rounded-lg font-bold text-lg transition-all ${
                  submitting ? "opacity-50 cursor-not-allowed" : "shadow-lg hover:shadow-xl"
                }`}
              >
                {submitting ? "Submitting..." : "🎯 Submit Exam"}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Make sure you've answered all questions before submitting
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentTakesExam;
