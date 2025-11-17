# 📊 API de Statistiques - Documentation Complète

Ce document contient la documentation complète de toutes les API de statistiques disponibles dans l'application MEPS.

## 🔐 Authentification Requise

- **Token JWT** : Obligatoire dans l'en-tête `Authorization: Bearer <token>`
- **Rôles autorisés** : `ADMIN` ou `SUPER_ADMIN` uniquement
- **Base URL** : `/api/statistics`

---

## 📋 Liste Complète des Endpoints

### 1. **GET** `/api/statistics/overview`
**Description** : Obtenir toutes les statistiques globales - vue d'ensemble complète

**Paramètres de requête** (tous optionnels) :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |
| `includeLocationStats` | boolean | Inclure stats par localisation | `true`, `false` | `true` |
| `includeActivitySectorStats` | boolean | Inclure stats par secteur | `true`, `false` | `true` |
| `includeDisabilityStats` | boolean | Inclure stats par handicap | `true`, `false` | `true` |

**Retourne** : `OverallStatisticsDto` - Toutes les statistiques avec détails complets

---

### 2. **GET** `/api/statistics/dashboard`
**Description** : Métriques clés pour le tableau de bord administrateur

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `DashboardMetricsDto` - Métriques essentielles pour tableau de bord

---

### 3. **GET** `/api/statistics/growth`
**Description** : Données de croissance sous forme de séries temporelles pour graphiques

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `GrowthStatisticsDto` - Données temporelles pour graphiques de croissance

---

### 4. **GET** `/api/statistics/candidates`
**Description** : Statistiques détaillées concernant les candidats uniquement

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `CandidateStatisticsDto` - Statistiques détaillées des candidats

---

### 5. **GET** `/api/statistics/companies`
**Description** : Statistiques détaillées concernant les entreprises uniquement

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |

**Retourne** : `CompanyStatisticsDto` - Statistiques détaillées des entreprises

---

### 6. **GET** `/api/statistics/ngos`
**Description** : Statistiques détaillées concernant les ONG uniquement

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |

**Retourne** : `NgoStatisticsDto` - Statistiques détaillées des ONG

---

### 7. **GET** `/api/statistics/job-offers`
**Description** : Statistiques détaillées concernant les offres d'emploi uniquement

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |

**Retourne** : `JobOfferStatisticsDto` - Statistiques détaillées des offres d'emploi

---

### 8. **GET** `/api/statistics/applications`
**Description** : Statistiques détaillées concernant les candidatures uniquement

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `ApplicationStatisticsDto` - Statistiques détaillées des candidatures

---

### 9. **GET** `/api/statistics/disabilities`
**Description** : Répartition des candidats par type de handicap avec pourcentages

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |

**Retourne** : `DisabilityStatisticsDto[]` - Array de statistiques par type de handicap

---

### 10. **GET** `/api/statistics/locations`
**Description** : Répartition géographique des utilisateurs par localisation

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `LocationStatisticsDto[]` - Array de statistiques par localisation

---

### 11. **GET** `/api/statistics/activity-sectors`
**Description** : Répartition des entreprises et offres par secteur d'activité

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |

**Retourne** : `ActivitySectorStatisticsDto[]` - Array de statistiques par secteur

---

### 12. **GET** `/api/statistics/export`
**Description** : Export complet des statistiques avec métadonnées pour analyse externe

**Paramètres de requête** :
| Paramètre | Type | Description | Valeurs possibles | Défaut |
|-----------|------|-------------|-------------------|---------|
| `period` | enum | Période d'analyse | `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `last_year`, `all_time`, `custom` | `all_time` |
| `startDate` | string | Date de début (format YYYY-MM-DD) | Date valide | - |
| `endDate` | string | Date de fin (format YYYY-MM-DD) | Date valide | - |
| `locationId` | string | Filtrer par localisation | UUID de localisation | - |
| `activitySectorId` | string | Filtrer par secteur d'activité | UUID de secteur | - |
| `disabilityTypeId` | string | Filtrer par type de handicap | UUID de type handicap | - |
| `includeLocationStats` | boolean | Inclure stats par localisation | `true`, `false` | `true` |
| `includeActivitySectorStats` | boolean | Inclure stats par secteur | `true`, `false` | `true` |
| `includeDisabilityStats` | boolean | Inclure stats par handicap | `true`, `false` | `true` |

