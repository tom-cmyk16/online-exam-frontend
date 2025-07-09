import { Routes, Route, Navigate } from "react-router-dom";
import Profile from "../features/student/presentation/pages/profile";
import ReadQuestion from "../features/student/presentation/pages/ReadQuestion";
import SubmitAnswer from "../features/student/presentation/pages/SubmitAnswer";
import SeeResult from "../features/student/presentation/pages/SeeResult";
import ChangePassword from "../features/student/presentation/pages/ChangePassword";
import Login from "../features/authentication/presentation/pages/login-page";

// Auth & Layout

// Student Pages

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Student Dashboard Routes (Protected) */}
      <Route
        path="/student"
        element={
          <PrivateRoute>
            <StudentLayout />
          </PrivateRoute>
        }
      >
        <Route path="profile" element={<Profile />} />
        <Route path="read-question" element={<ReadQuestion />} />
        <Route path="submit-answer" element={<SubmitAnswer />} />
        <Route path="see-result" element={<SeeResult />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      {/* Fallback for undefined paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
