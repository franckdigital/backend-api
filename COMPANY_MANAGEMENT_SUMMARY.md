# Système de Gestion des Compagnies - Résumé d'Implémentation

## Vue d'ensemble

Le système de gestion des compagnies a été implémenté avec un processus complet d'inscription, de validation administrative et de filtrage des offres d'emploi. Les compagnies doivent être vérifiées et approuvées avant de pouvoir publier des offres d'emploi visibles par les candidats.

## Fonctionnalités Implémentées

### 1. Inscription des Compagnies (`POST /auth/register/company`)

**Endpoint:** `POST /auth/register/company`

**Description:** Permet aux compagnies de s'inscrire sur la plateforme avec les informations du représentant et de l'entreprise.

**Données requises:**
- Informations du représentant (firstName, lastName, email, etc.)
- Informations de l'entreprise (companyName, activitySectorId, companySizeId, locationId)

**Comportement:**
- Crée un compte utilisateur pour le représentant
- Crée un profil d'entreprise
- La compagnie est créée avec `isVerified: false` et `canPostJobOffers: false`
- Génère un mot de passe si non fourni
- Envoie un email de vérification
- Notifie les administrateurs de la nouvelle inscription

**Réponse:** `CompanyRegistrationResponseDto` avec les détails du compte créé

### 2. Validation/Rejet des Compagnies

#### 2.1 Lister les Compagnies en Attente (`GET /companies/pending-verification`)

**Endpoint:** `GET /companies/pending-verification`

**Rôles autorisés:** admin, super-admin, ministry

**Description:** Récupère la liste des compagnies en attente de validation administrative.

#### 2.2 Valider ou Rejeter une Compagnie (`PATCH /companies/:id/validate`)

**Endpoint:** `PATCH /companies/:id/validate`

**Rôles autorisés:** admin, super-admin

**Body:** `ValidateCompanyDto`
```json
{
  "approve": true/false,
  "verificationNotes": "Notes optionnelles",
  "canPostJobOffers": true/false
}
```

**Comportement:**
- Si approuvée: `isVerified: true`, `canPostJobOffers: true` (par défaut), `verificationDate: Date`
- Si rejetée: `isVerified: false`, `canPostJobOffers: false`, `isActive: false`

**Réponse:** `CompanyValidationResponseDto` avec le statut de validation

#### 2.3 Lister les Compagnies Vérifiées (`GET /companies/verified`)

**Endpoint:** `GET /companies/verified`

**Rôles autorisés:** admin, super-admin, ministry, candidate, ngo

**Description:** Récupère la liste des compagnies vérifiées et autorisées à publier des offres.

### 3. Filtrage des Offres d'Emploi

#### 3.1 Modification du Service JobOffers

**Méthodes modifiées:**
- `findPublishedOffers()`: Filtre uniquement les offres des compagnies vérifiées
- `findWithPagination()`: Ajoute des filtres de vérification des compagnies
- `searchJobOffers()`: Inclut les critères de vérification des compagnies

**Critères de filtrage:**
```typescript
company: {
    isVerified: true,
    canPostJobOffers: true,
    isActive: true
}
```

#### 3.2 Vérification avant Publication

**Méthode:** `verifyCompanyCanPostJobOffers()`

**Vérifications:**
- Compagnie existe
- Compagnie est active (`isActive: true`)
- Compagnie est vérifiée (`isVerified: true`)
- Compagnie peut publier des offres (`canPostJobOffers: true`)

**Intégration:**
- Appelée dans `create()` avant la création d'une offre
- Appelée dans `publish()` avant la publication d'une offre

## Structure des Données

### DTOs Créés

1. **RegisterCompanyDto** - Données d'inscription
2. **CompanyRegistrationResponseDto** - Réponse d'inscription
3. **ValidateCompanyDto** - Données de validation
4. **CompanyValidationResponseDto** - Réponse de validation

### Méthodes de Service Ajoutées

#### CompaniesService
- `findPendingVerification()`: Compagnies en attente
- `validateCompany()`: Valider/rejeter une compagnie
- `findVerifiedCompanies()`: Compagnies vérifiées
- `isCompanyVerified()`: Vérifier le statut d'une compagnie

