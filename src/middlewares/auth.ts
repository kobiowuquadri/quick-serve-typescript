import { Request, Response, NextFunction } from 'express';
import { verifyToken, messageHandler } from '../utils/index.js';
import { UNAUTHORIZED } from '../constants/statusCode.js';

// Requires "Authorization: Bearer <access token>" and exposes the token payload as req.user
export const verify = (req: Request, res: Response, next: NextFunction) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return res.status(UNAUTHORIZED).json(messageHandler('Authorization token not found', false, UNAUTHORIZED));
  }

  const result = verifyToken(token, 'access');
  if (!result.success) {
    return res.status(UNAUTHORIZED).json(messageHandler('Invalid or expired token', false, UNAUTHORIZED));
  }

  req.user = result.decoded;
  next();
};
