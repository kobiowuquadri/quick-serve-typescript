export const registerValidation = {
    email: {
        in: 'body',
        isEmail: true,
        errorMessage: 'Invalid email',
    },
}