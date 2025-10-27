import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginCredentials } from '../types';
import { useLocation, useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, adoptToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [tokenParamError, setTokenParamError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Traiter le paramètre token dans l'URL (ex: /login?token=XYZ)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const externalToken = params.get('token');
    if (externalToken) {
      (async () => {
        try {
          setTokenParamError(null);
          await adoptToken(externalToken);
          // Nettoyer l'URL (retirer le token de la barre) sans recharger page
          navigate('/login', { replace: true });
        } catch (e) {
          setTokenParamError(e instanceof Error ? e.message : 'Token invalide');
        }
      })();
    }
  }, [location.search, adoptToken, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Ma Cave à Vin</h1>
          <p>Connectez-vous à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {tokenParamError && (
            <div className="error-message">
              {tokenParamError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
            style={
              {
                borderRadius:'20px'
              }
            }
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
            <p style={{ marginBottom: '0.5rem' }}>Ou</p>
            <button
              type="button"
              className="login-button google-login-button"
              onClick={() => {
                window.location.href = '/oauth2/authorization/google';
              }}
              style={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                width: '100%',
                backgroundColor: '#fff',
                color: '#444',
                borderRadius: '20px',
                border: '1px solid #dadce0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                fontWeight: 500
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.9 2.38 30.47 0 24 0 14.62 0 6.4 5.38 2.54 13.22l8 6.22C12.43 13.15 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.1 24.62c0-1.54-.14-3.02-.4-4.42H24v8.38h12.5c-.54 2.9-2.18 5.36-4.64 7.02l7.18 5.58C43.9 37.55 46.1 31.49 46.1 24.62z" />
                <path fill="#FBBC05" d="M10.54 28.96c-.5-1.48-.78-3.06-.78-4.69 0-1.63.28-3.21.78-4.69l-8-6.22C1.33 16.33 0 20.01 0 24c0 3.99 1.33 7.67 3.56 10.64l8-6.22z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.94-2.14 15.92-5.8l-7.18-5.58c-2.02 1.37-4.6 2.18-8.74 2.18-6.26 0-11.57-3.65-13.96-8.94l-8 6.22C6.4 42.62 14.62 48 24 48z" />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>Continuer avec Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;