**Retourne** : Export complet avec métadonnées

---

## 🔄 Exemples d'Utilisation

### 1. Statistiques globales pour les 30 derniers jours
```http
GET /api/statistics/overview?period=last_30_days
Authorization: Bearer <your_jwt_token>
```

### 2. Statistiques filtrées par localisation et secteur
```http
GET /api/statistics/overview?locationId=uuid-location&activitySectorId=uuid-sector&period=last_3_months
Authorization: Bearer <your_jwt_token>
```

### 3. Métriques du tableau de bord
```http
GET /api/statistics/dashboard?period=all_time
Authorization: Bearer <your_jwt_token>
```

### 4. Données de croissance pour graphiques
```http
GET /api/statistics/growth?period=last_year
Authorization: Bearer <your_jwt_token>
```

### 5. Export personnalisé avec dates spécifiques
```http
GET /api/statistics/export?period=custom&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <your_jwt_token>
```

### 6. Répartition par handicap pour une région
```http
GET /api/statistics/disabilities?locationId=uuid-location&period=all_time
Authorization: Bearer <your_jwt_token>
```

---

## 📝 Notes Importantes

### Gestion des Dates
- **Format requis** : YYYY-MM-DD (ex: 2024-12-31)
- **Dates personnalisées** : Utilisez `period=custom` avec `startDate` et `endDate`
- **Validation** : Les dates doivent être valides et logiques (startDate < endDate)

### Filtres
- **Combinables** : Tous les filtres peuvent être utilisés ensemble
- **UUIDs** : Tous les IDs doivent être des UUIDs valides
- **Optionnels** : Tous les filtres sont optionnels

### Paramètres Booléens
- **Formats acceptés** : `true`/`false` ou `"true"`/`"false"`
- **Valeurs par défaut** : Les paramètres `include*Stats` sont à `true` par défaut

### Périodes Prédéfinies
- `last_7_days` : 7 derniers jours
- `last_30_days` : 30 derniers jours
- `last_3_months` : 3 derniers mois
- `last_6_months` : 6 derniers mois
- `last_year` : 12 derniers mois
- `all_time` : Toutes les données (défaut)
- `custom` : Période personnalisée avec startDate/endDate

### Gestion des Erreurs
- **401 Unauthorized** : Token JWT manquant ou invalide
- **403 Forbidden** : Rôle insuffisant (pas ADMIN/SUPER_ADMIN)
- **400 Bad Request** : Paramètres invalides
- **500 Internal Server Error** : Erreur serveur

---

## 🚀 Utilisation Recommandée

### Pour un Tableau de Bord
1. Utilisez `/dashboard` pour les métriques clés
2. Utilisez `/growth` pour les graphiques temporels
3. Utilisez les endpoints spécifiques pour les détails

### Pour des Rapports
1. Utilisez `/overview` pour une vue complète
2. Utilisez `/export` pour les données d'analyse
3. Filtrez par période selon vos besoins

### Pour des Analyses Spécifiques
1. Utilisez les endpoints spécialisés (`/candidates`, `/companies`, etc.)
2. Combinez les filtres pour cibler vos analyses
3. Utilisez les données de répartition pour les insights démographiques

---

## 🔧 Performance et Optimisation

- **Requêtes parallèles** : Le service utilise des requêtes parallèles pour optimiser les performances
- **Mise en cache** : Considérez la mise en cache côté client pour les données fréquemment demandées
- **Pagination** : Pour de gros volumes, utilisez des filtres pour limiter les résultats
- **Monitoring** : Surveillez les temps de réponse pour les requêtes complexes 