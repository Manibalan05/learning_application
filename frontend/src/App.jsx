import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy Load Layouts
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const StudentLayout = lazy(() => import('./pages/student/StudentLayout'));

// Lazy Load Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AddProblem = lazy(() => import('./pages/admin/AddProblem'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const ProblemsList = lazy(() => import('./pages/admin/ProblemsList'));
const AdminSubmissions = lazy(() => import('./pages/admin/AdminSubmissions'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentProblems = lazy(() => import('./pages/student/StudentProblems'));
const ProblemSolve = lazy(() => import('./pages/student/ProblemSolve'));
const SubmissionHistory = lazy(() => import('./pages/student/SubmissionHistory'));

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

// Loading component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>
    Loading...
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                 <Route index element={<AdminDashboard />} />
                 <Route path="add-problem" element={<AddProblem />} />
                 <Route path="analytics" element={<Analytics />} />
                 <Route path="problems" element={<ProblemsList />} />
                 <Route path="submissions" element={<AdminSubmissions />} />
              </Route>
          </Route>
          
          {/* Student Routes - Protected */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentLayout />}>
                 <Route index element={<StudentDashboard />} />
                 <Route path="problems" element={<StudentProblems />} />
                 <Route path="problem/:id" element={<ProblemSolve />} />
                 <Route path="history" element={<SubmissionHistory />} />
              </Route>
          </Route>
          
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
