import { Injectable } from '@nestjs/common';
import { createReadStream, promises as fs } from 'fs';
import * as path from 'path';
import { Stream } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload, IStorageProvider, StorageFileInfo, FileMetadata } from '../storage.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LocalStorageProvider implements IStorageProvider {
    private readonly uploadDir: string;

    constructor(private configService: ConfigService) {
        // Get upload directory from config or use default
        this.uploadDir = configService.get<string>('upload.uploadDir') || path.join(process.cwd(), 'uploads');
        // Ensure the upload directory exists
        this.ensureUploadDir();
    }

    /**
     * Ensure the upload directory exists
     */
    private async ensureUploadDir(): Promise<void> {
        try {
            await fs.access(this.uploadDir);
        } catch (error) {
            // Create the directory if it doesn't exist
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    /**
     * Generate a unique filename to prevent collisions
     * @param originalname The original filename
     */
    private generateUniqueFilename(originalname: string): string {
        const extension = path.extname(originalname);
        const filename = path.basename(originalname, extension);
        const sanitizedFilename = filename
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-');
        const uuid = uuidv4();

        return `${sanitizedFilename}-${uuid}${extension}`;
    }

    /**
     * Get the absolute path for a file
     * @param subpath Optional subpath where the file is stored
     * @param filename The filename
     */
    private async getFilePath(subpath: string | undefined, filename: string): Promise<string> {
        if (subpath) {
            const fullPath = path.join(this.uploadDir, subpath);
            // Ensure the subdirectory exists and wait for it
            await fs.mkdir(fullPath, { recursive: true });
            return path.join(fullPath, filename);
        }
        return path.join(this.uploadDir, filename);
    }

    /**
     * Store a file in the local filesystem
     * @param file The file to store
     * @param subpath Optional subpath where to store the file
     */
    async storeFile(file: FileUpload, subpath?: string): Promise<StorageFileInfo> {
        const uniqueFilename = this.generateUniqueFilename(file.originalname);
        const filePath = await this.getFilePath(subpath, uniqueFilename);

        // If we have a file path from multer, we can just rename it
        if (file.path) {
            await fs.rename(file.path, filePath);
        }
        // Otherwise, write the buffer to the file
        else if (file.buffer) {
            await fs.writeFile(filePath, file.buffer);
        } else {
            throw new Error('File has no path or buffer');
        }

        // Calculate the relative path for storage
        const relativePath = subpath
            ? path.join(subpath, uniqueFilename)
            : uniqueFilename;

        return {
            filename: uniqueFilename,
            path: relativePath,
            mimetype: file.mimetype,
            size: file.size,
            originalname: file.originalname,
        };
    }

    /**
     * Store a buffer in the local filesystem
     * @param buffer The buffer to store
     * @param filename The filename to use
     * @param mimetype The mimetype of the file
     * @param subpath Optional subpath where to store the file
     */
    async storeBuffer(
        buffer: Buffer,
        filename: string,
        mimetype: string,
        subpath?: string
    ): Promise<StorageFileInfo> {
        const uniqueFilename = this.generateUniqueFilename(filename);
        const filePath = await this.getFilePath(subpath, uniqueFilename);

        await fs.writeFile(filePath, buffer);

        // Calculate the relative path for storage
        const relativePath = subpath
            ? path.join(subpath, uniqueFilename)
            : uniqueFilename;

        return {
            filename: uniqueFilename,
            path: relativePath,
            mimetype,
            size: buffer.length,
            originalname: filename,
        };
    }

    /**
     * Get a file from the local filesystem
     * @param filePath The path of the file to get
     */
    async getFile(filePath: string): Promise<Buffer> {
        const fullPath = path.join(this.uploadDir, filePath);
        return fs.readFile(fullPath);
    }

    /**
     * Get a file as a stream from the local filesystem
     * @param filePath The path of the file to get
     */
    async getFileStream(filePath: string): Promise<Stream> {
        const fullPath = path.join(this.uploadDir, filePath);
        
        try {
            // Check if file exists
            await fs.access(fullPath);
            return createReadStream(fullPath);
        } catch (error) {
            console.error('File access error:', error.message);
            console.error('Attempted full path:', fullPath);
            throw new Error(`File not found: ${filePath}`);
        }
    }

    /**
     * Get file metadata from the local filesystem
     * @param filePath The path of the file to get metadata for
     */
    async getFileMetadata(filePath: string): Promise<FileMetadata> {
        const fullPath = path.join(this.uploadDir, filePath);
        
        try {
            const stats = await fs.stat(fullPath);
            const filename = path.basename(filePath);
            
            // Try to determine MIME type from file extension
            const ext = path.extname(filename).toLowerCase();
            let mimetype = 'application/octet-stream'; // Default fallback
            
            // Common MIME types mapping
            const mimeTypeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.pdf': 'application/pdf',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.txt': 'text/plain',
                '.mp4': 'video/mp4',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.zip': 'application/zip',
                '.json': 'application/json',
            };
            
            if (mimeTypeMap[ext]) {
                mimetype = mimeTypeMap[ext];
            }
            
            return {
                filename,
                mimetype,
                size: stats.size,
            };
        } catch (error) {
            console.error('File metadata error:', error.message);
            console.error('Attempted full path:', fullPath);
            throw new Error(`File not found: ${filePath}`);
        }
    }

    /**
     * Delete a file from the local filesystem
     * @param filePath The path of the file to delete
     */
    async deleteFile(filePath: string): Promise<boolean> {
        try {
            const fullPath = path.join(this.uploadDir, filePath);
            await fs.unlink(fullPath);
            return true;
        } catch (error) {
            return false;
        }
    }
} 