# Module de Statistiques

Ce module fournit des statistiques complètes pour l'application MEPS (Mise en Emploi des Personnes en Situation de Handicap). Il permet aux administrateurs d'obtenir des insights détaillés sur l'utilisation de la plateforme et les tendances d'emploi.

## Fonctionnalités

### 📊 Statistiques Globales
- Vue d'ensemble complète de toutes les métriques importantes
- Données agrégées par période (7 jours, 30 jours, 3 mois, 6 mois, 1 an, ou personnalisée)
- Filtrage par localisation, secteur d'activité, ou type de handicap

### 👥 Statistiques des Candidats
- Nombre total de candidats inscrits
- Candidats actifs vs inactifs
- Candidats avec profil complet
- Candidats disponibles pour un emploi
- Candidats gérés par des ONG
- Répartition par type de handicap avec pourcentages

### 🏢 Statistiques des Entreprises
- Nombre total d'entreprises inscrites
- Entreprises vérifiées vs non vérifiées
- Entreprises actives
- Entreprises autorisées à publier des offres
- Entreprises soumises au quota de handicap
- Entreprises en conformité légale

### 🏛️ Statistiques des ONG
- Nombre total d'ONG inscrites
- ONG vérifiées et actives
- ONG autorisées à soutenir des candidats
- Total des candidats soutenus
- Total des placements réussis

### 💼 Statistiques des Offres d'Emploi
- Nombre total d'offres
- Répartition par statut (publiées, brouillon, pause, fermées, expirées)
- Offres adaptées aux handicaps
- Offres exclusives aux personnes handicapées
- Offres avec travail à distance/hybride

### 📋 Statistiques des Candidatures
- Nombre total de candidatures
- Répartition par statut (soumises, en cours d'examen, sélectionnées, rejetées, etc.)
- Candidatures avec embauche confirmée
- Temps moyen de traitement

### 📈 Données de Croissance
- Évolution des inscriptions (candidats, entreprises)
- Évolution des publications d'offres
- Évolution des candidatures
- Données en série temporelle pour les graphiques

### 🌍 Statistiques Géographiques
- Répartition par localisation
- Nombre de candidats, entreprises, ONG et offres par région

### 🏭 Statistiques par Secteur
- Répartition des entreprises par secteur d'activité
- Nombre d'offres d'emploi par secteur

## Endpoints API

### GET /api/statistics/overview
Retourne toutes les statistiques globales avec filtres optionnels.

**Paramètres de requête :**
- `period` : Période d'analyse (last_7_days, last_30_days, last_3_months, last_6_months, last_year, all_time, custom)
- `startDate` : Date de début pour période personnalisée (YYYY-MM-DD)
- `endDate` : Date de fin pour période personnalisée (YYYY-MM-DD)
- `locationId` : Filtrer par localisation
- `activitySectorId` : Filtrer par secteur d'activité
- `disabilityTypeId` : Filtrer par type de handicap
- `includeLocationStats` : Inclure statistiques par localisation (true/false)
- `includeActivitySectorStats` : Inclure statistiques par secteur (true/false)
- `includeDisabilityStats` : Inclure statistiques par handicap (true/false)

### GET /api/statistics/dashboard
Retourne les métriques clés pour le tableau de bord administrateur.

### GET /api/statistics/growth
Retourne les données de croissance en série temporelle pour les graphiques.

### GET /api/statistics/candidates
Retourne uniquement les statistiques des candidats.

### GET /api/statistics/companies
Retourne uniquement les statistiques des entreprises.

### GET /api/statistics/ngos
Retourne uniquement les statistiques des ONG.

### GET /api/statistics/job-offers
Retourne uniquement les statistiques des offres d'emploi.

### GET /api/statistics/applications
Retourne uniquement les statistiques des candidatures.

### GET /api/statistics/disabilities
Retourne la répartition des candidats par type de handicap.

### GET /api/statistics/locations
Retourne la répartition géographique des utilisateurs.

### GET /api/statistics/activity-sectors
Retourne la répartition par secteur d'activité.

### GET /api/statistics/export
Génère un export complet des statistiques avec métadonnées.

## Authentification

Tous les endpoints nécessitent :
- Authentification JWT valide
- Rôle administrateur (ADMIN ou SUPER_ADMIN)

## Exemples d'utilisation

### Statistiques globales pour les 30 derniers jours
```http
GET /api/statistics/overview?period=last_30_days
```

### Statistiques filtrées par localisation
```http
GET /api/statistics/overview?locationId=uuid-location&period=last_3_months
```

### Métriques du tableau de bord
```http
GET /api/statistics/dashboard?period=all_time
```

### Données de croissance pour graphiques
```http
GET /api/statistics/growth?period=last_year
```

### Export personnalisé
```http
GET /api/statistics/export?startDate=2024-01-01&endDate=2024-12-31&period=custom
```

## Structure des Données

### Exemple de réponse pour /overview
```json
{
  "candidates": {
    "totalCandidates": 150,
    "activeCandidates": 120,
    "inactiveCandidates": 30,
    "candidatesWithCompleteProfile": 100,
    "availableCandidates": 90,
    "candidatesManagedByNgo": 45
  },
  "companies": {
    "totalCompanies": 75,
    "verifiedCompanies": 60,
    "unverifiedCompanies": 15,
    "activeCompanies": 70,
    "companiesCanPostJobs": 65,
    "companiesSubjectToQuota": 25,
    "compliantCompanies": 20
  },
  "disabilityStatistics": [
    {
      "disabilityTypeName": "Handicap moteur",
      "count": 60,
      "percentage": 40.0
    }
  ],
  "locationStatistics": [
    {
      "locationName": "Abidjan",
      "candidatesCount": 80,
      "companiesCount": 40,
      "ngosCount": 5,
      "jobOffersCount": 120
    }
  ],
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Performance

Le module est optimisé pour :
- Requêtes parallèles pour améliorer les temps de réponse
- Mise en cache des résultats fréquemment demandés
- Requêtes SQL optimisées avec agrégations
- Support de la pagination pour les grandes données

## Sécurité

- Accès restreint aux administrateurs uniquement
- Validation des paramètres d'entrée
- Protection contre l'injection SQL
- Logs d'audit des accès aux statistiques

## Développement Futur

- Mise en cache Redis pour améliorer les performances
- Statistiques en temps réel avec WebSockets
- Exports en différents formats (CSV, Excel, PDF)
- Notifications automatiques sur les tendances importantes
- API de webhook pour intégrations externes 