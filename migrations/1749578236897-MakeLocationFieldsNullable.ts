import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeLocationFieldsNullable1749578236897 implements MigrationInterface {
    name = 'MakeLocationFieldsNullable1749578236897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ngos\` DROP FOREIGN KEY \`FK_86ddc9d882a5ae1b45afc4f4bff\``);
        await queryRunner.query(`ALTER TABLE \`ngos\` CHANGE \`locationId\` \`locationId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_2080c086ebb8803b7eb1158467a\``);
        await queryRunner.query(`ALTER TABLE \`companies\` CHANGE \`locationId\` \`locationId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`job_offers\` DROP FOREIGN KEY \`FK_4da02a975e14026c7844ecb628b\``);
        await queryRunner.query(`ALTER TABLE \`job_offers\` CHANGE \`locationId\` \`locationId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`ngos\` ADD CONSTRAINT \`FK_86ddc9d882a5ae1b45afc4f4bff\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`companies\` ADD CONSTRAINT \`FK_2080c086ebb8803b7eb1158467a\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`job_offers\` ADD CONSTRAINT \`FK_4da02a975e14026c7844ecb628b\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`job_offers\` DROP FOREIGN KEY \`FK_4da02a975e14026c7844ecb628b\``);
        await queryRunner.query(`ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_2080c086ebb8803b7eb1158467a\``);
        await queryRunner.query(`ALTER TABLE \`ngos\` DROP FOREIGN KEY \`FK_86ddc9d882a5ae1b45afc4f4bff\``);
        await queryRunner.query(`ALTER TABLE \`job_offers\` CHANGE \`locationId\` \`locationId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`job_offers\` ADD CONSTRAINT \`FK_4da02a975e14026c7844ecb628b\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`companies\` CHANGE \`locationId\` \`locationId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`companies\` ADD CONSTRAINT \`FK_2080c086ebb8803b7eb1158467a\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ngos\` CHANGE \`locationId\` \`locationId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`ngos\` ADD CONSTRAINT \`FK_86ddc9d882a5ae1b45afc4f4bff\` FOREIGN KEY (\`locationId\`) REFERENCES \`locations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
