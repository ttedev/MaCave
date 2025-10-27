import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import CavesPage from './pages/CavesPage';
import CaveDetailPage from './pages/CaveDetailPage';
import './App.css';
import { caveService } from './services/api';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [firstCaveId, setFirstCaveId] = useState<number | null>(null);
  const [cavesLoading, setCavesLoading] = useState(false);
  const [cavesFetched, setCavesFetched] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Charger les caves seulement après authentification
  useEffect(() => {
    if (isAuthenticated && !cavesFetched) {
      setCavesLoading(true);
      setFetchError(null);
      caveService.getCaves()
        .then(caves => {
          const list = Array.isArray(caves) ? caves : [];
          const id = list.find(c => c.id != null)?.id ?? null;
          setFirstCaveId(id);
          setCavesFetched(true);
        })
        .catch(err => {
          setFetchError(err instanceof Error ? err.message : 'Erreur chargement des caves');
          setCavesFetched(true); // même en cas d'erreur pour éviter boucle
        })
        .finally(() => setCavesLoading(false));
    }
  }, [isAuthenticated, cavesFetched]);

  // Pendant chargement auth ou caves
  if (isLoading || (isAuthenticated && (cavesLoading || !cavesFetched))) {
    return <div className="loading">Chargement...</div>;
  }

  // Pas authentifié -> page publique (login)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Si erreur lors du fetch, fallback vers liste des caves
  if (fetchError) {
    return <Navigate to="/caves" replace />;
  }

  // Authentifié et fetch terminé -> redirection vers première cave ou liste
  return firstCaveId != null
    ? <Navigate to={`/caves/${firstCaveId}`} replace />
    : <Navigate to="/caves" replace />;
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