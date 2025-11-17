import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Ngo } from '../entities/ngo.entity';
import { User, UserType } from '../entities/user.entity';
import { Candidate } from '../entities/candidate.entity';
import { ActivitySector } from '../entities/activity-sector.entity';
import { DisabilityType } from '../entities/disability-type.entity';
import { Location } from '../entities/location.entity';
import { Document } from '../entities/document.entity';
import { Role } from '../entities/role.entity';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';
import { CreateNgoCandidateDto } from './dto/create-ngo-candidate.dto';
import { NgoResponseDto } from './dto/ngo-response.dto';
import { PaginatedNgoResponseDto } from './dto/paginated-ngo-response.dto';
import { CandidateResponseDto } from '../candidates/candidates.dto';
import { StorageService } from '../../storage/storage.service';
import * as bcrypt from 'bcrypt';

/**
 * Utility function to generate a secure random password
 */
function generateRandomPassword(length: number = 12): string {
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

@Injectable()
export class NgosService {
  constructor(
    @InjectRepository(Ngo)
    private readonly ngoRepository: Repository<Ngo>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(ActivitySector)
    private readonly activitySectorRepository: Repository<ActivitySector>,
    @InjectRepository(DisabilityType)
    private readonly disabilityTypeRepository: Repository<DisabilityType>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
  ) {}

  /**
   * Create a new NGO with associated user account
   * @param createNgoDto NGO creation data
   * @param userId User ID who will be associated with this NGO
   * @returns Created NGO with user information
   */
  async createNgo(createNgoDto: CreateNgoDto, userId: string): Promise<NgoResponseDto> {
    // Check if user already has an NGO
    const existingNgo = await this.ngoRepository.findOne({
      where: { userId },
    });

    if (existingNgo) {
      throw new ConflictException('User already has an NGO account');
    }

    // Verify location exists if locationId is provided
    if (createNgoDto.locationId) {
      const location = await this.locationRepository.findOne({
        where: { id: createNgoDto.locationId },
      });

      if (!location) {
        throw new BadRequestException('Invalid location ID');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create NGO
      const ngo = new Ngo();
      ngo.userId = userId;
      ngo.organizationName = createNgoDto.organizationName;
      if (createNgoDto.registrationNumber) ngo.registrationNumber = createNgoDto.registrationNumber;
      if (createNgoDto.taxNumber) ngo.taxNumber = createNgoDto.taxNumber;
      if (createNgoDto.mission) ngo.mission = createNgoDto.mission;
      if (createNgoDto.description) ngo.description = createNgoDto.description;
      if (createNgoDto.website) ngo.website = createNgoDto.website;
      if (createNgoDto.foundedDate) ngo.foundedDate = new Date(createNgoDto.foundedDate);
      ngo.locationId = createNgoDto.locationId || null;
      if (createNgoDto.fullAddress) ngo.fullAddress = createNgoDto.fullAddress;
      if (createNgoDto.primaryContactName) ngo.primaryContactName = createNgoDto.primaryContactName;
      if (createNgoDto.primaryContactEmail) ngo.primaryContactEmail = createNgoDto.primaryContactEmail;
      if (createNgoDto.primaryContactPhone) ngo.primaryContactPhone = createNgoDto.primaryContactPhone;
      if (createNgoDto.secondaryContactName) ngo.secondaryContactName = createNgoDto.secondaryContactName;
      if (createNgoDto.secondaryContactEmail) ngo.secondaryContactEmail = createNgoDto.secondaryContactEmail;
      if (createNgoDto.secondaryContactPhone) ngo.secondaryContactPhone = createNgoDto.secondaryContactPhone;
      if (createNgoDto.servicesOffered) ngo.servicesOffered = createNgoDto.servicesOffered;
      ngo.providesJobTraining = createNgoDto.providesJobTraining || false;
      ngo.providesCareerCounseling = createNgoDto.providesCareerCounseling || false;
      ngo.providesLegalSupport = createNgoDto.providesLegalSupport || false;
      ngo.providesHealthcareSupport = createNgoDto.providesHealthcareSupport || false;
      ngo.activeMembers = createNgoDto.activeMembers || 0;
      ngo.staffCount = createNgoDto.staffCount || 0;

      const savedNgo = await queryRunner.manager.save(ngo);

      // Handle focus areas (activity sectors)
      if (createNgoDto.focusAreaIds && createNgoDto.focusAreaIds.length > 0) {
        const focusAreas = await queryRunner.manager.find(ActivitySector, {
          where: { id: In(createNgoDto.focusAreaIds) },
        });
        savedNgo.focusAreas = focusAreas;
        await queryRunner.manager.save(savedNgo);
      }

      // Handle supported disability types
      if (createNgoDto.supportedDisabilityTypeIds && createNgoDto.supportedDisabilityTypeIds.length > 0) {
        const supportedDisabilityTypes = await queryRunner.manager.find(DisabilityType, {
          where: { id: In(createNgoDto.supportedDisabilityTypeIds) },
        });
        savedNgo.supportedDisabilityTypes = supportedDisabilityTypes;
        await queryRunner.manager.save(savedNgo);
      }

      // Handle service areas
      if (createNgoDto.serviceAreaIds && createNgoDto.serviceAreaIds.length > 0) {
        const serviceAreas = await queryRunner.manager.find(Location, {
          where: { id: In(createNgoDto.serviceAreaIds) },
        });
        savedNgo.serviceAreas = serviceAreas;
        await queryRunner.manager.save(savedNgo);
      }

      await queryRunner.commitTransaction();

      // Return full NGO with relations
      return this.findNgoById(savedNgo.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a candidate associated with an NGO
   * @param ngoId NGO ID
   * @param createCandidateDto Candidate creation data  
   * @param files Uploaded files
   * @returns Created candidate
   */
  async createNgoCandidate(
    ngoId: string,
    createCandidateDto: CreateNgoCandidateDto,
    files?: {
      profilePhoto?: Express.Multer.File[];
      cvFile?: Express.Multer.File[];
      videoFile?: Express.Multer.File[];
      disabilityCertificate?: Express.Multer.File[];
      portfolioFiles?: Express.Multer.File[];
    },
  ): Promise<CandidateResponseDto> {
    // Verify NGO exists and can support candidates  
    const ngo = await this.ngoRepository.findOne({
      where: { id: ngoId, canSupportCandidates: true, isActive: true },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found or cannot support candidates');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createCandidateDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Verify disability type exists
    const disabilityType = await this.disabilityTypeRepository.findOne({
      where: { id: createCandidateDto.disabilityTypeId },
    });

    if (!disabilityType) {
      throw new BadRequestException('Invalid disability type ID');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate password if not provided
      const password = createCandidateDto.password || generateRandomPassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account
      const user = new User();
      user.firstName = createCandidateDto.firstName;
      user.lastName = createCandidateDto.lastName;
      user.email = createCandidateDto.email;
      user.password = hashedPassword;
      if (createCandidateDto.contact) user.contact = createCandidateDto.contact;
      if (createCandidateDto.secondaryContact) user.secondaryContact = createCandidateDto.secondaryContact;
      if (createCandidateDto.sex) user.sex = createCandidateDto.sex;
      if (createCandidateDto.birthDate) user.birthDate = new Date(createCandidateDto.birthDate);
      if (createCandidateDto.address) user.address = createCandidateDto.address;
      if (createCandidateDto.profession) user.profession = createCandidateDto.profession;
      user.userType = UserType.CANDIDATE;
      user.isActive = true;
      user.isEmailVerified = true; // NGO-created candidates are pre-verified
      
      // Set roles if provided, otherwise use default candidate role
      if (createCandidateDto.roles && createCandidateDto.roles.length > 0) {
        // Resolve role IDs to Role objects
        const roleRepository = queryRunner.manager.getRepository(Role);
        user.roles = await roleRepository.find({ where: { id: In(createCandidateDto.roles) } });
      } else {
        // Set default candidate role ID (assuming this is the standard candidate role ID)
        const roleRepository = queryRunner.manager.getRepository(Role);
        const defaultRole = await roleRepository.findOne({ where: { id: "050dd11a-9971-400e-9fab-b8e41501d640" } });
        if (defaultRole) {
          user.roles = [defaultRole];
        }
      }

      const savedUser = await queryRunner.manager.save(user);

      // Create candidate profile
      const candidate = new Candidate();
      candidate.userId = savedUser.id;
      candidate.ngoId = ngoId;
      candidate.isManagedByNgo = true;
      candidate.disabilityTypeId = createCandidateDto.disabilityTypeId;
      if (createCandidateDto.disabilityDescription) candidate.disabilityDescription = createCandidateDto.disabilityDescription;
      if (createCandidateDto.educationLevelId) candidate.educationLevelId = createCandidateDto.educationLevelId;
      if (createCandidateDto.experienceLevelId) candidate.experienceLevelId = createCandidateDto.experienceLevelId;
      if (createCandidateDto.professionId) candidate.professionId = createCandidateDto.professionId;
      if (createCandidateDto.professionalSummary) candidate.professionalSummary = createCandidateDto.professionalSummary;
      if (createCandidateDto.skills) candidate.skills = createCandidateDto.skills;
      if (createCandidateDto.languages) candidate.languages = createCandidateDto.languages;
      if (createCandidateDto.locationId) candidate.locationId = createCandidateDto.locationId;
      if (createCandidateDto.biography) candidate.biography = createCandidateDto.biography;
      if (createCandidateDto.videoPresentation) candidate.videoPresentation = createCandidateDto.videoPresentation;
      if (createCandidateDto.expectedSalaryMin) candidate.expectedSalaryMin = createCandidateDto.expectedSalaryMin;
      if (createCandidateDto.expectedSalaryMax) candidate.expectedSalaryMax = createCandidateDto.expectedSalaryMax;
      candidate.isAvailable = createCandidateDto.isAvailable ?? true;
      if (createCandidateDto.availabilityDate) candidate.availabilityDate = new Date(createCandidateDto.availabilityDate);

      const savedCandidate = await queryRunner.manager.save(candidate);

      // Handle file uploads if provided
      if (files) {
        const filePromises: Promise<void>[] = [];

        // Handle profile photo
        if (files.profilePhoto && files.profilePhoto.length > 0) {
          const profilePhotoFile = files.profilePhoto[0];
          filePromises.push(
            this.storageService.storeFile({
              buffer: profilePhotoFile.buffer,
              originalname: profilePhotoFile.originalname,
              mimetype: profilePhotoFile.mimetype,
              size: profilePhotoFile.size,
              fieldname: profilePhotoFile.fieldname,
              encoding: profilePhotoFile.encoding,
            }, 'candidates/photos')
              .then(async (storedFile) => {
                // Update candidate photoUrl
                await queryRunner.manager.update(Candidate, { id: savedCandidate.id }, { 
                  photoUrl: storedFile.path 
                });

                // Create document record
                const document = new Document();
                document.userId = savedUser.id;
                document.originalName = storedFile.originalname || profilePhotoFile.originalname;
                document.fileName = storedFile.filename;
                document.fileUrl = storedFile.path;
                document.mimeType = storedFile.mimetype;
                document.fileSize = storedFile.size;
                document.documentType = 'photo';
                document.category = 'candidate';
                document.relatedEntityType = 'candidate_profile';
                document.relatedEntityId = savedCandidate.id;
                document.isActive = true;
                await queryRunner.manager.save(document);
              })
          );
        }

        // Handle CV file
        if (files.cvFile && files.cvFile.length > 0) {
          const cvFile = files.cvFile[0];
          filePromises.push(
            this.storageService.storeFile({
              buffer: cvFile.buffer,
              originalname: cvFile.originalname,
              mimetype: cvFile.mimetype,
              size: cvFile.size,
              fieldname: cvFile.fieldname,
              encoding: cvFile.encoding,
            }, 'candidates/cvs')
              .then(async (storedFile) => {
                // Update candidate cvFileUrl
                await queryRunner.manager.update(Candidate, { id: savedCandidate.id }, { 
                  cvFileUrl: storedFile.path 
                });

                // Create document record
                const document = new Document();
                document.userId = savedUser.id;
                document.originalName = storedFile.originalname || cvFile.originalname;
                document.fileName = storedFile.filename;
                document.fileUrl = storedFile.path;
                document.mimeType = storedFile.mimetype;
                document.fileSize = storedFile.size;
                document.documentType = 'cv';
                document.category = 'candidate';
                document.relatedEntityType = 'candidate_profile';
                document.relatedEntityId = savedCandidate.id;
                document.isActive = true;
                await queryRunner.manager.save(document);
              })
          );
        }

        // Handle video file
        if (files.videoFile && files.videoFile.length > 0) {
          const videoFile = files.videoFile[0];
          filePromises.push(
            this.storageService.storeFile({
              buffer: videoFile.buffer,
              originalname: videoFile.originalname,
              mimetype: videoFile.mimetype,
              size: videoFile.size,
              fieldname: videoFile.fieldname,
              encoding: videoFile.encoding,
            }, 'candidates/videos')
              .then(async (storedFile) => {
                // Update candidate videoPresentation
                await queryRunner.manager.update(Candidate, { id: savedCandidate.id }, { 
                  videoPresentation: storedFile.path 
                });

                // Create document record
                const document = new Document();
                document.userId = savedUser.id;
                document.originalName = storedFile.originalname || videoFile.originalname;
                document.fileName = storedFile.filename;
                document.fileUrl = storedFile.path;
                document.mimeType = storedFile.mimetype;
                document.fileSize = storedFile.size;
                document.documentType = 'video';
                document.category = 'candidate';
                document.relatedEntityType = 'candidate_profile';
                document.relatedEntityId = savedCandidate.id;
                document.isActive = true;
                await queryRunner.manager.save(document);
              })
          );
        }

        // Handle disability certificate
        if (files.disabilityCertificate && files.disabilityCertificate.length > 0) {
          const disabilityCertFile = files.disabilityCertificate[0];
          filePromises.push(
            this.storageService.storeFile({
              buffer: disabilityCertFile.buffer,
              originalname: disabilityCertFile.originalname,
              mimetype: disabilityCertFile.mimetype,
              size: disabilityCertFile.size,
              fieldname: disabilityCertFile.fieldname,
              encoding: disabilityCertFile.encoding,
            }, 'candidates/certificates')
              .then(async (storedFile) => {
                // Create document record
                const document = new Document();
                document.userId = savedUser.id;
                document.originalName = storedFile.originalname || disabilityCertFile.originalname;
                document.fileName = storedFile.filename;
                document.fileUrl = storedFile.path;
                document.mimeType = storedFile.mimetype;
                document.fileSize = storedFile.size;
                document.documentType = 'medical_certificate';
                document.category = 'candidate';
                document.relatedEntityType = 'candidate_profile';
                document.relatedEntityId = savedCandidate.id;
                document.isActive = true;
                await queryRunner.manager.save(document);
              })
          );
        }

        // Handle portfolio files
        if (files.portfolioFiles && files.portfolioFiles.length > 0) {
          for (const portfolioFile of files.portfolioFiles) {
            filePromises.push(
              this.storageService.storeFile({
                buffer: portfolioFile.buffer,
                originalname: portfolioFile.originalname,
                mimetype: portfolioFile.mimetype,
                size: portfolioFile.size,
                fieldname: portfolioFile.fieldname,
                encoding: portfolioFile.encoding,
              }, 'candidates/portfolio')
                .then(async (storedFile) => {
                  // Create document record
                  const document = new Document();
                  document.userId = savedUser.id;
                  document.originalName = storedFile.originalname || portfolioFile.originalname;
                  document.fileName = storedFile.filename;
                  document.fileUrl = storedFile.path;
                  document.mimeType = storedFile.mimetype;
                  document.fileSize = storedFile.size;
                  document.documentType = 'portfolio';
                  document.category = 'candidate';
                  document.relatedEntityType = 'candidate_profile';
                  document.relatedEntityId = savedCandidate.id;
                  document.isActive = true;
                  await queryRunner.manager.save(document);
                })
            );
          }
        }

        // Wait for all file uploads to complete
        await Promise.all(filePromises);
      }

      // Update NGO candidate count
      await queryRunner.manager.increment(Ngo, { id: ngoId }, 'totalCandidatesSupported', 1);

      await queryRunner.commitTransaction();

      // Return full candidate data
      const candidateWithRelations = await this.candidateRepository.findOne({
        where: { id: savedCandidate.id },
        relations: [
          'user',
          'ngo',
          'disabilityType',
          'educationLevel',
          'experienceLevel',
          'profession',
          'location',
        ],
      });

      return candidateWithRelations as any;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find NGO by ID with all relations
   * @param id NGO ID
   * @returns NGO with relations
   */
  async findNgoById(id: string): Promise<NgoResponseDto> {
    const ngo = await this.ngoRepository.findOne({
      where: { id },
      relations: [
        'user',
        'location',
        'serviceAreas',
        'focusAreas',
        'supportedDisabilityTypes',
        'candidates',
        'candidates.user',
      ],
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    return ngo as any;
  }

  /**
   * Get all candidates managed by an NGO
   * @param ngoId NGO ID
   * @returns List of candidates
   */
  async getNgoCandidates(ngoId: string): Promise<CandidateResponseDto[]> {
    const ngo = await this.ngoRepository.findOne({
      where: { id: ngoId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    const candidates = await this.candidateRepository.find({
      where: { ngoId },
      relations: [
        'user',
        'ngo',
        'disabilityType',
        'educationLevel',
        'experienceLevel',
        'profession',
        'location',
      ],
    });

    return candidates;
  }

  /**
   * Find NGO by user ID
   * @param userId User ID
   * @returns NGO associated with user
   */
  async findNgoByUserId(userId: string): Promise<NgoResponseDto> {
    const ngo = await this.ngoRepository.findOne({
      where: { userId },
      relations: [
        'user',
        'location',
        'serviceAreas',
        'focusAreas',
        'supportedDisabilityTypes',
        'candidates',
        'candidates.user',
      ],
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found for this user');
    }

    return ngo as any;
  }

  /**
   * Find all NGOs with pagination and filtering
   * @param options Pagination and filter options
   * @returns Paginated NGOs
   */
  async findAllNgos(options: {
    page: number;
    size: number;
    search?: string;
    locationId?: string;
    isVerified?: boolean;
    isActive?: boolean;
    providesJobTraining?: boolean;
    providesCareerCounseling?: boolean;
    providesLegalSupport?: boolean;
    providesHealthcareSupport?: boolean;
  }): Promise<PaginatedNgoResponseDto> {
    const { page, size, search, locationId, isVerified, isActive, ...services } = options;
    
    const queryBuilder = this.ngoRepository.createQueryBuilder('ngo')
      .leftJoinAndSelect('ngo.user', 'user')
      .leftJoinAndSelect('ngo.location', 'location')
      .leftJoinAndSelect('ngo.serviceAreas', 'serviceAreas')
      .leftJoinAndSelect('ngo.focusAreas', 'focusAreas')
      .leftJoinAndSelect('ngo.supportedDisabilityTypes', 'supportedDisabilityTypes');

    // Apply filters
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(ngo.organizationName) LIKE LOWER(:search) OR LOWER(ngo.description) LIKE LOWER(:search) OR LOWER(ngo.mission) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    if (locationId) {
      queryBuilder.andWhere('ngo.locationId = :locationId', { locationId });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('ngo.isVerified = :isVerified', { isVerified });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('ngo.isActive = :isActive', { isActive });
    }

    if (services.providesJobTraining !== undefined) {
      queryBuilder.andWhere('ngo.providesJobTraining = :providesJobTraining', { providesJobTraining: services.providesJobTraining });
    }

    if (services.providesCareerCounseling !== undefined) {
      queryBuilder.andWhere('ngo.providesCareerCounseling = :providesCareerCounseling', { providesCareerCounseling: services.providesCareerCounseling });
    }

    if (services.providesLegalSupport !== undefined) {
      queryBuilder.andWhere('ngo.providesLegalSupport = :providesLegalSupport', { providesLegalSupport: services.providesLegalSupport });
    }

    if (services.providesHealthcareSupport !== undefined) {
      queryBuilder.andWhere('ngo.providesHealthcareSupport = :providesHealthcareSupport', { providesHealthcareSupport: services.providesHealthcareSupport });
    }

    // Order by creation date (newest first)
    queryBuilder.orderBy('ngo.createdAt', 'DESC');

    // Apply pagination
    const offset = (page - 1) * size;
    queryBuilder.skip(offset).take(size);

    const [ngos, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / size);

    return {
      data: ngos as any,
      meta: {
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Update NGO by user ID
   * @param userId User ID
   * @param updateNgoDto Update data
   * @returns Updated NGO
   */
  async updateNgoByUserId(userId: string, updateNgoDto: UpdateNgoDto): Promise<NgoResponseDto> {
    const ngo = await this.ngoRepository.findOne({
      where: { userId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found for this user');
    }

    // Verify location exists if locationId is provided
    if (updateNgoDto.locationId) {
      const location = await this.locationRepository.findOne({
        where: { id: updateNgoDto.locationId },
      });

      if (!location) {
        throw new BadRequestException('Invalid location ID');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update NGO basic info
      Object.keys(updateNgoDto).forEach(key => {
        if (updateNgoDto[key] !== undefined && key !== 'focusAreaIds' && key !== 'supportedDisabilityTypeIds' && key !== 'serviceAreaIds') {
          if (key === 'foundedDate') {
            if (updateNgoDto[key]) {
              ngo[key] = new Date(updateNgoDto[key]);
            }
          } else {
            ngo[key] = updateNgoDto[key];
          }
        }
      });

      const savedNgo = await queryRunner.manager.save(ngo);

      // Handle focus areas update
      if (updateNgoDto.focusAreaIds !== undefined) {
        if (updateNgoDto.focusAreaIds.length > 0) {
          const focusAreas = await queryRunner.manager.find(ActivitySector, {
            where: { id: In(updateNgoDto.focusAreaIds) },
          });
          savedNgo.focusAreas = focusAreas;
        } else {
          savedNgo.focusAreas = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      // Handle supported disability types update
      if (updateNgoDto.supportedDisabilityTypeIds !== undefined) {
        if (updateNgoDto.supportedDisabilityTypeIds.length > 0) {
          const supportedDisabilityTypes = await queryRunner.manager.find(DisabilityType, {
            where: { id: In(updateNgoDto.supportedDisabilityTypeIds) },
          });
          savedNgo.supportedDisabilityTypes = supportedDisabilityTypes;
        } else {
          savedNgo.supportedDisabilityTypes = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      // Handle service areas update
      if (updateNgoDto.serviceAreaIds !== undefined) {
        if (updateNgoDto.serviceAreaIds.length > 0) {
          const serviceAreas = await queryRunner.manager.find(Location, {
            where: { id: In(updateNgoDto.serviceAreaIds) },
          });
          savedNgo.serviceAreas = serviceAreas;
        } else {
          savedNgo.serviceAreas = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      await queryRunner.commitTransaction();

      // Return updated NGO with relations
      return this.findNgoByUserId(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update NGO by ID
   * @param id NGO ID
   * @param updateNgoDto Update data
   * @returns Updated NGO
   */
  async updateNgoById(id: string, updateNgoDto: UpdateNgoDto): Promise<NgoResponseDto> {
    const ngo = await this.ngoRepository.findOne({
      where: { id },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    // Verify location exists if locationId is provided
    if (updateNgoDto.locationId) {
      const location = await this.locationRepository.findOne({
        where: { id: updateNgoDto.locationId },
      });

      if (!location) {
        throw new BadRequestException('Invalid location ID');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update NGO basic info
      Object.keys(updateNgoDto).forEach(key => {
        if (updateNgoDto[key] !== undefined && key !== 'focusAreaIds' && key !== 'supportedDisabilityTypeIds' && key !== 'serviceAreaIds') {
          if (key === 'foundedDate') {
            if (updateNgoDto[key]) {
              ngo[key] = new Date(updateNgoDto[key]);
            }
          } else {
            ngo[key] = updateNgoDto[key];
          }
        }
      });

      const savedNgo = await queryRunner.manager.save(ngo);

      // Handle focus areas update
      if (updateNgoDto.focusAreaIds !== undefined) {
        if (updateNgoDto.focusAreaIds.length > 0) {
          const focusAreas = await queryRunner.manager.find(ActivitySector, {
            where: { id: In(updateNgoDto.focusAreaIds) },
          });
          savedNgo.focusAreas = focusAreas;
        } else {
          savedNgo.focusAreas = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      // Handle supported disability types update
      if (updateNgoDto.supportedDisabilityTypeIds !== undefined) {
        if (updateNgoDto.supportedDisabilityTypeIds.length > 0) {
          const supportedDisabilityTypes = await queryRunner.manager.find(DisabilityType, {
            where: { id: In(updateNgoDto.supportedDisabilityTypeIds) },
          });
          savedNgo.supportedDisabilityTypes = supportedDisabilityTypes;
        } else {
          savedNgo.supportedDisabilityTypes = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      // Handle service areas update
      if (updateNgoDto.serviceAreaIds !== undefined) {
        if (updateNgoDto.serviceAreaIds.length > 0) {
          const serviceAreas = await queryRunner.manager.find(Location, {
            where: { id: In(updateNgoDto.serviceAreaIds) },
          });
          savedNgo.serviceAreas = serviceAreas;
        } else {
          savedNgo.serviceAreas = [];
        }
        await queryRunner.manager.save(savedNgo);
      }

      await queryRunner.commitTransaction();

      // Return updated NGO with relations
      return this.findNgoById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete NGO by user ID
   * @param userId User ID
   */
  async deleteNgoByUserId(userId: string): Promise<void> {
    const ngo = await this.ngoRepository.findOne({
      where: { userId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found for this user');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete associated candidates (if any)
      await queryRunner.manager.delete(Candidate, { ngoId: ngo.id });

      // Delete NGO
      await queryRunner.manager.delete(Ngo, { id: ngo.id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete NGO by ID
   * @param id NGO ID
   */
  async deleteNgoById(id: string): Promise<void> {
    const ngo = await this.ngoRepository.findOne({
      where: { id },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete associated candidates (if any)
      await queryRunner.manager.delete(Candidate, { ngoId: id });

      // Delete NGO
      await queryRunner.manager.delete(Ngo, { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete all candidates managed by an NGO
   * @param ngoId NGO ID
   * @returns Number of deleted candidates
   */
  async deleteNgoCandidates(ngoId: string): Promise<number> {
    const ngo = await this.ngoRepository.findOne({
      where: { id: ngoId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find all candidates managed by this NGO
      const candidates = await queryRunner.manager.find(Candidate, {
        where: { ngoId },
        relations: ['user'],
      });

      // Delete candidate profiles and associated users
      for (const candidate of candidates) {
        if (candidate.user && candidate.isManagedByNgo) {
          // Delete user account for NGO-managed candidates
          await queryRunner.manager.delete(User, { id: candidate.userId });
        }
        await queryRunner.manager.delete(Candidate, { id: candidate.id });
      }

      // Update NGO candidate count
      await queryRunner.manager.update(Ngo, { id: ngoId }, { 
        totalCandidatesSupported: Math.max(0, ngo.totalCandidatesSupported - candidates.length) 
      });

      await queryRunner.commitTransaction();

      return candidates.length;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find all NGOs without pagination
   * @returns All NGOs
   */
  async findAllNgosWithoutPagination(): Promise<NgoResponseDto[]> {
    const ngos = await this.ngoRepository.find({
      relations: [
        'user',
        'location',
        'serviceAreas',
        'focusAreas',
        'supportedDisabilityTypes',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return ngos as any;
  }

  /**
   * Get paginated candidates for an NGO
   * @param ngoId NGO ID
   * @param options Pagination and filter options
   * @returns Paginated candidates
   */
  async getNgoCandidatesPaginated(ngoId: string, options: {
    page: number;
    size: number;
    search?: string;
    isAvailable?: boolean;
    isActive?: boolean;
    isProfileComplete?: boolean;
    disabilityTypeId?: string;
    educationLevelId?: string;
    experienceLevelId?: string;
    professionId?: string;
    locationId?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ data: CandidateResponseDto[]; meta: any }> {
    const ngo = await this.ngoRepository.findOne({
      where: { id: ngoId },
    });

    if (!ngo) {
      throw new NotFoundException('NGO not found');
    }

    const { 
      page, 
      size, 
      search, 
      isAvailable, 
      isActive, 
      isProfileComplete,
      disabilityTypeId,
      educationLevelId,
      experienceLevelId,
      professionId,
      locationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = options;
    
    const queryBuilder = this.candidateRepository.createQueryBuilder('candidate')
      .leftJoinAndSelect('candidate.user', 'user')
      .leftJoinAndSelect('candidate.ngo', 'ngo')
      .leftJoinAndSelect('candidate.disabilityType', 'disabilityType')
      .leftJoinAndSelect('candidate.educationLevel', 'educationLevel')
      .leftJoinAndSelect('candidate.experienceLevel', 'experienceLevel')
      .leftJoinAndSelect('candidate.profession', 'profession')
      .leftJoinAndSelect('candidate.location', 'location')
      .where('candidate.ngoId = :ngoId', { ngoId });

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search) OR LOWER(candidate.professionalSummary) LIKE LOWER(:search) OR LOWER(candidate.skills) LIKE LOWER(:search))',
        { search: `%${search}%` }
      );
    }

    // Apply availability filter
    if (isAvailable !== undefined) {
      queryBuilder.andWhere('candidate.isAvailable = :isAvailable', { isAvailable });
    }

    // Apply active filter
    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    // Apply profile completion filter
    if (isProfileComplete !== undefined) {
      queryBuilder.andWhere('candidate.isProfileComplete = :isProfileComplete', { isProfileComplete });
    }

    // Apply disability type filter
    if (disabilityTypeId) {
      queryBuilder.andWhere('candidate.disabilityTypeId = :disabilityTypeId', { disabilityTypeId });
    }

    // Apply education level filter
    if (educationLevelId) {
      queryBuilder.andWhere('candidate.educationLevelId = :educationLevelId', { educationLevelId });
    }

    // Apply experience level filter
    if (experienceLevelId) {
      queryBuilder.andWhere('candidate.experienceLevelId = :experienceLevelId', { experienceLevelId });
    }

    // Apply profession filter
    if (professionId) {
      queryBuilder.andWhere('candidate.professionId = :professionId', { professionId });
    }

    // Apply location filter
    if (locationId) {
      queryBuilder.andWhere('candidate.locationId = :locationId', { locationId });
    }

    // Apply sorting
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder);

    // Apply pagination
    const offset = (page - 1) * size;
    queryBuilder.skip(offset).take(size);

    const [candidates, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / size);

    return {
      data: candidates as any,
      meta: {
        page,
        size,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  /**
   * Get sort field for query builder
   * @param sortBy Sort field name
   * @returns Formatted sort field
   */
  private getSortField(sortBy: string): string {
    const sortFieldMap = {
      'createdAt': 'candidate.createdAt',
      'updatedAt': 'candidate.updatedAt',
      'firstName': 'user.firstName',
      'lastName': 'user.lastName',
      'email': 'user.email',
      'expectedSalaryMin': 'candidate.expectedSalaryMin',
      'expectedSalaryMax': 'candidate.expectedSalaryMax',
    };

    return sortFieldMap[sortBy] || 'candidate.createdAt';
  }

  /**
   * Find candidate by ID and NGO ID
   * @param candidateId Candidate ID
   * @param ngoId NGO ID
   * @returns Candidate
   */
  async findCandidateByIdAndNgoId(candidateId: string, ngoId: string): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, ngoId },
      relations: [
        'user',
        'ngo',
        'disabilityType',
        'educationLevel',
        'experienceLevel',
        'profession',
        'location',
      ],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found or not managed by this NGO');
    }

    return candidate as any;
  }

  /**
   * Update candidate by ID and NGO ID
   * @param candidateId Candidate ID
   * @param ngoId NGO ID
   * @param updateData Update data
   * @returns Updated candidate
   */
  async updateCandidateByIdAndNgoId(candidateId: string, ngoId: string, updateData: any): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, ngoId },
      relations: ['user'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found or not managed by this NGO');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update user information if provided
      if (candidate.user) {
        const userUpdates = {};
        ['firstName', 'lastName', 'email', 'contact', 'secondaryContact', 'sex', 'birthDate', 'address', 'profession'].forEach(field => {
          if (updateData[field] !== undefined) {
            if (field === 'birthDate') {
              userUpdates[field] = updateData[field] ? new Date(updateData[field]) : null;
            } else {
              userUpdates[field] = updateData[field];
            }
          }
        });

        if (Object.keys(userUpdates).length > 0) {
          await queryRunner.manager.update(User, { id: candidate.userId }, userUpdates);
        }
      }

      // Update candidate information
      const candidateUpdates = {};
      [
        'disabilityTypeId', 'disabilityDescription', 'educationLevelId', 'experienceLevelId', 
        'professionId', 'professionalSummary', 'skills', 'languages', 'locationId', 
        'biography', 'videoPresentation', 'expectedSalaryMin', 'expectedSalaryMax', 
        'isAvailable', 'availabilityDate'
      ].forEach(field => {
        if (updateData[field] !== undefined) {
          if (field === 'availabilityDate') {
            candidateUpdates[field] = updateData[field] ? new Date(updateData[field]) : null;
          } else {
            candidateUpdates[field] = updateData[field];
          }
        }
      });

      if (Object.keys(candidateUpdates).length > 0) {
        await queryRunner.manager.update(Candidate, { id: candidateId }, candidateUpdates);
      }

      await queryRunner.commitTransaction();

      // Return updated candidate
      return this.findCandidateByIdAndNgoId(candidateId, ngoId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Delete candidate by ID and NGO ID
   * @param candidateId Candidate ID
   * @param ngoId NGO ID
   */
  async deleteCandidateByIdAndNgoId(candidateId: string, ngoId: string): Promise<void> {
    const candidate = await this.candidateRepository.findOne({
      where: { id: candidateId, ngoId },
      relations: ['user'],
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found or not managed by this NGO');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete candidate
      await queryRunner.manager.delete(Candidate, { id: candidateId });

      // Delete user if managed by NGO
      if (candidate.user && candidate.isManagedByNgo) {
        await queryRunner.manager.delete(User, { id: candidate.userId });
      }

      // Update NGO candidate count
      await queryRunner.manager.decrement(Ngo, { id: ngoId }, 'totalCandidatesSupported', 1);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
} 