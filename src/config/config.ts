import 'dotenv/config';
import type { SignOptions } from 'jsonwebtoken';

// Fail fast at startup instead of failing on the first request that needs the value
const required = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
    app: {
        name: process.env.APP_NAME || 'Vyntra',
    },
    server: {
        env: nodeEnv,
        isProduction: nodeEnv === 'production',
        port: Number(process.env.PORT) || 5000,
        // Comma-separated list of allowed origins; empty allows all origins
        corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean),
        // Number of reverse proxies in front of the app (e.g. 1 on Render) so req.ip is the client IP
        trustProxy: Number(process.env.TRUST_PROXY) || 0,
    },
    database: {
        name: required('DB_NAME'),
        user: required('DB_USER'),
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
    },
    jwt: {
        secret: required('SECRET_KEY'),
        accessTokenExpiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN || '1d') as SignOptions['expiresIn'],
        refreshTokenExpiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    },
    email: {
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
    },
    brevo: {
        apiKey: process.env.BREVO_API_KEY || '',
        apiUrl: process.env.BREVO_API_URL || 'https://api.brevo.com/v3/smtp/email',
        senderEmail: process.env.BREVO_SENDER_EMAIL || '',
        senderName: process.env.BREVO_SENDER_NAME || process.env.APP_NAME || 'Vyntra',
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
};
