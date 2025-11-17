import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255, unique: true })
    name: string;

    @Column({ length: 255, unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ default: false })
    isDefault: boolean;

    @Column({ default: false })
    isSystem: boolean;

    @ManyToMany(() => Permission, permission => permission.roles)
    @JoinTable({
        name: 'role_permissions',
        joinColumn: { 
            name: 'role_id', 
            referencedColumnName: 'id' 
        },
        inverseJoinColumn: { 
            name: 'permission_id', 
            referencedColumnName: 'id' 
        }
    })
    permissions: Permission[];

    @ManyToMany(() => User, user => user.roles)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 