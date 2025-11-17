import { createConnection } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

async function resetDatabase() {
    console.log('Réinitialisation de la base de données...');

    try {
        // Créer une connexion TypeORM en utilisant les mêmes configurations que l'application
        const connection = await createConnection({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306', 10),
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'boilerplate_nestjs',
            synchronize: false,
            logging: true,
            entities: [__dirname + '/database/**/*.entity{.ts,.js}'],
        });

        console.log('Connexion établie avec la base de données.');

        // Supprimer complètement le schéma
        console.log('Suppression du schéma...');
        await connection.dropDatabase();
        console.log('Schéma supprimé avec succès.');

        // Fermer la connexion
        await connection.close();
        console.log('Connexion fermée.');

        console.log('Réinitialisation de la base de données terminée avec succès.');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la réinitialisation de la base de données:', error);
        process.exit(1);
    }
}

// Exécuter la fonction
resetDatabase(); 