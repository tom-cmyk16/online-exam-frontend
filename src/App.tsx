import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
<<<<<<< HEAD
=======

// Core Layout & Components
import MainLayout from "./core/MainLayout";
import RoleStand from "./core/component/Role";

// Auth
import LoginPage from "./features/authentication/presentation/pages/LoginPage";

// Admin Pages
import AdminDashboard from "./features/admin/presentation/component/AdminDashboard";
import ManageUsersPage from "./features/admin/presentation/component/ManageUsersPage";
import ManageDepartmentPage from "./features/admin/presentation/component/ManageDepartmentPage";
import AssignInstructorPage from "./features/admin/presentation/component/AssignCourseToInstructor";

// Instructor Pages
import InstructorDashboardPage from "./features/instructor/presentation/page/InstructorDashboardPage";
import ExamManagement from "./features/instructor/presentation/page/ExamManagement";
import AssignedInstructorsList from "./features/instructor/presentation/component/AssignedInstructorsList";

// Student Pages
import StudentDashboard from "./features/student/presentation/page/StudentDashboard";
import StudentAssignedCourses from "./features/student/presentation/page/StudentAssignedCourses";
import StudentExamResult from "./features/student/presentation/page/StudentExamResult";
import StudentTakeExam from "./features/student/presentation/page/StudentTakeExam";
import ScheduleExamPage from "./features/instructor/presentation/component/ScheduleExamForm";

// --------------------
// Dashboard Selector
// --------------------
const DashboardSelector: React.FC = () => {
  const role = RoleStand((state) => state.role);

  if (role === "admin") return <AdminDashboard />;
  if (role === "instructor") return <InstructorDashboardPage />;
  if (role === "student") return <StudentDashboard />;
  return (
    <div className="p-6 text-red-600 font-semibold">
      ❌ Invalid Role or Not Logged In
    </div>
  );
};

// --------------------
// ProtectedRoute
// --------------------
interface ProtectedRouteProps {
  allowedRoles: ("admin" | "instructor" | "student")[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const role = RoleStand((state) => state.role);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token || !role || !allowedRoles.includes(role))
    return <Navigate to="/login" replace />;

  return <>{children}</>;
};
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42

// Core Layout & Components
import MainLayout from "./core/MainLayout";
import RoleStand from "./core/component/Role";

// Auth
import LoginPage from "./features/authentication/presentation/pages/LoginPage";

// Admin Pages
import AdminDashboard from "./features/admin/presentation/component/AdminDashboard";
import ManageUsersPage from "./features/admin/presentation/component/ManageUsersPage";
import SystemSettingsPage from "./features/admin/presentation/component/SystemSettingsPage";

// Instructor Pages
import InstructorDashboardPage from "./features/instructor/presentation/page/InstructorDashboardPage";
import ExamManagement from "./features/instructor/presentation/page/ExamManagement";
import AssignedInstructorsList from "./features/instructor/presentation/component/AssignedInstructorsList";
import ScheduleExamPage from "./features/instructor/presentation/component/ScheduleExamForm";

// Department Head Pages
import DepartmentDashboard from "./features/departement head/DepartmentDashboard";
import ManageStudentsPage from "./features/departement head/Manage Students Page";
import ManageCourses from "./features/departement head/ManageCourses";

// Exam Committee Pages
import ExamCommitteeView from "./features/examcommita/ExamCommittee";

// Student Pages
import StudentDashboard from "./features/student/presentation/page/StudentDashboard";
import StudentTakeExam from "./features/student/presentation/page/StudentTakeExam";
import StudentExamResult from "./features/student/presentation/page/StudentExamResult";
import ViewStudentResults from "./features/instructor/presentation/page/ViewStudentResults";

// --------------------
// Dashboard Selector
// --------------------
const DashboardSelector: React.FC = () => {
  const role = RoleStand((state) => state.role);

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "instructor":
      return <InstructorDashboardPage />;
    case "student":
      // Student sees Take Exam page first
      return <StudentTakeExam />;
    case "departmentHead":
      return <DepartmentDashboard />;
    case "examCommittee":
      return <ExamCommitteeView />;
    default:
      return (
        <div className="p-6 text-red-600 font-semibold">
          ❌ Invalid Role or Not Logged In
        </div>
      );
  }
};

// --------------------
// ProtectedRoute
// --------------------
interface ProtectedRouteProps {
  allowedRoles: (
    | "admin"
    | "instructor"
    | "student"
    | "departmentHead"
    | "examCommittee"
    | "guest"
  )[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const role = RoleStand((state) => state.role);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// --------------------
// App Component
// --------------------
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected layout */}
        <Route path="/main" element={<MainLayout />}>
          {/* Default dashboard */}
          <Route index element={<DashboardSelector />} />

          {/* Admin routes */}
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <SystemSettingsPage />
=======
            path="admin/manage-departments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ManageDepartmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/assign-course"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AssignInstructorPage />
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
              </ProtectedRoute>
            }
          />

          {/* Instructor routes */}
          <Route
<<<<<<< HEAD
            path="instructor/dashboard"
=======
            path="/main/instructor/dashboard"
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/exam-creation"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <ExamManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/assigned-pages"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <AssignedInstructorsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="instructor/schedule-exam"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <ScheduleExamPage />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD
          <Route
            path="instructor/student-results"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <ViewStudentResults />
              </ProtectedRoute>
            }
          />
=======
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42

          {/* Student routes */}
          <Route
            path="student/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
            path="student/take-exam/:examId"
=======
            path="student/take-exam"
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentTakeExam />
              </ProtectedRoute>
            }
          />
          <Route
<<<<<<< HEAD
=======
            path="student/assigned-courses"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentAssignedCourses />
              </ProtectedRoute>
            }
          />
          <Route
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
            path="student/exam-result/:examId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentExamResult />
              </ProtectedRoute>
            }
          />
<<<<<<< HEAD

          {/* Department Head routes */}
          <Route
            path="department-head/dashboard"
            element={
              <ProtectedRoute allowedRoles={["departmentHead"]}>
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="department-head/assign-course"
            element={
              <ProtectedRoute allowedRoles={["departmentHead"]}>
                <ManageCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="department-head/manage-students"
            element={
              <ProtectedRoute allowedRoles={["departmentHead"]}>
                <ManageStudentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="department-head/assigned-instructor"
            element={
              <ProtectedRoute allowedRoles={["departmentHead"]}>
                <AssignedInstructorsList />
              </ProtectedRoute>
            }
          />

          {/* Exam Committee routes */}
          <Route
            path="exam-committee/dashboard"
            element={
              <ProtectedRoute allowedRoles={["examCommittee"]}>
                <ExamCommitteeView />
              </ProtectedRoute>
            }
          />
=======
>>>>>>> 836dc639932a3b64a30b2723853d803464ad6c42
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;