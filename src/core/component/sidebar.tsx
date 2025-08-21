import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Instructor", path: "/instructor", icon: "📚" },
    { name: "Courses", path: "/courses", icon: "📚" },
    { name: "Students", path: "/students", icon: "👨‍🎓" },
    { name: "Settings", path: "/settings", icon: "⚙️" },
    { name: "admin", path: "/admin", icon: "⚙️" },
  ];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-4 h-full flex flex-col">
        <div className="text-xl font-bold mb-8 p-2">Instructor Portal</div>

        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 text-gray-700"
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-3 text-sm text-gray-500">
          © 2023 Instructor Portal
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
