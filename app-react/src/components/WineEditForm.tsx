import React, { useState, useEffect, useRef } from 'react';
import { WineDto } from '../types';
import AutocompleteInput from './AutocompleteInput';

interface WineEditFormProps {
  wine?: WineDto;
  onSave: (wine: WineDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
  ligneId?: number;
  position?: number;
  suggestions?: { chateaux: string[]; appellations: string[] };
}

const WineEditForm: React.FC<WineEditFormProps> = ({
  wine,
  onSave,
  onCancel,
  isLoading = false,
  mode = 'edit',
  ligneId,
  position,
  suggestions = { chateaux: [], appellations: [] }
}) => {
  const [formData, setFormData] = useState<WineDto>(() => {
    if (mode === 'create') {
      return {
        chateau: '',
        appellation: '',
        annee: new Date().getFullYear(),
        prix: 0,
        taille: '75', // défaut 75cl
        couleur: 'ROUGE',
        ligneId,
        position
      };
    }
    const base = wine || {
      chateau: '',
      appellation: '',
      annee: new Date().getFullYear(),
      prix: 0,
      taille: '75',
      couleur: 'ROUGE'
    };
    if (!base.taille || base.taille.trim() === '') base.taille = '75';
    return base;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mode === 'edit' && wine) {
      setFormData(prev => ({ ...prev, ...wine, taille: wine.taille && wine.taille.trim() !== '' ? wine.taille : '75' }));
    }
  }, [wine, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = (name === 'annee' || name === 'prix') ? (value === '' ? 0 : Number(value)) : value;
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.chateau.trim()) newErrors.chateau = 'Le château est requis';
    if (!formData.appellation.trim()) newErrors.appellation = 'L\'appellation est requise';
    if (!formData.annee || formData.annee < 1800 || formData.annee > new Date().getFullYear()) newErrors.annee = 'Année invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const toSave: WineDto = { ...formData, taille: formData.taille && formData.taille.trim() !== '' ? formData.taille : '75' };
    onSave(toSave);
  };

  // --- Scan étiquette ---
  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError(null);
    setIsScanning(true);
    try {
      // Import dynamique pour éviter un import circulaire potentiel si réorganisé
      const { wineService } = await import('../services/api');
      const scanned = await wineService.scanWineLabel(file);
      // Fusion: ne remplace que les champs vides ou par défaut
      setFormData(prev => ({
        ...prev,
        chateau: scanned.chateau || '',
        appellation:  scanned.appellation || '',
        annee: scanned.annee || prev.annee,
        prix: scanned.prix || prev.prix,
        taille:  '75',
        couleur: 'ROUGE'  
      }));
    } catch (err) {
      console.error('Erreur scan', err);
      setScanError(err instanceof Error ? err.message : 'Erreur inconnue lors du scan');
      alert('Erreur lors du scan de l\'étiquette');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="wine-edit-form" style={{ position: 'relative' }}>
      {isScanning && (
        <div className="scan-loading-overlay">
          <div className="scan-spinner" />
          <div className="scan-loading-text">Analyse de l'étiquette</div>
        </div>
      )}
      <h3>{mode === 'create' ? 'Ajouter un nouveau vin' : 'Modifier le vin'}</h3>
      <div className="scan-actions">
        <button
          type="button"
          onClick={triggerScan}
          className="wine-btn wine-btn-scan"
          disabled={isScanning || isLoading}
        >
          <span className="btn-icon">{isScanning ? '⏳' : '📷'}</span>
          <span className="btn-text">{isScanning ? 'Scan...' : 'Scanner étiquette'}</span>
        </button>
        {scanError && <span className="error-text" style={{ alignSelf: 'center' }}>{scanError}</span>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="chateau">Château *</label>
            <AutocompleteInput
              id="chateau"
              name="chateau"
              value={formData.chateau}
              onChange={handleInputChange}
              suggestions={suggestions.chateaux}
              placeholder="Nom du château..."
              className={errors.chateau ? 'error' : ''}
              disabled={isLoading || isScanning}
            />
            {errors.chateau && <span className="error-text">{errors.chateau}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="appellation">Appellation *</label>
            <AutocompleteInput
              id="appellation"
              name="appellation"
              value={formData.appellation}
              onChange={handleInputChange}
              suggestions={suggestions.appellations}
              placeholder="Appellation..."
              className={errors.appellation ? 'error' : ''}
              disabled={isLoading || isScanning}
            />
            {errors.appellation && <span className="error-text">{errors.appellation}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="annee">Année *</label>
            <input
              type="number"
              id="annee"
              name="annee"
              value={formData.annee}
              onChange={handleInputChange}
              min="1800"
              max={new Date().getFullYear()}
              className={errors.annee ? 'error' : ''}
              disabled={isLoading || isScanning}
            />
            {errors.annee && <span className="error-text">{errors.annee}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="prix">Prix (€) *</label>
            <input
              type="number"
              id="prix"
              name="prix"
              value={formData.prix}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className={errors.prix ? 'error' : ''}
              disabled={isLoading || isScanning}
            />
            {errors.prix && <span className="error-text">{errors.prix}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="taille">Taille (cl)</label>
            <select
              id="taille"
              name="taille"
              value={formData.taille || '75'}
              onChange={handleInputChange}
              disabled={isLoading || isScanning}
            >
              <option value="75">75cl (Standard)</option>
              <option value="37.5">37.5cl (Demi)</option>
              <option value="150">150cl (Magnum)</option>
              <option value="300">300cl (Double Magnum)</option>
              <option value="600">600cl (Impériale)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="couleur">Couleur *</label>
            <select
              id="couleur"
              name="couleur"
              value={formData.couleur}
              onChange={handleInputChange}
              disabled={isLoading || isScanning}
            >
              <option value="ROUGE">Rouge</option>
              <option value="BLANC">Blanc</option>
              <option value="ROSE">Rosé</option>
              <option value="PETILLANT">Pétillant</option>
              <option value="CHAMPAGNE">Champagne</option>
            </select>
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
            disabled={isLoading || isScanning}
          >
            <span className="btn-icon">💾</span>
            <span className="btn-text">
              {isLoading ? (mode === 'create' ? 'Création...' : 'Sauvegarde...') : (mode === 'create' ? 'Créer' : 'Sauvegarder')}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default WineEditForm;