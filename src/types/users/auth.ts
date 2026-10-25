export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// The only user fields the API ever returns
export interface UserResponse {
    id: number;
    email: string;
    createdAt: Date;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
