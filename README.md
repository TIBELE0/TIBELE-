Bonjour GitHub Copilot,

Je vais te décrire un projet web éducatif que je souhaite développer. Tu devras m’assister étape par étape pour le réaliser, en générant le code nécessaire, en proposant des solutions et en répondant à mes questions. Voici le contexte complet.

## Nom du projet
TIBELE

## Objectif
Créer une plateforme web destinée aux étudiants et personnels de santé (infirmiers, médecins) en Côte d’Ivoire. Elle fournit des fiches pédagogiques sur les pathologies : définition, examens, diagnostic référentiel, traitement sur place, ordonnance de sortie, prévention. Ce n’est pas un outil de conseil médical, uniquement un support d’apprentissage.

## Stack technique à utiliser
- Backend : Node.js avec Express et TypeScript
- Base de données : MongoDB (avec Mongoose comme ODM)
- Authentification : JWT (JSON Web Tokens) et bcrypt pour hasher les mots de passe
- Frontend : React (avec Vite) ou Vue.js – tu choisiras ce qui est le plus simple et efficace pour un projet responsive. Le frontend devra être adapté aux mobiles.
- Hébergement : non défini pour l’instant, mais le code devra être facilement déployable sur Railway, DigitalOcean ou un VPS.

## Fonctionnalités

### Système de comptes
- Inscription et connexion par email/mot de passe.
- Deux statuts : **gratuit** et **payant**.
- Le statut payant est actif pendant 30 jours après un paiement de 1000 FCFA (simulation dans un premier temps). Un champ `subscriptionExpiryDate` indique la fin de l’abonnement.
- Pas de compte “établissement”, uniquement des comptes individuels.

### Accès gratuit
- Consultation limitée : seulement certaines pathologies définies comme “gratuites” (un booléen `isFree`). Pour les pathologies payantes, l’utilisateur voit uniquement un extrait (200 premiers caractères) et un message l’invitant à s’abonner.
- Affichage de publicités (bannières) sur toutes les pages.
- Moteur de recherche fonctionnel sur l’ensemble des pathologies, mais les fiches payantes restent verrouillées.
- Forum de discussion : accès complet en lecture et écriture (création de sujets, réponses).

### Accès payant (1000 FCFA/mois)
- Aucune publicité.
- Accès illimité à toutes les pathologies (fiches complètes).
- Forum de discussion identique.
- Module d’auto-évaluation : QCM et QCD (questions à choix multiples ou vrai/faux) pour chaque pathologie. L’utilisateur peut répondre, voir son score, et consulter son historique.
- Accès prioritaire au support (un simple formulaire de contact dédié, plus tard).

