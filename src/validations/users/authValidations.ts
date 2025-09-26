export const registerValidation = {
    email: {
        in: 'body',
        isEmail: true,
        errorMessage: 'Invalid email',
    },
    password: {
        in: 'body',
        isString: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password must be at least 8 characters long',
        },
        errorMessage: 'Invalid password',
    }
}