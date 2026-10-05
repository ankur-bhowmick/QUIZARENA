import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import QuizEditor from './pages/QuizEditor';
import StudentJoin from './pages/StudentJoin';
import StudentGame from './pages/StudentGame';
import HostGame from './pages/HostGame';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0F19]">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/join" element={<StudentJoin />} />
          <Route path="/student/game/:gameId" element={<StudentGame />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/quiz/create"
            element={
              <ProtectedAdminRoute>
                <QuizEditor />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/quiz/edit/:id"
            element={
              <ProtectedAdminRoute>
                <QuizEditor />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/host/game/:gameId"
            element={
              <ProtectedAdminRoute>
                <HostGame />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
