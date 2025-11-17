import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddProfessionToCandidate1749054300000 implements MigrationInterface {
    name = 'AddProfessionToCandidate1749054300000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add professionId column to candidates table
        await queryRunner.addColumn('candidates', new TableColumn({
            name: 'professionId',
            type: 'varchar',
            length: '36',
            isNullable: true,
        }));

        // Add foreign key constraint
        await queryRunner.createForeignKey('candidates', new TableForeignKey({
            columnNames: ['professionId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'professions',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraint
        const table = await queryRunner.getTable('candidates');
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('professionId') !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey('candidates', foreignKey);
            }
        }

        // Remove professionId column
        await queryRunner.dropColumn('candidates', 'professionId');
    }
} 