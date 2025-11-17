# Module Candidates

Ce module gère les profils des candidats (personnes en situation de handicap) dans le système MEPS.

## Structure du Module

### Entités
- **Candidate** : Entité principale représentant un profil de candidat
- Relations avec : User, DisabilityType, EducationLevel, ExperienceLevel, Location

### DTOs (Data Transfer Objects)

#### DTOs de Requête
- **CreateCandidateDto** : Pour la création d'un nouveau profil candidat
- **UpdateCandidateDto** : Pour la mise à jour d'un profil existant
- **CandidatePageQueryDto** : Pour les requêtes paginées avec filtres

#### DTOs de Réponse
- **CandidateResponseDto** : Réponse complète avec toutes les informations du candidat
- **UserResponseDto** : Informations utilisateur dans la réponse candidat
- **DisabilityTypeResponseDto** : Informations sur le type de handicap
- **EducationLevelResponseDto** : Informations sur le niveau d'éducation
- **ExperienceLevelResponseDto** : Informations sur le niveau d'expérience
- **LocationResponseDto** : Informations sur la localisation
- **PagedCandidatesResponseDto** : Réponse paginée avec métadonnées
- **CandidateStatsDto** : Statistiques des candidats
- **BulkOperationResponseDto** : Réponse pour les opérations en lot

## Endpoints API

### GET /candidates
Récupère les candidats avec pagination et filtres avancés.

**Paramètres de requête :**
- `page` : Numéro de page (défaut: 1)
- `size` : Taille de page (défaut: 10, max: 100)
- `search` : Recherche textuelle
- `isActive` : Filtre par statut actif
- `isProfileComplete` : Filtre par profil complet (≥80%)
- `isAvailable` : Filtre par disponibilité
- `disabilityTypeId` : Filtre par type de handicap
- `educationLevelId` : Filtre par niveau d'éducation
- `experienceLevelId` : Filtre par niveau d'expérience
- `locationId` : Filtre par localisation
- `hasCv` : Filtre par présence de CV
- `hasVideoPresentation` : Filtre par présence de vidéo

### GET /candidates/all
Récupère tous les candidats actifs (accès restreint).

### GET /candidates/profile
Récupère le profil du candidat authentifié.

### GET /candidates/stats
Récupère les statistiques des candidats (accès restreint).

### GET /candidates/:id
Récupère un candidat spécifique par ID.

### POST /candidates
Crée un nouveau profil candidat.

### PATCH /candidates/:id
Met à jour un profil candidat existant.

### PATCH /candidates/:id/profile-completion
Recalcule le pourcentage de complétion du profil.

### DELETE /candidates/:id
Suppression logique d'un profil candidat (accès restreint).

## Calcul de Complétion du Profil

Le pourcentage de complétion est calculé sur 12 champs importants :

### Informations de base (33% - 4 champs)
- Type de handicap (obligatoire)
- Niveau d'éducation
- Niveau d'expérience
- Localisation

### Informations professionnelles (33% - 4 champs)
- Résumé professionnel
- Compétences
- Langues
- CV uploadé

### Informations supplémentaires (34% - 4 champs)
- Biographie
- Photo de profil
- Présentation vidéo
- Salaire minimum attendu

**Profil complet :** ≥ 80% de complétion

## Validation des Données

### Champs Obligatoires
- `disabilityTypeId` : UUID du type de handicap

### Contraintes de Validation
- URLs valides pour les fichiers (CV, photo, vidéo)
- Salaires positifs
- Dates au format ISO
- Longueurs maximales pour les textes :
  - Description du handicap : 1000 caractères
  - Résumé professionnel : 2000 caractères
  - Biographie : 3000 caractères

## Sécurité et Autorisations

### Rôles Autorisés
- **Lecture complète** : admin, super-admin, company, ngo, ministry
- **Statistiques** : admin, super-admin, ministry
- **Suppression** : admin, super-admin
- **Profil personnel** : candidat authentifié

### Authentification
- JWT Bearer Token requis pour tous les endpoints
- Validation des rôles via Guards

## Exemples d'Utilisation

### Création d'un Profil Complet
```json
{
  "disabilityTypeId": "123e4567-e89b-12d3-a456-426614174000",
  "disabilityDescription": "Déficience motrice affectant les membres inférieurs",
  "educationLevelId": "456e7890-e89b-12d3-a456-426614174000",
  "experienceLevelId": "789e0123-e89b-12d3-a456-426614174000",
  "professionalSummary": "Développeur logiciel expérimenté avec 5+ années d'expérience",
  "skills": "[\"JavaScript\", \"TypeScript\", \"React\", \"Node.js\"]",
  "languages": "[\"Français (Natif)\", \"Anglais (Courant)\"]",
  "locationId": "012e3456-e89b-12d3-a456-426614174000",
  "cvFileUrl": "https://storage.example.com/cvs/candidate-cv.pdf",
  "photoUrl": "https://storage.example.com/photos/candidate-photo.jpg",
  "videoPresentation": "https://storage.example.com/videos/presentation.mp4",
  "biography": "Passionné par la création de solutions technologiques inclusives...",
  "expectedSalaryMin": 450000,
  "expectedSalaryMax": 650000,
  "isAvailable": true,
  "availabilityDate": "2024-02-01"
}
```

### Recherche avec Filtres
```
GET /candidates?search=développeur&isProfileComplete=true&hasCv=true&page=1&size=20
```

### Mise à Jour Partielle
```json
{
  "professionalSummary": "Développeur senior avec 8+ années d'expérience",
  "expectedSalaryMin": 550000,
  "expectedSalaryMax": 750000
}
```

## Gestion des Erreurs

### Codes de Statut HTTP
- **200** : Succès
- **201** : Créé avec succès
- **400** : Données invalides ou erreur de validation
- **401** : Non authentifié
- **403** : Accès interdit
- **404** : Ressource non trouvée

### Messages d'Erreur Typiques
- "Candidate profile already exists for this user"
- "Disability type is required"
- "Page number must be greater than 0"
- "Page size must be between 1 and 100"
- "Candidate not found with the specified ID"

## Performance et Optimisation

### Indexation Recommandée
- Index sur `userId` pour les recherches par utilisateur
- Index sur `isActive` pour les filtres de statut
- Index sur `profileCompletionPercentage` pour le tri
- Index composite sur les champs de filtre fréquents

### Pagination
- Taille de page limitée à 100 éléments maximum
- Tri par défaut : pourcentage de complétion (DESC) puis date de création (DESC)

### Relations
- Utilisation de `leftJoinAndSelect` pour charger les entités liées
- Optimisation des requêtes avec QueryBuilder pour les filtres complexes 