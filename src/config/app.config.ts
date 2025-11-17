export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'nestjs',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    logging: process.env.DB_LOGGING === 'true' || false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-key',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
  },
  magicLink: {
    secret: process.env.MAGIC_LINK_SECRET || 'super-magic-link-secret',
    expiresIn: process.env.MAGIC_LINK_EXPIRATION || '30m',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
  },
  email: {
    postmarkApiKey: process.env.POSTMARK_API_KEY || '',
    fromEmail: process.env.POSTMARK_FROM_EMAIL || 'noreply@yourdomain.com',
  },
  auth: {
    passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
    passwordMaxAttempts: parseInt(process.env.PASSWORD_MAX_ATTEMPTS || '5', 10),
    lockoutTime: parseInt(process.env.AUTH_LOCKOUT_TIME || '15', 10), // minutes
    throttle: {
      ttl: parseInt(process.env.AUTH_THROTTLE_TTL || '60', 10), // seconds
      limit: parseInt(process.env.AUTH_THROTTLE_LIMIT || '5', 10), // requests per TTL
    },
  },
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '52428800', 10), // 50MB default
    allowedMimeTypes: process.env.UPLOAD_ALLOWED_MIME_TYPES?.split(',') || [
      // Images
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      // Videos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      // Audio (for portfolio)
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      // Archives (for portfolio)
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ],
    storageType: process.env.UPLOAD_STORAGE_TYPE || 'local', // 'local' or 'r2'
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    // Cloudflare R2 configuration
    r2: {
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucketName: process.env.R2_BUCKET_NAME,
      publicUrl: process.env.R2_PUBLIC_URL,
      useSignedUrls: process.env.R2_USE_SIGNED_URLS === 'true',
      urlExpirationSeconds: parseInt(process.env.R2_URL_EXPIRATION_SECONDS || '3600', 10),
    },
  },
  // Lemon Squeezy configuration
  lemonSqueezy: {
    apiKey: process.env.LEMON_SQUEEZY_API_KEY || '',
    storeId: process.env.LEMON_SQUEEZY_STORE_ID || '',
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '',
  },
}); 