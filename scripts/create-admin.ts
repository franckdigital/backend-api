import "dotenv/config";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserType } from "../src/database/entities/user.entity";
import { Role } from "../src/database/entities/role.entity";
import { Permission } from "../src/database/entities/permission.entity";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User, Role, Permission],
  synchronize: false,
});

async function main() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const email = "admin@admin.com";

  // Vérifie si l'utilisateur existe déjà
  const existing = await userRepo.findOne({ where: { email }, relations: ["roles"] });
  if (existing) {
    console.log("❌ Admin existe déjà !");
    process.exit(0);
  }

  // Récupère le rôle admin depuis la DB
  const adminRole = await roleRepo.findOne({ where: { code: "admin" } });
  if (!adminRole) {
    console.error("❌ Le rôle 'admin' n'existe pas dans la DB !");
    process.exit(1);
  }

  // Crée le mot de passe hashé
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crée l'utilisateur admin
  const admin = userRepo.create({
    firstName: "Super",
    lastName: "Admin",
    email,
    password: hashedPassword,
    isActive: true,
    userType: UserType.ADMIN,
    isFirstLogin: true,
    roles: [adminRole], // ✅ Assigner le rôle admin pour les permissions complètes
    permissions: [],
  });

  await userRepo.save(admin);

  console.log("✅ Compte admin créé avec succès !");
  console.log("📧 Email :", email);
  console.log("🔑 Mot de passe :", password);

  process.exit(0);
}

main().catch(err => {
  console.error("Erreur lors de la création de l'admin :", err);
  process.exit(1);
});
