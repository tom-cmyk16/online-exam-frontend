import React, { useEffect, useState } from "react";
import axios from "axios";

// --- Interfaces ---
interface Student {
  _id: string;
  fullName: string;
  username: string;
  department: string;
  year?: string;
  section?: string;
}

interface StudentApproval {
  studentId: Student | string; // Can be populated Student object or just ObjectId string
  isApproved: boolean;
  isRejected: boolean;
}

interface Question {
  text: string;
  options?: string[];
  correctAnswer?: string;
  type?: string;
  points?: number;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  department: string;
  year?: string;
  section?: string;
  startTime?: string;
  endTime?: string;
  activeTime?: number;
  weight?: number;
  questions: Question[];
  isApproved: boolean;
  isRejected: boolean;
  assignedDepartments?: string[];
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
  const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false);
  const [currentDepartment, setCurrentDepartment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  
  // New state for department change functionality
  const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);
  const [selectedNewDepartment, setSelectedNewDepartment] = useState<string>("");
  const [departmentChangeReason, setDepartmentChangeReason] = useState<string>("");
  const [departmentChangeLoading, setDepartmentChangeLoading] = useState<boolean>(false);
  // New state for department assignment functionality
  const [showAssignDepartmentModal, setShowAssignDepartmentModal] = useState<boolean>(false);
  const [selectedDepartmentsForAssignment, setSelectedDepartmentsForAssignment] = useState<string[]>([]);
  const [assignmentYear, setAssignmentYear] = useState<string>("");
  const [assignmentSection, setAssignmentSection] = useState<string>("");
  const [assignmentLoading, setAssignmentLoading] = useState<boolean>(false);
  
  // New state for create exam functionality
  const [showCreateExamModal, setShowCreateExamModal] = useState<boolean>(false);
  const [newExamData, setNewExamData] = useState({
    university: "Debre Tabor University",
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
  const [createExamLoading, setCreateExamLoading] = useState<boolean>(false);

  useEffect(() => {
    // Get current user's department
    const department = localStorage.getItem("department") || "";
    setCurrentDepartment(department);

    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        console.log("🔍 Fetching exams for department:", department);

        // Fetch both pending and approved exams from committee member's department
        const [pendingRes, approvedRes, departmentsRes] = await Promise.all([
          axios.get<Exam[]>(`${API_BASE}/exams/committee`, config),
          axios.get<Exam[]>(`${API_BASE}/exams/committee/approved`, config),
          axios.get<{departments: string[]}>(`${API_BASE}/exams/departments`, config),
        ]);

        console.log("📋 Raw pending exams:", pendingRes.data);
        console.log("✅ Raw approved exams:", approvedRes.data);
        console.log("🏢 Available departments:", departmentsRes.data.departments);
        
        // Set available departments
        setAvailableDepartments(departmentsRes.data.departments);
        
        // Debug: Check student approvals structure
        if (approvedRes.data && approvedRes.data.length > 0) {
          console.log("🔍 First approved exam student approvals:", approvedRes.data[0]?.studentApprovals);
        }

        // Filter exams by committee member's department
        const filteredPendingExams = pendingRes.data.filter((exam: Exam) => exam.department === department);
        const filteredApprovedExams = approvedRes.data.filter((exam: Exam) => exam.department === department);
        
        console.log("📋 Pending exams for department:", filteredPendingExams.length);
        console.log("✅ Approved exams for department:", filteredApprovedExams.length);

        setPendingExams(filteredPendingExams);
        setApprovedExams(filteredApprovedExams);

      } catch (err: any) {
        console.error("❌ Error fetching exams:", err);
        setError(err.response?.data?.message || "Failed to fetch exams");
      } finally {
        setLoading(false);
      }
    };

    if (department) {
      fetchData();
    } else {
      setError("No department found. Please ensure you're logged in properly.");
      setLoading(false);
    }
  }, []);

  const handleApproveExam = async (id: string) => {
    try {
      console.log("🔄 Approving exam with ID:", id);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = await axios.put(`${API_BASE}/exams/committee/${id}/approve`, {}, config);
      console.log("✅ Exam approved successfully:", res.data);
      
      // Remove from pending list
      const updatedPendingExams = pendingExams.filter((e) => e._id !== id);
      setPendingExams(updatedPendingExams);
      
      // Add to approved list
      const approvedExam = res.data.exam;
      const updatedApprovedExams = [...approvedExams, approvedExam];
      setApprovedExams(updatedApprovedExams);
      
      console.log("📊 Updated pending exams:", updatedPendingExams.length);
      console.log("📊 Updated approved exams:", updatedApprovedExams.length);
      console.log("✅ New approved exam:", approvedExam);
      
      setShowQuestionsModal(false);
      
      // Automatically switch to approved tab to show the result
      setActiveTab("approved");
      
      // Show success message
      setSuccessMessage(`Exam "${approvedExam.title}" has been approved successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000); // Clear after 5 seconds
      
    } catch (err: any) { 
      console.error("❌ Error approving exam:", err);
      alert(`Error approving exam: ${err.response?.data?.message || err.message}`); 
    }
  };

  const handleRejectExam = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API_BASE}/exams/committee/${id}/reject`, {}, config);
      setPendingExams(pendingExams.map((e) => (e._id === id ? res.data.exam : e)));
      setShowQuestionsModal(false);
    } catch (err) { 
      console.error("Error rejecting exam:", err);
      alert("Error rejecting exam"); 
    }
  };

  const refreshApprovedExams = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log("🔄 Refreshing approved exams...");
      const approvedRes = await axios.get<Exam[]>(`${API_BASE}/exams/committee/approved`, config);
      
      console.log("✅ Refreshed approved exams:", approvedRes.data);
      
      const filteredApproved = approvedRes.data.filter(
        (exam) => exam.department === currentDepartment
      );
      
      setApprovedExams(filteredApproved);
      console.log("📊 Updated approved exams count:", filteredApproved.length);
      
    } catch (err) {
      console.error("❌ Error refreshing approved exams:", err);
    }
  };

  const handleStudentAction = async (examId: string, studentId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`${API_BASE}/exams/committee/${examId}/students/${studentId}/${action}`, {}, config);
      setApprovedExams(approvedExams.map((e) => (e._id === examId ? res.data.exam : e)));
      setSuccessMessage(`Student ${action}d successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) { 
      console.error(`Error ${action}ing student:`, err);
    }
  };

  // Bulk approve all pending students for an exam
  const handleBulkApprove = async (examId: string) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      console.log("🔄 Bulk approving students for exam:", examId);
      const res = await axios.put(`${API_BASE}/exams/committee/${examId}/students/bulk-approve`, {}, config);
      
      console.log("✅ Bulk approval response:", res.data);
      
      // Update the exam in the approved list
      setApprovedExams(approvedExams.map((e) => (e._id === examId ? res.data.exam : e)));
      
      setSuccessMessage(`${res.data.approvedCount} students approved successfully!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: any) { 
      console.error("Error bulk approving students:", err);
      alert(`Error bulk approving students: ${err.response?.data?.message || err.message}`);
    }
  };

  // New function to handle department change
  const handleChangeDepartment = async () => {
    if (!selectedExam || !selectedNewDepartment || !departmentChangeReason.trim()) {
      alert("Please select a department and provide a reason for the change.");
      return;
    }

    if (selectedNewDepartment === selectedExam.department) {
      alert("The selected department is the same as the current department.");
      return;
    }

    const confirmChange = window.confirm(
      `Are you sure you want to change the department of "${selectedExam.title}" from "${selectedExam.department}" to "${selectedNewDepartment}"?\n\nReason: ${departmentChangeReason}\n\nThis action will be logged for audit purposes.`
    );

    if (!confirmChange) return;

    setDepartmentChangeLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.put(
        `${API_BASE}/exams/committee/${selectedExam._id}/change-department`,
        {
          newDepartment: selectedNewDepartment,
          reason: departmentChangeReason
        },
        config
      );

      console.log("✅ Department changed successfully:", response.data);

      // Update the exam in both lists
      const updatedExam = response.data.exam;
      setPendingExams(pendingExams.map((e) => (e._id === selectedExam._id ? updatedExam : e)));
      setApprovedExams(approvedExams.map((e) => (e._id === selectedExam._id ? updatedExam : e)));

      // Show success message
      setSuccessMessage(
        `Exam "${selectedExam.title}" department changed from "${response.data.change.from}" to "${response.data.change.to}" successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 7000);

      // Close modal and reset form
      setShowDepartmentModal(false);
      setSelectedNewDepartment("");
      setDepartmentChangeReason("");
      setSelectedExam(null);

    } catch (err: any) {
      console.error("❌ Error changing department:", err);
      alert(`Error changing department: ${err.response?.data?.message || err.message}`);
    } finally {
      setDepartmentChangeLoading(false);
    }
  };

  // Function to open department change modal
  const openDepartmentChangeModal = (exam: Exam) => {
    setSelectedExam(exam);
    setSelectedNewDepartment("");
    setDepartmentChangeReason("");
    setShowDepartmentModal(true);
  };

  // Function to open department assignment modal
  const openDepartmentAssignmentModal = (exam: Exam) => {
    setSelectedExam(exam);
    setSelectedDepartmentsForAssignment(exam.assignedDepartments || []);
    setAssignmentYear(exam.year || "");
    setAssignmentSection(exam.section || "");
    setShowAssignDepartmentModal(true);
  };

  // Function to handle create exam
  const handleCreateExam = async () => {
    if (!newExamData.title.trim()) {
      alert("Please enter an exam title.");
      return;
    }

    if (!newExamData.year.trim() || !newExamData.section.trim()) {
      alert("Please specify year and section for the exam.");
      return;
    }

    const confirmCreate = window.confirm(
      `Create new exam "${newExamData.title}"?\n\n` +
      `University: ${newExamData.university}\n` +
      `Year: ${newExamData.year}\n` +
      `Section: ${newExamData.section}\n\n` +
      `You can add questions and assign departments after creation.`
    );

    if (!confirmCreate) return;

    setCreateExamLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const examData = {
        ...newExamData,
        duration: newExamData.duration ? parseInt(newExamData.duration) : undefined,
        weight: newExamData.weight ? parseInt(newExamData.weight) : undefined,
        activeTime: newExamData.activeTime ? parseInt(newExamData.activeTime) : undefined,
      };
      
      const response = await axios.post(`${API_BASE}/exams`, examData, config);

      console.log("✅ Exam created successfully:", response.data);

      // Add to pending exams list
      setPendingExams([response.data, ...pendingExams]);

      // Show success message
      setSuccessMessage(
        `Exam "${newExamData.title}" created successfully! Exam Code: ${response.data.examCode}`
      );
      setTimeout(() => setSuccessMessage(""), 7000);

      // Close modal and reset form
      setShowCreateExamModal(false);
      setNewExamData({
        university: "Debre Tabor University",
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

    } catch (err: any) {
      console.error("❌ Error creating exam:", err);
      alert(`Error creating exam: ${err.response?.data?.message || err.message}`);
    } finally {
      setCreateExamLoading(false);
    }
  };

  // Function to handle department assignment
  const handleAssignDepartments = async () => {
    if (!selectedExam || selectedDepartmentsForAssignment.length === 0) {
      alert("Please select at least one department.");
      return;
    }

    if (!assignmentYear.trim() || !assignmentSection.trim()) {
      alert("Please specify year and section for the assignment.");
      return;
    }

    const confirmAssign = window.confirm(
      `Assign "${selectedExam.title}" to the following departments?\n\n` +
      `Departments: ${selectedDepartmentsForAssignment.join(", ")}\n` +
      `Year: ${assignmentYear}\n` +
      `Section: ${assignmentSection}\n\n` +
      `This will make the exam available for approval and student assignment.`
    );

    if (!confirmAssign) return;

    setAssignmentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.put(
        `${API_BASE}/exams/${selectedExam._id}/assign-departments`,
        {
          assignedDepartments: selectedDepartmentsForAssignment,
          year: assignmentYear,
          section: assignmentSection
        },
        config
      );

      console.log("✅ Departments assigned successfully:", response.data);

      // Update the exam in both lists
      const updatedExam = response.data;
      setPendingExams(pendingExams.map((e) => (e._id === selectedExam._id ? updatedExam : e)));
      setApprovedExams(approvedExams.map((e) => (e._id === selectedExam._id ? updatedExam : e)));

      // Show success message
      setSuccessMessage(
        `Exam "${selectedExam.title}" assigned to departments: ${selectedDepartmentsForAssignment.join(", ")} successfully!`
      );
      setTimeout(() => setSuccessMessage(""), 7000);

      // Close modal and reset form
      setShowAssignDepartmentModal(false);
      setSelectedDepartmentsForAssignment([]);
      setAssignmentYear("");
      setAssignmentSection("");
      setSelectedExam(null);

    } catch (err: any) {
      console.error("❌ Error assigning departments:", err);
      alert(`Error assigning departments: ${err.response?.data?.message || err.message}`);
    } finally {
      setAssignmentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            Loading exam committee data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 font-semibold mb-2">Error Loading Exams</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      {/* Tabs and Create Button */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex border-b bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-8 py-2.5 rounded-md transition-all duration-200 ${
              activeTab === "pending" 
              ? "bg-white shadow-md text-blue-600 font-bold" 
              : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Pending Review ({pendingExams.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`px-8 py-2.5 rounded-md transition-all duration-200 ${
              activeTab === "approved" 
              ? "bg-white shadow-md text-blue-600 font-bold" 
              : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Approved Exams ({approvedExams.length})
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-600 mr-2">✅</div>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Department Info with Enhanced Stats */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <p className="text-blue-800 font-semibold">
              📍 Department: {currentDepartment || "Not assigned"}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Review and approve exams from your department
            </p>

            {/* Progress Overview */}
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-700">{pendingExams.length}</div>
                <div className="text-xs text-blue-600">Pending Review</div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${pendingExams.length > 0 ? Math.min(100, (pendingExams.length / (pendingExams.length + approvedExams.length)) * 100) : 0}%`}}></div>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-700">{approvedExams.length}</div>
                <div className="text-xs text-green-600">Approved</div>
                <div className="w-full bg-green-200 rounded-full h-1.5 mt-1">
                  <div className="bg-green-600 h-1.5 rounded-full" style={{width: `${approvedExams.length > 0 ? Math.min(100, (approvedExams.length / (pendingExams.length + approvedExams.length)) * 100) : 0}%`}}></div>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-700">
                  {approvedExams.reduce((total, exam) => total + (exam.studentApprovals?.length || 0), 0)}
                </div>
                <div className="text-xs text-purple-600">Total Students</div>
                <div className="w-full bg-purple-200 rounded-full h-1.5 mt-1">
                  <div className="bg-purple-600 h-1.5 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right ml-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => refreshApprovedExams()}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
              >
                🔄 Refresh Approved
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg transition-colors"
              >
                🔄 Refresh All
              </button>
            </div>

            {/* Workflow Status */}
            <div className="text-xs text-blue-600 space-y-1">
              <div>📋 Review Queue: {pendingExams.length > 0 ? 'Active' : 'Empty'}</div>
              <div>✅ Approval Rate: {pendingExams.length + approvedExams.length > 0 ? Math.round((approvedExams.length / (pendingExams.length + approvedExams.length)) * 100) : 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending List */}
      {activeTab === "pending" && (
        <div className="grid gap-4">
          {pendingExams.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl text-gray-400">
              No exams currently awaiting review.
            </div>
          )}
          {pendingExams.map((exam) => (
            <div key={exam._id} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-sm text-gray-500">Instructor: {exam.createdBy.fullName}</p>
                  <p className="text-sm text-blue-600 font-medium">Department: {exam.department}</p>
                  {exam.assignedDepartments && exam.assignedDepartments.length > 0 ? (
                    <p className="text-sm text-green-600 font-medium">
                      ✅ Assigned to: {exam.assignedDepartments.join(", ")}
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-medium">
                      ⚠️ Not yet assigned to departments
                    </p>
                  )}
                  <div className="flex gap-4 mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span className="bg-gray-100 px-2 py-1 rounded">Year: {exam.year || "N/A"}</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Weight: {exam.weight}%</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Questions: {exam.questions.length}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setSelectedExam(exam); setShowQuestionsModal(true); }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm"
                  >
                    Review Exam
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approved List */}
      {activeTab === "approved" && (
        <div className="grid gap-6">
          {approvedExams.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl text-gray-400">
              No approved exams to display.
            </div>
          )}
          {approvedExams.map((exam) => (
            <div key={exam._id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <div>
                  <span className="font-bold text-gray-800">{exam.title}</span>
                  <div className="text-sm text-blue-600 mt-1">Department: {exam.department}</div>
                  {exam.assignedDepartments && exam.assignedDepartments.length > 0 ? (
                    <div className="text-sm text-green-600 mt-1">
                      ✅ Assigned to: {exam.assignedDepartments.join(", ")}
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 mt-1">
                      ⚠️ Not yet assigned to departments
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-3 py-1 rounded-full">Approved</span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Student Management</h4>
                  {exam.studentApprovals && exam.studentApprovals.some(a => !a.isApproved && !a.isRejected) && (
                    <button
                      onClick={() => handleBulkApprove(exam._id)}
                      className="px-4 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      ✅ Approve All Pending
                    </button>
                  )}
                </div>
                {(!exam.studentApprovals || exam.studentApprovals.length === 0) ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No students assigned to this exam yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Students will be automatically assigned when the exam is approved.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {exam.studentApprovals.map((approval, index) => {
                      // Handle cases where studentId might be null or not populated
                      if (!approval.studentId) {
                        console.warn("Student data not populated for approval:", approval);
                        return (
                          <div key={`missing-${index}`} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div>
                              <span className="text-gray-700 font-medium">Student data not loaded</span>
                              <div className="text-xs text-gray-500">
                                Student ID: {typeof approval.studentId === 'string' ? approval.studentId : 'Unknown'}
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-[11px] font-bold text-yellow-600">⚠ DATA MISSING</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={typeof approval.studentId === 'string' ? approval.studentId : approval.studentId._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100 transition">
                          <div>
                            <span className="text-gray-700 font-medium">
                              {typeof approval.studentId === 'string' ? 'Student ID: ' + approval.studentId : approval.studentId.fullName}
                            </span>
                            <div className="text-xs text-gray-500">
                              {typeof approval.studentId === 'string' ? (
                                'Student data not populated'
                              ) : (
                                <>
                                  {approval.studentId.username} • {approval.studentId.department}
                                  {approval.studentId.year && ` • Year ${approval.studentId.year}`}
                                  {approval.studentId.section && ` • Section ${approval.studentId.section}`}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className={`text-[11px] font-bold ${approval.isApproved ? 'text-green-600' : approval.isRejected ? 'text-red-600' : 'text-yellow-600'}`}>
                              {approval.isApproved ? "✓ APPROVED" : approval.isRejected ? "✕ REJECTED" : "● PENDING"}
                            </span>
                            {!approval.isApproved && !approval.isRejected && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleStudentAction(exam._id, typeof approval.studentId === 'string' ? approval.studentId : approval.studentId._id, 'approve')} 
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleStudentAction(exam._id, typeof approval.studentId === 'string' ? approval.studentId : approval.studentId._id, 'reject')} 
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showQuestionsModal && selectedExam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 italic">Paper Verification: {selectedExam.title}</h2>
              <button onClick={() => setShowQuestionsModal(false)} className="text-gray-400 hover:text-black text-2xl transition">&times;</button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid grid-cols-4 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200 text-center">
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Weight</p><p className="font-bold text-blue-600">{selectedExam.weight}%</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Time</p><p className="font-bold text-blue-600">{selectedExam.activeTime}m</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Questions</p><p className="font-bold text-blue-600">{selectedExam.questions.length}</p></div>
                <div><p className="text-[10px] text-gray-400 font-bold uppercase">Year</p><p className="font-bold text-blue-600">{selectedExam.year || "All"}</p></div>
              </div>

              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest border-b pb-2">Exam Questions</h3>
                <div className="space-y-6">
                  {selectedExam.questions.map((q, idx) => (
                    <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                      <p className="font-bold text-gray-800 mb-3">{idx + 1}. {q.text}</p>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`text-xs p-3 rounded-lg border ${opt === q.correctAnswer ? 'bg-green-50 border-green-200 font-bold text-green-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                              {opt} {opt === q.correctAnswer && " (Answer)"}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowQuestionsModal(false)} className="px-6 py-2 text-gray-500 font-bold hover:text-black transition">Cancel</button>
              {activeTab === "pending" && (
                <>
                  <button onClick={() => handleRejectExam(selectedExam._id)} className="px-6 py-2 bg-white text-red-600 rounded-lg font-bold border border-red-200 hover:bg-red-50 transition">Reject</button>
                  <button onClick={() => handleApproveExam(selectedExam._id)} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg transition">Confirm & Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Department Assignment Modal */}
      {showAssignDepartmentModal && selectedExam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-purple-50">
              <h2 className="text-lg font-bold text-gray-800">🏢 Assign to Departments</h2>
              <button 
                onClick={() => setShowAssignDepartmentModal(false)} 
                className="text-gray-400 hover:text-black text-2xl transition"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Exam Info */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-gray-800 mb-2">{selectedExam.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Instructor:</strong> {selectedExam.createdBy.fullName}</p>
                  <p><strong>Current Department:</strong> <span className="text-blue-600 font-medium">{selectedExam.department}</span></p>
                  <p><strong>Questions:</strong> {selectedExam.questions.length}</p>
                  <p><strong>Currently Assigned:</strong> {selectedExam.assignedDepartments?.length ? selectedExam.assignedDepartments.join(", ") : "None"}</p>
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Assign to Departments *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {availableDepartments.map((dept) => (
                    <label key={dept} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedDepartmentsForAssignment.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartmentsForAssignment([...selectedDepartmentsForAssignment, dept]);
                          } else {
                            setSelectedDepartmentsForAssignment(selectedDepartmentsForAssignment.filter(d => d !== dept));
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        disabled={assignmentLoading}
                      />
                      <span className="text-sm">{dept}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select one or more departments to assign this exam to.
                </p>
              </div>

              {/* Year and Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={assignmentYear}
                    onChange={(e) => setAssignmentYear(e.target.value)}
                    placeholder="e.g., 2024, 3rd Year"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={assignmentLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={assignmentSection}
                    onChange={(e) => setAssignmentSection(e.target.value)}
                    placeholder="e.g., A, B, C"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={assignmentLoading}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-2 mt-0.5">ℹ️</div>
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium mb-1">Assignment Information:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>This will assign the exam to the selected departments</li>
                      <li>Students from these departments will be able to see and take the exam</li>
                      <li>Year and section help filter which students can access the exam</li>
                      <li>You can modify assignments later if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowAssignDepartmentModal(false)} 
                className="px-6 py-2 text-gray-500 font-bold hover:text-black transition"
                disabled={assignmentLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignDepartments}
                disabled={assignmentLoading || selectedDepartmentsForAssignment.length === 0 || !assignmentYear.trim() || !assignmentSection.trim()}
                className="px-8 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignmentLoading ? "Assigning..." : "Assign to Departments"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Change Modal */}
      {showDepartmentModal && selectedExam && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-orange-50">
              <h2 className="text-lg font-bold text-gray-800">🏢 Change Department</h2>
              <button 
                onClick={() => setShowDepartmentModal(false)} 
                className="text-gray-400 hover:text-black text-2xl transition"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Exam Info */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-bold text-gray-800 mb-2">{selectedExam.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Current Department:</strong> <span className="text-blue-600 font-medium">{selectedExam.department}</span></p>
                  <p><strong>Instructor:</strong> {selectedExam.createdBy.fullName}</p>
                  <p><strong>Questions:</strong> {selectedExam.questions.length}</p>
                  <p><strong>Status:</strong> {selectedExam.isApproved ? "Approved" : "Pending"}</p>
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Department *
                </label>
                <select
                  value={selectedNewDepartment}
                  onChange={(e) => setSelectedNewDepartment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={departmentChangeLoading}
                >
                  <option value="">Select a department...</option>
                  {availableDepartments
                    .filter(dept => dept !== selectedExam.department)
                    .map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Reason for Change *
                </label>
                <textarea
                  value={departmentChangeReason}
                  onChange={(e) => setDepartmentChangeReason(e.target.value)}
                  placeholder="Please provide a detailed reason for changing the department..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24 resize-none"
                  disabled={departmentChangeLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be logged for audit purposes.
                </p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-yellow-600 mr-2 mt-0.5">⚠️</div>
                  <div className="text-yellow-800 text-sm">
                    <p className="font-medium mb-1">Important Notice:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>This action will change the exam's department assignment</li>
                      <li>The change will be logged for audit purposes</li>
                      <li>Students from the new department may need to be reassigned</li>
                      <li>This action cannot be undone automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowDepartmentModal(false)} 
                className="px-6 py-2 text-gray-500 font-bold hover:text-black transition"
                disabled={departmentChangeLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleChangeDepartment}
                disabled={departmentChangeLoading || !selectedNewDepartment || !departmentChangeReason.trim()}
                className="px-8 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {departmentChangeLoading ? "Changing..." : "Change Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-green-50">
              <h2 className="text-lg font-bold text-gray-800">➕ Create New Exam</h2>
              <button 
                onClick={() => setShowCreateExamModal(false)} 
                className="text-gray-400 hover:text-black text-2xl transition"
              >
                &times;
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* University */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  University *
                </label>
                <input
                  type="text"
                  value={newExamData.university}
                  onChange={(e) => setNewExamData({ ...newExamData, university: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={createExamLoading}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Exam Title *
                </label>
                <input
                  type="text"
                  value={newExamData.title}
                  onChange={(e) => setNewExamData({ ...newExamData, title: e.target.value })}
                  placeholder="e.g., Midterm Exam - Data Structures"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={createExamLoading}
                />
              </div>

              {/* Description and Instructions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newExamData.description}
                    onChange={(e) => setNewExamData({ ...newExamData, description: e.target.value })}
                    placeholder="Brief description of the exam"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 resize-none"
                    disabled={createExamLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={newExamData.instructions}
                    onChange={(e) => setNewExamData({ ...newExamData, instructions: e.target.value })}
                    placeholder="Instructions for students"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-24 resize-none"
                    disabled={createExamLoading}
                  />
                </div>
              </div>

              {/* Year and Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Year *
                  </label>
                  <input
                    type="text"
                    value={newExamData.year}
                    onChange={(e) => setNewExamData({ ...newExamData, year: e.target.value })}
                    placeholder="e.g., 2024, 3rd Year"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Section *
                  </label>
                  <input
                    type="text"
                    value={newExamData.section}
                    onChange={(e) => setNewExamData({ ...newExamData, section: e.target.value })}
                    placeholder="e.g., A, B, C"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
              </div>

              {/* Duration, Weight, Active Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={newExamData.duration}
                    onChange={(e) => setNewExamData({ ...newExamData, duration: e.target.value })}
                    placeholder="60"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Weight (%)
                  </label>
                  <input
                    type="number"
                    value={newExamData.weight}
                    onChange={(e) => setNewExamData({ ...newExamData, weight: e.target.value })}
                    placeholder="30"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Active Time (min)
                  </label>
                  <input
                    type="number"
                    value={newExamData.activeTime}
                    onChange={(e) => setNewExamData({ ...newExamData, activeTime: e.target.value })}
                    placeholder="120"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
              </div>

              {/* Start and End Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newExamData.startTime}
                    onChange={(e) => setNewExamData({ ...newExamData, startTime: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newExamData.endTime}
                    onChange={(e) => setNewExamData({ ...newExamData, endTime: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={createExamLoading}
                  />
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-2 mt-0.5">ℹ️</div>
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium mb-1">After Creating:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>You can add questions to the exam</li>
                      <li>Assign the exam to departments</li>
                      <li>Review and approve the exam</li>
                      <li>Manage student approvals</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowCreateExamModal(false)} 
                className="px-6 py-2 text-gray-500 font-bold hover:text-black transition"
                disabled={createExamLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateExam}
                disabled={createExamLoading || !newExamData.title.trim() || !newExamData.year.trim() || !newExamData.section.trim()}
                className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createExamLoading ? "Creating..." : "Create Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamCommitteeView;