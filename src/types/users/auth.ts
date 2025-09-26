import { Request } from "express";

export interface AuthRequest extends Request {
    user: {
        id: number;
        email: string;
        password: string;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    };
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: any;
    user: {
        id: number;
        email: string;
        password: string;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    };
}