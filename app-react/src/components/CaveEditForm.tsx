import React, { useState, useEffect } from 'react';
import { CaveDto } from '../types';

interface CaveEditFormProps {
  cave: CaveDto;
  onSave: (cave: CaveDto) => void;
  deleteCave?: (cave: CaveDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const CaveEditForm: React.FC<CaveEditFormProps> = ({ 
  cave, 
  onSave, 
  deleteCave,
  onCancel, 
  isLoading = false 
}) => {
  const [formData, setFormData] = useState<CaveDto>(() => {
    // S'assurer que capacitesParLigne est bien initialisé
    const initialCave = { ...cave };
    if (!initialCave.capacitesParLigne || initialCave.capacitesParLigne.length === 0) {
      // Si pas de capacités définies, créer un tableau avec des valeurs par défaut
      initialCave.capacitesParLigne = Array.from(
        { length: initialCave.nombreLignesParCasier || 1 }, 
        () => 6 // 6 bouteilles par défaut
      );
    }
    return initialCave;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Synchroniser formData quand cave change
  useEffect(() => {
    const updatedCave = { ...cave };
    if (!updatedCave.capacitesParLigne || updatedCave.capacitesParLigne.length === 0) {
      // Si pas de capacités définies, créer un tableau avec des valeurs par défaut
      updatedCave.capacitesParLigne = Array.from(
        { length: updatedCave.nombreLignesParCasier || 1 }, 
        () => 6 // 6 bouteilles par défaut
      );
    }
    setFormData(updatedCave);
  }, [cave]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Conversion pour les champs numériques
    const processedValue = name === 'nombreLignesParCasier' ? 
      (value === '' ? 0 : Number(value)) : value;

    if (name === 'nombreLignesParCasier') {
      // Quand le nombre de lignes change, ajuster le tableau des capacités
      const newNombreLignes = Number(value) || 0;
      const currentCapacites = formData.capacitesParLigne || [];
      
      // Créer un nouveau tableau avec la bonne taille
      const newCapacites = Array.from({ length: newNombreLignes }, (_, index) => {
        // Garder les valeurs existantes ou utiliser une valeur par défaut
        return currentCapacites[index] || 6; // 6 bouteilles par défaut
      });
      
      setFormData(prev => ({
        ...prev,
        nombreLignesParCasier: newNombreLignes,
        capacitesParLigne: newCapacites
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    // Nettoyer l'erreur si elle existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRemoveCave = () => {
    // Appeler onSave avec une cave vide pour indiquer la suppression
    if (deleteCave) deleteCave(cave);
  }

  const handleCapaciteChange = (index: number, value: string) => {
    const newCapacite = value === '' ? 0 : Number(value);
    const newCapacites = [...(formData.capacitesParLigne || [])];
    newCapacites[index] = newCapacite;
    
    setFormData(prev => ({
      ...prev,
      capacitesParLigne: newCapacites
    }));

    // Nettoyer l'erreur si elle existe
    if (errors[`capacite_${index}`]) {
      setErrors(prev => ({ ...prev, [`capacite_${index}`]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la cave est requis';
    }

    if (!formData.nombreLignesParCasier || formData.nombreLignesParCasier < 1 || formData.nombreLignesParCasier > 4) {
      newErrors.nombreLignesParCasier = 'Le nombre de lignes par casier doit être entre 1 et 4';
    }

    // Valider chaque capacité de ligne
    if (formData.capacitesParLigne) {
      formData.capacitesParLigne.forEach((capacite, index) => {
        if (!capacite || capacite < 1 || capacite > 20) {
          newErrors[`capacite_${index}`] = 'La capacité doit être entre 1 et 20';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <div className="cave-edit-form">
      <h3>⚙️ Paramètres de la cave</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nom">Nom de la cave *</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Nom de votre cave..."
              className={errors.nom ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.nom && <span className="error-text">{errors.nom}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description de votre cave..."
              className={errors.description ? 'error' : ''}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="nombreLignesParCasier">Nombre de lignes par casier *</label>
            <input
              type="number"
              id="nombreLignesParCasier"
              name="nombreLignesParCasier"
              value={formData.nombreLignesParCasier}
              onChange={handleInputChange}
              min="1"
              max="50"
              className={errors.nombreLignesParCasier ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.nombreLignesParCasier && <span className="error-text">{errors.nombreLignesParCasier}</span>}
            <small className="help-text">Entre 1 et 4 lignes par casier</small>
          </div>

          <div className="form-group">
            <label>Capacités par ligne *</label>
            <div className="capacites-grid">
              {Array.from({ length: formData.nombreLignesParCasier || 0 }, (_, index) => (
                <div key={index} className="capacite-item">
                  <label htmlFor={`capacite_${index}`}>Ligne {index + 1}</label>
                  <input
                    type="number"
                    id={`capacite_${index}`}
                    value={formData.capacitesParLigne?.[index] || 0}
                    onChange={(e) => handleCapaciteChange(index, e.target.value)}
                    min="1"
                    max="100"
                    className={errors[`capacite_${index}`] ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors[`capacite_${index}`] && (
                    <span className="error-text">{errors[`capacite_${index}`]}</span>
                  )}
                </div>
              ))}
            </div>
            <small className="help-text">Entre 1 et 20 bouteilles par ligne</small>
          </div>
        </div>

        <div className="cave-info">
          <div className="info-item">
            <span className="info-label">Nombre de casiers actuels:</span>
            <span className="info-value">{cave.casiers?.length || 0}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Capacité totale théorique:</span>
            <span className="info-value">
              {(cave.casiers?.length || 0) * (formData.capacitesParLigne?.reduce((sum, cap) => sum + cap, 0) || 0)} bouteilles
            </span>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="wine-btn wine-btn-cancel"
            disabled={isLoading}
          >
            <span className="btn-icon">❌</span>
            <span className="btn-text">Annuler</span>
          </button>
          
          <button
            type="submit"
            className="wine-btn wine-btn-save"
            disabled={isLoading}
          >
            <span className="btn-icon">💾</span>
            <span className="btn-text">
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </span>
          </button>
          {(!!deleteCave) && (
          <button
            type="button"
            className="wine-btn wine-btn-delete"
            onClick={handleRemoveCave}
          >
            <span className="btn-icon">🗑️</span>
            <span className="btn-text">
              Supprimer
            </span>
          </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CaveEditForm;