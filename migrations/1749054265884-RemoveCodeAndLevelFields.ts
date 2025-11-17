import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCodeAndLevelFields1749054265884 implements MigrationInterface {
    name = 'RemoveCodeAndLevelFields1749054265884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_6488523f6e53a7b5cf617ede9a\` ON \`activity_sectors\``);
        await queryRunner.query(`DROP INDEX \`IDX_8ac86f620042907067ccce82a7\` ON \`disability_types\``);
        await queryRunner.query(`DROP INDEX \`IDX_f904787e25141b24738ccfd084\` ON \`company_sizes\``);
        await queryRunner.query(`DROP INDEX \`IDX_a87bc0d3d989bb359111aded77\` ON \`contract_types\``);
        await queryRunner.query(`DROP INDEX \`IDX_3552a051190008dd76e0832973\` ON \`education_levels\``);
        await queryRunner.query(`DROP INDEX \`IDX_8e319106b14b9b60d0f3268540\` ON \`experience_levels\``);
        await queryRunner.query(`ALTER TABLE \`activity_sectors\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`disability_types\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`company_sizes\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`contract_types\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`education_levels\` DROP COLUMN \`code\``);
        await queryRunner.query(`ALTER TABLE \`education_levels\` DROP COLUMN \`level\``);
        await queryRunner.query(`ALTER TABLE \`experience_levels\` DROP COLUMN \`code\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`experience_levels\` ADD \`code\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`education_levels\` ADD \`level\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`education_levels\` ADD \`code\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`contract_types\` ADD \`code\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`company_sizes\` ADD \`code\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`disability_types\` ADD \`code\` varchar(10) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_sectors\` ADD \`code\` varchar(20) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_8e319106b14b9b60d0f3268540\` ON \`experience_levels\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_3552a051190008dd76e0832973\` ON \`education_levels\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_a87bc0d3d989bb359111aded77\` ON \`contract_types\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_f904787e25141b24738ccfd084\` ON \`company_sizes\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_8ac86f620042907067ccce82a7\` ON \`disability_types\` (\`code\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_6488523f6e53a7b5cf617ede9a\` ON \`activity_sectors\` (\`code\`)`);
    }

}
