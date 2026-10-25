import rateLimit from 'express-rate-limit';
import { messageHandler } from '../utils/index.js';
import { TOO_MANY_REQUESTS } from '../constants/statusCode.js';

// Slows down brute-force and credential-stuffing attempts on auth routes (per client IP)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: messageHandler('Too many requests, please try again later', false, TOO_MANY_REQUESTS),
});
