import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white flex flex-col p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-6">Student Dashboard</h2>

        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `py-2 px-4 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/student/read-question"
          className={({ isActive }) =>
            `py-2 px-4 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          Read Questions
        </NavLink>
        <NavLink
          to="/student/submit-answer"
          className={({ isActive }) =>
            `py-2 px-4 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          Submit Answer
        </NavLink>
        <NavLink
          to="/student/see-result"
          className={({ isActive }) =>
            `py-2 px-4 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          See Results
        </NavLink>
        <NavLink
          to="/student/change-password"
          className={({ isActive }) =>
            `py-2 px-4 rounded hover:bg-blue-700 ${
              isActive ? "bg-blue-700" : ""
            }`
          }
        >
          Change Password
        </NavLink>

        <button
          onClick={logout}
          className="mt-auto py-2 px-4 bg-red-500 hover:bg-red-600 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
