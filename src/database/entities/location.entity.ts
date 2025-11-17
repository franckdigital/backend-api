import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

/**
 * Entity representing geographical locations
 * Used for hierarchical location management (Country > Region > City)
 */
@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ length: 20, unique: true })
    code: string;

    @Column({ 
        type: 'enum',
        enum: ['country', 'region', 'city', 'district'],
        default: 'city'
    })
    type: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    sortOrder: number;

    // Self-referencing for hierarchical structure
    @Column({ nullable: true })
    parentId: string;

    @ManyToOne(() => Location, location => location.children)
    @JoinColumn({ name: 'parentId' })
    parent: Location;

    @OneToMany(() => Location, location => location.parent)
    children: Location[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 