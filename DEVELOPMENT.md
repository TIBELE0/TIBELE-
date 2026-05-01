# Guide de Développement TIBELE

## Architecture Générale

### Backend (Node.js + Express + TypeScript)
- **Port**: 5000
- **Base de données**: MongoDB
- **Authentification**: JWT + bcrypt

### Frontend (React + Vite + TypeScript)
- **Port**: 5173
- **Styling**: CSS modernes + responsive design

## Configuration d'Environnement

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tibele
JWT_SECRET=votre_secret_jwt
JWT_EXPIRE=7d
BCRYPT_SALT=10
ADMIN_EMAIL=admin@tibele.com
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Scripts Disponibles

### Backend
- `npm run dev` - Démarrage en mode développement
- `npm run build` - Construction TypeScript
- `npm start` - Démarrage en production
- `npm run seed` - Initialiser la base de données

### Frontend
- `npm run dev` - Démarrage du serveur de développement
- `npm run build` - Construction du bundle
- `npm run preview` - Prévisualisation

## Collections MongoDB

### Users
- email (unique)
- password (hashé)
- fullName
- role (user | admin)
- isPaid (boolean)
- subscriptionExpiryDate
- timestamps

### Pathologies
- title
- slug (unique)
- shortDescription
- definition
- examinations
- referentialDiagnosis
- onSiteTreatment
- dischargeOrder
- prevention
- references (optionnel)
- imageUrl (optionnel)
- isFree (boolean)
- timestamps

### Topics (Forum)
- title
- content
- author (référence User)
- pathology (référence Pathologie, optionnel)
- replyCount
- timestamps

### Messages (Forum)
- topic (référence Topic)
- author (référence User)
- content
- timestamps

### Questions (QCM/QCD)
- pathology (référence Pathologie)
- questionText
- type (QCM | QCD)
- options (array: { text, isCorrect })
- explanation (optionnel)
- timestamps

### UserAnswers
- user (référence User)
- question (référence Question)
- answer (mixed: string, number, boolean)
- isCorrect (boolean)
- timestamps

## Routes API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Pathologies
- `GET /api/pathologies` - Lister toutes les pathologies
- `GET /api/pathologies/:slug` - Détail d'une pathologie
- `GET /api/pathologies/search?q=query` - Rechercher
- `POST /api/pathologies` - Créer (admin)
- `PUT /api/pathologies/:id` - Modifier (admin)
- `DELETE /api/pathologies/:id` - Supprimer (admin)

### Forum
- `GET /api/forum/topics` - Lister les sujets
- `POST /api/forum/topics` - Créer un sujet
- `GET /api/forum/topics/:id` - Détail d'un sujet
- `POST /api/forum/messages` - Créer un message
- `DELETE /api/forum/messages/:id` - Supprimer un message
- `DELETE /api/forum/topics/:id` - Supprimer un sujet

### Questions (QCM/QCD)
- `GET /api/questions/:pathologyId` - Questions par pathologie
- `POST /api/questions/answer` - Soumettre une réponse
- `GET /api/questions/history/:userId` - Historique des réponses
- `POST /api/questions` - Créer une question (admin)

### Abonnement
- `GET /api/subscription/status` - Statut d'abonnement
- `POST /api/subscription/subscribe` - S'abonner (simulation)
- `POST /api/subscription/cancel` - Annuler l'abonnement

### Admin
- `GET /api/admin/dashboard` - Tableau de bord
- (Routes de gestion intégrées dans les autres modules)

## Déploiement

### Docker Compose
```bash
docker-compose up
```

### Railway
1. Configurer la variable `MONGODB_URI`
2. Configurer `JWT_SECRET`
3. Déployer avec `git push railroad main`

### DigitalOcean / VPS
1. Installer Node.js 18+
2. Installer MongoDB
3. Configurer PM2 pour l'auto-restart
4. Configurer Nginx comme reverse proxy

## Points d'Extension Future

1. **Paiement réel**: Intégration CinetPay
2. **Notifications**: Email/SMS
3. **Analytics**: Suivi des utilisateurs
4. **Tests**: Unit et integration tests
5. **CI/CD**: GitHub Actions
6. **Logging**: Winston/Morgan
7. **Rate limiting**: redis-limiter
8. **Caching**: Redis

## Contact et Support
- Email: contact@tibele.ci
- GitHub: [TIBELE-Project](https://github.com)
