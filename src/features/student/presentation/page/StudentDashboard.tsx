<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../../core/component/card";
import api from "../../../../api/xiosInstance";

/* ================= TYPES (UNCHANGED) ================= */

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
  text: string;
  type: "text" | "multiple-choice";
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  department: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  questions: Question[];
  isApproved: boolean;
  isRejected?: boolean;
}

/* ================= COMPONENT ================= */

const StudentDashboard: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(userRes.data);

        const mockExams: Exam[] = [
          {
            _id: "exam-1",
            title: "Database Fundamentals",
            description: "SQL & Database Design",
            department: userRes.data.department,
            duration: 90,
            isApproved: true,
            questions: [
              { text: "What is normalization?", type: "multiple-choice" },
              { text: "Explain ACID properties", type: "text" },
            ],
            startTime: new Date(Date.now() + 86400000).toISOString(),
          },
          {
            _id: "exam-2",
            title: "Mathematics II",
            description: "Calculus & Matrices",
            department: userRes.data.department,
            duration: 120,
            isApproved: true,
            questions: [
              { text: "Solve the integral", type: "text" },
              { text: "Matrix multiplication", type: "multiple-choice" },
            ],
          },
        ];
        setExams(mockExams);
      } catch (err) {
        console.error("Student dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const approvedExams = exams.filter((e) => e.isApproved);
  const upcomingExams = approvedExams.filter(
    (e) => e.startTime && new Date(e.startTime) > new Date()
  ).length;
  const availableNow = approvedExams.filter((e) => {
    if (!e.startTime || !e.endTime) return true;
    const now = new Date();
    return now >= new Date(e.startTime) && now <= new Date(e.endTime);
  }).length;

  const stats = [
    { title: "Total Exams", value: approvedExams.length, badgeText: "Approved" },
    { title: "Available Now", value: availableNow, badgeText: "Open" },
    { title: "Upcoming Exams", value: upcomingExams, badgeText: "Scheduled" },
    { title: "Completed Exams", value: 0, badgeText: "Done" },
  ];

  /* ================= UI RENDERING ================= */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Synchronizing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header with Hover Effects */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-green-600">{currentUser?.fullName}</span>
          </h1>
          <p className="text-gray-500 mt-1">
            {currentUser?.department} • Year {currentUser?.year} • Section {currentUser?.section}
          </p>
        </div>

        <Link
          to="/main/student/take-exam"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-green-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 font-semibold"
        >
          Quick Launch Exam
        </Link>
      </div>

      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="hover:scale-105 transition-transform duration-300">
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {/* Exams Section with Card Interactions */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            My Approved Exams
            <span className="ml-3 text-sm font-normal bg-green-100 text-green-700 px-3 py-1 rounded-full">
              {approvedExams.length} Available
            </span>
          </h2>
        </div>

        {approvedExams.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 italic">No examinations have been assigned to your section yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedExams.map((exam) => (
              <div 
                key={exam._id} 
                className="group relative border border-gray-200 rounded-2xl p-6 hover:border-green-500 hover:bg-green-50/30 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-green-100 transition-colors">
                    <svg className="w-6 h-6 text-gray-600 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>

                <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-green-700 transition-colors">
                  {exam.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {exam.description || "No description provided for this examination."}
                </p>
                
                <div className="flex items-center gap-4 mb-6 text-xs font-medium text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {exam.questions.length} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {exam.duration} Min
                  </span>
                </div>

                <Link
                  to={`/main/student/take-exam/${exam._id}`}
                  className="flex items-center justify-center w-full bg-white border-2 border-green-600 text-green-600 group-hover:bg-green-600 group-hover:text-white py-2.5 rounded-xl font-bold transition-all duration-300"
                >
                  Start Examination
                </Link>
              </div>
            ))}
          </div>
        )}
=======
// src/features/student/presentation/components/StudentDashboard.tsx
import React from "react";
import StatCard from "../../../../core/component/card";
interface DashboardStats {
  scheduledExams: number;
  passPercentage: number;
  failPercentage: number;
  activeusere: number;
}

const StudentDashboard: React.FC = () => {
  // Example data - should be replaced with actual API call
  const dashboardStats: DashboardStats = {
    scheduledExams: 5,
    passPercentage: 78,
    failPercentage: 22,
    activeusere: 45,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Scheduled Exams"
          value={`${dashboardStats.scheduledExams}%`}
          badgeText="New"
          variant="info"
        />

        <StatCard
          title="Pass Percentage"
          badgeText="New "
          value={`${dashboardStats.passPercentage}%`}
          variant="success"
        />

        <StatCard
          title="Fail Percentage"
          value={`${dashboardStats.failPercentage}%`}
          variant="danger"
        />
        <StatCard
          title="Total user"
          value={`${dashboardStats.activeusere}%`}
          variant="danger"
        />
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default StudentDashboard;
=======
export default StudentDashboard;
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
