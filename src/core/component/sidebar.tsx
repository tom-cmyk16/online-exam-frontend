import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import RoleStand from "./Role";
import { Menu, ChevronLeft } from "lucide-react";

const Sidebar: React.FC = () => {
  const role = RoleStand((state) => state.role);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setCollapsed((prev) => !prev);

  const menuItems: Record<string, { path: string; label: string }[]> = {
    admin: [
      { path: "/main/admin/dashboard", label: "Admain-Dashboard" },
      { path: "/main/admin/manage-users", label: "Manage-Users" },
      { path: "/main/admin/manage-departments", label: "M-Departments" },
      { path: "/main/admin/assign-course", label: "Courses-instructor" },
      { path: "/main/admin/view-results", label: "Student-Results" },
    ],
    instructor: [
      { path: "/main/instructor/dashboard", label: "Dashboard" },
      { path: "/main/instructor/assigned-pages", label: "Assigned Courses" },
      { path: "/main/instructor/exam-creation", label: "Exam Management" },
      { path: "/main/instructor/schedule-exam", label: "Schedule Exam" },
      { path: "/main/instructor/grade-exam", label: "Student Results" },
    ],
    student: [
      { path: "/main/student/dashboard", label: "Dashboard" },
      { path: "/main/student/take-exam", label: "Take-Exam" },
      { path: "/main/student/exam-result/:examId", label: "View Results" },
    ],
    guest: [{ path: "/login", label: "Login" }],
  };

  return (
    <aside
      className={`h-screen bg-green-50 border-r border-green-300 p-2 shadow-md overflow-y-auto transition-all duration-300 ${
        collapsed ? "w-10" : "w-52"
      }`}
    >
      <button
        className="text-green-700 hover:text-green-900 hover:bg-green-100 rounded p-2 mb-4 transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        onClick={toggleSidebar}
      >
        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
      </button>

      <ul className="space-y-2">
        {menuItems[role]?.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-2 text-base font-medium rounded px-3 py-2 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                location.pathname
                  .toLowerCase()
                  .startsWith(item.path.toLowerCase())
                  ? "bg-green-600 text-white"
                  : "text-green-800 hover:bg-green-600 hover:text-white"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full ${
                  location.pathname
                    .toLowerCase()
                    .startsWith(item.path.toLowerCase())
                    ? "bg-white border border-green-600"
                    : "bg-green-300"
                }`}
              />
              {!collapsed && item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
