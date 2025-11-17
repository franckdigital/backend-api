# Guide de Déploiement en Production

Ce document décrit les étapes nécessaires pour déployer l'API en production.

## Prérequis

- Node.js (version 18 ou supérieure)
- PostgreSQL (version 12 ou supérieure)

## 1. Installation des Dépendances

```bash
# Installation des dépendances du projet
npm install

# Installation des dépendances de développement (si nécessaire)
npm install --save-dev
```

## 2. Configuration de l'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://meps_user:votre_mot_de_passe_secure@localhost:5432/app_meps_prod
JWT_SECRET=votre_secret_jwt
```

## 3. Configuration de la Base de Données

### 3.1 Création de la Base de Données

```bash
# Connexion à PostgreSQL
sudo -u postgres psql

# Création de la base de données
CREATE DATABASE app_meps_prod;
CREATE USER meps_user WITH PASSWORD 'votre_mot_de_passe_secure';
GRANT ALL PRIVILEGES ON DATABASE app_meps_prod TO meps_user;
```

### 3.2 Configuration de TypeORM

Vérifiez que le fichier `typeorm.config.ts` contient la configuration correcte pour la production :

```typescript
export default {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false, // Important : toujours false en production
  logging: false, // Désactivez les logs en production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};
```

## 4. Gestion des Migrations

### 4.1 Génération des Migrations

```bash
# Générer une nouvelle migration
npm run migration:generate --name=NomDeLaMigration

# Exécuter les migrations
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

### 4.2 Vérification des Migrations

```bash
# Voir le statut des migrations
npm run migration:show
```

## 5. Construction et Démarrage de l'Application

```bash
# Construction de l'application
npm run build

# Démarrage de l'application en production
npm run start:prod
```

## 6. Mises à Jour du Projet

Pour mettre à jour l'application :

```bash
# Récupération des dernières modifications
git pull origin main

# Installation des nouvelles dépendances
npm install

# Construction de l'application
npm run build

# Exécution des migrations si nécessaire
npm run migration:run
```

## 7. Scripts Utiles

Les scripts disponibles dans le `package.json` :

- `npm run start:dev` : Démarrage en mode développement
- `npm run start:prod` : Démarrage en mode production
- `npm run build` : Construction de l'application
- `npm run migration:generate` : Génération de migrations
- `npm run migration:run` : Exécution des migrations
- `npm run migration:revert` : Annulation de la dernière migration 