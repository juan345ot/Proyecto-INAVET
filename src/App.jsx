import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import StudentHome from './pages/StudentHome';
import StudentLesson from './pages/StudentLesson';
import StudentExam from './pages/StudentExam';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page Pública Original */}
          <Route path="/" element={<LandingPage />} />

          {/* Autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/ingresar" element={<Navigate to="/login" replace />} />
          <Route path="/cambiar-password" element={<ChangePassword />} />

          {/* Área de Alumno Protegida */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']} />}>
            <Route path="/aula" element={<StudentHome />} />
            <Route path="/aula/clase/:id" element={<StudentLesson />} />
            <Route path="/aula/examen/:examId" element={<StudentExam />} />
          </Route>

          {/* Área Administrativa Protegida */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