#### AuthService
- `registerCompany()`: Inscription des compagnies

#### JobOffersService
- `verifyCompanyCanPostJobOffers()`: Vérification avant publication

## Flux de Travail

### 1. Inscription d'une Compagnie
```
1. Compagnie s'inscrit via POST /auth/register/company
2. Compte utilisateur créé (représentant)
3. Profil compagnie créé avec isVerified: false
4. Email de vérification envoyé
5. Notification aux administrateurs
```

### 2. Validation Administrative
```
1. Admin consulte GET /companies/pending-verification
2. Admin valide via PATCH /companies/:id/validate
3. Si approuvée: isVerified: true, canPostJobOffers: true
4. Si rejetée: isVerified: false, isActive: false
```

### 3. Publication d'Offres
```
1. Compagnie tente de créer/publier une offre
2. Vérification du statut de la compagnie
3. Si vérifiée: offre créée/publiée
4. Si non vérifiée: erreur 403 Forbidden
```

### 4. Consultation des Offres
```
1. Candidats/NGOs consultent les offres
2. Seules les offres des compagnies vérifiées sont visibles
3. Filtrage automatique appliqué
```

## Sécurité et Contrôles

### Contrôles d'Accès
- **Inscription:** Public (rate-limited)
- **Validation:** Admin/Super-admin uniquement
- **Consultation des offres:** Utilisateurs authentifiés

### Validations
- Vérification de l'unicité de l'email
- Validation de la force du mot de passe
- Vérification des IDs de référence (secteur, taille, localisation)
- Contrôles de cohérence des données

### Rate Limiting
- Inscription compagnies: 5 requêtes par 5 minutes
- Autres endpoints selon configuration existante

## APIs Disponibles

### Authentification
- `POST /auth/register/company` - Inscription compagnie

### Gestion des Compagnies
- `GET /companies/pending-verification` - Compagnies en attente
- `PATCH /companies/:id/validate` - Valider/rejeter
- `GET /companies/verified` - Compagnies vérifiées

### Offres d'Emploi (Modifiées)
- `GET /job-offers` - Offres publiées (filtrées)
- `GET /job-offers/paginated` - Offres avec pagination (filtrées)
- `POST /job-offers` - Créer offre (avec vérification)
- `PATCH /job-offers/:id/publish` - Publier offre (avec vérification)

## Notifications et Communications

### Emails Automatiques
- Vérification d'email pour les compagnies
- Notification aux admins pour nouvelles inscriptions
- Confirmation de validation/rejet (à implémenter)

### Messages de Statut
- Messages clairs pour les différents états de validation
- Erreurs explicites en cas de refus de publication

## Intégration avec le Système Existant

### Compatibilité
- Utilise les entités et services existants
- S'intègre avec le système de rôles existant
- Compatible avec les filtres et recherches existants

### Extensions Futures Possibles
- Système de notifications en temps réel
- Dashboard administrateur pour la gestion des compagnies
- Statistiques de validation et performance
- Système de commentaires pour les validations
- Historique des modifications de statut

## Configuration Requise

### Variables d'Environnement
- Configuration JWT existante
- Configuration email existante
- Configuration de rate limiting

### Base de Données
- Utilise les tables existantes (companies, users, job_offers)
- Aucune migration supplémentaire requise

## Tests et Validation

### Points de Test Recommandés
1. Inscription compagnie avec données valides/invalides
2. Validation/rejet par administrateurs
3. Tentative de publication d'offres par compagnies non vérifiées
4. Filtrage des offres selon le statut de vérification
5. Contrôles d'accès pour chaque endpoint

### Scénarios de Test
1. **Flux complet:** Inscription → Validation → Publication d'offre
2. **Rejet:** Inscription → Rejet → Tentative de publication (échec)
3. **Sécurité:** Tentatives d'accès non autorisées
4. **Performance:** Charge sur les endpoints publics

Ce système assure un contrôle qualité des compagnies avant qu'elles puissent interagir avec les candidats, tout en maintenant une expérience utilisateur fluide et sécurisée. 