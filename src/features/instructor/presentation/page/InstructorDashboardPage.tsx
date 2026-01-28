import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../../../core/component/card";
import api from "../../../../api/xiosInstance";

// ... [Interfaces remain the same] ...
interface User { _id: string; fullName: string; username: string; department: string; role: string; isActive: boolean; }
interface Question { text: string; type: string; correctAnswer: string; }
interface Exam {
  _id: string; title: string; department: string; questions: Question[];
  isApproved: boolean; isRejected: boolean; startTime?: string;
  duration?: number; examCode?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const InstructorDashboard: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const userRes = await api.get("/auth/me", getAuthHeaders());
      setCurrentUser(userRes.data);
      const userDepartment = userRes.data.department;

      try {
        const examRes = await api.get("/exams", getAuthHeaders());
        const departmentExams = examRes.data.filter((exam: Exam) => exam.department === userDepartment);
        setExams(departmentExams);
      } catch (examErr) {
        // Mock data logic (same as yours)
        const mockExams: Exam[] = [
          { _id: "1", title: "Midterm Exam - Programming", department: userDepartment, questions: [], isApproved: true, isRejected: false, startTime: new Date().toISOString(), examCode: "CS101-MID" },
          { _id: "2", title: "Final Exam - Database", department: userDepartment, questions: [], isApproved: false, isRejected: false, startTime: new Date().toISOString(), examCode: "DB301-FIN" }
        ];
        setExams(mockExams);
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalExams = exams.length;
  const approvedExams = exams.filter(e => e.isApproved).length;
  const pendingExams = exams.filter(e => !e.isApproved && !e.isRejected).length;

  const filteredExams = exams.filter(e => {
    if (filter === 'approved') return e.isApproved;
    if (filter === 'pending') return !e.isApproved && !e.isRejected;
    return true;
  });

  const stats = [
    { title: "Total Exams", value: totalExams, type: 'all' as const, badge: "Created", sub: "All time records", color: "blue" },
    { title: "Approved", value: approvedExams, type: 'approved' as const, badge: "Live", sub: "Ready for students", color: "green" },
    { title: "Pending", value: pendingExams, type: 'pending' as const, badge: "Review", sub: "Awaiting approval", color: "orange" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse">Loading secure exam data...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Interactive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Instructor Dashboard</h1>
            <p className="text-xs text-gray-500 font-medium">
              Real-time Sync: <span className={isRefreshing ? "text-blue-500" : "text-green-600"}>{lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95
            ${isRefreshing ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-100'}`}
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {isRefreshing ? "Updating..." : "Refresh Data"}
        </button>
      </div>

      {/* Filterable Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            onClick={() => setFilter(stat.type)}
            className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 relative
              ${filter === stat.type ? 'ring-2 ring-green-500 rounded-2xl' : 'hover:opacity-80'}`}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              badgeText={stat.badge}
            />
            <div className="absolute bottom-2 left-4 right-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
            </div>
            {filter === stat.type && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Interactive Exam List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 capitalize">{filter} Exams</h2>
          <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-500">
            {filteredExams.length} Total
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Exam Info</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam._id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-800">{exam.title}</p>
                      <p className="text-xs text-gray-400">{exam.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {exam.examCode || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {exam.isApproved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Approved
                        </span>
                      ) : exam.isRejected ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-green-600 hover:text-green-800 text-xs font-bold uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                      <p className="text-sm">No {filter} exams found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
