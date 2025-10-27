import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import _ from 'lodash';

interface SiteHeaderProps {
  showBack?: boolean; // afficher le lien retour
  backTo?: string;    // chemin retour (par défaut /caves)
  title?: string;     // titre principal (par défaut Ma Cave à Vin)
  subtitle?: string;  // sous-titre optionnel (ex: description de la cave)
  rightContent?: React.ReactNode; // zone d'actions à droite
}

const SiteHeader: React.FC<SiteHeaderProps> = ({
  showBack = false,
  backTo = '/caves',
  title = 'Ma Cave à Vin',
  subtitle,
  rightContent,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="site-header-title-row">
            {showBack && (
              <Link to={backTo} className="nav-back-btn" aria-label="Retour">
                <span className="nav-back-icon">←</span>
                <span className="nav-back-text">Retour</span>
              </Link>
            )}
            <h1 className="site-header-title">{title}</h1>
          </div>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        <div className="header-right">
          <div className="user-info">
            <span>Bonjour, {_.capitalize(user?.firstName || user?.username)}</span>
            <button onClick={logout} className="logout-btn">Déconnexion</button>
          </div>
          {rightContent && (
            <div className="header-actions">{rightContent}</div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;