# TIBELE - Plateforme Éducative Médicale

## Structure du Projet

```
TIBELE-/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (database)
│   │   ├── middleware/      # Middlewares (auth, error handling)
│   │   ├── models/          # Schémas MongoDB (User, Pathology, etc.)
│   │   ├── routes/          # Routes API
│   │   ├── controllers/     # Logique des routes
│   │   ├── services/        # Logique métier
│   │   ├── utils/           # Utilitaires (JWT, validators)
│   │   └── index.ts         # Point d'entrée
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Appels API
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── context/         # Contexte (Auth)
│   │   ├── styles/          # CSS
│   │   ├── main.tsx         # Point d'entrée
│   │   └── App.tsx
│   ├── public/              # Fichiers statiques
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .gitignore
│
├── docker-compose.yml       # Configuration Docker
└── README.md

## Installation et Démarrage

### Prérequis
- Node.js 18+
- MongoDB 6.0+
- npm ou yarn

### Installation Backend

cd backend
npm install
cp .env.example .env
npm run dev

### Installation Frontend

cd frontend
npm install
npm run dev

### Avec Docker Compose

docker-compose up

## Prochaines Étapes

1. ✓ Créer l'arborescence du projet
2. □ Implémenter l'authentification JWT
3. □ Créer les modèles et collections MongoDB
4. □ Implémenter les contrôleurs et services
5. □ Créer les pages frontend
6. □ Tester l'intégration complet
