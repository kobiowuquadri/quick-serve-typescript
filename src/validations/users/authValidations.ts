import type { Schema } from 'express-validator';
import { passwordValidator } from '../../utils/index.js';

const email: Schema[string] = {
    in: ['body'],
    trim: true,
    isEmail: {
        errorMessage: 'Invalid email',
    },
    toLowerCase: true,
};

export const registerValidation: Schema = {
    email,
    password: {
        in: ['body'],
        isString: {
            errorMessage: 'Invalid password',
            bail: true,
        },
        custom: {
            options: (value: string) => passwordValidator(value),
            errorMessage: 'Password must be 8-72 characters and include uppercase, lowercase, number and symbol',
        },
    }
}

export const loginValidation: Schema = {
    email,
    password: {
        in: ['body'],
        isString: {
            errorMessage: 'Invalid password',
        },
        notEmpty: {
            errorMessage: 'Password is required',
        },
    }
}

export const refreshTokenValidation: Schema = {
    refreshToken: {
        in: ['body'],
        isJWT: {
            errorMessage: 'Invalid refresh token',
        },
    }
}
