# API d'inscription des candidats MEPS

## Vue d'ensemble

Cette API permet l'inscription complète des candidats dans le système MEPS, créant à la fois un compte utilisateur et un profil de candidat avec toutes les informations spécifiques aux personnes en situation de handicap.

## Endpoint

```
POST /auth/register/candidate
```

## Fonctionnalités

### ✅ **Informations utilisateur de base**

- Nom, prénom, email
- Contacts primaire et secondaire
- Sexe, date de naissance
- Adresse, profession
- Mot de passe (optionnel)

### ✅ **Informations spécifiques au handicap**

- Type de handicap (obligatoire)
- Description détaillée du handicap

### ✅ **Informations professionnelles**

- Niveau d'éducation
- Niveau d'expérience
- Résumé professionnel
- Compétences (format JSON)
- Langues parlées (format JSON)

### ✅ **Préférences et localisation**

- Localisation préférée
- Salaire attendu (min/max)
- Disponibilité et date de disponibilité

### ✅ **Upload de fichiers**

- Photo de profil
- CV/Curriculum Vitae
- Vidéo de présentation
- Certificat de handicap
- Fichiers de portfolio (jusqu'à 5)

## Format de la requête

### Content-Type

```
multipart/form-data
```

### Champs obligatoires

- `firstName` (string)
- `lastName` (string)
- `email` (string)
- `disabilityTypeId` (UUID)

### Champs optionnels

- `password` (string, min 6 caractères)
- `contact` (string)
- `secondaryContact` (string)
- `sex` (string)
- `birthDate` (date, format: YYYY-MM-DD)
- `address` (string)
- `profession` (string)
- `disabilityDescription` (string)
- `educationLevelId` (UUID)
- `experienceLevelId` (UUID)
- `professionalSummary` (string)
- `skills` (JSON string)
- `languages` (JSON string)
- `locationId` (UUID)
- `biography` (string)
- `videoPresentation` (string)
- `expectedSalaryMin` (number)
- `expectedSalaryMax` (number)
- `isAvailable` (boolean)
- `availabilityDate` (date)

### Fichiers

- `profilePhoto` (image)
- `cvFile` (PDF, DOC, DOCX)
- `videoFile` (MP4, MOV, AVI - vidéo de présentation)
- `disabilityCertificate` (PDF, image)
- `portfolioFiles` (jusqu'à 5 fichiers)

## Exemple de requête

```bash
curl -X POST http://localhost:3000/auth/register/candidate \
  -F "firstName=Jean" \
  -F "lastName=Dupont" \
  -F "email=jean.dupont@example.com" \
  -F "password=MotDePasse123!" \
  -F "contact=+237123456789" \
  -F "disabilityTypeId=uuid-disability-type-id" \
  -F "disabilityDescription=Mobilité réduite des membres inférieurs" \
  -F "profession=Développeur informatique" \
  -F "skills=[\"JavaScript\", \"TypeScript\", \"React\", \"Node.js\"]" \
  -F "locationId=uuid-location-id" \
  -F "expectedSalaryMin=500000" \
  -F "expectedSalaryMax=750000" \
  -F "profilePhoto=@/path/to/photo.jpg" \
  -F "cvFile=@/path/to/cv.pdf" \
  -F "videoFile=@/path/to/presentation.mp4"
```

## Réponse de l'API

### Succès (201 Created)

```json
{
  "id": "uuid-candidate-id",
  "userId": "uuid-user-id",
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid-user-id",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "userType": "candidate",
    "isActive": true,
    "isEmailVerified": false,
    "isVerified": false,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "disabilityTypeId": "uuid-disability-type-id",
  "disabilityDescription": "Mobilité réduite des membres inférieurs",
  "professionalSummary": null,
  "skills": "[\"JavaScript\", \"TypeScript\", \"React\", \"Node.js\"]",
  "profileCompletionPercentage": 58,
  "isProfileComplete": false,
  "isAvailable": true,
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Erreur (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "User with this email already exists",
  "error": "Bad Request"
}
```

## Flux d'inscription

1. **Validation des données** - Vérification des champs obligatoires et formats
2. **Vérification d'unicité** - S'assurer que l'email n'est pas déjà utilisé
3. **Upload des fichiers** - Stockage sécurisé des fichiers uploadés
4. **Création utilisateur** - Création du compte utilisateur de base
5. **Création profil candidat** - Création du profil candidat détaillé
6. **Calcul de complétude** - Calcul automatique du pourcentage de profil complété
7. **Notification email** - Envoi d'email de vérification ou de notification

## Sécurité

- **Rate limiting** : 10 requêtes par 5 minutes
- **Validation des fichiers** : Type et taille limités
- **Sanitisation des données** : Nettoyage automatique des entrées
- **Hachage des mots de passe** : Bcrypt avec salt
- **Tokens sécurisés** : JWT pour l'authentification

## États du compte

### Avec mot de passe

- Compte actif immédiatement
- Email de vérification envoyé
- Connexion possible après vérification email

### Sans mot de passe

- Compte inactif en attente de validation
- Email de notification envoyé
- Mot de passe généré lors de la validation par un administrateur

## Calcul de complétude du profil

Le pourcentage de complétude est calculé automatiquement basé sur :

- **Informations de base** (4 points) : Type de handicap, niveau d'éducation, niveau d'expérience, localisation
- **Informations professionnelles** (4 points) : Résumé professionnel, compétences, langues, CV
- **Informations supplémentaires** (4 points) : Biographie, photo, vidéo de présentation, salaire attendu

**Profil considéré comme complet** : ≥ 80% (10/12 points)

## Documentation Swagger

L'API est entièrement documentée dans Swagger UI accessible à `/api`