import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super-admin',
}

export enum UserType {
    CANDIDATE = 'candidate',
    COMPANY = 'company',
    NGO = 'ngo',
    ADMIN = 'admin',
    MINISTRY = 'ministry'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 255 })
    firstName: string;

    @Column({ length: 255 })
    lastName: string;

    @Column({ length: 255, unique: true })
    email: string;

    @Column({ length: 255, nullable: true })
    contact: string;

    @Column({ length: 255, nullable: true })
    secondaryContact: string;

    @Column({ length: 50, nullable: true })
    sex: string;

    @Column({ type: 'date', nullable: true })
    birthDate: Date;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ length: 255, nullable: true })
    profession: string;

    // MEPS-specific discriminator
    @Column({ 
        type: 'enum',
        enum: UserType,
        default: UserType.CANDIDATE
    })
    userType: UserType;

    @Column({ length: 255, nullable: true, select: false })
    password?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ type: 'timestamp', nullable: true })
    verifiedAt: Date | null;

    @Column({ default: true })
    isFirstLogin: boolean;

    @ManyToMany(() => Permission)
    @JoinTable({
        name: 'user_permissions',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'permission_id',
            referencedColumnName: 'id'
        }
    })
    permissions: Permission[];

    // User's profile photo URL
    @Column({ nullable: true, length: 255 })
    photoUrl?: string;

    // Refresh token for JWT authentication
    @Column({ nullable: true, length: 1024, select: false })
    refreshToken?: string;

    // Token expiration timestamp
    @Column({ nullable: true })
    refreshTokenExpires?: Date;

    // For magic link authentication
    @Column({ nullable: true, length: 1024, select: false })
    magicLinkToken?: string;

    @Column({ nullable: true })
    magicLinkExpires?: Date;

    // For account lockout
    @Column({ default: 0 })
    failedLoginAttempts: number;

    @Column({ nullable: true })
    lockoutUntil?: Date;

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'user_roles',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
    })
    roles: Role[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Method to compare password
    async comparePassword(candidatePassword: string): Promise<boolean> {
        if (!this.password) return false;
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Hash password before insert or update
    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && this.isPasswordModified) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            this.isPasswordModified = false;
        }
    }

    // Flag to track password changes
    private isPasswordModified: boolean = false;

    // Setter to mark password as modified
    setPassword(password: string) {
        this.password = password;
        this.isPasswordModified = true;
    }
} 