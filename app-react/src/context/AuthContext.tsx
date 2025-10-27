import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  adoptToken: (token: string) => Promise<void>; // Intègre un token externe (ex: redirection OAuth)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          // Essayer d'utiliser l'utilisateur stocké d'abord
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Valider le token en faisant un appel à getCurrentUser
          try {
            await authService.getCurrentUser();
            // Si l'appel réussit, le token est valide
          } catch (error) {
            // Token invalide, nettoyer l'authentification
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          // Erreur de parsing ou autre, nettoyer tout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };


  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      // Conversion de UserDto vers User (en assumant que l'id existe après registration)
      if (response.id) {
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName
        };
        setUser(user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const adoptToken = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      // Récupérer l'utilisateur courant
      const userInfo = await authService.getCurrentUser();
      if (userInfo.id) {
        const adoptedUser: User = {
          id: userInfo.id,
          username: userInfo.username,
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
        };
        localStorage.setItem('user', JSON.stringify(adoptedUser));
        setUser(adoptedUser);
      }
    } catch (e) {
      // Nettoyer si échec
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw e;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    adoptToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};