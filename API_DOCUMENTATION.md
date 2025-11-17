# API Documentation - MEPS Backend

Ce document présente la documentation complète des API de l'application MEPS (système de placement des personnes en situation de handicap).

## Architecture générale

L'API est construite avec NestJS et suit une architecture modulaire. Chaque module expose ses propres endpoints avec des contrôles d'accès basés sur les rôles et permissions.

### Authentification

Toutes les API (sauf indication contraire) nécessitent une authentification JWT via l'en-tête `Authorization: Bearer <token>`.

### Base URL

```
https://your-domain.com/api
```

---

## Modules Principaux

### 1. Module Users (`/users`)

Gestion des utilisateurs du système.

#### Endpoints

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `POST` | `/users` | Créer un utilisateur | `users:create` |
| `GET` | `/users` | Liste des utilisateurs avec pagination | `users:read` |
| `GET` | `/users/page` | Liste avec pagination par page | `users:view` |
| `GET` | `/users/:id` | Détails d'un utilisateur | `users:view` |
| `PATCH` | `/users/:id` | Modifier un profil utilisateur | `users:update` |
| `POST` | `/users/register` | Enregistrer avec photo | - |
| `POST` | `/users/:id/permissions` | Assigner des permissions | `users:assign-roles` |
| `POST` | `/users/:id/permissions/add` | Ajouter des permissions | `users:assign-roles` |
| `POST` | `/users/:id/permissions/remove` | Retirer des permissions | `users:assign-roles` |
| `GET` | `/users/:id/permissions` | Récupérer les permissions | `users:view` |
| `PUT` | `/users/:id/change-password` | Changer le mot de passe | `users:update` |

#### Utilisation

