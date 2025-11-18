import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { FileUpload } from './storage.interface';
import { FileUploadConfig } from '../config/storage.config';
import {
    ApiTags,
    ApiConsumes,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { Public } from '../common/guards/global-auth.guard';

@ApiTags('files')
@Controller('files')
export class StorageController {
    constructor(
        private readonly storageService: StorageService,
        private readonly fileUploadConfig: FileUploadConfig
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a single file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'File uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'object',
                    properties: {
                        filename: { type: 'string' },
                        path: { type: 'string' },
                        mimetype: { type: 'string' },
                        size: { type: 'number' },
                        originalname: { type: 'string' },
                    },
                },
            },
        },
    })
    async uploadFile(@UploadedFile() file: FileUpload) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        
        const result = await this.storageService.storeFile(file);
        return {
            status: 'success',
            data: result,
        };
    }

    @Post('upload/multiple')
    @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
    @ApiOperation({ summary: 'Upload multiple files' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Files uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'success' },
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            filename: { type: 'string' },
                            path: { type: 'string' },
                            mimetype: { type: 'string' },
                            size: { type: 'number' },
                            originalname: { type: 'string' },
                        },
                    },
                },
            },
        },
    })
    async uploadMultipleFiles(@UploadedFiles() files: FileUpload[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        const results = await Promise.all(
            files.map(file => this.storageService.storeFile(file))
        );

        return {
            status: 'success',
            data: results,
        };
    }

    @Public()
    @Get('*path')
    @ApiOperation({ summary: 'Get a file by path' })
    @ApiParam({ name: 'path', description: 'The path of the file to retrieve' })
    @ApiResponse({ status: 200, description: 'File retrieved successfully' })
    @ApiResponse({ status: 404, description: 'File not found' })
    async getFile(@Param('path') filePath: string, @Res() res: Response) {
        try {
            // Convert commas back to slashes (NestJS wildcard behavior)
            const normalizedPath = filePath.replace(/,/g, '/');
            
            // Get file metadata to set proper headers
            const metadata = await this.storageService.getFileMetadata(normalizedPath);
            
            // Set appropriate headers for proper browser interpretation
            res.setHeader('Content-Type', metadata.mimetype);
            res.setHeader('Content-Length', metadata.size);
            
            // Set cache headers for better performance
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
            res.setHeader('ETag', `"${metadata.filename}-${metadata.size}"`);
            
            // For images, set Content-Disposition to inline so they display in browser
            if (metadata.mimetype.startsWith('image/')) {
                res.setHeader('Content-Disposition', `inline; filename="${metadata.filename}"`);
            } else {
                // For other files, set as attachment to trigger download
                res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalname || metadata.filename}"`);
            }
            
            // Get and pipe the file stream
            const stream = await this.storageService.getFileStream(normalizedPath);
            stream.pipe(res);
        } catch (error) {
            console.error('Error getting file:', error.message);
            console.error('File path attempted:', filePath);
            res.status(404).send({
                status: 'error',
                message: 'File not found',
            });
        }
    }
} 