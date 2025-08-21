// AdminDashboard.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../component/Sidebar";

const AdminDashboard: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
