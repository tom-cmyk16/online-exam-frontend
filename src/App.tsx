import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./features/authentication/presentation/pages/login";
import DashboardLayout from "./features/dashboard/presentation/component/dashboardLayout";
import Dashboard from "./features/dashboard/presentation/pages/dashboard";
import InstructorDashboard from "./features/instructor/InstructorDashboard";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          {/* Add more protected routes here */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
