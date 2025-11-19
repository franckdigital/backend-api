import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../database/users/users.service';
import { EmailService } from '../common/services/email.service';
import * as crypto from 'crypto';
import { StorageService } from '../storage/storage.service';
import { CandidatesService } from '../database/candidates/candidates.service';
import { NgosService } from '../database/ngos/ngos.service';
import { CompaniesService } from '../database/companies/companies.service';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { UserType } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RegisterNgoDto } from './dto/register-ngo.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { NgoRegistrationResponseDto } from './dto/ngo-registration-response.dto';
import { CompanyRegistrationResponseDto } from './dto/company-registration-response.dto';

@Injectable()
export class AuthService {
  private readonly failedLoginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private storageService: StorageService,
    private candidatesService: CandidatesService,
    private ngosService: NgosService,
    private companiesService: CompaniesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Check if user is locked out due to too many failed attempts
    const emailKey = email.toLowerCase();
    const failedAttempt = this.failedLoginAttempts.get(emailKey);
    const maxAttempts = this.configService.get<number>('auth.passwordMaxAttempts') || 10;
    const lockoutMinutes = this.configService.get<number>('auth.lockoutTime') || 10;
    
    if (failedAttempt && failedAttempt.count >= maxAttempts) {
      const lockoutTime = new Date(failedAttempt.lastAttempt.getTime() + lockoutMinutes * 60000);
      if (new Date() < lockoutTime) {
        // User is still in lockout period
        const minutesLeft = Math.ceil((lockoutTime.getTime() - new Date().getTime()) / 60000);
        throw new ForbiddenException(`Account temporarily locked. Try again in ${minutesLeft} minutes.`);
      } else {
        // Lockout period has passed, reset counter
        this.failedLoginAttempts.delete(emailKey);
      }
    }

    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      // Increment failed login attempts for security
      this.incrementFailedAttempts(emailKey);
      return null;
    }

    // Use the comparePassword method from the User entity
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      this.incrementFailedAttempts(emailKey);
      return null;
    }
    
    // Check if user account is active
    if (!user.isActive) {
      throw new ForbiddenException('Account is inactive. Please contact an administrator.');
    }

    // Successful login, reset failed attempts
    this.failedLoginAttempts.delete(emailKey);

    const { password: _, ...result } = user;
    
    // Add the first login status to the result using type assertion
    return {
      ...result,
      passwordChangeRequired: user.isFirstLogin
    };
  }

  private incrementFailedAttempts(email: string): void {
    const current = this.failedLoginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    
    current.count += 1;
    current.lastAttempt = new Date();
    
    this.failedLoginAttempts.set(email, current);
  }

  async login(user: any) {
    // Extract only the role IDs if roles are available
    const roleIds = Array.isArray(user.roles) 
      ? user.roles.map(role => role.id) 
      : [];

    // Generate a unique refresh token using JWT
    const refreshToken = await this.jwtService.signAsync(
      { 
        email: user.email, 
        sub: user.id,
        roleIds: roleIds,
        permissions: user.permissions || []
      },
      {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'super-refresh-secret-key',
        expiresIn: 60 * 60 * 24 * 30, // 30 jours en secondes
      }
    );
    
    // Save the refresh token in the database
    await this.usersService.saveRefreshToken(user.id, refreshToken);
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      roleIds: roleIds,
      permissions: user.permissions || []
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken,
      user,
    };
  }
  
  async loginMember(user: any) {
    // Fetch organization information based on user type and roles
    try {
      const userRoles = Array.isArray(user.roles) ? user.roles : [];
      const hasRole = (roleCode: string) => userRoles.some((role: any) => role.code?.toLowerCase() === roleCode.toLowerCase());

      // Check if user is a candidate
      if (hasRole('candidat') || user.userType === UserType.CANDIDATE) {
        try {
          const memberInfo = await this.candidatesService.findByUserId(user.id);
          user.candidate = memberInfo;
        } catch (error) {
          console.error('Failed to fetch candidate information:', error.message);
        }
      }

      // Check if user is from a company
      if (hasRole('company') || user.userType === UserType.COMPANY) {
        try {
          const companyInfo = await this.companiesService.findByUserId(user.id);
          user.company = companyInfo;
        } catch (error) {
          console.error('Failed to fetch company information:', error.message);
        }
      }

      // Check if user is from an NGO
      if (hasRole('ngo') || user.userType === UserType.NGO) {
        try {
          const ngoInfo = await this.ngosService.findNgoByUserId(user.id);
          user.ngo = ngoInfo;
        } catch (error) {
          console.error('Failed to fetch NGO information:', error.message);
        }
      }

    } catch (error) {
      console.error('Failed to fetch organization information:', error.message);
    }

    // Extract only the role IDs if roles are available
    const roleIds = Array.isArray(user.roles) 
      ? user.roles.map((role: any) => role.id) 
      : [];

    // Generate a unique refresh token using JWT
    const refreshToken = this.jwtService.sign(
      { 
        email: user.email, 
        sub: user.id,
        roleIds: roleIds,
        permissions: user.permissions || []
      },
      {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'super-refresh-secret-key',
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') ?? 60 * 60 * 24 * 30,
      }
    );
    
    // Save the refresh token in the database
    await this.usersService.saveRefreshToken(user.id, refreshToken);
    
    const payload = { 
      email: user.email, 
      sub: user.id,
      roleIds: roleIds,
      permissions: user.permissions || []
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken,
      user,
    };
  }

  async register(
    userData: RegisterDto,
    files?: {
      profilePhoto?: Express.Multer.File[],
    }
  ) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(userData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    // If password provided, validate its strength
    if (userData.password) {
      const minLength = this.configService.get<number>('auth.passwordMinLength') || 8;
      if (userData.password.length < minLength) {
        throw new BadRequestException(`Password must be at least ${minLength} characters long`);
      }
      
      // Check password complexity
      if (!this.isPasswordStrong(userData.password)) {
        throw new BadRequestException('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    }

    // Create user data object with all fields from RegisterDto
    const userCreateData = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      contact: userData.contact,
      secondaryContact: userData.secondaryContact,
      sex: userData.sex,
      birthDate: userData.birthDate ? new Date(userData.birthDate) : undefined,
      address: userData.address,
      profession: userData.profession,
      userType: userData.userType || UserType.CANDIDATE,
      password: userData.password,
      isActive: !!userData.password,
      roles: ["050dd11a-9971-400e-9fab-b8e41501d640"]
    };

    let user: any;

    // Handle profile photo if provided
    if (files?.profilePhoto?.[0]) {
      const fileInfo = await this.storageService.storeFile(
        files.profilePhoto[0], 
        'users/profile-photos'
      );
      // Create user and update with photo URL
      user = await this.usersService.create(userCreateData);
      await this.usersService.updateProfile(user.id, { photoUrl: fileInfo.path });
      user.photoUrl = fileInfo.path;
    } else {
      // Create the user without photo
      user = await this.usersService.create(userCreateData);
    }
    
    // Send appropriate notification email
    if (userData.password) {
      // Generate verification token
      const verificationToken = this.generateToken();
      
      // Save token to user
      await this.usersService.saveMagicLinkToken(user.id, verificationToken);
      
      // Send verification email
      await this.emailService.sendEmailVerification(userData.email, verificationToken);
    } else {
      // Notify user that their account is under review
      await this.emailService.sendApplicationReceivedNotification(userData.email);
    }

    // Return the user without password
    const { password: _, ...result } = user;
    return {
      ...result,
      message: userData.password ? 
        'Registration successful. Please check your email to verify your account.' :
        'Registration successful. Your account is under review and you will be notified once approved.'
    };
  }
  
  private isPasswordStrong(password: string): boolean {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
  }

  async sendMagicLink(email: string) {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security, don't reveal if the email doesn't exist
      return { message: 'If your email is registered, you will receive a magic link' };
    }

    // Generate magic link token
    const token = this.generateToken();
    
    // Save token to user
    const expiresIn = 30 * 60 * 1000; // 30 minutes
    const expiryDate = new Date(Date.now() + expiresIn);
    await this.usersService.saveMagicLinkToken(user.id, token, expiryDate);
    
    // Send magic link email
    await this.emailService.sendMagicLink(email, token);

    return { message: 'If your email is registered, you will receive a magic link' };
  }

  async verifyMagicLink(email: string, token: string) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.magicLinkToken || user.magicLinkToken !== token) {
      throw new UnauthorizedException('Invalid or expired magic link');
    }

    // Check if token is expired
    if (user.magicLinkExpires && user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Magic link has expired');
    }

    // Clear the magic link token
    await this.usersService.clearMagicLinkToken(user.id);

    // Extract only the role IDs if roles are available
    const roleIds = Array.isArray(user.roles) 
      ? user.roles.map(role => role.id) 
      : [];

    // Generate JWT tokens for the user
    const payload = { 
      email: user.email, 
      sub: user.id,
      roleIds: roleIds,
      permissions: user.permissions || []
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'super-refresh-secret-key',
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') ?? 60 * 60 * 24 * 30,
      }),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        roles: user.roles || [],
        permissions: user.permissions || [],
        roleIds: roleIds
      },
    };
  }

  async forgotPassword(email: string) {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security, don't reveal if the email doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    // Generate reset token
    const token = this.generateToken();
    
    // Save token to user
    const expiresIn = 30 * 60 * 1000; // 30 minutes
    const expiryDate = new Date(Date.now() + expiresIn);
    await this.usersService.saveMagicLinkToken(user.id, token, expiryDate);
    
    // Send password reset email
    await this.emailService.sendPasswordReset(email, token);

    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.magicLinkToken || user.magicLinkToken !== token) {
      throw new UnauthorizedException('Invalid or expired password reset link');
    }

    // Check if token is expired
    if (user.magicLinkExpires && user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Password reset link has expired');
    }

    // Update password and clear magic link token
    await this.usersService.resetPassword(user.id, newPassword);

    return { message: 'Password has been successfully reset' };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user: any = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token 1');
    }

    // Verify the refresh token matches
    if (refreshToken !== user.refreshToken) {
      // If token is invalid, log detailed information for debugging
      console.warn('Refresh token mismatch', {
        userId,
        receivedRefreshToken: refreshToken,
        storedRefreshToken: user.refreshToken,
      });
      // Just return unauthorized without revoking stored refresh token
      throw new UnauthorizedException('Invalid refresh token 2 ');
    }

    // Extract only the role IDs if roles are available
    const roleIds = Array.isArray(user.roles) 
      ? user.roles.map(role => role.id) 
      : [];

    // Generate new tokens (token rotation)
    const newRefreshToken = this.jwtService.sign(
      { 
        email: user.email, 
        sub: user.id,
        roleIds: roleIds,
        permissions: user.permissions || []
      },
      {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'super-refresh-secret-key',
        expiresIn: this.configService.get<number>('jwt.refreshExpiresIn') ?? 60 * 60 * 24 * 30,
      }
    );
    
    // Save the new refresh token
    await this.usersService.saveRefreshToken(userId, newRefreshToken);
    
    // Generate new payload
    const newPayload = { 
      email: user.email, 
      sub: user.id,
      roleIds: roleIds,
      permissions: user.permissions || []
    };
    
    return {
      accessToken: this.jwtService.sign(newPayload),
      refreshToken: newRefreshToken,
    };
  }
  
  async logout(userId: string) {
    // Invalidate the refresh token
    await this.usersService.saveRefreshToken(userId, null);
    return { success: true };
  }

  async verifyEmail(email: string, token: string) {
    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.magicLinkToken || user.magicLinkToken !== token) {
      throw new UnauthorizedException('Invalid or expired verification link');
    }

    // Check if token is expired
    if (user.magicLinkExpires && user.magicLinkExpires < new Date()) {
      throw new UnauthorizedException('Verification link has expired');
    }

    // Verify email using the existing method
    await this.usersService.verifyEmail(user.id);

    // Extract only the role IDs if roles are available
    const roleIds = Array.isArray(user.roles) 
      ? user.roles.map(role => role.id) 
      : [];

    // Generate JWT tokens for the user
    const payload = { 
      email: user.email, 
      sub: user.id,
      roleIds: roleIds,
      permissions: user.permissions || []
    };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret') || 'super-refresh-secret-key',
        expiresIn: parseInt(this.configService.get<string>('jwt.refreshExpiresIn') || '2592000', 10),
      }),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive,
        isEmailVerified: true,
        roles: user.roles || [],
        permissions: user.permissions || [],
        roleIds: roleIds
      },
    };
  }

  async registerCandidate(
    candidateData: RegisterCandidateDto,
    files?: {
      profilePhoto?: Express.Multer.File[],
      cvFile?: Express.Multer.File[],
      videoFile?: Express.Multer.File[],
      disabilityCertificate?: Express.Multer.File[],
      portfolioFiles?: Express.Multer.File[]
    }
  ) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(candidateData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }
    
    // If password provided, validate its strength
    if (candidateData.password) {
      const minLength = this.configService.get<number>('auth.passwordMinLength') || 8;
      if (candidateData.password.length < minLength) {
        throw new BadRequestException(`Password must be at least ${minLength} characters long`);
      }
      
      // Check password complexity
      if (!this.isPasswordStrong(candidateData.password)) {
        throw new BadRequestException('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
      }
    }

    let photoUrl: string | undefined;
    let cvFileUrl: string | undefined;
    let videoUrl: string | undefined;

    try {
      // Handle file uploads
      if (files?.profilePhoto?.[0]) {
        const fileInfo = await this.storageService.storeFile(
          files.profilePhoto[0], 
          'candidates/profile-photos'
        );
        photoUrl = fileInfo.path;
      }

      if (files?.cvFile?.[0]) {
        const fileInfo = await this.storageService.storeFile(
          files.cvFile[0], 
          'candidates/cv-files'
        );
        cvFileUrl = fileInfo.path;
      }

      if (files?.videoFile?.[0]) {
        const fileInfo = await this.storageService.storeFile(
          files.videoFile[0], 
          'candidates/videos'
        );
        videoUrl = fileInfo.path;
      }

      // Create user data object
      const userCreateData = {
        firstName: candidateData.firstName,
        lastName: candidateData.lastName,
        email: candidateData.email,
        contact: candidateData.contact,
        secondaryContact: candidateData.secondaryContact,
        sex: candidateData.sex,
        birthDate: candidateData.birthDate ? new Date(candidateData.birthDate) : undefined,
        address: candidateData.address,
        professionId: candidateData.professionId,
        userType: UserType.CANDIDATE,
        password: candidateData.password,
        photoUrl: photoUrl,
        isActive: !!candidateData.password, // Active if password is provided
        isEmailVerified: false,
        isVerified: false,
        isFirstLogin: true,
        roles: candidateData.roles // Assign default candidate role
      };

      // Create the user
      const user = await this.usersService.create(userCreateData);

      // Create candidate data object
      const candidateCreateData = {
        userId: user.id,
        disabilityTypeId: candidateData.disabilityTypeId,
        disabilityDescription: candidateData.disabilityDescription,
        educationLevelId: candidateData.educationLevelId,
        experienceLevelId: candidateData.experienceLevelId,
        professionalSummary: candidateData.professionalSummary,
        // skills: candidateData.skills,
        // languages: candidateData.languages,
        // locationId: candidateData.locationId,
        cvFileUrl: cvFileUrl,
        photoUrl: photoUrl,
        // videoPresentation: videoUrl || candidateData.videoPresentation,
        biography: candidateData.biography,
        expectedSalaryMin: candidateData.expectedSalaryMin,
        expectedSalaryMax: candidateData.expectedSalaryMax,
        isAvailable: candidateData.isAvailable ?? true,
        availabilityDate: candidateData.availabilityDate,
        isActive: true,
      };

      // Create the candidate profile
      const candidate = await this.candidatesService.create(candidateCreateData);

      // Update profile completion percentage
      await this.candidatesService.updateProfileCompletion(candidate.id);
      
      // Handle email verification and notifications
      if (candidateData.password) {
        // Generate verification token
        const verificationToken = this.generateToken();
        
        // Save token to user
        await this.usersService.saveMagicLinkToken(user.id, verificationToken);
        
        // Send verification email
        await this.emailService.sendEmailVerification(candidateData.email, verificationToken);
      } else {
        // Notify user that their account is under review
        await this.emailService.sendApplicationReceivedNotification(candidateData.email);
      }

      // Auto-login: Generate authentication tokens if user provided password
      let authTokens: { accessToken?: string; refreshToken?: string } = {};
      if (candidateData.password && user.isActive) {
        // Prepare user object for token generation (similar to login method)
        const userForToken = {
          ...user,
          roles: user.roles || [],
          permissions: user.permissions || []
        };

        // Generate tokens using the same logic as login method
        const loginResult = await this.login(userForToken);
        authTokens = {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken
        };
      }

      // Return the candidate with user information and tokens
      const { password: _, ...sanitizedUser } = user;
      return {
        ...candidate,
        user: sanitizedUser,
        message: candidateData.password ? 
          (authTokens.accessToken ? 'Registration successful. You are now logged in.' : 'Registration successful. Please check your email to verify your account.') :
          'Registration successful. Your account is under review and you will be notified once approved.',
        ...authTokens
      };

    } catch (error) {
      // Clean up uploaded files if registration fails
      if (photoUrl) {
        try {
          await this.storageService.deleteFile(photoUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup profile photo:', deleteError);
        }
      }
      if (cvFileUrl) {
        try {
          await this.storageService.deleteFile(cvFileUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup CV file:', deleteError);
        }
      }
      if (videoUrl) {
        try {
          await this.storageService.deleteFile(videoUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup video file:', deleteError);
        }
      }
      
      throw error;
    }
  }

  // Helper methods
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async registerNgo(
    ngoData: RegisterNgoDto,
    files?: {
      logoFile?: Express.Multer.File[];
    }
  ): Promise<NgoRegistrationResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(ngoData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate password if not provided
    const password = ngoData.password || this.generateRandomPassword();
    const generatedPassword = !ngoData.password ? password : undefined;

    // Validate password strength if provided
    if (ngoData.password && !this.isPasswordStrong(ngoData.password)) {
      throw new BadRequestException('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    let logoUrl: string | undefined;

    try {
      // Handle logo file upload
      if (files?.logoFile?.[0]) {
        const fileInfo = await this.storageService.storeFile(
          files.logoFile[0], 
          'ngos/logos'
        );
        logoUrl = fileInfo.path;
      }
      // Create user account
      const userData = {
        firstName: ngoData.firstName,
        lastName: ngoData.lastName,
        email: ngoData.email,
        password,
        contact: ngoData.contact,
        secondaryContact: ngoData.secondaryContact,
        sex: ngoData.sex,
        birthDate: ngoData.birthDate ? new Date(ngoData.birthDate) : undefined,
        address: ngoData.address,
        profession: ngoData.profession,
        userType: UserType.NGO,
        roles: ngoData.roles // Assign default ngo role
      };

      const user = await this.usersService.create(userData);

      // Create NGO profile
      const ngoProfileData = {
        organizationName: ngoData.organizationName,
        registrationNumber: ngoData.registrationNumber,
        taxNumber: ngoData.taxNumber,
        mission: ngoData.mission,
        description: ngoData.description,
        website: ngoData.website,
        logoUrl: logoUrl,
        foundedDate: ngoData.foundedDate,
        locationId: ngoData.locationId,
        fullAddress: ngoData.fullAddress,
        primaryContactName: ngoData.primaryContactName,
        primaryContactEmail: ngoData.primaryContactEmail,
        primaryContactPhone: ngoData.primaryContactPhone,
        secondaryContactName: ngoData.secondaryContactName,
        secondaryContactEmail: ngoData.secondaryContactEmail,
        secondaryContactPhone: ngoData.secondaryContactPhone,
        focusAreaIds: ngoData.focusAreaIds,
        supportedDisabilityTypeIds: ngoData.supportedDisabilityTypeIds,
        serviceAreaIds: ngoData.serviceAreaIds,
        servicesOffered: ngoData.servicesOffered,
        providesJobTraining: ngoData.providesJobTraining,
        providesCareerCounseling: ngoData.providesCareerCounseling,
        providesLegalSupport: ngoData.providesLegalSupport,
        providesHealthcareSupport: ngoData.providesHealthcareSupport,
        activeMembers: ngoData.activeMembers,
        staffCount: ngoData.staffCount,
      };

      const ngo = await this.ngosService.createNgo(ngoProfileData, user.id);

      // Send welcome email with credentials if password was generated
      if (generatedPassword) {
        // For now, we'll use a simple email notification
        // TODO: Implement sendWelcomeEmail method in EmailService
        console.log(`NGO account created for ${user.email} with password: ${generatedPassword}`);
      } else {
        // Send verification email
        const verificationToken = this.generateToken();
        // TODO: Implement saveEmailVerificationToken method in UsersService
        // TODO: Implement sendVerificationEmail method in EmailService
        console.log(`NGO account created for ${user.email}. Verification token: ${verificationToken}`);
      }

      return {
        success: true,
        user,
        ngo,
        generatedPassword,
        message: generatedPassword 
          ? 'NGO account created successfully. Login credentials have been sent to your email.'
          : 'NGO account created successfully. Please check your email to verify your account.',
        isEmailVerificationRequired: !generatedPassword,
      };
    } catch (error) {
      // Clean up uploaded logo file if registration fails
      if (logoUrl) {
        try {
          await this.storageService.deleteFile(logoUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup NGO logo:', deleteError);
        }
      }
      
      throw new BadRequestException(`Failed to register NGO: ${error.message}`);
    }
  }

  async registerCompany(
    companyData: RegisterCompanyDto,
    files?: {
      logoFile?: Express.Multer.File[];
    }
  ): Promise<CompanyRegistrationResponseDto> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(companyData.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate password if not provided
    const password = companyData.password || this.generateRandomPassword();
    const generatedPassword = !companyData.password ? password : undefined;

    // Validate password strength if provided
    if (companyData.password && !this.isPasswordStrong(companyData.password)) {
      throw new BadRequestException('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    let logoUrl: string | undefined;

    try {
      // Handle logo file upload
      if (files?.logoFile?.[0]) {
        const fileInfo = await this.storageService.storeFile(
          files.logoFile[0], 
          'companies/logos'
        );
        logoUrl = fileInfo.path;
      }
      // Create user account (company representative)
      const userData = {
        firstName: companyData.firstName,
        lastName: companyData.lastName,
        email: companyData.email,
        password,
        contact: companyData.contact,
        secondaryContact: companyData.secondaryContact,
        sex: companyData.sex,
        birthDate: companyData.birthDate ? new Date(companyData.birthDate) : undefined,
        address: companyData.address,
        profession: companyData.profession,
        userType: UserType.COMPANY,
        isActive: true,
        isEmailVerified: false,
        isVerified: false,
        isFirstLogin: !companyData.password,
        roles: companyData.roles // Assign default company role
      };

      const user = await this.usersService.create(userData);

      // Create company profile
      const companyProfileData = {
        userId: user.id,
        companyName: companyData.companyName,
        registrationNumber: companyData.registrationNumber || undefined,
        taxNumber: companyData.taxNumber || undefined,
        description: companyData.description || undefined,
        website: companyData.website || undefined,
        logoUrl: logoUrl,
        activitySectorId: companyData.activitySectorId,
        companySizeId: companyData.companySizeId,
        exactEmployeeCount: companyData.exactEmployeeCount,
        locationId: companyData.locationId || null,
        fullAddress: companyData.fullAddress || undefined,
        currentDisabledEmployeesCount: companyData.currentDisabledEmployeesCount || 0,
        hrContactName: companyData.hrContactName || undefined,
        hrContactEmail: companyData.hrContactEmail || undefined,
        hrContactPhone: companyData.hrContactPhone || undefined,
        // Company starts as unverified and cannot post job offers until approved
        isVerified: false,
        isActive: true,
        canPostJobOffers: false,
      };

      const company = await this.companiesService.create(companyProfileData);

      // Update profile completion percentage
      await this.companiesService.updateProfileCompletion(company.id);

      // Send appropriate email based on registration method
      if (generatedPassword) {
        // Send welcome email with generated credentials
        console.log(`Company account created for ${user.email} with password: ${generatedPassword}`);
        // TODO: Implement sendCompanyWelcomeEmail method in EmailService
      } else {
        // Send verification email if password was provided
        const verificationToken = this.generateToken();
        await this.usersService.saveMagicLinkToken(user.id, verificationToken);
        await this.emailService.sendEmailVerification(companyData.email, verificationToken);
      }

      // Notify administrators about new company registration
      // TODO: Implement sendNewCompanyNotificationToAdmins method in EmailService
      console.log(`New company registration: ${companyData.companyName} (${user.email})`);

      const { password: _, ...sanitizedUser } = user;

      return {
        success: true,
        user: sanitizedUser,
        company,
        generatedPassword,
        message: 'Company registration successful. Your account is pending verification by administrators.',
        requiresVerification: true,
        isEmailVerificationRequired: !generatedPassword,
        canPostJobOffers: false,
      };
    } catch (error) {
      // Clean up uploaded logo file if registration fails
      if (logoUrl) {
        try {
          await this.storageService.deleteFile(logoUrl);
        } catch (deleteError) {
          console.error('Failed to cleanup company logo:', deleteError);
        }
      }
      
      throw new BadRequestException(`Failed to register company: ${error.message}`);
    }
  }

  async getCompleteUserProfile(userId: string) {
    // Fetch user with roles and permissions
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const result = {
      user: user,
      candidate: null as any,
      company: null as any,
      ngo: null as any,
      profileSummary: {
        hasCandidate: false,
        hasCompany: false,
        hasNgo: false,
        overallCompletionPercentage: 0
      }
    };

    const userRoles = Array.isArray(user.roles) ? user.roles : [];
    const hasRole = (roleCode: string) => userRoles.some((role: any) => role.code?.toLowerCase() === roleCode.toLowerCase());

    let totalCompletionPercentage = 0;
    let profileCount = 0;

    // Check if user is a candidate
    if (hasRole('candidat') || user.userType === UserType.CANDIDATE) {
      try {
        const candidateInfo = await this.candidatesService.findByUserId(user.id);
        if (candidateInfo) {
          result.candidate = candidateInfo;
          result.profileSummary.hasCandidate = true;
          totalCompletionPercentage += candidateInfo.profileCompletionPercentage || 0;
          profileCount++;
        }
      } catch (error) {
        console.error('Failed to fetch candidate information:', error.message);
      }
    }

    // Check if user is from a company
    if (hasRole('company') || user.userType === UserType.COMPANY) {
      try {
        const companyInfo = await this.companiesService.findByUserId(user.id);
        if (companyInfo) {
          result.company = companyInfo;
          result.profileSummary.hasCompany = true;
          totalCompletionPercentage += companyInfo.profileCompletionPercentage || 0;
          profileCount++;
        }
      } catch (error) {
        console.error('Failed to fetch company information:', error.message);
      }
    }

    // Check if user is from an NGO
    if (hasRole('ngo') || user.userType === UserType.NGO) {
      try {
        const ngoInfo = await this.ngosService.findNgoByUserId(user.id);
        if (ngoInfo) {
          result.ngo = ngoInfo;
          result.profileSummary.hasNgo = true;
          totalCompletionPercentage += ngoInfo.profileCompletionPercentage || 0;
          profileCount++;
        }
      } catch (error) {
        console.error('Failed to fetch NGO information:', error.message);
      }
    }

    // Calculate overall completion percentage
    if (profileCount > 0) {
      result.profileSummary.overallCompletionPercentage = Math.round(totalCompletionPercentage / profileCount);
    }

    return result;
  }

  private generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
} 