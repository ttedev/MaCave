# API de Gestion de Cave à Vin

## Vue d'ensemble

Cette application Spring Boot fournit une API REST pour gérer une cave à vin avec un système flexible de casiers et de lignes.

## Modèle de données

### Structure hiérarchique :
```
Cave
└── Casiers (list)
    └── Lignes (list)
        └── Bouteilles/Wines (list)
```

### Entités principales :

- **Cave** : Contient la configuration générale (nom, description, nombre de lignes par casier, capacité par défaut par ligne)
- **Casier** : Représente un casier physique dans la cave
- **Ligne** : Une ligne dans un casier avec une capacité maximale de bouteilles
- **Wine** : Une bouteille avec ses caractéristiques (château, appellation, année, couleur, prix)

## Endpoints API

### Gestion des Caves

#### Opérations CRUD de base
- `GET /api/caves` - Liste toutes les caves
- `GET /api/caves/{id}` - Récupère une cave par ID
- `POST /api/caves` - Crée une nouvelle cave
- `PUT /api/caves/{id}` - Met à jour une cave
- `DELETE /api/caves/{id}` - Supprime une cave
- `GET /api/caves/search?nom={nom}` - Recherche des caves par nom

#### Gestion avancée des caves
- `POST /api/cave-management/create-complete` - Crée une cave complète avec casiers et lignes
- `POST /api/cave-management/{caveId}/add-casier` - Ajoute un casier à une cave
- `POST /api/cave-management/ligne/{ligneId}/add-wine` - Ajoute une bouteille à une ligne
- `GET /api/cave-management/{caveId}/find-free-space` - Trouve une place libre dans la cave

### Gestion des Casiers
- `GET /api/casiers` - Liste tous les casiers
- `GET /api/casiers/{id}` - Récupère un casier par ID
- `GET /api/casiers/cave/{caveId}` - Récupère tous les casiers d'une cave
- `POST /api/casiers` - Crée un nouveau casier
- `PUT /api/casiers/{id}` - Met à jour un casier
- `DELETE /api/casiers/{id}` - Supprime un casier

### Gestion des Lignes
- `GET /api/lignes` - Liste toutes les lignes
- `GET /api/lignes/{id}` - Récupère une ligne par ID
- `GET /api/lignes/casier/{casierId}` - Récupère toutes les lignes d'un casier
- `POST /api/lignes` - Crée une nouvelle ligne
- `PUT /api/lignes/{id}` - Met à jour une ligne
- `DELETE /api/lignes/{id}` - Supprime une ligne

### Gestion des Bouteilles
- `GET /api/wines` - Liste toutes les bouteilles
- `GET /api/wines/{id}` - Récupère une bouteille par ID
- `GET /api/wines/ligne/{ligneId}` - Récupère toutes les bouteilles d'une ligne
- `GET /api/wines/cave/{caveId}` - Récupère toutes les bouteilles d'une cave
- `POST /api/wines` - Crée une nouvelle bouteille
- `PUT /api/wines/{id}` - Met à jour une bouteille
- `DELETE /api/wines/{id}` - Supprime une bouteille

#### Recherche de bouteilles
- `GET /api/wines/search/chateau?chateau={chateau}` - Recherche par château
- `GET /api/wines/search/appellation?appellation={appellation}` - Recherche par appellation
- `GET /api/wines/search/annee?annee={annee}` - Recherche par année
- `GET /api/wines/search/couleur?couleur={couleur}` - Recherche par couleur

## Exemples d'utilisation

### 1. Créer une cave complète

```bash
POST /api/cave-management/create-complete
Content-Type: application/json

{
  "nom": "Cave Principale",
  "description": "Ma cave à vin principale",
  "nombreCasiers": 3,
  "nombreLignesParCasier": 2,
  "capaciteParLigne": 6
}
```

### 2. Ajouter une bouteille

```bash
POST /api/wines
Content-Type: application/json

{
  "chateau": "Château Margaux",
  "appellation": "Margaux",
  "annee": 2015,
  "couleur": "ROUGE",
  "prix": 450.00
}
```

### 3. Rechercher une place libre

```bash
GET /api/cave-management/1/find-free-space
```

## Couleurs de vin disponibles

- `ROUGE`
- `BLANC`
- `ROSE`
- `PETILLANT`
- `CHAMPAGNE`

## Configuration flexible

Le nouveau modèle permet de configurer :
- Le nombre de casiers dans une cave
- Le nombre de lignes par casier
- La capacité par défaut de chaque ligne
- La capacité individuelle de chaque ligne (personnalisable après création)

## Base de données

L'application utilise H2 en mémoire par défaut, mais peut être configurée pour PostgreSQL, MySQL ou autres SGBD via `application.properties`.

## Démarrage

```bash
mvn spring-boot:run
```

L'application démarre sur `http://localhost:8080`