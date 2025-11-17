import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNgoToCandidateRelation1749144695225 implements MigrationInterface {
    name = 'AddNgoToCandidateRelation1749144695225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_282f3e1c180f21873eb37a7844b\``);
        await queryRunner.query(`DROP INDEX \`IDX_PROFESSIONS_ACTIVE_SORT\` ON \`professions\``);
        await queryRunner.query(`DROP INDEX \`IDX_PROFESSIONS_NAME\` ON \`professions\``);
        await queryRunner.query(`DROP INDEX \`UQ_b273de78f494fa9da6952ffa703\` ON \`professions\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`ngoId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`isManagedByNgo\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`professions\` CHANGE \`id\` \`id\` varchar(36) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`professions\` ADD UNIQUE INDEX \`IDX_b273de78f494fa9da6952ffa70\` (\`name\`)`);
        await queryRunner.query(`ALTER TABLE \`professions\` CHANGE \`isActive\` \`isActive\` tinyint NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE \`professions\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`professions\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`professions\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`professions\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`professionId\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`professionId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD CONSTRAINT \`FK_cd4835d2f702ff64698297c1e95\` FOREIGN KEY (\`ngoId\`) REFERENCES \`ngos\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD CONSTRAINT \`FK_282f3e1c180f21873eb37a7844b\` FOREIGN KEY (\`professionId\`) REFERENCES \`professions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_282f3e1c180f21873eb37a7844b\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP FOREIGN KEY \`FK_cd4835d2f702ff64698297c1e95\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`professionId\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`professionId\` varchar(36) NULL`);
        await queryRunner.query(`ALTER TABLE \`professions\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`professions\` ADD \`updatedAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`professions\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`professions\` ADD \`createdAt\` timestamp(0) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`professions\` CHANGE \`isActive\` \`isActive\` tinyint(1) NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`professions\` DROP INDEX \`IDX_b273de78f494fa9da6952ffa70\``);
        await queryRunner.query(`ALTER TABLE \`professions\` CHANGE \`id\` \`id\` varchar(36) NOT NULL DEFAULT 'uuid()'`);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`isManagedByNgo\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`ngoId\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UQ_b273de78f494fa9da6952ffa703\` ON \`professions\` (\`name\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_PROFESSIONS_NAME\` ON \`professions\` (\`name\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_PROFESSIONS_ACTIVE_SORT\` ON \`professions\` (\`isActive\`, \`sortOrder\`)`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD CONSTRAINT \`FK_282f3e1c180f21873eb37a7844b\` FOREIGN KEY (\`professionId\`) REFERENCES \`professions\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
