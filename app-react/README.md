# Ma Cave à Vin - Application React

Une application moderne de gestion de cave à vin développée avec React et TypeScript.

## Fonctionnalités

- 🔐 **Authentification** - Connexion et inscription des utilisateurs
- 🏠 **Gestion de caves** - Création et organisation de vos caves
- 📦 **Casiers et emplacements** - Organisation en casiers avec système de grille
- 🍷 **Gestion des vins** - Ajout, modification et suppression des bouteilles
- 📱 **Design responsive** - Interface adaptée mobile et desktop
- 🖼️ **Upload de photos** - Ajout d'images pour vos bouteilles

## Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (version 18 ou supérieure) - [Télécharger Node.js](https://nodejs.org/)
- **npm** ou **yarn** (inclus avec Node.js)

## Installation

1. **Installer Node.js**
   - Téléchargez et installez Node.js depuis [nodejs.org](https://nodejs.org/)
   - Vérifiez l'installation : `node --version` et `npm --version`

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application en mode développement**
   ```bash
   npm run dev
   ```

4. **Ouvrir dans le navigateur**
   - L'application sera disponible sur : `http://localhost:5173`

## Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint

## Structure du projet

```
src/
├── components/          # Composants réutilisables
│   └── WineCard.tsx    # Carte d'affichage des vins
├── context/            # Contextes React
│   └── AuthContext.tsx # Gestion de l'authentification
├── hooks/              # Hooks personnalisés
│   └── useCaves.ts     # Hook pour la gestion des caves
├── pages/              # Pages de l'application
│   ├── LoginPage.tsx   # Page de connexion
│   ├── CavesPage.tsx   # Liste des caves
│   └── CaveDetailPage.tsx # Détail d'une cave
├── services/           # Services API
│   └── api.ts          # Appels vers l'API backend
├── types/              # Types TypeScript
│   └── index.ts        # Définitions des interfaces
├── App.tsx             # Composant principal
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux
```

## Configuration de l'API

L'application est configurée pour se connecter à une API backend sur `http://localhost:8080`.

Les endpoints utilisés :
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/caves` - Liste des caves
- `POST /api/caves` - Création d'une cave
- `POST /api/wines` - Création d'un vin
- etc.

## Technologies utilisées

- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **React Router** - Navigation
- **CSS3** - Styling personnalisé

## Développement

### Structure de données

L'application utilise les types suivants :

- `Wine` - Représente une bouteille de vin
- `Cave` - Représente une cave
- `Casier` - Représente un casier dans une cave
- `Emplacement` - Représente un emplacement pour une bouteille
- `User` - Représente un utilisateur

### Authentification

L'authentification utilise JWT tokens stockés dans le localStorage. Le contexte `AuthContext` gère l'état d'authentification globalement.

### API

Les services API sont centralisés dans `src/services/api.ts` et organisés par domaine :
- `authService` - Authentification
- `caveService` - Gestion des caves
- `wineService` - Gestion des vins
- `emplacementService` - Gestion des emplacements

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.