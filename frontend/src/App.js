import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import TemplateForm from './pages/TemplateForm';
import Documents from './pages/Documents';
import GenerateDocument from './pages/GenerateDocument';
import BulkGenerate from './pages/BulkGenerate';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Profile from './pages/Profile';

// Protected Route Component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Template Routes */}
              <Route path="templates" element={<Templates />} />
              <Route
                path="templates/new"
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <TemplateForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="templates/:id/edit"
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <TemplateForm />
                  </ProtectedRoute>
                }
              />

              {/* Document Routes */}
              <Route path="documents" element={<Documents />} />
              <Route path="generate" element={<GenerateDocument />} />
              <Route
                path="bulk-generate"
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <BulkGenerate />
                  </ProtectedRoute>
                }
              />

              {/* Admin/HR Routes */}
              <Route
                path="audit"
                element={
                  <ProtectedRoute roles={['admin', 'hr']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
