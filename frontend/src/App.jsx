import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProblem from './pages/admin/AddProblem';
import Analytics from './pages/admin/Analytics';
import ProblemsList from './pages/admin/ProblemsList';

import StudentLayout from './pages/student/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProblems from './pages/student/StudentProblems';
import ProblemSolve from './pages/student/ProblemSolve';
import SubmissionHistory from './pages/student/SubmissionHistory';

import AdminSubmissions from './pages/admin/AdminSubmissions';

import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<AdminDashboard />} />
           <Route path="add-problem" element={<AddProblem />} />
           <Route path="analytics" element={<Analytics />} />
           <Route path="problems" element={<ProblemsList />} />
           <Route path="submissions" element={<AdminSubmissions />} />
        </Route>
        
        {/* Student Routes */}
        <Route path="/student" element={<StudentLayout />}>
           <Route index element={<StudentDashboard />} />
           <Route path="problems" element={<StudentProblems />} />
           <Route path="problem/:id" element={<ProblemSolve />} />
           <Route path="history" element={<SubmissionHistory />} />
        </Route>
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
