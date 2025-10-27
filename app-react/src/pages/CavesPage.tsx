import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caveService } from '../services/api';
import { CaveDto } from '../types';
import CaveEditForm from '../components/CaveEditForm';
import SiteHeader from '../components/SiteHeader';

const CavesPage: React.FC = () => {
  const [caves, setCaves] = useState<CaveDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Récupérer l'auth pour SiteHeader si besoin plus tard
  useAuth();

  useEffect(() => {
    loadCaves();
  }, []);

  const loadCaves = async () => {
    try {
      const data = await caveService.getCaves();
      setCaves(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSave = async (draft: CaveDto) => {
    setIsSaving(true);
    setCreateError(null);
    try {
      // Nettoyage et valeurs par défaut
      const payload: CaveDto = {
        nom: draft.nom.trim(),
        description: draft.description.trim(),
        nombreLignesParCasier: draft.nombreLignesParCasier || 1,
        capacitesParLigne: draft.capacitesParLigne && draft.capacitesParLigne.length > 0
          ? draft.capacitesParLigne
          : Array.from({ length: draft.nombreLignesParCasier || 1 }, () => 6),
      };
      const created = await caveService.createCave(payload);
      setCaves(prev => [...prev, created]);
      setShowCreate(false);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Erreur création cave');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCancel = () => {
    setShowCreate(false);
    setCreateError(null);
  };

  if (isLoading) {
    return <div className="loading">Chargement des caves...</div>;
  }

  return (
    <div className="caves-page">
      <SiteHeader />

      <main className="main-content">
        <div className="caves-header">
          <h2>Mes Caves</h2>
          <button
            className="btn-primary"
            onClick={() => setShowCreate(true)}
            disabled={isSaving}
          >
            {isSaving ? 'Création...' : 'Ajouter une cave'}
          </button>
        </div>

        {showCreate && (
          <div className="create-cave-panel">
            <div className="panel-content">
              <h3>Nouvelle cave</h3>
              {createError && <div className="error-message">{createError}</div>}
              <CaveEditForm
                cave={{
                  nom: '',
                  description: '',
                  nombreLignesParCasier: 1,
                  capacitesParLigne: [6],
                }}
                onSave={handleCreateSave}
                onCancel={handleCreateCancel}
                isLoading={isSaving}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {caves.length === 0 && !showCreate && (
          <div className="empty-state">
            <p>Vous n'avez pas encore de cave.</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              Créer ma première cave
            </button>
          </div>
        )}
        {caves.length > 0 && (
          <div className="caves-grid">
            {caves.map((cave) => (
              <div key={cave.id} className="cave-card">
                <h3>{cave.nom}</h3>
                <p>{cave.description}</p>
                <div className="cave-stats">
                  <span>{cave.casiers?.length || 0} casiers</span>
                </div>
                <div className="cave-actions">
                  <Link 
                    to={`/caves/${cave.id}`}
                    className="btn-secondary"
                  >
                    Voir la cave
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CavesPage;