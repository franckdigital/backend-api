# Module Professions

Ce module gère les différentes professions disponibles dans le système MEPS pour catégoriser les candidats selon leur domaine professionnel.

## Structure du Module

### Entité
- **Profession** : Entité représentant une profession avec nom, description, statut actif et ordre de tri

### DTOs (Data Transfer Objects)

#### DTOs de Requête
- **CreateProfessionDto** : Pour la création d'une nouvelle profession
- **UpdateProfessionDto** : Pour la mise à jour d'une profession existante
- **ProfessionPageQueryDto** : Pour les requêtes paginées avec filtres

#### DTOs de Réponse
- **ProfessionResponseDto** : Réponse complète avec toutes les informations de la profession
- **PagedProfessionsResponseDto** : Réponse paginée avec métadonnées

## Endpoints API

### GET /professions
Récupère les professions avec pagination et filtres.

**Paramètres de requête :**
- `page` : Numéro de page (défaut: 1)
- `size` : Taille de page (défaut: 10, max: 100)
- `search` : Recherche textuelle dans le nom et la description
- `isActive` : Filtre par statut actif

### GET /professions/all
Récupère toutes les professions actives (nécessite authentification).

### GET /professions/complete
Récupère toutes les professions actives (endpoint public).

### GET /professions/:id
Récupère une profession spécifique par son ID.

### POST /professions
Crée une nouvelle profession (nécessite rôle admin ou super-admin).

### PATCH /professions/:id
Met à jour une profession existante (nécessite rôle admin ou super-admin).

### DELETE /professions/:id
Suppression logique d'une profession (nécessite rôle admin ou super-admin).

## Sécurité

- **Authentification** : JWT requis pour tous les endpoints sauf `/professions/complete`
- **Autorisation** : 
  - Lecture : Tous les utilisateurs authentifiés
  - Création/Modification/Suppression : Rôles admin et super-admin uniquement

## Utilisation dans le Module Candidates

Le champ `professionId` a été ajouté à l'entité `Candidate` pour permettre de renseigner la profession d'un candidat. Cette relation permet :

- De filtrer les candidats par profession
- D'afficher la profession dans les profils candidats
- De générer des statistiques par profession

## Données de Base

Le système inclut des professions pré-définies couvrant les domaines :
- Informatique et technologie
- Administration et gestion
- Commerce et marketing
- Services et support

Ces données peuvent être étendues via l'interface d'administration.

## Migration

Trois migrations ont été créées :
1. `CreateProfessionsTable` : Création de la table professions
2. `SeedProfessionsData` : Insertion des données de base
3. `AddProfessionToCandidate` : Ajout du champ professionId à la table candidates 