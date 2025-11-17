import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus, NotFoundException, UploadedFile, Patch, Query, BadRequestException, Put, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto, PaginatedUsersResponseDto, PagedUsersResponseDto } from './dto/user-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { StorageService } from '../../storage/storage.service';
import { FileUpload } from '../../storage/storage.interface';
import { CreateUserWithPhotoDto } from './dto/create-user-with-photo.dto';
import { UserPageQueryDto } from './dto/user-query.dto';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiNotFoundResponse,
  ApiConsumes,
  ApiBody
} from '@nestjs/swagger';
import { UserPermissionsDto } from './dto/user-permissions.dto';
import { UserPermissionsResponseDto } from './dto/user-permissions-response.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { Public } from 'src/common/guards/global-auth.guard';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
// @UseGuards(RolesGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService
  ) {}

  @Public()
  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:create')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        secondaryContact: { type: 'string' },
        sex: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        address: { type: 'string' },
        profession: { type: 'string' },
        password: { type: 'string' },
        isActive: { type: 'boolean' },
        roles: { type: 'array', items: { type: 'string' } },
        permissions: { type: 'array', items: { type: 'string' } },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['firstName', 'lastName', 'email'],
    }
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() body: any,
    @UploadedFile() photo?: FileUpload
  ) {
    // Créer un nouvel objet DTO propre
    const createUserDto: any = {};

    // Copier les champs textuels simples
    const textFields = ['firstName', 'lastName', 'email', 'contact', 'secondaryContact', 
                      'sex', 'address', 'profession', 'password'];
    
    textFields.forEach(field => {
      if (field in body) {
        createUserDto[field] = body[field];
      }
    });

    // Traiter les champs booléens
    if ('isActive' in body) {
      if (typeof body.isActive === 'string') {
        createUserDto.isActive = body.isActive.toLowerCase() === 'true';
      } else {
        createUserDto.isActive = !!body.isActive;
      }
    }

    // Traiter la date de naissance
    if (body.birthDate) {
      createUserDto.birthDate = body.birthDate;
    }

    // Traiter les rôles
    if (body.roles) {
      // Si c'est déjà un tableau, l'utiliser tel quel
      if (Array.isArray(body.roles)) {
        createUserDto.roles = body.roles;
      }
      // Si c'est une chaîne qui ressemble à un JSON, essayer de la parser
      else if (typeof body.roles === 'string' && (body.roles.startsWith('[') || body.roles.startsWith('"'))) {
        try {
          const parsed = JSON.parse(body.roles);
          createUserDto.roles = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // En cas d'erreur de parsing, considérer comme une seule valeur
          createUserDto.roles = [body.roles];
        }
      }
      // Sinon, c'est une valeur unique
      else {
        createUserDto.roles = [body.roles];
      }
    }

    // Traiter les permissions
    if (body.permissions) {
      // Si c'est déjà un tableau, l'utiliser tel quel
      if (Array.isArray(body.permissions)) {
        createUserDto.permissions = body.permissions;
      }
      // Si c'est une chaîne qui ressemble à un JSON, essayer de la parser
      else if (typeof body.permissions === 'string' && (body.permissions.startsWith('[') || body.permissions.startsWith('"'))) {
        try {
          const parsed = JSON.parse(body.permissions);
          createUserDto.permissions = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // En cas d'erreur de parsing, considérer comme une seule valeur
          createUserDto.permissions = [body.permissions];
        }
      }
      // Sinon, c'est une valeur unique
      else {
        createUserDto.permissions = [body.permissions];
      }
    }

    // D'abord créer l'utilisateur
    const user = await this.usersService.create(createUserDto);
    
    // Si une photo est fournie, la stocker et mettre à jour le profil utilisateur
    if (photo) {
      const fileInfo = await this.storageService.storeFile(photo, 'users');
      await this.usersService.updateProfile(user.id, { photoUrl: fileInfo.path });
      user.photoUrl = fileInfo.path;
    }
    
    return user;
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto
  })
  async findAll(@Query() query: any) {
    return this.usersService.findWithPagePagination(query);
  }

  @Get('page')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:view')
  @ApiOperation({ summary: 'Get users with page-based pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
    type: PagedUsersResponseDto
  })
  async findAllPaged(@Query() query: UserPageQueryDto) {
    return this.usersService.findWithPagePagination(query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:view')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User retrieved successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        contact: { type: 'string' },
        secondaryContact: { type: 'string' },
        sex: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        address: { type: 'string' },
        profession: { type: 'string' },
        password: { type: 'string' },
        isActive: { type: 'boolean' },
        roles: { type: 'array', items: { type: 'string' } },
        photo: { type: 'string', format: 'binary' },
      },
    },
    description: 'User profile data to update'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFile() photo?: FileUpload
  ) {
    const user = await this.usersService.findOne(id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Créer un nouvel objet DTO propre
    const updateUserDto: UpdateUserProfileDto  = {};
    // const updateUserDto: any  = {};

    // Copier les champs textuels simples
    const textFields = ['firstName', 'lastName', 'email', 'contact', 'secondaryContact', 
                      'sex', 'address', 'profession', 'password'];
    
    textFields.forEach(field => {
      if (field in body) {
        updateUserDto[field] = body[field];
      }
    });

    // Traiter les champs booléens
    if ('isActive' in body) {
      if (typeof body.isActive === 'string') {
        updateUserDto.isActive = body.isActive.toLowerCase() === 'true';
      } else {
        updateUserDto.isActive = !!body.isActive;
      }
    }

    // Traiter la date de naissance
    if (body.birthDate) {
      updateUserDto.birthDate = body.birthDate;
    }

    // Traiter les rôles
    if (body.roles) {
      // Si c'est déjà un tableau, l'utiliser tel quel
      if (Array.isArray(body.roles)) {
        updateUserDto.roles = body.roles;
      }
      // Si c'est une chaîne qui ressemble à un JSON, essayer de la parser
      else if (typeof body.roles === 'string' && (body.roles.startsWith('[') || body.roles.startsWith('"'))) {
        try {
          const parsed = JSON.parse(body.roles);
          updateUserDto.roles = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // En cas d'erreur de parsing, considérer comme une seule valeur
          updateUserDto.roles = [body.roles];
        }
      }
      // Sinon, c'est une valeur unique
      else {
        updateUserDto.roles = [body.roles];
      }
    }

    // Si une photo est fournie, la stocker et mettre à jour l'URL dans l'objet DTO
    if (photo) {
      const fileInfo = await this.storageService.storeFile(photo, 'users');
      updateUserDto.photoUrl = fileInfo.path;
    }

    console.log('FIELDS ====>', updateUserDto)

    // Update the user's profile
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Post('register')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
        role: { type: 'string', enum: ['user', 'admin', 'editor'] },
        roles: { type: 'array', items: { type: 'string' } },
        permissions: { type: 'array', items: { type: 'string' } },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['name', 'email'],
    },
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User created successfully with photo',
    type: UserResponseDto
  })
  async createWithPhoto(
    @Body() createUserDto: CreateUserWithPhotoDto,
    @UploadedFile() photo: FileUpload
  ) {
    // First create the user
    const user = await this.usersService.create(createUserDto);
    
    // If photo is provided, upload it and update the user profile
    if (photo) {
      const fileInfo = await this.storageService.storeFile(photo, 'users');
      await this.usersService.updateProfile(user.id, { photoUrl: fileInfo.path });
      user.photoUrl = fileInfo.path;
    }
    
    return user;
  }

  @Post(':id/permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:assign-roles')
  @ApiOperation({ summary: 'Assign permissions to a user' })
  @ApiParam({ name: 'id', description: 'The ID of the user to assign permissions to' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Permissions assigned successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() dto: UserPermissionsDto
  ) {
    return this.usersService.assignPermissions(id, dto);
  }

  @Post(':id/permissions/add')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:assign-roles')
  @ApiOperation({ summary: 'Add permissions to a user' })
  @ApiParam({ name: 'id', description: 'The ID of the user to add permissions to' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Permissions added successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async addPermissions(
    @Param('id') id: string,
    @Body() dto: UserPermissionsDto
  ) {
    return this.usersService.addPermissions(id, dto);
  }

  @Post(':id/permissions/remove')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:assign-roles')
  @ApiOperation({ summary: 'Remove permissions from a user' })
  @ApiParam({ name: 'id', description: 'The ID of the user to remove permissions from' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Permissions removed successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async removePermissions(
    @Param('id') id: string,
    @Body() dto: UserPermissionsDto
  ) {
    return this.usersService.removePermissions(id, dto);
  }

  @Get(':id/permissions')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:view')
  @ApiOperation({ summary: 'Get user permissions' })
  @ApiParam({ name: 'id', description: 'The ID of the user to get permissions for' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Permissions retrieved successfully',
    type: UserPermissionsResponseDto
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async getUserPermissions(
    @Param('id') id: string
  ) {
    return this.usersService.getUserPermissions(id);
  }

  @Put(':id/change-password')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('users:update')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'The ID of the user to change password for' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Password changed successfully'
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Current password is incorrect'
  })
  @ApiNotFoundResponse({ description: 'User not found' })
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    const success = await this.usersService.changePassword(
      id, 
      changePasswordDto.currentPassword, 
      changePasswordDto.newPassword
    );

    if (success) {
      return { message: 'Password changed successfully' };
    } else {
      throw new BadRequestException('Failed to change password');
    }
  }
}
