# Applications Module

Ce module gère les candidatures pour les offres d'emploi dans la plateforme MEPS. Il permet aux candidats et aux ONG de postuler aux offres des entreprises, et aux entreprises de gérer ces candidatures.

## Fonctionnalités

### Pour les Candidats et ONG
- ✅ Postuler à une offre d'emploi
- ✅ Télécharger des documents (CV, pièces jointes)
- ✅ Ajouter une lettre de motivation et de présentation
- ✅ Spécifier les besoins d'accessibilité et de support
- ✅ Retirer une candidature avant traitement
- ✅ Consulter le statut de leurs candidatures
- ✅ Ajouter des commentaires/feedback

### Pour les Entreprises
- ✅ Consulter toutes les candidatures pour leurs offres
- ✅ Mettre à jour le statut des candidatures
- ✅ Programmer des entretiens
- ✅ Ajouter des évaluations et commentaires
- ✅ Proposer des conditions d'emploi
- ✅ Marquer les candidats comme embauchés
- ✅ Voir les statistiques des candidatures

## Structure du Module

```
applications/
├── dto/
│   ├── create-application.dto.ts      # DTO pour créer une candidature
│   ├── update-application-status.dto.ts # DTO pour mettre à jour le statut
│   ├── application-query.dto.ts       # DTO pour les requêtes de filtrage
│   ├── application-response.dto.ts    # DTO pour les réponses API
│   └── add-feedback.dto.ts           # DTO pour ajouter du feedback
├── applications.controller.ts         # Contrôleur REST API
├── applications.service.ts           # Logique métier
├── applications.module.ts            # Module NestJS
└── README.md                         # Cette documentation
```

## Endpoints API

### Créer une candidature
```http
POST /applications
Content-Type: multipart/form-data

{
  "jobOfferId": "uuid",
  "candidateId": "uuid",
  "supportingNgoId": "uuid", // optionnel
  "coverLetter": "string",
  "motivationLetter": "string",
  "portfolioUrl": "string",
  "needsAccessibilitySupport": boolean,
  "cv": file,
  "attachments": [files]
}
```

### Lister les candidatures avec filtres
```http
GET /applications?jobOfferId=uuid&status=submitted&page=1&limit=10
```

### Obtenir une candidature spécifique
```http
GET /applications/:id
```

### Mettre à jour le statut (Entreprise)
```http
PATCH /applications/:id/status
{
  "status": "shortlisted",
  "statusNotes": "Candidate meets requirements",
  "interviewScheduledAt": "2024-01-20T14:00:00Z",
  "interviewLocation": "Office Room 205"
}
```

### Candidatures par offre d'emploi
```http
GET /applications/job-offer/:jobOfferId
```

### Candidatures par candidat
```http
GET /applications/candidate/:candidateId
```

### Candidatures par ONG
```http
GET /applications/ngo/:ngoId
```

### Retirer une candidature
```http
DELETE /applications/:id/withdraw
{
  "userId": "uuid"
}
```

### Ajouter un feedback
```http
POST /applications/:id/feedback
{
  "feedback": "Great technical skills demonstrated",
  "feedbackType": "employer"
}
```

### Statistiques
```http
GET /applications/statistics?jobOfferId=uuid
```

## Statuts des Candidatures

| Statut | Description |
|--------|-------------|
| `submitted` | Candidature soumise (statut initial) |
| `under_review` | En cours d'examen |
| `shortlisted` | Présélectionnée |
| `interview_scheduled` | Entretien programmé |
| `interviewed` | Entretien effectué |
| `selected` | Candidat sélectionné |
| `rejected` | Candidature rejetée |
| `withdrawn` | Candidature retirée |

## Permissions Requises

- `applications:create` - Créer une candidature
- `applications:read` - Lire les candidatures
- `applications:update` - Mettre à jour le statut/feedback
- `applications:delete` - Retirer une candidature

## Services Disponibles

### ApplicationsService

#### Méthodes principales
- `create(dto)` - Créer une candidature
- `updateStatus(id, dto)` - Mettre à jour le statut
- `findOne(id)` - Obtenir une candidature
- `findWithFilters(query)` - Chercher avec filtres
- `findByJobOffer(jobOfferId)` - Par offre d'emploi
- `findByCandidate(candidateId)` - Par candidat
- `findByNgo(ngoId)` - Par ONG
- `withdraw(id, userId)` - Retirer une candidature
- `addFeedback(id, feedback, type)` - Ajouter feedback
- `getStatistics(filters)` - Obtenir statistiques

## Gestion des Fichiers

Le module prend en charge le téléchargement de fichiers via Cloudflare R2 :
- CV principal
- Documents annexes (diplômes, certifications, etc.)
- Limite de 10 fichiers par candidature
- Types supportés : PDF, DOC, DOCX, JPG, PNG

## Métriques et Analytiques

Le système calcule automatiquement :
- Temps de réponse (premier changement de statut)
- Temps de décision (décision finale)
- Taux de conversion (embauches/candidatures)
- Statistiques par statut

## Exemples d'Usage

### Créer une candidature avec fichiers
```typescript
const formData = new FormData();
formData.append('jobOfferId', 'job-uuid');
formData.append('candidateId', 'candidate-uuid');
formData.append('coverLetter', 'Ma lettre de motivation...');
formData.append('cv', cvFile);
formData.append('attachments', diplomaFile);

const response = await fetch('/applications', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Filtrer les candidatures
```typescript
const params = new URLSearchParams({
  jobOfferId: 'job-uuid',
  status: 'submitted',
  needsAccessibilitySupport: 'true',
  page: '1',
  limit: '20'
});

const applications = await fetch(`/applications?${params}`);
```

### Mettre à jour vers entretien programmé
```typescript
await fetch(`/applications/${applicationId}/status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    status: 'interview_scheduled',
    statusNotes: 'Entretien programmé avec le responsable technique',
    interviewScheduledAt: '2024-01-25T10:00:00Z',
    interviewLocation: 'Bureau principal, Salle de réunion A',
    interviewNotes: 'Apporter portfolio et références'
  })
});
```

## Notifications et Workflow

Le module s'intègre avec le système de notifications pour :
- Informer le candidat des changements de statut
- Rappeler les entretiens programmés
- Notifier l'entreprise des nouvelles candidatures
- Alerter l'ONG du suivi des candidats qu'elle supporte

## Sécurité

- Vérification des permissions pour chaque action
- Validation des données d'entrée
- Contrôle d'accès basé sur les rôles
- Protection contre les candidatures multiples
- Validation des types de fichiers uploadés 