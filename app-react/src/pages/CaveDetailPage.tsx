import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { caveService, wineService, casierService } from '../services/api';
import { CaveDto, WineDto, CasierDto } from '../types';
import WineCard from '../components/WineCard';
import WineEditForm from '../components/WineEditForm';
import CaveEditForm from '../components/CaveEditForm';

const CaveDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cave, setCave] = useState<CaveDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWine, setSelectedWine] = useState<WineDto | null>(null);
  const [editingWine, setEditingWine] = useState<WineDto | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [creatingWine, setCreatingWine] = useState<{ligneId: number, position: number} | null>(null);
  const [editingCave, setEditingCave] = useState(false);
  // Reorder (drag & drop) mode
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [pendingPositions, setPendingPositions] = useState<Record<number, { ligneId: number; position: number }>>({});
  const longPressTimerRef = useRef<number | null>(null);
  const [dragWine, setDragWine] = useState<WineDto | null>(null);

  useEffect(() => {
    if (id) {
      loadCave(parseInt(id));
    }
  }, [id]);

  const loadCave = async (caveId: number) => {
    try {
      const caveData = await caveService.getCaveById(caveId);
      setCave(caveData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWineClick = (wine: WineDto) => {
    if (isReorderMode) return; // disable normal click in reorder mode
    setSelectedWine(wine);
  };

  // Long press to enter reorder mode
  const handleBottlePressStart = (_wine: WineDto) => {
    if (isReorderMode) return;
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      setIsReorderMode(true);
    }, 600); // 600ms threshold
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const exitReorderMode = () => {
    setIsReorderMode(false);
    setPendingPositions({});
    setDragWine(null);
    clearLongPress();
  };

  const handleDragStart = (wine: WineDto) => {
    if (!isReorderMode || !wine.id || wine.ligneId == null || wine.position == null) return;
    setDragWine(wine);
  };

  // Drag over an occupied slot (for swapping)
  const handleDragOverOccupied = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isReorderMode) return;
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeaveOccupied = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  // Drop on an occupied bottle to swap positions
  const handleDropOnOccupied = (targetWine: WineDto, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!dragWine || !dragWine.id || !targetWine.id) return;
    if (dragWine.id === targetWine.id) return; // same bottle no-op
    if (dragWine.ligneId == null || dragWine.position == null || targetWine.ligneId == null || targetWine.position == null) return;

    // Register both position changes (swap)
    setPendingPositions(prev => ({
      ...prev,
      [dragWine.id!]: { ligneId: targetWine.ligneId!, position: targetWine.position! },
      [targetWine.id!]: { ligneId: dragWine.ligneId!, position: dragWine.position! }
    }));

    // Optimistic local update
    setCave(prev => {
      if (!prev || !prev.casiers) return prev;
      const casiersCopy = prev.casiers.map(c => ({
        ...c,
        lignes: c.lignes?.map(l => ({ ...l, bouteilles: l.bouteilles ? [...l.bouteilles] : [] }))
      }));

      // Remove both wines from all lines
      casiersCopy.forEach(c => c.lignes?.forEach(l => {
        if (l.bouteilles) {
          l.bouteilles = l.bouteilles.filter(b => b.id !== dragWine.id && b.id !== targetWine.id);
        }
      }));

      // Insert swapped wines into their target lines
      const lineA = casiersCopy.flatMap(c => c.lignes || []).find(l => l.id === dragWine.ligneId);
      const lineB = casiersCopy.flatMap(c => c.lignes || []).find(l => l.id === targetWine.ligneId);

      if (lineA) {
        if (!lineA.bouteilles) lineA.bouteilles = [];
        lineA.bouteilles.push({ ...targetWine, ligneId: dragWine.ligneId, position: dragWine.position });
      }
      if (lineB) {
        if (!lineB.bouteilles) lineB.bouteilles = [];
        lineB.bouteilles.push({ ...dragWine, ligneId: targetWine.ligneId, position: targetWine.position });
      }

      return { ...prev, casiers: casiersCopy };
    });

    setDragWine(null);
  };

  const handleDragOverEmpty = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isReorderMode) return;
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeaveEmpty = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDropOnEmpty = (ligneId: number, targetPosition: number, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!dragWine || !dragWine.id) return;

    // Register new position change
    setPendingPositions(prev => ({
      ...prev,
      [dragWine.id!]: { ligneId, position: targetPosition }
    }));

    // Optimistic local update of cave state
    setCave(prev => {
      if (!prev || !prev.casiers) return prev;
      const casiersCopy = prev.casiers.map(c => ({ ...c, lignes: c.lignes?.map(l => ({ ...l, bouteilles: l.bouteilles ? [...l.bouteilles] : [] })) }));
      // Remove wine from all lines
      casiersCopy.forEach(c => c.lignes?.forEach(l => { if (l.bouteilles) l.bouteilles = l.bouteilles.filter(b => b.id !== dragWine.id); }));
      // Insert into target line
      const targetLine = casiersCopy.flatMap(c => c.lignes || []).find(l => l.id === ligneId);
      if (targetLine) {
        if (!targetLine.bouteilles) targetLine.bouteilles = [];
        targetLine.bouteilles.push({ ...dragWine, ligneId, position: targetPosition });
      }
      return { ...prev, casiers: casiersCopy };
    });
    setDragWine(null);
  };

  // Duplicate wine into first available position of its line
  const handleDuplicateWine = async (wine: WineDto) => {
    if (!wine.ligneId) {
      alert('Duplication impossible: ligne inconnue');
      return;
    }
    // Construire liste ordonnée des lignes (casiers puis lignes par position)
    const orderedLines = cave?.casiers
      ?.sort((a,b) => (a.position||0) - (b.position||0))
      .flatMap(casier => (casier.lignes?.sort((a,b) => (a.position||0)-(b.position||0)) || [])) || [];

    const currentLineIndex = orderedLines.findIndex(l => l.id === wine.ligneId);
    if (currentLineIndex === -1) {
      alert('Ligne courante introuvable pour duplication');
      return;
    }
    const currentLine = orderedLines[currentLineIndex];

    // 1. Chercher une position libre APRÈS la position actuelle dans la même ligne
    let targetLigneId: number | undefined = currentLine.id;
    let targetPos: number | null = null;
    if (currentLine.bouteilles) {
      const usedCurrent = new Set<number>(currentLine.bouteilles.map(b => b.position!).filter(p => p != null));
      for (let p = (wine.position || 0) + 1; p <= currentLine.nombreBouteillesMax; p++) {
        if (!usedCurrent.has(p)) { targetPos = p; break; }
      }
    } else if (currentLine.nombreBouteillesMax > 0) {
      // Ligne vide: si position actuelle est undefined on commence à 1, sinon on essaye position+1
      const start = (wine.position || 0) + 1;
      if (start <= currentLine.nombreBouteillesMax) {
        targetPos = start;
      }
    }

    // 2. Si pas trouvé, parcourir les lignes suivantes (même casier ou casier suivant)
    if (targetPos == null) {
      for (let i = currentLineIndex + 1; i < orderedLines.length; i++) {
        const line = orderedLines[i];
        const used = new Set<number>(line.bouteilles?.map(b => b.position!).filter(p => p != null));
        for (let p = 1; p <= line.nombreBouteillesMax; p++) {
          if (!used.has(p)) {
            targetLigneId = line.id;
            targetPos = p;
            break;
          }
        }
        if (targetPos != null) break;
      }
    }

    if (targetPos == null || !targetLigneId) {
      alert('Aucune place libre disponible après cette bouteille dans la cave');
      return;
    }

    const duplicate: WineDto = {
      chateau: wine.chateau,
      appellation: wine.appellation,
      taille: wine.taille,
      annee: wine.annee,
      couleur: wine.couleur,
      prix: wine.prix,
      ligneId: targetLigneId,
      position: targetPos
    };
    setIsUpdating(true);
    try {
      await wineService.createWine(duplicate);
      // Reload cave
      if (cave?.id) {
        const refreshed = await caveService.getCaveById(cave.id);
        setCave(refreshed);
      }
    } catch (err) {
      console.error('Erreur duplication', err);
      alert('Erreur lors de la duplication du vin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveReorder = async () => {
    if (!Object.keys(pendingPositions).length) {
      exitReorderMode();
      return;
    }
    setIsUpdating(true);
    try {
      for (const wineIdStr of Object.keys(pendingPositions)) {
        const wineId = parseInt(wineIdStr, 10);
        const { ligneId, position } = pendingPositions[wineId];
        await wineService.updateWinePosition(wineId, ligneId, position);
      }
      // Refresh cave
      if (cave?.id) {
        const refreshed = await caveService.getCaveById(cave.id);
        setCave(refreshed);
      }
      exitReorderMode();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde des déplacements');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseWineCard = () => {
    setSelectedWine(null);
  };

  const handleEditWine = (wine: WineDto) => {
    console.log('🔍 handleEditWine appelé avec:', wine);
    console.log('🆔 ID du vin:', wine.id);
    setEditingWine(wine);
    setSelectedWine(null); // Fermer la vue détail si ouverte
  };

  const handleSaveWine = async (updatedWine: WineDto) => {
    console.log('🔍 handleSaveWine appelé avec:', updatedWine);
    
    if (!updatedWine.id) {
      console.error('❌ ID du vin manquant:', updatedWine);
      alert('Erreur: ID du vin manquant. Le vin ne peut pas être modifié.');
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 Appel API updateWine avec ID:', updatedWine.id);
      await wineService.updateWine(updatedWine.id, updatedWine);
      
      // Recharger la cave pour voir les modifications
      if (id) {
        await loadCave(parseInt(id));
      }
      
      setEditingWine(null);
      console.log('✅ Vin modifié avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
      alert('❌ Erreur lors de la modification du vin: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingWine(null);
  };

  const handleCreateWine = (ligneId: number, position: number) => {
    setCreatingWine({ ligneId, position });
    setSelectedWine(null); // Fermer la vue détail si ouverte
  };

  const handleSaveNewWine = async (newWine: WineDto) => {
    if (!creatingWine) {
      alert('Erreur: informations de position manquantes');
      return;
    }

    setIsUpdating(true);
    try {
      // Assurer que ligneId et position sont bien définis
      const wineToCreate = {
        ...newWine,
        ligneId: creatingWine.ligneId,
        position: creatingWine.position
      };

      await wineService.createWine(wineToCreate);
      
      // Recharger la cave pour voir les modifications
      if (id) {
        await loadCave(parseInt(id));
      }
      
      setCreatingWine(null);
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert('❌ Erreur lors de la création du vin: ' + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelCreate = () => {
    setCreatingWine(null);
  };

  // Fonction pour ajouter un nouveau casier
  const handleAddCasier = async () => {
    if (!cave?.id) return;

    // Calculer le prochain numéro de casier
    const nextCasierNumber = cave.casiers && cave.casiers.length > 0 
      ? Math.max(...cave.casiers.map(c => c.numeroCasier || 0)) + 1 
      : 1;

    try {
      setIsUpdating(true);
      await caveService.addCasier(cave.id, { numeroCasier: nextCasierNumber });
      
      // Recharger la cave pour voir le nouveau casier
      await loadCave(cave.id);
      console.log('✅ Casier ajouté avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du casier:', error);
      alert('❌ Erreur lors de l\'ajout du casier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction pour supprimer un casier vide
  const handleDeleteCasier = async (casier: CasierDto) => {
    if (!casier.id) {
      alert('Erreur: ID du casier manquant');
      return;
    }

    // Vérifier si le casier est vide (aucune bouteille)
    const isEmpty = !casier.lignes?.some(ligne => 
      ligne.bouteilles && ligne.bouteilles.length > 0
    );

    if (!isEmpty) {
      alert('⚠️ Ce casier contient des bouteilles et ne peut pas être supprimé.\nVeuillez d\'abord déplacer ou supprimer toutes les bouteilles.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir supprimer le casier ${casier.numeroCasier} ?\n\nCette action est irréversible !`
    );
    
    if (confirmed) {
      try {
        setIsUpdating(true);
        await casierService.deleteCasier(casier.id);
        
        // Recharger la cave pour voir les modifications
        if (id) {
          await loadCave(parseInt(id));
        }
        
        console.log('✅ Casier supprimé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression du casier:', error);
        alert('❌ Erreur lors de la suppression du casier: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Fonction pour ouvrir l'édition de la cave
  const handleEditCave = () => {
    setEditingCave(true);
  };

  // Fonction pour sauvegarder les modifications de la cave
  const handleSaveCave = async (updatedCave: CaveDto) => {
    if (!cave?.id) {
      alert('Erreur: ID de la cave manquant');
      return;
    }

    setIsUpdating(true);
    try {
      await caveService.updateCave(cave.id, updatedCave);
      
      // Recharger la cave pour voir les modifications
      await loadCave(cave.id);
      
      setEditingCave(false);
      console.log('✅ Cave modifiée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la modification de la cave:', error);
      alert('❌ Erreur lors de la modification de la cave: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Fonction pour annuler l'édition de la cave
  const handleCancelEditCave = () => {
    setEditingCave(false);
  };

  // Fonction pour extraire les suggestions d'autocomplétion de la cave
  const getAutocompleteSuggestions = () => {
    if (!cave?.casiers) return { chateaux: [], appellations: [] };

    const chateaux = new Set<string>();
    const appellations = new Set<string>();

    cave.casiers.forEach(casier => {
      casier.lignes?.forEach(ligne => {
        ligne.bouteilles?.forEach(bouteille => {
          if (bouteille.chateau) chateaux.add(bouteille.chateau);
          if (bouteille.appellation) appellations.add(bouteille.appellation);
        });
      });
    });

    return {
      chateaux: Array.from(chateaux).sort(),
      appellations: Array.from(appellations).sort()
    };
  };

  const handleDeleteWine = async (wine: WineDto) => {
    if (!wine.id) {
      alert('Erreur: ID du vin manquant');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ Êtes-vous sûr de vouloir supprimer ce vin ?\n\n${wine.chateau} ${wine.annee}\n${wine.appellation}\n\nCette action est irréversible !`
    );
    
    if (confirmed) {
      setIsUpdating(true);
      try {
        // L'API de suppression peut retourner undefined/void
        await wineService.deleteWine(wine.id);
        
        // Recharger la cave pour voir les modifications
        if (id) {
          await loadCave(parseInt(id));
        }
        
        setSelectedWine(null); // Fermer le modal
        console.log('✅ Vin supprimé avec succès:', wine.chateau);
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        alert('❌ Erreur lors de la suppression du vin: ' + errorMessage);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Chargement de la cave...</div>;
  }

  if (error || !cave) {
    return (
      <div className="error-page">
        <h2>Erreur</h2>
        <p>{error || 'Cave non trouvée'}</p>
        <Link to="/caves" className="btn-primary">
          Retour aux caves
        </Link>
      </div>
    );
  }

  return (
    <div className="cave-detail-page">
      {/* Bandeau rouge de navigation global */}
      <SiteHeader/>



      <main className="caves-content">
        <div className="caves-header">
          <div className="header-left">

            <h2>{cave.nom}

          </h2>
      
           <p className="cave-description">{cave.description}</p>

          </div>
          <div className="header-right">  <button
            className="btn-primary"
            onClick={() => navigate('/caves')}
            type="button"
          >
            Retour
          </button>
                    <button
            className="btn-primary"
                onClick={handleEditCave}
                disabled={isUpdating}
                title="Modifier les paramètres de la cave"
                aria-label="Modifier la cave"
          >
            Modifier
          </button></div>

                  
        </div>

        {cave.casiers && cave.casiers.length > 0 ? (
          <div className="casiers-container">
            {cave.casiers
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map((casier) => {
                // Vérifier si le casier est vide
                const isEmpty = !casier.lignes?.some(ligne => 
                  ligne.bouteilles && ligne.bouteilles.length > 0
                );

                return (
              <div key={casier.id} className="casier-section">
                <div className="casier-visual">

                                    {isEmpty && isReorderMode && (
                    <button
                      onClick={() => handleDeleteCasier(casier)}
                      className="wine-btn wine-btn-delete casier-delete-btn"
                      disabled={isUpdating}
                      title="Supprimer ce casier vide"
                    >
                      <span className="btn-icon">🗑️</span>
                      <span className="btn-text">Supprimer</span>
                    </button>
                  )}
                  {casier.lignes
                    ?.sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map((ligne) => {
                      // Créer un tableau des positions avec les bouteilles
                      const positions = Array.from({ length: ligne.nombreBouteillesMax }, (_, index) => {
                        const bouteille = ligne.bouteilles?.find(b => b.position === index + 1);
                        return { position: index + 1, bouteille };
                      });

                      return (
                        <div
                          key={ligne.id}
                          className="ligne-horizontal"
                          style={{ '--positions': positions.length } as React.CSSProperties}
                        >
                          {positions.map(({ position, bouteille }) => {
                            if (bouteille) {
                              return (
                                <div
                                  key={bouteille.id}
                                  className={`bouteille occupied ${isReorderMode ? 'reorder-shake' : ''}`}
                                  title={`${bouteille.appellation} - ${bouteille.chateau} - ${bouteille.annee}`}
                                  onClick={() => handleWineClick(bouteille)}
                                  draggable={isReorderMode}
                                  onDragStart={() => handleDragStart(bouteille)}
                                  onMouseDown={() => handleBottlePressStart(bouteille)}
                                  onTouchStart={() => handleBottlePressStart(bouteille)}
                                  onMouseUp={clearLongPress}
                                  onTouchEnd={clearLongPress}
                                  onDragOver={handleDragOverOccupied}
                                  onDragLeave={handleDragLeaveOccupied}
                                  onDrop={(e) => handleDropOnOccupied(bouteille, e)}
                                >
                                  {isReorderMode && (
                                    <div className="reorder-actions">
                                      <button
                                        type="button"
                                        className="reorder-btn duplicate"
                                        title="Dupliquer"
                                        disabled={isUpdating}
                                        onClick={(e) => { e.stopPropagation(); handleDuplicateWine(bouteille); }}
                                      >
                                        ⧉
                                      </button>
                                      <button
                                        type="button"
                                        className="reorder-btn delete"
                                        title="Supprimer"
                                        disabled={isUpdating}
                                        onClick={(e) => { e.stopPropagation(); handleDeleteWine(bouteille); }}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )}
                                  <div className="wine-info">
                                    <span className="wine-appellation">{bouteille.appellation}</span>
                                    <span className="wine-chateau">{bouteille.chateau}</span>
                                    <span className="wine-year">{bouteille.annee}</span>
                                    <span className="wine-couleur">{bouteille.couleur}</span>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <div
                                key={`empty-${ligne.id}-${position}`}
                                className="bouteille empty"
                                title={`Position ${position}`}
                                onClick={() => !isReorderMode && handleCreateWine(ligne.id!, position)}
                                onDragOver={handleDragOverEmpty}
                                onDragLeave={handleDragLeaveEmpty}
                                onDrop={(e) => handleDropOnEmpty(ligne.id!, position, e)}
                              >
                                <span className="empty-slot">+</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  }
                </div>
              </div>
                );
              })}
            
            {/* Bouton pour ajouter un casier */}
            <div className="add-casier-section">
              <button
                onClick={handleAddCasier}
                className="wine-btn wine-btn-add-casier"
                disabled={isUpdating}
                title="Ajouter un nouveau casier"
              >
                <span className="btn-icon">➕</span>
                <span className="btn-text">
                  {isUpdating ? 'Ajout...' : 'Ajouter un casier'}
                </span>
              </button>
              <button
                onClick={v => setIsReorderMode(!isReorderMode)}
                className="wine-btn wine-btn-add-casier"
                disabled={isUpdating}
                title="Reorganiser La Cave"
              >
                <span className="btn-icon">🔀</span>
                <span className="btn-text">
                   {isReorderMode ? 'Reorg...' : 'Reorganiser la cave'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="casiers-container">
          <div className="empty-cave">
            <h3>Cette cave est vide</h3>
            <p>Commencez par ajouter des casiers à votre cave.</p>
            <button onClick={handleAddCasier} className="wine-btn wine-btn-add-casier" disabled={isUpdating}>
              <span className="btn-icon">➕</span>
              <span className="btn-text">
                {isUpdating ? 'Ajout...' : 'Ajouter un casier'}
              </span>
            </button>
          </div>
          </div>
          
        )}
      </main>
      {isReorderMode && (
        <div className="modal-overlay" style={{ background: 'transparent', pointerEvents: 'none' }}>
          <div style={{ position: 'fixed', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '1rem', pointerEvents: 'auto' }}>
            <button className="wine-btn wine-btn-primary" disabled={isUpdating} onClick={handleSaveReorder}>Sauvegarder déplacements</button>
            <button className="wine-btn wine-btn-delete" disabled={isUpdating} onClick={exitReorderMode}>Annuler</button>
          </div>
        </div>
      )}

      {/* Modal pour afficher la WineCard */}
      {selectedWine && (
        <div className="wine-modal-overlay" onClick={handleCloseWineCard}>
          <div className="wine-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="wine-modal-close" onClick={handleCloseWineCard}>
              ×
            </button>
            <WineCard 
              wine={selectedWine} 
              onEdit={handleEditWine}
              onDelete={handleDeleteWine}
              onScanComplete={() => { if (id) loadCave(parseInt(id)); }}
            />
          </div>
        </div>
      )}

      {/* Modal pour éditer le vin */}
      {editingWine && (
        <div className="wine-modal-overlay" onClick={handleCancelEdit}>
          <div className="wine-modal-content wine-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="wine-modal-close" onClick={handleCancelEdit}>
              ×
            </button>
            <WineEditForm
              wine={editingWine}
              onSave={handleSaveWine}
              onCancel={handleCancelEdit}
              isLoading={isUpdating}
              mode="edit"
              suggestions={getAutocompleteSuggestions()}
            />
          </div>
        </div>
      )}

      {/* Modal pour créer un nouveau vin */}
      {creatingWine && (
        <div className="wine-modal-overlay" onClick={handleCancelCreate}>
          <div className="wine-modal-content wine-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="wine-modal-close" onClick={handleCancelCreate}>
              ×
            </button>
            <WineEditForm
              onSave={handleSaveNewWine}
              onCancel={handleCancelCreate}
              isLoading={isUpdating}
              mode="create"
              ligneId={creatingWine.ligneId}
              position={creatingWine.position}
              suggestions={getAutocompleteSuggestions()}
            />
          </div>
        </div>
      )}

      {/* Modal pour éditer la cave */}
      {editingCave && (
        <div className="wine-modal-overlay" onClick={handleCancelEditCave}>
          <div className="wine-modal-content wine-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="wine-modal-close" onClick={handleCancelEditCave}>
              ×
            </button>
            <CaveEditForm
              cave={cave}
              onSave={handleSaveCave}
              onCancel={handleCancelEditCave}
              isLoading={isUpdating}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CaveDetailPage;