### Administration
- Un panel admin (accessible uniquement à un utilisateur avec un rôle `admin`) pour :
  - Créer, modifier, supprimer des pathologies.
    - Gérer les questions des QCM/QCD.
      - Modérer le forum (supprimer des sujets ou messages).
      - La création du premier admin peut se faire via un script ou une variable d’environnement.

      ## Structure des données (MongoDB)

      Tu devras créer les collections suivantes avec Mongoose :

      1. **Users** : email unique, mot de passe hashé, date d’inscription, `isPaid` (booléen), `subscriptionExpiryDate` (date), `fullName` (optionnel), `role` (par défaut “user”, possible “admin”).

      2. **Pathologies** : titre, slug unique, description courte, définition (texte long), examens, diagnostic référentiel, traitement sur place, ordonnance de sortie, prévention, références, image URL (optionnel), `isFree` (booléen pour les pathologies accessibles gratuitement), dates de création et mise à jour.

      3. **Topics** (forum) : titre, contenu du premier message, auteur (référence vers User), pathologie associée (optionnelle, référence vers Pathologie), date de création, compteur de réponses.

      4. **Messages** : topic (référence), auteur (référence User), contenu, date de création.

      5. **Questions** (QCM/QCD) : pathologie associée, texte de la question, type (`QCM` ou `QCD`), options (tableau d’objets avec `text` et `isCorrect`), explication (optionnelle).

      6. **Réponses utilisateur** : utilisateur, question, réponse donnée (index de l’option pour QCM ou booléen pour QCD), `isCorrect`, date.

      ## Règles métier importantes

      - **Authentification** : toutes les routes protégées (sauf accueil, recherche, inscription/connexion) nécessitent un JWT valide.
      - **Restriction d’accès aux pathologies** : 
        - Si l’utilisateur est payant (et dans la période d’abonnement), il voit le contenu complet de toutes les pathologies.
          - Si l’utilisateur est gratuit, il ne voit le contenu complet que si `pathologie.isFree === true`. Sinon, un extrait est affiché et un message d’abonnement.
          - **Publicités** : côté frontend, conditionner l’affichage des bannières à `!user.isPaid`.
          - **Module QCM** : accessible uniquement aux utilisateurs payants (vérification en backend et frontend). Les questions sont chargées par pathologie, l’utilisateur répond une à une ou en lot, on enregistre ses réponses et on calcule un score.
          - **Paiement** : pour la phase de développement, un simple bouton “S’abonner pour 1000 FCFA” qui, lorsqu’il est cliqué, met à jour l’utilisateur courant : `isPaid = true`, `subscriptionExpiryDate = date actuelle + 30 jours`. Pas d’intégration réelle de CinetPay pour l’instant, mais il faudra prévoir la place pour l’ajouter plus tard.
          - **Recherche** : doit chercher dans les champs `titre` et `définition` (et éventuellement `description courte`) des pathologies. Les résultats doivent indiquer si la pathologie est gratuite ou payante.
          - **Forum** : pagination (10 sujets par page, 10 messages par sujet). Tout utilisateur connecté peut créer un sujet ou répondre. L’admin peut supprimer n’importe quel sujet/message.

          ## Interface utilisateur (frontend)

          Le site doit avoir une apparence sobre, professionnelle, avec un thème médical (bleu/blanc). Les pages suivantes sont nécessaires :

          - Page d’accueil : liste des pathologies (avec vignette, titre, extrait, badge gratuit/payant). Barre de recherche.
          - Page fiche pathologie : affichage complet ou partiel selon droits.
          - Page d’abonnement : bouton de simulation.
          - Page forum : liste des sujets, formulaire de création, affichage d’un sujet avec ses messages.
          - Page QCM : pour une pathologie donnée, afficher les questions, permettre de répondre, afficher le score.
          - Page de connexion / inscription.
          - Profil utilisateur : afficher son statut (gratuit/payant) et la date d’expiration de l’abonnement, possibilité de se désabonner ? Non, juste voir.
          - Panel admin : accessible via un lien ou /admin, avec formulaires pour gérer pathologies et questions.

          ## Étapes de développement (à suivre avec toi)

          1. Initialiser le projet : créer dossiers backend et frontend, configurer TypeScript, Express, MongoDB (connexion).
          2. Définir les modèles Mongoose (schémas).
          3. Mettre en place l’authentification JWT (routes register, login, middleware).
          4. Créer les routes CRUD pour les pathologies (protégées par admin pour l’écriture).
          5. Implémenter la logique de restriction d’accès (middleware d’abonnement).
          6. Créer les routes du forum (topics, messages) avec pagination.
          7. Créer les routes QCM (récupérer les questions, soumettre les réponses, historique).
          8. Ajouter la route de simulation d’abonnement.
          9. Développer le frontend (React/Vue) avec les pages listées.
          10. Tester le tout en local avec des données factices (seed de quelques pathologies, utilisateurs, questions).

          ## Contraintes supplémentaires
          - Tout le code doit être commenté en anglais ou en français.
          - Les mots de passe doivent être hashés avec bcrypt (coût 10).
          - Les requêtes MongoDB doivent être optimisées (index sur email, slug, etc.).
          - La sécurité : validation des entrées (express-validator ou zod), protection contre les injections NoSQL, échappement du contenu HTML dans le forum.
          - Le site doit être responsive (mobile-first).

          ## Conclusion
          Tu es mon assistant. Je te fournirai ces instructions une fois, et tout au long du développement je te poserai des questions ou te demanderai de générer des parties spécifiques. Commence par me proposer une structure de dossiers claire et les fichiers de configuration initiaux (package.json, tsconfig.json, etc.). Je te dirai “go” quand je serai prêt.

          Merci de ton aide !