import React from "react";
import "./App.css";
import InstructorDashboard from "./GrideLayout/Instructor Dashboard Layout";
import Login from "./features/authentication/presentation/pages/login";
const App: React.FC = () => (
  <div className="App">
    <Login />
    {/*     
    <InstructorDashboard /> */}
  </div>
);
export default App;
