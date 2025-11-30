import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import AdminPortal from "./components/AdminPortal";
import StudentDashboard from "./components/StudentDashboard";
import PlacementOfficerDashboard from "./components/PlacementOfficerDashboard";
import EmployerDashboard from "./components/EmployerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/adminportal" element={<AdminPortal />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/placement-officer-dashboard" element={<PlacementOfficerDashboard />} />
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
