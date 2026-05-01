# Runbook TIBELE

## 1) Démarrage production

### Variables d'environnement backend
- NODE_ENV=production
- PORT=5000
- MONGODB_URI=<mongodb-uri>
- JWT_SECRET=<long-secret>
- JWT_REFRESH_SECRET=<long-secret>
- CORS_ORIGINS=https://votre-domaine
- COOKIE_SECURE=true
- ADMIN_EMAIL=<admin-email>
- ADMIN_PASSWORD_HASH=<bcrypt-hash>
- ADMIN_MATRICULE=MED000000
- ADMIN_SCHOOL=Administration TIBELE
- ADMIN_MAJOR=Administration

### Commandes
- Backend: `npm --prefix backend run build && npm --prefix backend start`
- Frontend: `npm --prefix frontend run build` puis servir le dossier `frontend/dist`

## 2) Health checks
- API health: `GET /api/health`
- API readiness: `GET /api/ready`

## 3) Sauvegarde MongoDB (mongodump)

### Backup
`mongodump --uri "$MONGODB_URI" --out ./backups/$(date +%Y%m%d_%H%M%S)`

### Compression
`tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz ./backups/<dossier_backup>`

## 4) Restauration MongoDB (mongorestore)

### Restore complet
`mongorestore --uri "$MONGODB_URI" --drop ./backups/<dossier_backup>`

### Restore depuis archive
1. `tar -xzf backup_xxx.tar.gz`
2. `mongorestore --uri "$MONGODB_URI" --drop ./backups/<dossier_backup>`

## 5) Vérifications post-restore
- Vérifier connexion API: `/api/health`
- Vérifier login admin
- Vérifier routes critiques: pathologies, forum, questions

## 6) Notes sécurité
- Ne jamais commiter de secrets dans le repo.
- Utiliser ADMIN_PASSWORD_HASH en production (pas de mot de passe en clair).
- Désactiver tout seed automatique en production.
