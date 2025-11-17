# NGO Module

Ce module gère les ONGs (Organisations Non Gouvernementales) et leur capacité à créer et gérer des candidats associés.

## Fonctionnalités

### 1. Inscription des ONGs
- Endpoint: `POST /auth/register/ngo`
- Permet aux ONGs de s'inscrire avec leurs informations organisationnelles
- Crée automatiquement un compte utilisateur pour le représentant de l'ONG
- Génère un mot de passe sécurisé si non fourni

### 2. Gestion du profil ONG
- Endpoint: `GET /ngos/profile` - Récupérer le profil de l'ONG authentifiée
- Endpoint: `GET /ngos/:id` - Récupérer les détails d'une ONG par ID
- Endpoint: `POST /ngos` - Créer un profil ONG (pour utilisateurs existants)

### 3. Gestion des candidats par les ONGs
- Endpoint: `POST /ngos/candidates` - Créer un candidat associé à l'ONG
- Endpoint: `GET /ngos/candidates` - Récupérer tous les candidats de l'ONG authentifiée
- Endpoint: `GET /ngos/:ngoId/candidates` - Récupérer les candidats d'une ONG spécifique

## Entités

### NGO Entity
- Informations organisationnelles (nom, numéro d'enregistrement, mission, etc.)
- Contacts (primaire et secondaire)
- Localisation et zones de service
- Domaines d'activité et types de handicaps supportés
- Services offerts (formation, conseil, support légal, etc.)
- Statistiques (candidats supportés, placements réussis, etc.)

### Relation avec Candidate Entity
- Un candidat peut être associé à une ONG (`ngoId`)
- Flag `isManagedByNgo` pour indiquer si le candidat est géré par une ONG
- Relation Many-to-One entre Candidate et NGO

## DTOs

### Inscription
- `RegisterNgoDto` - Données complètes pour l'inscription d'une ONG
- `NgoRegistrationResponseDto` - Réponse d'inscription avec détails utilisateur et ONG

### Gestion ONG
- `CreateNgoDto` - Création de profil ONG
- `NgoResponseDto` - Réponse complète avec toutes les relations

### Gestion candidats
- `CreateNgoCandidateDto` - Création de candidat par une ONG
- Support des uploads de fichiers (photo, CV, certificat de handicap, etc.)

## Sécurité

- Authentification JWT requise pour tous les endpoints (sauf inscription)
- Rate limiting sur les endpoints sensibles
- Validation complète des données d'entrée
- Vérification des permissions (seules les ONGs peuvent créer des candidats)

## Workflow d'utilisation

1. **Inscription ONG**: L'ONG s'inscrit via `/auth/register/ngo`
2. **Connexion**: L'ONG se connecte avec ses identifiants
3. **Gestion candidats**: L'ONG peut créer et gérer ses candidats
4. **Candidatures**: Les candidats créés par l'ONG peuvent postuler aux offres
5. **Suivi**: L'ONG peut suivre les candidatures de ses candidats

## Relations avec autres modules

- **Users**: Chaque ONG a un utilisateur associé
- **Candidates**: Les ONGs peuvent créer et gérer des candidats
- **Locations**: Localisation de l'ONG et zones de service
- **ActivitySectors**: Domaines d'activité de l'ONG
- **DisabilityTypes**: Types de handicaps supportés par l'ONG
- **Applications**: Les candidats de l'ONG peuvent postuler aux offres

## TODO

- [ ] Implémenter l'envoi d'emails de bienvenue
- [ ] Ajouter la vérification par email
- [ ] Implémenter la gestion des fichiers uploadés
- [ ] Ajouter des endpoints pour modifier les profils
- [ ] Implémenter la recherche et filtrage des ONGs
- [ ] Ajouter des statistiques détaillées pour les ONGs 