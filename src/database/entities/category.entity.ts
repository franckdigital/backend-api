import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, OneToMany } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, unique: true })
    name: string;

    @Column({ length: 255, unique: true, nullable: true })
    nameEn: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text', nullable: true })
    descriptionEn?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    parentId: string;

    @Column({ default: 0 })
    @Index()
    order: number;

    @Column({ nullable: true, length: 255 })
    imageUrl?: string;

    @CreateDateColumn()
    @Index()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Category, category => category.children)
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];
} 