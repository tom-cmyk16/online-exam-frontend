import { useState } from "react";
import "./App.css";

import StudentDashboard from "./features/student/presentation/pages/studentpage";
// import Login from "./features/authentication/presentation/pages/login-page";

function App() {
  const [] = useState(0);

  return (
    <>
      {" "}
      <StudentDashboard />
    </>
  );
}

export default App;
