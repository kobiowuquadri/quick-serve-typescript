import express from 'express'
import { validate } from '../../validations/index.js';
import { verify } from '../../middlewares/auth.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import { registerController, loginController, refreshTokenController, logoutController, profileController } from "../../controllers/users/authController.js";
import { registerValidation, loginValidation, refreshTokenValidation } from '../../validations/users/authValidations.js';

export const userRouter = express.Router()

userRouter.post('/register', authLimiter, validate(registerValidation), registerController)
userRouter.post('/login', authLimiter, validate(loginValidation), loginController)
userRouter.post('/refresh-token', authLimiter, validate(refreshTokenValidation), refreshTokenController)
userRouter.post('/logout', verify, logoutController)
userRouter.get('/me', verify, profileController)
