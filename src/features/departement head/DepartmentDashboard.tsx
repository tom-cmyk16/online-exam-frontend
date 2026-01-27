import React, { useState, useEffect, useCallback } from "react";
import StatCard from "../../core/component/card";
import api from "../../api/xiosInstance";

// ... [Interfaces remain the same] ...
interface User { _id: string; fullName: string; username: string; department: string; role: string; isActive: boolean; }
interface Course { _id: string; name: string; code: string; department: string; instructor?: User; }

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const DepartmentDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // For visual feedback
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'users' | 'courses'>('users');

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

      const response = await fetch(`${API_BASE}/manageuser`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const allUsers = await response.json();
      
      const departmentUsers = allUsers.filter((u: User) => u.department === userDepartment);
      setUsers(departmentUsers);

      try {
        const coursesRes = await api.get("/courses", getAuthHeaders());
        setCourses(coursesRes.data.filter((c: Course) => c.department === userDepartment));
      } catch (courseErr) {
        // Fallback to mock data logic as in original
        const mockCourses = [
          { _id: "1", name: "Introduction to Programming", code: "CS101", department: userDepartment },
          { _id: "2", name: "Data Structures", code: "CS201", department: userDepartment },
        ];
        setCourses(mockCourses);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch department data");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600); // Small delay for the animation
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculations
  const totalStudents = users.filter(u => u.role === 'student').length;
  const activeStudents = users.filter(u => u.role === 'student' && u.isActive).length;
  const totalInstructors = users.filter(u => u.role === 'instructor').length;
  const totalCourses = courses.length;

  const stats = [
    { title: "Students", value: totalStudents, badge: "Enrolled", sub: `${activeStudents} active`, color: "green" },
    { title: "Instructors", value: totalInstructors, badge: "Staff", sub: "Faculty Members", color: "blue" },
    { title: "Department Courses", value: totalCourses, badge: "Curriculum", sub: "Active Modules", color: "purple" },
    { title: "Dept Status", value: "Active", badge: "Live", sub: currentUser?.department || "Updating...", color: "orange" },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 animate-pulse font-medium">Loading Department Database...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Interactive Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${isRefreshing ? 'bg-green-100 animate-pulse' : 'bg-green-50'} text-green-600`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 uppercase tracking-tight">{currentUser?.department} Department</h1>
            <p className="text-xs text-gray-400 font-medium">
              Real-time Sync: <span className="text-green-600">{lastUpdated.toLocaleTimeString()}</span>
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => fetchData(true)}
          className={`group flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all
            ${isRefreshing ? 'bg-gray-100 text-gray-400' : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-95'}`}
          disabled={isRefreshing}
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {isRefreshing ? 'Syncing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stat Cards with Hover Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="group relative bg-white rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-default"
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              badgeText={stat.badge}
            />
            <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.sub}</p>
              <div className={`w-1 h-1 rounded-full bg-${stat.color}-500 group-hover:scale-[3] transition-transform`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive List Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'users' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Staff & Students ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-4 text-sm font-bold transition-all ${activeTab === 'courses' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/30' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Course Catalog ({courses.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.slice(0, 6).map((u) => (
                <div key={u._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:border-green-100 hover:bg-green-50/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{u.fullName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{u.role} • {u.isActive ? '✅ Active' : '❌ Inactive'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c._id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center gap-4">
                    <span className="bg-white px-2 py-1 rounded text-xs font-mono font-bold border border-gray-200">{c.code}</span>
                    <p className="text-sm font-bold text-gray-700">{c.name}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-green-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;