import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedUserFields1748968796461 implements MigrationInterface {
    name = 'RemoveUnusedUserFields1748968796461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`businessSector\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`hasActiveSubscription\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`lemonSqueezyCustomerId\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nationality\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`workingAddress\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`workingAddress\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`nationality\` varchar(100) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`lemonSqueezyCustomerId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`hasActiveSubscription\` tinyint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`businessSector\` varchar(255) NULL`);
    }

}
