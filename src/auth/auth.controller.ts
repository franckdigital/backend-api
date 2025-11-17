import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  BadRequestException,
  HttpStatus,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterCandidateDto } from './dto/register-candidate.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { VerifyMagicLinkDto } from './dto/verify-magic-link.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthResponseDto,
  MagicLinkResponseDto,
  ResetPasswordResponseDto,
  UserRegistrationResponseDto,
} from './dto/auth-response.dto';
import { Public } from '../common/guards/global-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UserResponseDto } from '../database/users/dto/user-response.dto';
import { RateLimit } from './decorators/throttle.decorator';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CandidateRegistrationResponseDto } from './dto/candidate-registration-response.dto';
import { RegisterNgoDto } from './dto/register-ngo.dto';
import { NgoRegistrationResponseDto } from './dto/ngo-registration-response.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { CompanyRegistrationResponseDto } from './dto/company-registration-response.dto';
import { CompleteUserProfileDto } from './dto/complete-user-profile.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @Inject(ConfigService) private configService: ConfigService,
  ) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @RateLimit(5, 60) // 5 requests per minute
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticates a user and returns tokens',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('authentication')
  @RateLimit(5, 60) // 5 requests per minute
  @ApiOperation({
    summary: 'Login with email and password',
    description: 'Authenticates a user and returns tokens with organization information (candidate profile, company info, or NGO info) based on user type',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in with organization information',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async loginMember(@Request() req) {
    return this.authService.loginMember(req.user);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('admin-login')
  @RateLimit(3, 60) // 3 requests per minute (plus restrictif pour les admins)
  @ApiOperation({
    summary: 'Admin/Super-admin login',
    description: 'Authenticates admin and super-admin users only. This endpoint is restricted to users with admin or super-admin roles.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin successfully logged in',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials or insufficient permissions (admin/super-admin role required)' 
  })
  async adminLogin(@Request() req) {
    // Vérifier si l'utilisateur a le rôle admin ou super-admin
    const user = req.user;
    const userRoles = user.roles || [];
    const hasAdminRole = userRoles.some(role => 
      role.code === 'admin' || role.code === 'super-admin'
    );

    if (!hasAdminRole) {
      throw new UnauthorizedException(
        'Access denied. Admin or super-admin role required.'
      );
    }

    return this.authService.loginMember(req.user);
  }

  @Public()
  @Post('register')
  @RateLimit(10, 300) // 10 requests per 5 minutes
  @ApiOperation({
    summary: 'Register new user',
    description: 'Creates a new user account with comprehensive profile information. Use /auth/register/candidate for candidate-specific registration.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: UserRegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or email already in use',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // Basic required information
        firstName: { 
          type: 'string', 
          example: 'John',
          description: 'User first name'
        },
        lastName: { 
          type: 'string', 
          example: 'Doe',
          description: 'User last name'
        },
        email: { 
          type: 'string', 
          example: 'john.doe@example.com',
          description: 'User email address (unique)'
        },
        
        // Optional user information
        contact: { 
          type: 'string', 
          example: '+237123456789',
          description: 'Primary contact number'
        },
        secondaryContact: { 
          type: 'string', 
          example: '+237987654321',
          description: 'Secondary contact number'
        },
        sex: { 
          type: 'string', 
          example: 'male',
          enum: ['male', 'female', 'other'],
          description: 'User gender'
        },
        birthDate: { 
          type: 'string', 
          format: 'date',
          example: '1990-01-15',
          description: 'User birth date (YYYY-MM-DD)'
        },
        address: { 
          type: 'string', 
          example: '123 Main Street, Douala, Cameroon',
          description: 'User full address'
        },
        profession: { 
          type: 'string', 
          example: 'Software Developer',
          description: 'User profession or job title'
        },
        userType: {
          type: 'string',
          enum: ['candidate', 'company', 'ngo', 'admin', 'ministry'],
          example: 'candidate',
          description: 'Type of user account',
          default: 'candidate'
        },
        password: {
          type: 'string',
          example: 'Password123!',
          description: 'User password (optional - will be generated if not provided)',
          minLength: 8
        },
        
        // File uploads
        profilePhoto: { 
          type: 'string', 
          format: 'binary',
          description: 'Profile photo file upload'
        },
      },
      required: ['firstName', 'lastName', 'email'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
    ]),
  )
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
    },
  ) {
    return this.authService.register(registerDto, files);
  }

  @Public()
  @Post('magic-link')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Request magic link',
    description:
      'Sends a magic link to the provided email for passwordless login',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Magic link sent successfully',
    type: MagicLinkResponseDto,
  })
  async requestMagicLink(@Body() magicLinkDto: MagicLinkDto) {
    return this.authService.sendMagicLink(magicLinkDto.email);
  }

  @Public()
  @Post('verify-magic-link')
  @ApiOperation({
    summary: 'Verify magic link',
    description: 'Verifies a magic link token and authenticates the user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Magic link verified successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async verifyMagicLink(@Body() verifyMagicLinkDto: VerifyMagicLinkDto) {
    return this.authService.verifyMagicLink(
      verifyMagicLinkDto.email,
      verifyMagicLinkDto.token,
    );
  }

  @Public()
  @Post('forgot-password')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Sends a password reset link to the provided email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset instructions sent',
    type: ResetPasswordResponseDto,
  })
  async forgotPassword(@Body() magicLinkDto: MagicLinkDto) {
    return this.authService.forgotPassword(magicLinkDto.email);
  }

  @Public()
  @Post('reset-password')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password using a token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Returns the profile of the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super-admin')
  @Get('admin-profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get admin profile',
    description: 'Returns the profile of the authenticated admin/super-admin user. Only accessible by users with admin or super-admin roles.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ 
    description: 'Not authenticated or insufficient permissions (admin/super-admin role required)' 
  })
  getAdminProfile(@Request() req) {
    return {
      ...req.user,
      message: 'Admin access granted',
      accessLevel: 'administrator',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('complete-profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get complete user profile with all associated information',
    description: 'Returns comprehensive user profile including candidate, company, and NGO information (if applicable). This endpoint aggregates all profile data associated with the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Complete user profile retrieved successfully',
    type: CompleteUserProfileDto,
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async getCompleteProfile(@Request() req) {
    return this.authService.getCompleteUserProfile(req.user.userId);
  }

  @Public()
  @Post('refresh-token')
  @RateLimit(10, 60) // 10 requests per minute
  @ApiOperation({
    summary: 'Refresh token',
    description: 'Gets a new access token using a refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @ApiBadRequestResponse({ description: 'Missing required fields' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.userId || !refreshTokenDto.refreshToken) {
      throw new BadRequestException('User ID and refresh token are required');
    }

    const response = await this.authService.refreshToken(
      refreshTokenDto.userId,
      refreshTokenDto.refreshToken,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the refresh token for the user',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged out',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }

  @Public()
  @Get('verify-email')
  @ApiOperation({
    summary: 'Verify email',
    description: 'Verifies a user email using a verification token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  async verifyEmail(
    @Query('token') token: string,
    @Query('email') email: string,
  ) {
    return this.authService.verifyEmail(email, token);
  }

  @Public()
  @Post('register/candidate')
  @RateLimit(10, 300) // 10 requests per 5 minutes
  @ApiOperation({
    summary: 'Register new candidate',
    description: 'Creates a new candidate account with comprehensive profile information. If password is provided, user is automatically logged in and receives authentication tokens.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Candidate successfully registered and optionally logged in with authentication tokens',
    type: CandidateRegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input, email already in use, or validation errors',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // User basic information
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        password: { type: 'string', example: 'Password123', description: 'Optional' },
        contact: { type: 'string', example: '+237123456789' },
        secondaryContact: { type: 'string', example: '+237987654321' },
        sex: { type: 'string', example: 'male' },
        birthDate: { type: 'string', example: '1990-01-15' },
        address: { type: 'string', example: '123 Main Street, Douala, Cameroon' },
        profession: { type: 'string', example: 'Software Developer' },
        
        // Candidate-specific disability information
        disabilityTypeId: { type: 'string', example: 'uuid-disability-type-id' },
        disabilityDescription: { type: 'string', example: 'Mobility impairment affecting lower limbs' },
        
        // Professional information
        educationLevelId: { type: 'string', example: 'uuid-education-level-id' },
        experienceLevelId: { type: 'string', example: 'uuid-experience-level-id' },
        professionalSummary: { type: 'string', example: 'Experienced software developer with expertise in web technologies' },
        skills: { type: 'string', example: '["JavaScript", "TypeScript", "React", "Node.js"]' },
        languages: { type: 'string', example: '[{"name": "English", "level": "Native"}, {"name": "French", "level": "Fluent"}]' },
        
        // Location and preferences
        locationId: { type: 'string', example: 'uuid-location-id' },
        biography: { type: 'string', example: 'Passionate about technology and helping others through accessible solutions.' },
        videoPresentation: { type: 'string', example: 'Short video introducing myself and my skills' },
        expectedSalaryMin: { type: 'number', example: 500000 },
        expectedSalaryMax: { type: 'number', example: 750000 },
        isAvailable: { type: 'boolean', example: true },
        availabilityDate: { type: 'string', example: '2024-02-01' },
        
        // File uploads
        profilePhoto: { type: 'string', format: 'binary', description: 'Profile photo' },
        cvFile: { type: 'string', format: 'binary', description: 'CV/Resume file' },
        videoFile: { type: 'string', format: 'binary', description: 'Video presentation file' },
        disabilityCertificate: { type: 'string', format: 'binary', description: 'Disability certificate' },
        portfolioFiles: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Portfolio files' },
      },
      required: ['firstName', 'lastName', 'email', 'disabilityTypeId'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'cvFile', maxCount: 1 },
      { name: 'videoFile', maxCount: 1 },
      { name: 'disabilityCertificate', maxCount: 1 },
      { name: 'portfolioFiles', maxCount: 5 },
    ]),
  )
  async registerCandidate(
    @Body() registerCandidateDto: RegisterCandidateDto,
    @UploadedFiles()
    files: {
      profilePhoto?: Express.Multer.File[];
      cvFile?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
      disabilityCertificate?: Express.Multer.File[];
      portfolioFiles?: Express.Multer.File[];
    },
  ) {
    return this.authService.registerCandidate(registerCandidateDto, files);
  }

  @Public()
  @Post('register/ngo')
  @RateLimit(3, 300) // 3 requests per 5 minutes
  @ApiOperation({
    summary: 'Register new NGO',
    description: 'Creates a new NGO account with user profile and organization information',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'NGO successfully registered',
    type: NgoRegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or email already in use',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // User information
        firstName: { type: 'string', example: 'John', description: 'NGO representative first name' },
        lastName: { type: 'string', example: 'Doe', description: 'NGO representative last name' },
        email: { type: 'string', example: 'john.doe@hopeassociation.org', description: 'NGO representative email' },
        password: { type: 'string', example: 'Password123!', description: 'Password (optional - will be generated if not provided)' },
        contact: { type: 'string', example: '+237123456789', description: 'Representative contact number' },
        secondaryContact: { type: 'string', example: '+237987654321', description: 'Representative secondary contact' },
        sex: { type: 'string', example: 'male', enum: ['male', 'female', 'other'], description: 'Representative gender' },
        birthDate: { type: 'string', example: '1980-01-15', description: 'Representative birth date' },
        address: { type: 'string', example: '123 Main Street, Douala, Cameroon', description: 'Representative address' },
        profession: { type: 'string', example: 'NGO Director', description: 'Representative profession' },
        
        // NGO information
        organizationName: { type: 'string', example: 'Hope for Disabled Association', description: 'NGO organization name' },
        registrationNumber: { type: 'string', example: 'NGO-2024-001', description: 'NGO registration number' },
        taxNumber: { type: 'string', example: 'TAX-NGO-001', description: 'NGO tax number' },
        mission: { type: 'string', description: 'NGO mission statement' },
        description: { type: 'string', description: 'NGO description' },
        website: { type: 'string', example: 'https://hope-disabled.org', description: 'NGO website URL' },
        foundedDate: { type: 'string', example: '2020-01-15', description: 'Founded date' },
        locationId: { type: 'string', example: 'uuid-location-id', description: 'Location ID where NGO is based' },
        fullAddress: { type: 'string', description: 'Full address of NGO' },
        primaryContactName: { type: 'string', description: 'Primary contact person name' },
        primaryContactEmail: { type: 'string', description: 'Primary contact email' },
        primaryContactPhone: { type: 'string', description: 'Primary contact phone' },
        secondaryContactName: { type: 'string', description: 'Secondary contact person name' },
        secondaryContactEmail: { type: 'string', description: 'Secondary contact email' },
        secondaryContactPhone: { type: 'string', description: 'Secondary contact phone' },
        focusAreaIds: { type: 'array', items: { type: 'string' }, description: 'Array of activity sector IDs' },
        supportedDisabilityTypeIds: { type: 'array', items: { type: 'string' }, description: 'Array of supported disability type IDs' },
        serviceAreaIds: { type: 'array', items: { type: 'string' }, description: 'Array of service area location IDs' },
        servicesOffered: { type: 'string', example: '["Job Training", "Career Counseling"]', description: 'Services offered by NGO (JSON string)' },
        providesJobTraining: { type: 'boolean', default: false, description: 'Provides job training' },
        providesCareerCounseling: { type: 'boolean', default: false, description: 'Provides career counseling' },
        providesLegalSupport: { type: 'boolean', default: false, description: 'Provides legal support' },
        providesHealthcareSupport: { type: 'boolean', default: false, description: 'Provides healthcare support' },
        activeMembers: { type: 'number', description: 'Number of active members' },
        staffCount: { type: 'number', description: 'Number of staff' },
        
        // File uploads
        logoFile: { type: 'string', format: 'binary', description: 'NGO logo file upload' },
      },
      required: ['firstName', 'lastName', 'email', 'organizationName'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoFile', maxCount: 1 },
    ]),
  )
  async registerNgo(
    @Body() registerNgoDto: RegisterNgoDto,
    @UploadedFiles()
    files: {
      logoFile?: Express.Multer.File[];
    },
  ): Promise<NgoRegistrationResponseDto> {
    return this.authService.registerNgo(registerNgoDto, files);
  }

  @Public()
  @Post('register/company')
  @RateLimit(5, 300) // 5 requests per 5 minutes
  @ApiOperation({
    summary: 'Register new company',
    description: 'Creates a new company account with user and company profile information. Company will require admin verification before being able to post job offers.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company successfully registered',
    type: CompanyRegistrationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or email already in use',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        // User information (company representative)
        firstName: { type: 'string', example: 'Jean', description: 'Company representative first name' },
        lastName: { type: 'string', example: 'Dupont', description: 'Company representative last name' },
        email: { type: 'string', example: 'jean.dupont@techsolutions.com', description: 'Company representative email' },
        password: { type: 'string', example: 'Password123!', description: 'Password (optional - will be generated if not provided)' },
        contact: { type: 'string', example: '+237123456789', description: 'Representative contact number' },
        secondaryContact: { type: 'string', example: '+237987654321', description: 'Representative secondary contact' },
        sex: { type: 'string', example: 'male', enum: ['male', 'female', 'other'], description: 'Representative gender' },
        birthDate: { type: 'string', example: '1980-01-15', description: 'Representative birth date' },
        address: { type: 'string', example: '123 Main Street, Douala, Cameroon', description: 'Representative address' },
        profession: { type: 'string', example: 'CEO', description: 'Representative profession' },
        
        // Company information
        companyName: { type: 'string', example: 'Tech Solutions SARL', description: 'Company name' },
        registrationNumber: { type: 'string', example: 'RCCM123456789', description: 'Company registration number (RCCM, SIRET, etc.)' },
        taxNumber: { type: 'string', example: 'TAX987654321', description: 'Tax identification number' },
        description: { type: 'string', description: 'Company description' },
        website: { type: 'string', example: 'https://www.techsolutions.com', description: 'Company website URL' },
        activitySectorId: { type: 'string', example: 'uuid-activity-sector-id', description: 'Activity sector ID' },
        companySizeId: { type: 'string', example: 'uuid-company-size-id', description: 'Company size ID' },
        exactEmployeeCount: { type: 'number', example: 150, description: 'Exact number of employees' },
        locationId: { type: 'string', example: 'uuid-location-id', description: 'Location ID' },
        fullAddress: { type: 'string', example: '123 Business Avenue, Tech District, City, Country', description: 'Full company address' },
        currentDisabledEmployeesCount: { type: 'number', example: 5, description: 'Current number of disabled employees' },
        hrContactName: { type: 'string', example: 'Marie Martin', description: 'HR contact person name' },
        hrContactEmail: { type: 'string', example: 'rh@techsolutions.com', description: 'HR contact email' },
        hrContactPhone: { type: 'string', example: '+237123456789', description: 'HR contact phone number' },
        
        // File uploads
        logoFile: { type: 'string', format: 'binary', description: 'Company logo file upload' },
      },
      required: ['firstName', 'lastName', 'email', 'companyName', 'activitySectorId', 'companySizeId', 'locationId'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoFile', maxCount: 1 },
    ]),
  )
  async registerCompany(
    @Body() registerCompanyDto: RegisterCompanyDto,
    @UploadedFiles()
    files: {
      logoFile?: Express.Multer.File[];
    },
  ): Promise<CompanyRegistrationResponseDto> {
    return this.authService.registerCompany(registerCompanyDto, files);
  }
}