```javascript
// Créer un utilisateur avec photo
const formData = new FormData();
formData.append('firstName', 'John');
formData.append('lastName', 'Doe');
formData.append('email', 'john.doe@example.com');
formData.append('photo', fileInput.files[0]);

fetch('/api/users', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

---

### 2. Module Candidates (`/candidates`)

Gestion des profils de candidats.

#### Endpoints

| Méthode | Endpoint | Description | Rôles requis |
|---------|----------|-------------|--------------|
| `GET` | `/candidates/all` | Tous les candidats actifs | admin, super-admin, company, ngo |
| `GET` | `/candidates` | Candidats avec filtres avancés | admin, super-admin, company, ngo, ministry |
| `GET` | `/candidates/profile` | Profil du candidat connecté | - |
| `GET` | `/candidates/stats` | Statistiques des candidats | admin, super-admin, ministry |
| `GET` | `/candidates/:id` | Détails d'un candidat | admin, super-admin, company, ngo |
| `POST` | `/candidates` | Créer un profil candidat | - |
| `PATCH` | `/candidates/:id` | Modifier un profil | - |
| `PATCH` | `/candidates/:id/profile-completion` | Recalculer le taux de complétude | - |
| `DELETE` | `/candidates/:id` | Supprimer un candidat | admin, super-admin |

#### Filtres disponibles

- `search` : Recherche textuelle (nom, résumé, compétences)
- `isActive` : Statut actif
- `isProfileComplete` : Profil complet (≥80%)
- `isAvailable` : Disponibilité pour un emploi
- `disabilityTypeId` : Type de handicap
- `educationLevelId` : Niveau d'éducation
- `experienceLevelId` : Niveau d'expérience
- `locationId` : Localisation
- `hasCv` : Possession d'un CV
- `hasVideoPresentation` : Possession d'une présentation vidéo

#### Utilisation

```javascript
// Rechercher des candidats
const response = await fetch('/api/candidates?search=developer&isAvailable=true&page=1&size=10', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

---

### 3. Module Companies (`/companies`)

Gestion des profils d'entreprises.

#### Endpoints

| Méthode | Endpoint | Description | Rôles requis |
|---------|----------|-------------|--------------|
| `GET` | `/companies/all` | Toutes les entreprises | admin, super-admin, ministry |
| `GET` | `/companies` | Entreprises avec pagination | admin, super-admin, ministry, candidate, ngo |
| `GET` | `/companies/profile` | Profil de l'entreprise connectée | company |
| `GET` | `/companies/compliance/compliant` | Entreprises conformes | admin, super-admin, ministry |
| `GET` | `/companies/compliance/non-compliant` | Entreprises non conformes | admin, super-admin, ministry |
| `GET` | `/companies/:id` | Détails d'une entreprise | admin, super-admin, ministry, candidate, ngo |
| `POST` | `/companies` | Créer un profil entreprise | company |
| `PATCH` | `/companies/:id` | Modifier le profil | company, admin, super-admin |
| `PATCH` | `/companies/:id/compliance` | Mettre à jour la conformité | company, admin, super-admin |
| `PATCH` | `/companies/:id/profile-completion` | Recalculer le taux de complétude | company, admin, super-admin |
| `DELETE` | `/companies/:id` | Supprimer une entreprise | admin, super-admin |
| `GET` | `/companies/pending-verification` | Entreprises en attente | admin, super-admin, ministry |
| `PATCH` | `/companies/:id/validate` | Valider/Rejeter une entreprise | admin, super-admin |
| `GET` | `/companies/verified` | Entreprises vérifiées | admin, super-admin, ministry, candidate, ngo |

#### Utilisation

```javascript
// Créer un profil entreprise
const companyData = {
  name: "Tech Solutions SARL",
  description: "Entreprise de développement logiciel",
  activitySectorId: "uuid-sector",
  companySizeId: "uuid-size",
  locationId: "uuid-location",
  employeeCount: 50,
  registrationNumber: "RC/DLA/123456"
};

await fetch('/api/companies', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(companyData)
});
```

---

### 4. Module Job Offers (`/job-offers`)

Gestion des offres d'emploi.

#### Endpoints

| Méthode | Endpoint | Description | Authentification |
|---------|----------|-------------|------------------|
| `GET` | `/job-offers/search` | Offres publiées (public) | Non requise |
| `GET` | `/job-offers` | Offres avec filtres | Requise |
| `GET` | `/job-offers/published` | Recherche avancée (public) | Non requise |
| `GET` | `/job-offers/my-offers` | Offres de l'entreprise connectée | company |
| `GET` | `/job-offers/my-offers/all` | Toutes les offres sans pagination | company |
| `GET` | `/job-offers/:id` | Détails d'une offre | - |
| `GET` | `/job-offers/:id/details` | Détails d'une offre publiée (public) | Non requise |
| `GET` | `/job-offers/:id/stats` | Statistiques d'une offre | company, admin, super-admin |
| `POST` | `/job-offers` | Créer une offre | company |
| `PATCH` | `/job-offers/:id` | Modifier une offre | company, admin, super-admin |
| `PATCH` | `/job-offers/:id/publish` | Publier une offre | company, admin, super-admin |
| `PATCH` | `/job-offers/:id/pause` | Suspendre une offre | company, admin, super-admin |
| `PATCH` | `/job-offers/:id/close` | Fermer définitivement une offre | company, admin, super-admin |
| `DELETE` | `/job-offers/:id` | Supprimer une offre (soft delete) | company, admin, super-admin |

#### Filtres disponibles

- `search` : Recherche dans titre, description, exigences
- `isActive` : Statut actif
- `isVisible` : Visible aux candidats
- `status` : Statut de l'offre (draft, published, paused, closed)
- `activitySectorId` : Secteur d'activité
- `contractTypeId` : Type de contrat
- `locationId` : Localisation
- `isRemoteWork` : Travail à distance possible
- `isDisabilityFriendly` : Adapté aux personnes handicapées
- `isExclusiveForDisabled` : Exclusif aux personnes handicapées
- `salaryMin` / `salaryMax` : Fourchette salariale
- `suitableDisabilityTypeIds` : Types de handicap appropriés

#### Utilisation

```javascript
// Créer une offre d'emploi
const jobOffer = {
  title: "Développeur Frontend Senior",
  description: "Nous recherchons un développeur frontend expérimenté...",
  requirements: "5+ ans d'expérience avec React, TypeScript...",
  activitySectorId: "uuid-sector",
  contractTypeId: "uuid-contract",
  locationId: "uuid-location",
  salaryMin: 45000,
  salaryMax: 65000,
  salaryCurrency: "EUR",
  isRemoteWork: true,
  isDisabilityFriendly: true,
  applicationDeadline: "2024-12-31T23:59:59.000Z"
};

await fetch('/api/job-offers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jobOffer)
});
```

---

### 5. Module Applications (`/applications`)

Gestion des candidatures aux offres d'emploi.

#### Endpoints

| Méthode | Endpoint | Description | Permissions |
|---------|----------|-------------|-------------|
| `POST` | `/applications` | Créer une candidature | `applications:create` |
| `GET` | `/applications` | Liste des candidatures | `applications:read` |
| `GET` | `/applications/page` | Pagination par page | `applications:read` |
| `GET` | `/applications/statistics` | Statistiques des candidatures | `applications:read` |
| `GET` | `/applications/job-offer/:jobOfferId` | Candidatures pour une offre | `applications:read` |
| `GET` | `/applications/company/:companyId` | Candidatures d'une entreprise | `applications:read` |
| `GET` | `/applications/candidate/:candidateId` | Candidatures d'un candidat | `applications:read` |
| `GET` | `/applications/ngo/:ngoId` | Candidatures soutenues par une ONG | `applications:read` |
| `GET` | `/applications/:id` | Détails d'une candidature | `applications:read` |
| `PATCH` | `/applications/:id/status` | Mettre à jour le statut | `applications:update` |
| `DELETE` | `/applications/:id/withdraw` | Retirer une candidature | `applications:delete` |
| `POST` | `/applications/:id/feedback` | Ajouter un retour | `applications:update` |

#### Utilisation

```javascript
// Créer une candidature avec fichiers
const formData = new FormData();
formData.append('jobOfferId', 'uuid-job-offer');
formData.append('candidateId', 'uuid-candidate');
formData.append('coverLetter', 'Ma lettre de motivation...');
formData.append('cv', cvFile);
formData.append('motivationLetterFile', motivationFile);

await fetch('/api/applications', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + token },
  body: formData
});
```

---

### 6. Module NGOs (`/ngos`)

Gestion des ONG et de leurs candidats.

#### Endpoints

| Méthode | Endpoint | Description | Rôles requis |
|---------|----------|-------------|--------------|
| `GET` | `/ngos/:id` | Détails d'une ONG | admin, super-admin, ministry, company, ngo |
| `GET` | `/ngos/all` | Toutes les ONG | admin, super-admin, ministry |
| `GET` | `/ngos` | ONG avec pagination | admin, super-admin, ministry, company |
| `PUT` | `/ngos/:id` | Modifier une ONG | admin, super-admin |
| `DELETE` | `/ngos/:id` | Supprimer une ONG | admin, super-admin |
| `DELETE` | `/ngos/:ngoId/candidates` | Supprimer tous les candidats d'une ONG | admin, super-admin |

#### Gestion des candidats par ONG

| Méthode | Endpoint | Description | Rôles requis |
|---------|----------|-------------|--------------|
| `POST` | `/ngos/:id/candidates` | Créer un candidat pour une ONG | admin, super-admin, ministry |
| `GET` | `/ngos/:id/candidates/all` | Tous les candidats d'une ONG | admin, super-admin, ministry, company |
| `GET` | `/ngos/:id/candidates` | Candidats avec pagination | admin, super-admin, ministry, company |
| `GET` | `/ngos/:id/candidates/:candidateId` | Détails d'un candidat | admin, super-admin, ministry, company |
| `PUT` | `/ngos/:id/candidates/:candidateId` | Modifier un candidat | admin, super-admin, ministry |
| `DELETE` | `/ngos/:id/candidates/:candidateId` | Supprimer un candidat | admin, super-admin |

#### Utilisation

```javascript
// Récupérer les candidats d'une ONG avec pagination
const response = await fetch('/api/ngos/uuid-ngo/candidates?page=1&size=10&search=developer', {
  headers: { 'Authorization': 'Bearer ' + token }
});
```

---

## Modules de Référence

Ces modules fournissent les données de référence utilisées par les autres modules.

### Activity Sectors (`/activity-sectors`)
- `GET /activity-sectors` : Liste des secteurs d'activité
- `POST /activity-sectors` : Créer un secteur
- `PUT /activity-sectors/:id` : Modifier un secteur
- `DELETE /activity-sectors/:id` : Supprimer un secteur

### Contract Types (`/contract-types`)
- `GET /contract-types` : Liste des types de contrat
- `POST /contract-types` : Créer un type de contrat
- `PUT /contract-types/:id` : Modifier un type de contrat
- `DELETE /contract-types/:id` : Supprimer un type de contrat

### Company Sizes (`/company-sizes`)
- `GET /company-sizes` : Liste des tailles d'entreprise
- `POST /company-sizes` : Créer une taille d'entreprise
- `PUT /company-sizes/:id` : Modifier une taille d'entreprise
- `DELETE /company-sizes/:id` : Supprimer une taille d'entreprise

### Disability Types (`/disability-types`)
- `GET /disability-types` : Liste des types de handicap
- `POST /disability-types` : Créer un type de handicap
- `PUT /disability-types/:id` : Modifier un type de handicap
- `DELETE /disability-types/:id` : Supprimer un type de handicap

### Education Levels (`/education-levels`)
- `GET /education-levels` : Liste des niveaux d'éducation
- `POST /education-levels` : Créer un niveau d'éducation
- `PUT /education-levels/:id` : Modifier un niveau d'éducation
- `DELETE /education-levels/:id` : Supprimer un niveau d'éducation

### Experience Levels (`/experience-levels`)
- `GET /experience-levels` : Liste des niveaux d'expérience
- `POST /experience-levels` : Créer un niveau d'expérience
- `PUT /experience-levels/:id` : Modifier un niveau d'expérience
- `DELETE /experience-levels/:id` : Supprimer un niveau d'expérience

### Locations (`/locations`)
- `GET /locations` : Liste des localités
- `POST /locations` : Créer une localité
- `PUT /locations/:id` : Modifier une localité
- `DELETE /locations/:id` : Supprimer une localité

### Professions (`/professions`)
- `GET /professions` : Liste des professions
- `POST /professions` : Créer une profession
- `PUT /professions/:id` : Modifier une profession
- `DELETE /professions/:id` : Supprimer une profession

---

## Module Authentification (`/auth`)

### Endpoints

- `POST /auth/login` : Connexion utilisateur
- `POST /auth/logout` : Déconnexion
- `POST /auth/refresh` : Renouveler le token
- `POST /auth/register` : Inscription
- `POST /auth/forgot-password` : Mot de passe oublié
- `POST /auth/reset-password` : Réinitialiser le mot de passe

### Utilisation

```javascript
// Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken, refreshToken } = await loginResponse.json();
```

---

## Module Statistics (`/statistics`)

Fournit des statistiques et analyses sur la plateforme.

### Endpoints

- `GET /statistics/dashboard` : Statistiques du tableau de bord
- `GET /statistics/candidates` : Statistiques des candidats
- `GET /statistics/companies` : Statistiques des entreprises
- `GET /statistics/job-offers` : Statistiques des offres d'emploi
- `GET /statistics/applications` : Statistiques des candidatures

---

## Système de Permissions

### Rôles disponibles

- `super-admin` : Accès complet au système
- `admin` : Administration générale
- `ministry` : Accès du ministère
- `company` : Entreprise utilisatrice
- `ngo` : Organisation non gouvernementale
- `candidate` : Candidat à l'emploi

### Permissions communes

- `{resource}:create` : Créer une ressource
- `{resource}:read` : Lire une ressource
- `{resource}:update` : Modifier une ressource
- `{resource}:delete` : Supprimer une ressource
- `{resource}:view` : Voir les détails
- `{resource}:list` : Lister les ressources

---

## Gestion des erreurs

### Codes de statut HTTP

- `200 OK` : Succès
- `201 Created` : Ressource créée
- `400 Bad Request` : Données invalides
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Permissions insuffisantes
- `404 Not Found` : Ressource non trouvée
- `409 Conflict` : Conflit (ex: email déjà utilisé)
- `422 Unprocessable Entity` : Erreur de validation
- `500 Internal Server Error` : Erreur serveur

### Format des erreurs

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

---

## Pagination

### Format standard

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "size": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Paramètres de pagination

- `page` : Numéro de page (défaut: 1)
- `size` : Taille de page (défaut: 10, max: 100)
- `search` : Terme de recherche
- Filtres spécifiques selon l'endpoint

---

## Upload de fichiers

Les endpoints supportant l'upload utilisent `multipart/form-data` :

- Photos de profil : formats image (jpg, png, webp)
- CV : formats document (pdf, doc, docx)
- Vidéos : formats vidéo (mp4, webm, avi)

### Limitations

- Taille maximale : 10MB par fichier
- Types MIME vérifiés côté serveur
- Stockage sécurisé avec génération d'URLs d'accès

---

## Bonnes pratiques

1. **Authentification** : Toujours inclure le token JWT dans les en-têtes
2. **Gestion des erreurs** : Vérifier les codes de statut HTTP
3. **Pagination** : Utiliser la pagination pour les listes importantes
4. **Filtrage** : Exploiter les filtres disponibles pour optimiser les requêtes
5. **Permissions** : Respecter le système de rôles et permissions
6. **Upload** : Vérifier les types et tailles de fichiers avant upload

Cette documentation couvre l'ensemble des API disponibles. Pour plus de détails sur les schémas de données, consultez la documentation Swagger générée automatiquement à `/api/docs`.