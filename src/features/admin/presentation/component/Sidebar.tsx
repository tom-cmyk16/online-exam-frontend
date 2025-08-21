import React from "react";
import { NavLink } from "react-router-dom";

// Define nav items in an array for cleaner rendering
const navItems = [
  { name: "Manage Account", path: "/admin/manage-account" },
  { name: "Manage Institute", path: "/admin/manage-institute" },
  { name: "Manage Department", path: "/admin/manage-department" },
  { name: "Manage Course", path: "/admin/manage-course" },
  { name: "Manage Question", path: "/admin/manage-question" },
  { name: "Manage Users", path: "/admin/manage-users" },
];

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-blue-100 ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white h-screen shadow-md p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
