import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAdditionalCandidateFields1748969586153 implements MigrationInterface {
    name = 'RemoveAdditionalCandidateFields1748969586153'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`disabilityPercentage\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`disabilityCertificationDate\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`disabilityCertificationNumber\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`certifications\``);
        await queryRunner.query(`ALTER TABLE \`candidates\` DROP COLUMN \`isWillingToRelocate\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`isWillingToRelocate\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`certifications\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`disabilityCertificationNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`disabilityCertificationDate\` date NULL`);
        await queryRunner.query(`ALTER TABLE \`candidates\` ADD \`disabilityPercentage\` int NULL`);
    }

}
