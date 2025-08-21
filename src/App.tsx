import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import DashboardLayout from "./features/dashboard/presentation/component/dashboardLayout";
import InstructorDashboard from "./features/instructor/presentation/page/InstructorDashboard";
import StudentDashboard from "./features/student/presentation/page/Studentpages";
import Dashboard from "./features/dashboard/presentation/pages/dashboard";
import Login from "./features/authentication/presentation/pages/login";
import AdminDashboard from "./features/admin/presentation/pages/AdminDashboard";
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/students" element={<StudentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
