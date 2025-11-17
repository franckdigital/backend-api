import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getConnection } from 'typeorm';

async function bootstrap() {
  // Créer une instance de l'application
  const app = await NestFactory.create(AppModule);
  
  try {
    console.log('Initialisation du schéma de la base de données...');
    
    // Obtenir la connexion TypeORM
    const connection = getConnection();
    
    // Synchroniser le schéma (équivalent à synchronize: true)
    console.log('Synchronisation du schéma...');
    await connection.synchronize(true); // true pour supprimer le schéma existant
    
    console.log('Schéma de la base de données initialisé avec succès !');
    
    // Fermer l'application
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du schéma:', error);
    await app.close();
    process.exit(1);
  }
}

bootstrap(); 