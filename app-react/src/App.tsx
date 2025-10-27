import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import CavesPage from './pages/CavesPage';
import CaveDetailPage from './pages/CaveDetailPage';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/caves" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/caves" 
          element={
            <ProtectedRoute>
              <CavesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/caves/:id" 
          element={
            <ProtectedRoute>
              <CaveDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/caves" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;