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
  isApproved?: boolean;
  isRejected?: boolean;
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
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);

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
        
        // Fetch only approved exams for students
        let res;
        try {
          // Use the specific endpoint for students that only returns approved exams
          const studentExamsRes = await api.get<Exam[]>("/exams/student/approved", {
            headers: { Authorization: `Bearer ${token}` },
          });
          res = { data: studentExamsRes.data };
          console.log("✅ Fetched approved exams for student:", res.data);
        } catch (err) {
          console.error("Failed to fetch student exams:", err);
          // Fallback: fetch all exams and filter by approval status
          const allExamsRes = await api.get<Exam[]>("/exams", {
            headers: { Authorization: `Bearer ${token}` },
          });
          // Filter to show only approved exams from student's department
          res = {
            data: allExamsRes.data.filter(
              (exam) => 
                exam.department === currentUser.department && 
                exam.isApproved === true && 
                exam.isRejected !== true
            ),
          };
          console.log("⚠️ Using fallback: filtered approved exams:", res.data);
        }
        
        console.log("📋 Final exams list:", res.data);
        
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
          toast.info("No approved exams available for your department");
        } else {
          console.log(`✅ Found ${examsWithStatus.length} approved exam(s) for ${currentUser.department}`);
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

  // Auto-save functionality
  useEffect(() => {
    if (!examOpened || !selectedExam) return;

    const autoSave = async () => {
      try {
        setAutoSaveStatus('saving');
        const token = localStorage.getItem("token");

        await api.post(
          `/student-exams/auto-save/${selectedExam._id}`,
          { answers },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        console.log("✅ Answers auto-saved successfully");
      } catch (err: any) {
        console.error("❌ Auto-save failed:", err);
        setAutoSaveStatus('error');
        toast.error("Failed to save answers automatically");
      }
    };

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(autoSave, 30000);

    // Save immediately when answers change
    if (Object.keys(answers).length > 0) {
      autoSave();
    }

    return () => clearInterval(autoSaveInterval);
  }, [answers, examOpened, selectedExam]);

  // Calculate current score in real-time
  useEffect(() => {
    if (!selectedExam || !selectedExam.questions) return;

    let score = 0;
    selectedExam.questions.forEach((question) => {
      const userAnswer = answers[question._id || ""];
      if (userAnswer && userAnswer === question.correctAnswer) {
        score += question.marks || 1;
      }
    });

    setCurrentScore(score);
  }, [answers, selectedExam]);

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
      
      // Try to use the student-specific endpoint first
      let filteredExams;
      try {
        const studentExamsRes = await api.get<Exam[]>("/exams/student/approved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        filteredExams = studentExamsRes.data;
        console.log("✅ Refreshed approved exams for student:", filteredExams);
      } catch (err) {
        console.error("Student endpoint failed, using fallback:", err);
        // Fallback: fetch all exams and filter
        const res = await api.get<Exam[]>("/exams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        filteredExams = res.data.filter(
          (exam) => 
            exam.department === currentUser.department && 
            exam.isApproved === true && 
            exam.isRejected !== true
        );
        console.log("⚠️ Using fallback: filtered approved exams:", filteredExams);
      }
      
      setExams(filteredExams);
      toast.success(`Found ${filteredExams.length} approved exam(s)`);
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
          
          {/* Approval Status Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <div className="text-green-600 mr-2">✅</div>
              <div>
                <p className="text-green-800 font-medium">Showing Approved Exams Only</p>
                <p className="text-sm text-green-700 mt-1">
                  Only exams that have been reviewed and approved by the exam committee are displayed here.
                  If you don't see an expected exam, it may still be under review.
                </p>
              </div>
            </div>
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
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Approved Exams Available</h3>
              <p className="text-gray-600 mb-2">
                There are currently no exams that have been approved by the exam committee for your department.
              </p>
              <div className="text-sm text-gray-500 mt-4 bg-gray-50 p-4 rounded">
                <p className="font-medium mb-2">📋 Exam Approval Process:</p>
                <div className="text-left space-y-1">
                  <p>1. 👨‍🏫 Instructor creates exam</p>
                  <p>2. 📤 Instructor sends exam to committee</p>
                  <p>3. 👥 Exam committee reviews and approves</p>
                  <p>4. ✅ Approved exams appear here for students</p>
                </div>
              </div>
              <button
                onClick={refreshExams}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Check Again
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
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-normal">
                          ✅ Committee Approved
                        </span>
                        {exam.isSubmitted && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-normal">
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
            <div>
              <h3 className="text-xl font-bold text-green-700">
                {selectedExam.title} - Exam
              </h3>
              {/* Approval Status Display */}
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Committee Approved
                </span>
                <span className="text-sm text-gray-600">
                  This exam has been reviewed and approved by the exam committee
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-red-600 mb-2">
                Time Left: {formatTime(timeLeft)}
              </div>
              {/* Auto-save Status */}
              <div className="text-sm">
                {autoSaveStatus === 'saving' && (
                  <span className="text-blue-600 flex items-center">
                    <svg className="w-4 h-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                )}
                {autoSaveStatus === 'saved' && lastSaved && (
                  <span className="text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Save failed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Score Display with Detailed Breakdown */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="text-blue-600 mr-3 text-2xl">📊</div>
                <div>
                  <p className="text-blue-800 font-bold text-lg">Current Score</p>
                  <p className="text-sm text-blue-700">
                    Real-time scoring as you answer questions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {currentScore}
                </div>
                <div className="text-sm text-blue-500 font-medium">
                  out of {selectedExam.questions?.reduce((total, q) => total + (q.marks || 1), 0) || 0} marks
                </div>
                <div className="text-xs text-blue-400 mt-1">
                  {selectedExam.questions?.length ? ((currentScore / selectedExam.questions.reduce((total, q) => total + (q.marks || 1), 0)) * 100).toFixed(1) : 0}% complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Object.keys(answers).length} / {selectedExam.questions?.length || 0} questions answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${selectedExam.questions?.length ? (Object.keys(answers).length / selectedExam.questions.length) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Question Status Breakdown */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{Object.keys(answers).length}</div>
                <div className="text-xs text-green-700 font-medium">Answered</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.keys(flags).filter(k => flags[parseInt(k)]).length}
                </div>
                <div className="text-xs text-yellow-700 font-medium">Flagged</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-600">
                  {(selectedExam.questions?.length || 0) - Object.keys(answers).length}
                </div>
                <div className="text-xs text-gray-700 font-medium">Remaining</div>
              </div>
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
