import React from 'react';
import { Wine, WineDto } from '../types';

interface WineCardProps {
  wine: Wine | WineDto;
  onEdit?: (wine: Wine | WineDto) => void;
  onDelete?: (wine: Wine | WineDto) => void;
  // Ajouté pour compatibilité avec utilisation dans CaveDetailPage (callback post-scan)
  onScanComplete?: () => void;
}

const WineCard: React.FC<WineCardProps> = ({ wine, onEdit, onDelete }) => {
  const getColorClass = (couleur: string) => {
    switch (couleur) {
      case 'ROUGE': return 'wine-rouge';
      case 'BLANC': return 'wine-blanc';
      case 'ROSE': return 'wine-rose';
      case 'PETILLANT': return 'wine-petillant';
      case 'CHAMPAGNE': return 'wine-champagne';
      default: return 'wine-default';
    }
  };


  return (
    <div className={`wine-card ${getColorClass(wine.couleur)}`}>
      {/* Temporairement commenté car la propriété photo n'existe pas dans les types actuels
      {wine.photo && (
        <div className="wine-photo">
          <img src={wine.photo} alt={wine.chateau} />
        </div>
      )}
      */}
      
      <div className="wine-info">
        <h3 className="wine-chateau">{wine.chateau}</h3>
        <p className="wine-appellation">{wine.appellation}</p>
        <div className="wine-details">
          <span className="wine-year">{wine.annee}</span>
          <span className="wine-price">{wine.prix}€</span>
          <span className="wine-size">{wine.taille}</span>
        </div>
        <span className={`wine-color ${getColorClass(wine.couleur)}`}>
          {wine.couleur}
        </span>
      </div>

      {(onEdit || onDelete) && (
        <div className="wine-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(wine)}
              className="wine-btn wine-btn-edit"
              title="Modifier ce vin"
            >
              <span className="btn-icon">✏️</span>
              <span className="btn-text">Modifier</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(wine)}
              className="wine-btn wine-btn-delete"
              title="Supprimer ce vin"
            >
              <span className="btn-icon">🗑️</span>
              <span className="btn-text">Supprimer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WineCard;