import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateProfessionsTable1749054250000 implements MigrationInterface {
    name = 'CreateProfessionsTable1749054250000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'professions',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: '(UUID())',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '100',
                        isUnique: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'sortOrder',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Create index for better performance
        await queryRunner.createIndex(
            'professions',
            new TableIndex({
                name: 'IDX_PROFESSIONS_NAME',
                columnNames: ['name'],
            }),
        );

        await queryRunner.createIndex(
            'professions',
            new TableIndex({
                name: 'IDX_PROFESSIONS_ACTIVE_SORT',
                columnNames: ['isActive', 'sortOrder'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('professions');
    }
} 