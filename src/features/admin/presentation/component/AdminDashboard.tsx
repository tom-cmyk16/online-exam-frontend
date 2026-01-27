import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // npm install framer-motion
import { 
  Users, UserCheck, GraduationCap, Briefcase, 
  RefreshCw, Search, ArrowRight, Database 
} from "lucide-react"; // npm install lucide-react
import StatCard from "../../../../core/component/card";

interface User {
  _id: string; fullName: string; username: string; department: string;
  year?: string; section?: string; role: string; isActive: boolean;
  email?: string; programType?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'instructors' | 'students'>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async (manual = false) => {
    try {
      if (manual) setIsRefreshing(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE}/manageuser`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setUsers(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const interval = setInterval(() => fetchUsers(), 30000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  // Calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const instructors = users.filter(u => u.role === "instructor").length;
  const students = users.filter(u => u.role === "student").length;

  const filteredUsers = users.filter(user => {
    const matchesFilter = 
      selectedFilter === 'all' ? true :
      selectedFilter === 'active' ? user.isActive :
      selectedFilter === 'instructors' ? user.role === 'instructor' :
      user.role === 'student';
    
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = [
    { title: "Total Users", value: totalUsers, type: 'all' as const, color: "blue", icon: <Users className="w-5 h-5"/> },
    { title: "Active Users", value: activeUsers, type: 'active' as const, color: "green", icon: <UserCheck className="w-5 h-5"/> },
    { title: "Instructors", value: instructors, type: 'instructors' as const, color: "purple", icon: <Briefcase className="w-5 h-5"/> },
    { title: "Students", value: students, type: 'students' as const, color: "orange", icon: <GraduationCap className="w-5 h-5"/> },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
      />
      <p className="text-gray-500 font-medium animate-pulse">Syncing with database...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/30 min-h-screen">
      
      {/* Real-time Status Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">System Monitoring</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></span>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-semibold">Refresh Now</span>
        </button>
      </div>

      {/* Interactive Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.type}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFilter(stat.type)}
            className={`relative p-5 rounded-2xl cursor-pointer transition-all border-2 
              ${selectedFilter === stat.type 
                ? 'bg-white border-blue-500 shadow-xl ring-4 ring-blue-50' 
                : 'bg-white border-transparent shadow-md hover:border-gray-200'}`}
          >
            <div className={`inline-flex p-2 rounded-lg mb-3 bg-${stat.color}-50 text-${stat.color}-600`}>
              {stat.icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
            {selectedFilter === stat.type && (
              <motion.div layoutId="active-pill" className="absolute top-4 right-4 text-blue-500">
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-white space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              User Records
              <span className="text-sm font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {filteredUsers.length} total
              </span>
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search by name or username..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Identification</th>
                <th className="px-6 py-4">Role & Department</th>
                <th className="px-6 py-4">Account Status</th>
                {selectedFilter === 'students' && <th className="px-6 py-4">Academic</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.slice(0, 10).map((user) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={user._id} 
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-all">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{user.fullName}</p>
                          <p className="text-xs text-gray-400 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-700 capitalize">{user.role}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase
                        ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {selectedFilter === 'students' && (
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-600">Year {user.year || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400">Sec: {user.section || 'N/A'}</p>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="text-center py-20"
          >
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-gray-500 font-medium italic">No users matching your criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;