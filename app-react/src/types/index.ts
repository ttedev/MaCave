export interface Wine {
  id?: number;
  chateau: string;
  appellation: string;
  annee: number;
  prix: number;
  taille: string;
  couleur: 'ROUGE' | 'BLANC' | 'ROSE' | 'PETILLANT' | 'CHAMPAGNE';
  ligneId?: number;
  position?: number;
}

export interface WineDto {
  id?: number;
  chateau: string;
  appellation: string;
  taille: string;
  annee: number;
  couleur: 'ROUGE' | 'BLANC' | 'ROSE' | 'PETILLANT' | 'CHAMPAGNE';
  prix: number;
  ligneId?: number;
  position?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserDto {
  id?: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Cave {
  id: number;
  nom: string;
  description: string;
  nombreLignesParCasier: number;
  capacitesParLigne: number[];
  ownerId?: number;
  casiers: Casier[];
}

export interface CaveDto {
  id?: number;
  nom: string;
  description: string;
  nombreLignesParCasier: number;
  capacitesParLigne: number[];
  ownerId?: number;
  casiers?: CasierDto[];
}

export interface Casier {
  id: number;
  numeroCasier: number;
  caveId?: number;
  position: number;
  lignes: Ligne[];
}

export interface CasierDto {
  id?: number;
  numeroCasier: number;
  caveId?: number;
  position: number;
  lignes?: LigneDto[];
}

export interface Ligne {
  id: number;
  nombreBouteillesMax: number;
  casierId?: number;
  position: number;
  bouteilles: Wine[];
}

export interface LigneDto {
  id?: number;
  nombreBouteillesMax: number;
  casierId?: number;
  position: number;
  bouteilles?: WineDto[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CaveConfig {
  numeroCasier: number;
}