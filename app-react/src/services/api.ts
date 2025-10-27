import { AuthResponse, CaveConfig, LoginCredentials, RegisterData, UserRegistrationDto, User, UserDto, Wine, WineDto, CasierDto, LigneDto, CaveDto } from '../types';

const API_BASE = '/api';

// Utility function for API calls
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;
  const hasBody = options.body !== undefined && options.body !== null;
  const config: RequestInit = {
    headers: {
      // Authorization par défaut (token applicatif) sera surchargée si options.headers fournit une autre valeur
      ...(token && { Authorization: `Bearer ${token}` }),
      // Content-Type JSON seulement si un body est présent et qu'il n'est pas FormData
      ...((hasBody && !isFormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token invalide ou expiré, nettoyer l'authentification
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    } catch (e) {
      // Ignore les erreurs de parsing
    }
    
    throw new Error(errorMessage);
  }
  
  // Gérer les réponses vides (comme les suppressions)
  const contentType = response.headers.get('content-type');
  const contentLength = response.headers.get('content-length');
  
  // Si pas de contenu ou contenu vide, retourner undefined
  if (response.status === 204 || contentLength === '0' || !contentType?.includes('application/json')) {
    return undefined as T;
  }
  
  // Vérifier si la réponse a du contenu avant de parser JSON
  const text = await response.text();
  if (!text || text.trim() === '') {
    return undefined as T;
  }
  
  return JSON.parse(text);
}

// Authentication services
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Appel du vrai endpoint de login
      const response = await apiCall<any>('/users/login', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        }),
      });

      // Si la réponse contient directement le token
      if (response.token) {
        // Récupérer les informations de l'utilisateur avec le token
        const token = response.token;
        
        // Stocker temporairement le token pour faire l'appel getCurrentUser
        localStorage.setItem('token', token);
        
        try {
          const userInfo = await authService.getCurrentUser();
          if (userInfo.id) {
            const user: User = {
              id: userInfo.id,
              username: userInfo.username,
              email: userInfo.email,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName
            };
            
            return {
              user,
              token
            };
          }
        } catch (userError) {
          // Si on ne peut pas récupérer l'utilisateur, nettoyer le token
          localStorage.removeItem('token');
          throw new Error('Impossible de récupérer les informations utilisateur');
        }
      }
      
      // Si le format de réponse est différent, adapter ici
      throw new Error('Format de réponse de login inattendu');
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors de la connexion');
    }
  },

  async register(data: RegisterData): Promise<UserDto> {
    const registrationData: UserRegistrationDto = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    
    return apiCall<UserDto>('/users/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  async getCurrentUser(): Promise<UserDto> {
    return apiCall<UserDto>('/users/current');
  },

  async updateCurrentUser(user: UserDto): Promise<UserDto> {
    return apiCall<UserDto>('/users/current', {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Cave services
export const caveService = {
  async getCaves(): Promise<CaveDto[]> {
    return apiCall<CaveDto[]>('/caves');
  },

  async getCaveById(id: number): Promise<CaveDto> {
    return apiCall<CaveDto>(`/caves/${id}`);
  },

  async createCave(cave: CaveDto): Promise<CaveDto> {
    return apiCall<CaveDto>('/caves', {
      method: 'POST',
      body: JSON.stringify(cave),
    });
  },

  async updateCave(id: number, cave: CaveDto): Promise<CaveDto> {
    return apiCall<CaveDto>(`/caves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cave),
    });
  },

  async deleteCave(id: number): Promise<void> {
    return apiCall<void>(`/caves/${id}`, {
      method: 'DELETE',
    });
  },

  async addCasier(caveId: number, config: CaveConfig): Promise<CasierDto> {
    return apiCall<CasierDto>(`/cave-management/${caveId}/add-casier?numeroCasier=${config.numeroCasier}`, {
      method: 'POST',
    });
  },

  async swapWines(wineId1: number, wineId2: number): Promise<string> {
    return apiCall<string>(`/cave-management/swap-wines?wineId1=${wineId1}&wineId2=${wineId2}`, {
      method: 'POST',
    });
  }
};

// Wine services
export const wineService = {
  async createWine(wine: WineDto): Promise<WineDto> {
    return apiCall<WineDto>('/wines', {
      method: 'POST',
      body: JSON.stringify(wine),
    });
  },

  async updateWine(id: number, wine: WineDto): Promise<Wine> {
    return apiCall<Wine>(`/wines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wine),
    });
  },

  // Scan d'étiquette pour pré-remplir un formulaire (création ou édition sans dépendre de l'ID)
  async scanWineLabel(file: File): Promise<WineDto> {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall<WineDto>('/scan', {
      method: 'POST',
      body: formData
    });
  },

  /**
   * Update only the position (and optionally ligneId) of a wine without changing other fields.
   * Falls back to full update if backend requires all fields.
   */
  async updateWinePosition(id: number, ligneId: number, position: number): Promise<Wine> {
    // Minimal payload focusing on repositioning
    const partial: Partial<WineDto> = { ligneId, position };
    return apiCall<Wine>(`/wines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partial),
    });
  },

  async deleteWine(id: number): Promise<void> {
    return apiCall<void>(`/wines/${id}`, {
      method: 'DELETE',
    });
  }
};

// Casier services
export const casierService = {
  async createCasier(casier: CasierDto): Promise<CasierDto> {
    return apiCall<CasierDto>('/casiers', {
      method: 'POST',
      body: JSON.stringify(casier),
    });
  },

  async getCasiersByCaveId(caveId: number): Promise<CasierDto[]> {
    return apiCall<CasierDto[]>(`/casiers/cave/${caveId}`);
  },

  async deleteCasier(id: number): Promise<void> {
    return apiCall<void>(`/casiers/${id}`, {
      method: 'DELETE',
    });
  }
};

// Ligne services
export const ligneService = {
  async createLigne(ligne: LigneDto): Promise<LigneDto> {
    return apiCall<LigneDto>('/lignes', {
      method: 'POST',
      body: JSON.stringify(ligne),
    });
  }
};